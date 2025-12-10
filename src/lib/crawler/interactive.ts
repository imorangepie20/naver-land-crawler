import puppeteer, { Browser, Page } from 'puppeteer';
import { Article, SEOUL_DISTRICTS } from '@/types';

// 인터랙티브 브라우저 크롤러 (Octoparse 스타일)
export class InteractiveCrawler {
    private browser: Browser | null = null;
    private page: Page | null = null;
    private isReady: boolean = false;

    // 브라우저 시작 (눈에 보이는 모드)
    async launch(): Promise<string> {
        this.browser = await puppeteer.launch({
            headless: false, // 👀 브라우저 창 보이기!
            defaultViewport: null, // 전체 화면 사용
            args: [
                '--start-maximized',
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        });

        this.page = await this.browser.newPage();

        await this.page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        return 'Browser launched';
    }

    // 페이지 열기 (사용자가 캡챠/로그인 해결할 수 있도록)
    async openPage(
        region: string,
        realEstateType: string = 'APT',
        tradeType: string = 'A1'
    ): Promise<{ success: boolean; url: string; message: string }> {
        if (!this.page) {
            throw new Error('Browser not launched');
        }

        const cortarNo = SEOUL_DISTRICTS[region];
        if (!cortarNo) {
            return { success: false, url: '', message: '잘못된 지역입니다.' };
        }

        const url = `https://new.land.naver.com/complexes?ms=37.5172,127.0473,16&a=${realEstateType}&b=${tradeType}&e=RETAIL&cortarNo=${cortarNo}`;

        try {
            await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

            return {
                success: true,
                url,
                message: '페이지가 열렸습니다. 캡챠나 로그인이 필요하면 브라우저에서 직접 해결해주세요.',
            };
        } catch (error: any) {
            return {
                success: false,
                url,
                message: `페이지 로딩 실패: ${error.message}`,
            };
        }
    }

    // 준비 완료 (사용자가 캡챠 해결 후 호출)
    setReady(): void {
        this.isReady = true;
    }

    // 현재 페이지에서 데이터 추출
    async scrapeCurrentPage(region: string): Promise<Article[]> {
        if (!this.page) {
            throw new Error('Browser not launched');
        }

        const articles: Article[] = [];

        try {
            // 스크롤해서 더 많은 데이터 로드
            await this.autoScroll();
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 페이지에서 API 호출해서 데이터 가져오기
            const data = await this.page.evaluate(async () => {
                // 현재 URL에서 파라미터 추출
                const url = new URL(window.location.href);
                const cortarNo = url.searchParams.get('cortarNo') || '';
                const realEstateType = url.searchParams.get('a') || 'APT';
                const tradeType = url.searchParams.get('b') || 'A1';

                try {
                    const apiUrl = `https://new.land.naver.com/api/articles?cortarNo=${cortarNo}&realEstateType=${realEstateType}&tradeType=${tradeType}&page=1&order=rank`;

                    const response = await fetch(apiUrl, {
                        headers: {
                            'Accept': 'application/json',
                            'Referer': window.location.href,
                        },
                        credentials: 'include', // 쿠키 포함!
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }

                    return await response.json();
                } catch (e: any) {
                    return { error: e.message, articleList: [] };
                }
            });

            if (data.articleList && data.articleList.length > 0) {
                for (const raw of data.articleList) {
                    const article: Article = {
                        articleNo: raw.articleNo,
                        articleName: raw.articleName || raw.buildingName || '-',
                        realEstateType: raw.realEstateTypeCode,
                        realEstateTypeName: raw.realEstateTypeName,
                        tradeType: raw.tradeTypeCode,
                        tradeTypeName: raw.tradeTypeName,
                        dealPrice: raw.tradeTypeCode === 'A1' ? this.parsePrice(raw.dealOrWarrantPrc) : undefined,
                        warrantPrice: raw.tradeTypeCode !== 'A1' ? this.parsePrice(raw.dealOrWarrantPrc) : undefined,
                        rentPrice: raw.rentPrc ? this.parsePrice(raw.rentPrc) : undefined,
                        area1: raw.area1 || 0,
                        area2: raw.area2 || 0,
                        direction: raw.direction || '-',
                        floor: raw.floorInfo?.split('/')[0] || '-',
                        totalFloor: raw.floorInfo?.split('/')[1] || '-',
                        region,
                        cpName: raw.cpName,
                        confirmDate: raw.articleConfirmYmd,
                        createdAt: new Date().toISOString().split('T')[0],
                    };
                    articles.push(article);
                }
            }

        } catch (error: any) {
            console.error('Scrape error:', error);
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

                    if (totalHeight >= scrollHeight || totalHeight > 2000) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 150);
            });
        });
    }

    // 가격 파싱
    private parsePrice(priceStr: string): number {
        if (!priceStr) return 0;
        const num = priceStr.replace(/,/g, '');
        return parseInt(num, 10) || 0;
    }

    // 브라우저 종료
    async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
            this.isReady = false;
        }
    }

    // 브라우저 상태 확인
    isLaunched(): boolean {
        return this.browser !== null;
    }
}

// 전역 인스턴스
export const interactiveCrawler = new InteractiveCrawler();
