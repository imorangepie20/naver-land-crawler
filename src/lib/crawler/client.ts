import axios, { AxiosInstance, AxiosError } from 'axios';

// User-Agent 목록 (랜덤 선택용)
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
];

// 랜덤 User-Agent 선택
function getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// 랜덤 딜레이 (최소~최대 사이)
function randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
}

// 네이버 부동산 API 클라이언트
class NaverLandClient {
    private lastRequestTime: number = 0;
    private minInterval: number = 3000; // 최소 3초 간격
    private maxRetries: number = 3;

    private createClient(): AxiosInstance {
        return axios.create({
            baseURL: 'https://new.land.naver.com',
            timeout: 30000,
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
                'User-Agent': getRandomUserAgent(),
                'Referer': 'https://new.land.naver.com/complexes',
                'Origin': 'https://new.land.naver.com',
                'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
            },
        });
    }

    // Rate Limiting + 랜덤 딜레이
    private async waitForRateLimit(): Promise<void> {
        const now = Date.now();
        const elapsed = now - this.lastRequestTime;

        if (elapsed < this.minInterval) {
            const waitTime = this.minInterval - elapsed;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        // 추가 랜덤 딜레이 (0.5~1.5초)
        await randomDelay(500, 1500);

        this.lastRequestTime = Date.now();
    }

    // 재시도 로직 with 지수 백오프
    private async requestWithRetry<T>(
        requestFn: () => Promise<T>,
        retryCount: number = 0
    ): Promise<T> {
        try {
            await this.waitForRateLimit();
            return await requestFn();
        } catch (error: any) {
            const axiosError = error as AxiosError;

            // 429 에러 처리
            if (axiosError.response?.status === 429) {
                if (retryCount < this.maxRetries) {
                    // 지수 백오프: 5초, 10초, 20초
                    const backoffTime = Math.pow(2, retryCount) * 5000;
                    console.log(`[429] Rate limited. Waiting ${backoffTime / 1000}s before retry ${retryCount + 1}/${this.maxRetries}`);

                    await new Promise(resolve => setTimeout(resolve, backoffTime));
                    return this.requestWithRetry(requestFn, retryCount + 1);
                }
            }

            throw error;
        }
    }

    // 지역별 매물 목록 조회
    async getArticlesByRegion(
        cortarNo: string,
        realEstateType: string = 'APT',
        tradeType: string = 'A1',
        page: number = 1
    ) {
        return this.requestWithRetry(async () => {
            const client = this.createClient();
            const response = await client.get('/api/articles', {
                params: {
                    cortarNo,
                    realEstateType,
                    tradeType,
                    page,
                    order: 'rank',
                },
            });
            return response.data;
        });
    }

    // 단지별 매물 목록 조회
    async getArticlesByComplex(
        complexNo: string,
        realEstateType: string = 'APT',
        tradeType: string = '',
        page: number = 1
    ) {
        return this.requestWithRetry(async () => {
            const client = this.createClient();
            const response = await client.get(`/api/articles/complex/${complexNo}`, {
                params: {
                    realEstateType,
                    tradeType,
                    page,
                    order: 'prc',
                },
            });
            return response.data;
        });
    }

    // 단지 기본 정보 조회
    async getComplexInfo(complexNo: string) {
        return this.requestWithRetry(async () => {
            const client = this.createClient();
            const response = await client.get(`/api/complexes/${complexNo}`, {
                params: {
                    sameAddressGroup: 'true',
                },
            });
            return response.data;
        });
    }

    // 지역 내 단지 목록 조회
    async getComplexesByRegion(
        cortarNo: string,
        realEstateType: string = 'APT',
        page: number = 1
    ) {
        return this.requestWithRetry(async () => {
            const client = this.createClient();
            const response = await client.get('/api/complexes', {
                params: {
                    cortarNo,
                    realEstateType,
                    order: 'name',
                    page,
                },
            });
            return response.data;
        });
    }
}

// 싱글톤 인스턴스 export
export const naverLandClient = new NaverLandClient();
