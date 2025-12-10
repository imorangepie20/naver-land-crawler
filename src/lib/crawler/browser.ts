import puppeteer, { Browser, Page } from 'puppeteer';
import { Article, SEOUL_DISTRICTS, PROPERTY_TYPES, TRADE_TYPES } from '@/types';

// 랜덤 딜레이
function randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
}

// Puppeteer 브라우저 크롤러
export class NaverLandBrowserCrawler {
    private browser: Browser | null = null;
    private page: Page | null = null;

    // 브라우저 시작
    async launch(): Promise<void> {
        this.browser = await puppeteer.launch({
            headless: true, // true = 백그라운드 실행, false = 브라우저 창 열림
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920,1080',
            ],
        });

        this.page = await this.browser.newPage();

        // User-Agent 설정
        await this.page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        // 뷰포트 설정
        await this.page.setViewport({ width: 1920, height: 1080 });

        // 네트워크 요청 인터셉트 (광고 차단으로 속도 향상)
        await this.page.setRequestInterception(true);
        this.page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                request.abort();
            } else {
                request.continue();
            }
        });
    }

    // 브라우저 종료
    async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }

    // 지역별 매물 크롤링
    async crawlArticles(
        region: string,
        realEstateType: string = 'APT',
        tradeType: string = 'A1',
        onLog?: (msg: string) => void
    ): Promise<Article[]> {
        if (!this.page) {
            throw new Error('Browser not launched. Call launch() first.');
        }

        const cortarNo = SEOUL_DISTRICTS[region];
        if (!cortarNo) {
            onLog?.(`[에러] ${region}: 지역 코드를 찾을 수 없음`);
            return [];
        }

        const articles: Article[] = [];

        try {
            // 네이버 부동산 매물 목록 페이지로 이동
            const url = `https://new.land.naver.com/complexes?ms=37.5665,126.9780,16&a=${realEstateType}&b=${tradeType}&e=RETAIL&ad=true&cortarNo=${cortarNo}`;

            onLog?.(`[진행] ${region} 페이지 로딩 중...`);
            await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            // 페이지 로딩 대기
            await randomDelay(2000, 3000);

            // API 응답 가로채기
            const apiUrl = `https://new.land.naver.com/api/articles?cortarNo=${cortarNo}&realEstateType=${realEstateType}&tradeType=${tradeType}&page=1&order=rank`;

            onLog?.(`[진행] API 데이터 조회 중...`);

            // 직접 API 호출 (브라우저 컨텍스트에서)
            const data = await this.page.evaluate(async (apiUrl: string) => {
                try {
                    const response = await fetch(apiUrl, {
                        headers: {
                            'Accept': 'application/json',
                        },
                    });
                    return await response.json();
                } catch (e) {
                    return null;
                }
            }, apiUrl);

            if (data && data.articleList) {
                onLog?.(`[성공] ${region}: ${data.articleList.length}개 매물 발견`);

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
                        area1: raw.area1,
                        area2: raw.area2,
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
            } else {
                onLog?.(`[정보] ${region}: 매물 없음 또는 로딩 실패`);
            }

            // 다음 요청 전 대기
            await randomDelay(3000, 5000);

        } catch (error: any) {
            onLog?.(`[에러] ${region}: ${error.message}`);
        }

        return articles;
    }

    // 가격 문자열 파싱
    private parsePrice(priceStr: string): number {
        if (!priceStr) return 0;
        const num = priceStr.replace(/,/g, '');
        return parseInt(num, 10) || 0;
    }
}

// 싱글톤 인스턴스
export const browserCrawler = new NaverLandBrowserCrawler();
