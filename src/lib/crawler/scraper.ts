import puppeteer, { Browser, Page } from 'puppeteer';
import { Article, SEOUL_DISTRICTS } from '@/types';

// 랜덤 딜레이
function randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
}

// DOM 스크래핑 기반 크롤러
export class NaverLandScraper {
    private browser: Browser | null = null;
    private page: Page | null = null;

    // 브라우저 시작
    async launch(): Promise<void> {
        this.browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--window-size=1920,1080',
            ],
        });

        this.page = await this.browser.newPage();

        await this.page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        await this.page.setViewport({ width: 1920, height: 1080 });
    }

    // 브라우저 종료
    async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }

    // 페이지에서 매물 데이터 스크래핑
    async scrapeArticles(
        region: string,
        realEstateType: string = 'APT',
        tradeType: string = 'A1',
        onLog?: (msg: string) => void
    ): Promise<Article[]> {
        if (!this.page) {
            throw new Error('Browser not launched');
        }

        const cortarNo = SEOUL_DISTRICTS[region];
        if (!cortarNo) {
            onLog?.(`[에러] ${region}: 지역 코드 없음`);
            return [];
        }

        const articles: Article[] = [];

        try {
            // 네이버 부동산 매물 목록 페이지
            const tradeParam = tradeType === 'A1' ? 'A1' : tradeType === 'B1' ? 'B1' : 'B2';
            const url = `https://new.land.naver.com/complexes?ms=37.5172,127.0473,16&a=${realEstateType}&b=${tradeParam}&e=RETAIL&cortarNo=${cortarNo}`;

            onLog?.(`[진행] ${region} 페이지 로딩...`);
            await this.page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

            // 페이지 완전 로딩 대기
            await randomDelay(3000, 5000);

            // 스크롤해서 더 많은 매물 로드
            onLog?.(`[진행] 스크롤하여 매물 로딩 중...`);
            await this.autoScroll();

            await randomDelay(2000, 3000);

            // DOM에서 매물 정보 추출
            onLog?.(`[진행] 매물 데이터 추출 중...`);

            const scrapedData = await this.page.evaluate(() => {
                const items: any[] = [];

                // 매물 카드 선택자들 (네이버 부동산 구조에 맞게)
                const articleCards = document.querySelectorAll('.item_inner, .article_item, [class*="ComplexItem"], [class*="ArticleItem"]');

                articleCards.forEach((card, index) => {
                    try {
                        // 다양한 선택자로 데이터 추출 시도
                        const nameEl = card.querySelector('.item_title, .complex_title, [class*="name"], h2, h3');
                        const priceEl = card.querySelector('.price, .item_price, [class*="price"], .price_area');
                        const infoEl = card.querySelector('.info, .item_info, [class*="area"], .area_info');

                        if (nameEl || priceEl) {
                            items.push({
                                name: nameEl?.textContent?.trim() || '',
                                price: priceEl?.textContent?.trim() || '',
                                info: infoEl?.textContent?.trim() || '',
                                index,
                            });
                        }
                    } catch (e) {
                        // 개별 항목 에러 무시
                    }
                });

                // 리스트 형태도 시도
                const listItems = document.querySelectorAll('.complex_list li, .item_list li, [class*="list"] li');
                listItems.forEach((item, index) => {
                    try {
                        const text = item.textContent?.trim() || '';
                        if (text && text.length > 10) {
                            items.push({
                                name: text.slice(0, 50),
                                price: '',
                                info: text,
                                index: 1000 + index,
                            });
                        }
                    } catch (e) { }
                });

                return items;
            });

            onLog?.(`[정보] DOM에서 ${scrapedData.length}개 요소 발견`);

            // 스크래핑 데이터를 Article 형태로 변환
            for (const data of scrapedData) {
                if (data.name || data.price) {
                    const article: Article = {
                        articleNo: `scraped_${Date.now()}_${data.index}`,
                        articleName: data.name || '정보 없음',
                        realEstateType: realEstateType,
                        realEstateTypeName: realEstateType === 'APT' ? '아파트' : realEstateType,
                        tradeType: tradeType,
                        tradeTypeName: tradeType === 'A1' ? '매매' : tradeType === 'B1' ? '전세' : '월세',
                        dealPrice: this.extractPrice(data.price),
                        area1: 0,
                        area2: 0,
                        direction: '-',
                        floor: '-',
                        totalFloor: '-',
                        region,
                        createdAt: new Date().toISOString().split('T')[0],
                    };
                    articles.push(article);
                }
            }

            if (articles.length > 0) {
                onLog?.(`[성공] ${region}: ${articles.length}개 매물 수집`);
            } else {
                onLog?.(`[정보] ${region}: 매물 없음`);
            }

            await randomDelay(2000, 4000);

        } catch (error: any) {
            onLog?.(`[에러] ${region}: ${error.message}`);
        }

        return articles;
    }

    // 자동 스크롤
    private async autoScroll(): Promise<void> {
        if (!this.page) return;

        await this.page.evaluate(async () => {
            await new Promise<void>((resolve) => {
                let totalHeight = 0;
                const distance = 300;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight || totalHeight > 3000) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 200);
            });
        });
    }

    // 가격 추출
    private extractPrice(priceStr: string): number {
        if (!priceStr) return 0;

        // "12억 5,000" 같은 형태 파싱
        const billionMatch = priceStr.match(/(\d+)억/);
        const millionMatch = priceStr.match(/억\s*(\d[\d,]*)/);
        const plainMatch = priceStr.match(/(\d[\d,]+)/);

        let total = 0;
        if (billionMatch) {
            total += parseInt(billionMatch[1]) * 10000;
        }
        if (millionMatch) {
            total += parseInt(millionMatch[1].replace(/,/g, ''));
        } else if (!billionMatch && plainMatch) {
            total = parseInt(plainMatch[1].replace(/,/g, ''));
        }

        return total;
    }
}

export const pageScraper = new NaverLandScraper();
