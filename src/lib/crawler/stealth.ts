import puppeteer, { Browser, Page } from 'puppeteer';
import { Article, SEOUL_DISTRICTS } from '@/types';

export class ManualStealthCrawler {
    private browser: Browser | null = null;
    private page: Page | null = null;

    async launch(): Promise<string> {
        this.browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: [
                '--start-maximized',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-infobars',
                '--window-size=1920,1080',
            ],
            ignoreDefaultArgs: ['--enable-automation'],
        });

        const pages = await this.browser.pages();
        this.page = pages[0] || await this.browser.newPage();

        await this.page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            (window as any).chrome = { runtime: {} };
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            Object.defineProperty(navigator, 'languages', { get: () => ['ko-KR', 'ko', 'en-US', 'en'] });
        });

        await this.page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        return '✅ Chrome 브라우저가 열렸습니다!';
    }

    // 네이버 부동산 메인으로 이동 (자유 탐색 모드)
    async openNaverLand(): Promise<{ success: boolean; url: string; message: string }> {
        if (!this.page) throw new Error('Browser not launched');

        try {
            await this.page.goto('https://new.land.naver.com', {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });
            await this.delay(2000);

            const currentUrl = this.page.url();
            return {
                success: true,
                url: currentUrl,
                message: '✅ 네이버 부동산이 열렸습니다! 원하는 페이지로 이동 후 "데이터 수집"을 클릭하세요.'
            };
        } catch (error: any) {
            return { success: false, url: '', message: `실패: ${error.message}` };
        }
    }

    // 특정 지역 페이지로 이동 (전국 지원)
    async openPage(region: string, realEstateType: string = 'APT', tradeType: string = 'A1'): Promise<{ success: boolean; url: string; message: string }> {
        if (!this.page) throw new Error('Browser not launched');

        // 먼저 서울 구 목록에서 찾기
        let cortarNo: string | undefined = SEOUL_DISTRICTS[region];

        // 서울이 아닌 경우 동적으로 찾기
        if (!cortarNo) {
            const found = await this.findCortarNo(region);
            cortarNo = found || undefined;
        }

        if (!cortarNo) {
            // cortarNo를 찾지 못한 경우 자유 탐색 모드로 전환
            return this.openNaverLand();
        }

        try {
            const url = `https://new.land.naver.com/complexes?cortarNo=${cortarNo}&a=${realEstateType}&b=${tradeType}`;
            await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
            await this.delay(3000);

            const currentUrl = this.page.url();
            if (currentUrl.includes('/404')) {
                return { success: false, url, message: '❌ 404 리다이렉트됨' };
            }

            return {
                success: true,
                url: currentUrl,
                message: '✅ 페이지가 열렸습니다! 원하는 단지를 클릭하거나 매물을 탐색한 후 "데이터 수집"을 클릭하세요.'
            };
        } catch (error: any) {
            return { success: false, url: '', message: `실패: ${error.message}` };
        }
    }

    // 지역명으로 cortarNo 찾기 (네이버 API 활용)
    private async findCortarNo(regionName: string): Promise<string | null> {
        try {
            // 전국 시도 → 시군구 순으로 검색
            const provinces: Record<string, string> = {
                '서울특별시': '1100000000',
                '부산광역시': '2600000000',
                '대구광역시': '2700000000',
                '인천광역시': '2800000000',
                '광주광역시': '2900000000',
                '대전광역시': '3000000000',
                '울산광역시': '3100000000',
                '세종특별자치시': '3600000000',
                '경기도': '4100000000',
                '강원특별자치도': '5100000000',
                '충청북도': '4300000000',
                '충청남도': '4400000000',
                '전북특별자치도': '5200000000',
                '전라남도': '4600000000',
                '경상북도': '4700000000',
                '경상남도': '4800000000',
                '제주특별자치도': '5000000000',
            };

            // 1. 시도 레벨 확인
            if (provinces[regionName]) {
                return provinces[regionName];
            }

            // 2. 시군구 레벨 검색 - 각 시도의 하위 지역에서 검색
            for (const [, provinceCode] of Object.entries(provinces)) {
                const response = await fetch(`https://new.land.naver.com/api/regions/list?cortarNo=${provinceCode}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    const found = data.result?.list?.find((item: any) =>
                        item.cortarName === regionName || item.cortarName.includes(regionName)
                    );
                    if (found) {
                        return found.cortarNo;
                    }
                }
            }

            return null;
        } catch (error) {
            console.error('Failed to find cortarNo:', error);
            return null;
        }
    }

    // 현재 URL 가져오기
    async getCurrentUrl(): Promise<string> {
        if (!this.page) return '';
        return this.page.url();
    }

    // 단지명으로 마커 클릭 후 상세 매물 수집
    async clickComplexAndScrape(complexName: string, region: string = '서울'): Promise<{
        success: boolean;
        articles: Article[];
        url: string;
        message: string;
    }> {
        if (!this.page) {
            return { success: false, articles: [], url: '', message: '브라우저가 실행되지 않았습니다.' };
        }

        try {
            console.log(`단지 클릭 시도: "${complexName}"`);

            // 1. 지도에서 해당 단지 마커 찾아서 클릭
            const clicked = await this.page.evaluate((targetName: string) => {
                // 마커에서 단지 이름 찾기
                const markers = document.querySelectorAll('.marker_complex--apart, [class*="marker_complex"]');
                for (const marker of markers) {
                    const titleEl = marker.querySelector('.complex_title');
                    const title = titleEl?.textContent?.trim() || '';
                    if (title === targetName || title.includes(targetName)) {
                        // 마커 클릭
                        (marker as HTMLElement).click();
                        return true;
                    }
                }

                // 리스트에서 찾기
                const listItems = document.querySelectorAll('.item, .article_item');
                for (const item of listItems) {
                    const titleEl = item.querySelector('.item_title .text, .text');
                    const title = titleEl?.textContent?.trim() || '';
                    if (title === targetName || title.includes(targetName)) {
                        (item as HTMLElement).click();
                        return true;
                    }
                }

                return false;
            }, complexName);

            if (!clicked) {
                return {
                    success: false,
                    articles: [],
                    url: this.page.url(),
                    message: `"${complexName}" 단지를 찾을 수 없습니다. 지도에 보이는 단지만 클릭할 수 있습니다.`
                };
            }

            // 2. 상세 패널 로딩 대기
            await this.delay(3000);

            // 3. 상세 패널에서만 매물 수집 (전체 페이지 아닌 패널만)
            const articles = await this.scrapeComplexDetailPanel(complexName, region);

            return {
                success: true,
                articles,
                url: this.page.url(),
                message: articles.length > 0
                    ? `🎉 "${complexName}" 매물 ${articles.length}개 수집 완료!`
                    : `⚠️ "${complexName}" 상세 패널에서 매물을 찾을 수 없습니다.`,
            };

        } catch (error: any) {
            console.error('Click complex error:', error);
            return {
                success: false,
                articles: [],
                url: this.page.url(),
                message: `오류: ${error.message}`
            };
        }
    }

    // 단지 상세 패널에서만 매물 수집 (클릭한 단지의 매물만)
    private async scrapeComplexDetailPanel(complexName: string, region: string): Promise<Article[]> {
        if (!this.page) return [];

        const data = await this.page.evaluate(() => {
            const items: any[] = [];

            // 단지 상세 패널의 매물 리스트만 추출 (#articleListArea .item)
            const complexArticles = document.querySelectorAll('#articleListArea .item, .item_list--article .item');
            console.log('단지 상세 매물 발견:', complexArticles.length);

            complexArticles.forEach((item, index) => {
                try {
                    // 매물명 (단지명 + 동)
                    const titleEl = item.querySelector('.item_title .text');
                    // 거래유형 & 가격
                    const tradeTypeEl = item.querySelector('.price_line .type');
                    const priceEl = item.querySelector('.price_line .price');
                    // 상세 정보 (면적, 층수, 방향)
                    const specEls = item.querySelectorAll('.info_area .spec');
                    // 중개사 정보
                    const agentEls = item.querySelectorAll('.agent_name');
                    // 확인일자
                    const confirmEl = item.querySelector('.icon-badge');
                    // 썸네일
                    const thumbEl = item.querySelector('.thumbnail');
                    const thumbStyle = thumbEl?.getAttribute('style') || '';
                    const thumbMatch = thumbStyle.match(/url\("([^"]+)"\)/);

                    const name = titleEl?.textContent?.trim() || '';
                    const tradeType = tradeTypeEl?.textContent?.trim() || '';
                    const price = priceEl?.textContent?.trim() || '';
                    const spec = specEls[0]?.textContent?.trim() || '';
                    const desc = specEls[1]?.textContent?.trim() || '';
                    const cp = agentEls[0]?.textContent?.trim() || '';
                    const agent = agentEls[1]?.textContent?.trim() || '';
                    // 확인일자 - 날짜와 집주인 여부 분리 추출
                    const confirmText = confirmEl?.textContent?.trim() || '';
                    const dateMatch = confirmText.match(/(\d{2}\.\d{2}\.\d{2})/);
                    const confirmDate = dateMatch ? dateMatch[1] : '';
                    // 집주인, 확인매물 등 추가 정보
                    const ownerType = confirmText.replace(/\d{2}\.\d{2}\.\d{2}/, '').replace('확인매물', '').trim();
                    const thumbnail = thumbMatch ? thumbMatch[1] : '';

                    if (name && price) {
                        items.push({
                            name,
                            price,
                            tradeType,
                            spec,
                            desc,
                            cp,
                            agent,
                            confirmDate,
                            ownerType,
                            thumbnail,
                        });
                    }
                } catch (e) { }
            });

            return items;
        });

        console.log(`"${complexName}" 패널에서 ${data.length}개 매물 발견`);

        // Article 형식으로 변환
        const articles: Article[] = [];
        for (const item of data) {
            const priceValue = this.parsePriceText(item.price);
            const tradeType = this.normalizeTradeType(item.tradeType);

            // spec 파싱 (면적, 층, 방향)
            const specParts = item.spec.split(',').map((s: string) => s.trim());
            let area2 = 0;
            let floor = '';
            let totalFloor = '';
            let direction = '';

            for (const part of specParts) {
                if (part.includes('㎡')) {
                    area2 = parseFloat(part.replace('㎡', '').trim()) || 0;
                } else if (part.includes('/')) {
                    const floorParts = part.split('/');
                    floor = floorParts[0]?.replace('층', '').trim() || '';
                    totalFloor = floorParts[1]?.replace('층', '').trim() || '';
                } else if (part.includes('향')) {
                    direction = part;
                }
            }

            // 거래유형 이름 매핑
            const tradeTypeName = item.tradeType.includes('매') ? '매매' :
                item.tradeType.includes('전') ? '전세' :
                    item.tradeType.includes('월') ? '월세' : '매매';

            articles.push({
                articleNo: `${complexName}_${articles.length}`,
                articleName: item.name || complexName,
                complexName: complexName,  // 단지명 저장
                realEstateType: 'APT',
                realEstateTypeName: '아파트',
                tradeType: tradeType,
                tradeTypeName: tradeTypeName,
                dealPrice: tradeType === 'A1' ? priceValue : undefined,
                warrantPrice: tradeType !== 'A1' ? priceValue : undefined,
                priceText: item.price,
                area1: area2,  // 공급면적은 전용면적과 같게 설정 (상세 정보에서는 전용면적만 있음)
                area2,
                floor,
                totalFloor,
                direction,
                region,
                cpName: item.cp,
                realtorName: item.agent,
                confirmDate: item.confirmDate,
                ownerType: item.ownerType,
                description: item.desc,
                thumbnail: item.thumbnail,
                createdAt: new Date().toISOString().split('T')[0],
            });
        }

        return articles;
    }

    // 현재 페이지에서 데이터 스크래핑 (어떤 페이지든 지원)
    async scrapeCurrentPage(region: string = '서울'): Promise<Article[]> {
        if (!this.page) return [];

        const articles: Article[] = [];
        const seenNames = new Set<string>(); // 중복 방지

        try {
            await this.delay(2000);

            const currentUrl = await this.getCurrentUrl();
            console.log('현재 URL:', currentUrl);

            // 다양한 페이지 유형에서 데이터 추출
            const data = await this.page.evaluate(() => {
                const items: any[] = [];

                // 1. 지도 위 단지 마커에서 데이터 추출 (매물 있는 것만)
                const complexMarkers = document.querySelectorAll('.marker_complex--apart, [class*="marker_complex"]');
                console.log('단지 마커 발견:', complexMarkers.length);

                complexMarkers.forEach((marker, index) => {
                    try {
                        // 매물 없는 단지 스킵 (is-dealtype0)
                        if (marker.classList.contains('is-dealtype0')) {
                            return;
                        }

                        const nameEl = marker.querySelector('.complex_title');
                        // 가격: 여러 위치에서 찾기
                        const priceEl = marker.querySelector('.price_default') ||
                            marker.querySelector('.complex_price .price_default') ||
                            marker.querySelector('[class*="price"]');
                        const typeEl = marker.querySelector('.complex_price .type, .type');
                        const sizeEl = marker.querySelector('.complex_size-default');
                        const countEl = marker.querySelector('.article_link .count');
                        // 평당가 (complex_feature 클래스)
                        const featureEl = marker.querySelector('.complex_feature');

                        const name = nameEl?.textContent?.trim() || '';
                        let price = priceEl?.textContent?.trim() || '';
                        const tradeType = typeEl?.textContent?.trim() || '';
                        const size = sizeEl?.textContent?.trim() || '';
                        const articleCount = countEl?.textContent?.trim() || '';
                        const feature = featureEl?.textContent?.trim() || '';

                        // 가격이 없으면 feature 사용 (평당가를 임시로)
                        if (!price && feature) {
                            price = feature;
                        }

                        // 가격이 있는 항목만 추가
                        if (name && price) {
                            items.push({
                                source: 'marker',
                                index,
                                name,
                                price,
                                tradeType,
                                size,
                                articleCount,
                            });
                        }
                    } catch (e) { }
                });

                // 2. 매물 리스트에서 데이터 추출 (.item, .article_item 등)
                const articleItems = document.querySelectorAll('.item, .article_item, [class*="ArticleItem"]');
                console.log('매물 아이템 발견:', articleItems.length);

                articleItems.forEach((item, index) => {
                    try {
                        const nameEl = item.querySelector('.item_title .text, .text, .article_title, [class*="title"]');
                        const priceEl = item.querySelector('.price_line .price, .price, [class*="price"]');
                        const typeEl = item.querySelector('.price_line .type, .type, [class*="type"]');
                        const specEl = item.querySelector('.info_area .spec, .spec, [class*="spec"]');
                        const agentEl = item.querySelector('.cp_area .agent_name, .agent_name, [class*="agent"]');

                        const name = nameEl?.textContent?.trim() || '';
                        const price = priceEl?.textContent?.trim() || '';
                        const tradeType = typeEl?.textContent?.trim() || '';
                        const spec = specEl?.textContent?.trim() || '';
                        const agent = agentEl?.textContent?.trim() || '';

                        // 이름과 가격이 있는 항목만 추가
                        if (name && price) {
                            items.push({
                                source: 'list',
                                index: 1000 + index,
                                name,
                                price,
                                tradeType,
                                spec,
                                agent,
                            });
                        }
                    } catch (e) { }
                });

                // 3. 단지 상세 패널 - 단지 정보 추출
                const complexInfo: any = {};
                const complexTitle = document.querySelector('#complexTitle');
                if (complexTitle) {
                    complexInfo.name = complexTitle.textContent?.trim() || '';

                    // 단지 특징 (유형, 세대수, 동수, 사용승인일, 면적)
                    const features = document.querySelectorAll('.complex_feature dt, .complex_feature dd');
                    for (let i = 0; i < features.length; i += 2) {
                        const key = features[i]?.textContent?.trim() || '';
                        const value = features[i + 1]?.textContent?.trim() || '';
                        if (key && value) {
                            complexInfo[key] = value;
                        }
                    }

                    // 가격 범위
                    const priceItems = document.querySelectorAll('.complex_price');
                    priceItems.forEach(item => {
                        const title = item.querySelector('.title')?.textContent?.trim() || '';
                        const data = item.querySelector('.data')?.textContent?.trim() || '';
                        if (title && data) {
                            complexInfo[title] = data;
                        }
                    });
                }

                // 4. 단지 상세 패널 - 매물 리스트 추출 (#articleListArea .item)
                const complexArticles = document.querySelectorAll('#articleListArea .item, .item_list--article .item');
                console.log('단지 상세 매물 발견:', complexArticles.length);

                complexArticles.forEach((item, index) => {
                    try {
                        // 매물명 (단지명 + 동)
                        const titleEl = item.querySelector('.item_title .text');
                        // 거래유형 & 가격
                        const tradeTypeEl = item.querySelector('.price_line .type');
                        const priceEl = item.querySelector('.price_line .price');
                        // 상세 정보 (면적, 층수, 방향)
                        const specEls = item.querySelectorAll('.info_area .spec');
                        // 중개사 정보
                        const agentEls = item.querySelectorAll('.agent_name');
                        // 확인일자
                        const confirmEl = item.querySelector('.icon-badge');
                        // 썸네일
                        const thumbEl = item.querySelector('.thumbnail');
                        const thumbStyle = thumbEl?.getAttribute('style') || '';
                        const thumbMatch = thumbStyle.match(/url\("([^"]+)"\)/);

                        const name = titleEl?.textContent?.trim() || '';
                        const tradeType = tradeTypeEl?.textContent?.trim() || '';
                        const price = priceEl?.textContent?.trim() || '';
                        const spec = specEls[0]?.textContent?.trim() || '';
                        const desc = specEls[1]?.textContent?.trim() || '';
                        const cp = agentEls[0]?.textContent?.trim() || '';
                        const agent = agentEls[1]?.textContent?.trim() || '';
                        const confirmDate = confirmEl?.textContent?.replace('확인매물', '').trim() || '';
                        const thumbnail = thumbMatch ? thumbMatch[1] : '';

                        if (name && price) {
                            items.push({
                                source: 'complex_detail',
                                index: 2000 + index,
                                name,
                                price,
                                tradeType,
                                spec,
                                desc,
                                cp,
                                agent,
                                confirmDate,
                                thumbnail,
                                complexInfo: index === 0 ? complexInfo : undefined, // 첫 항목에만 단지 정보 포함
                            });
                        }
                    } catch (e) { }
                });

                return items;
            });

            console.log('총 스크래핑 데이터:', data.length);

            // 데이터를 Article 형식으로 변환 (중복 제거)
            for (const item of data) {
                // 중복 확인 (이름 기준)
                const key = `${item.name}_${item.price}`;
                if (seenNames.has(key)) {
                    continue;
                }
                seenNames.add(key);

                const priceValue = this.parsePriceText(item.price);
                const tradeType = this.normalizeTradeType(item.tradeType);

                // 가격이 0이면 스킵
                if (priceValue === 0) {
                    continue;
                }

                // spec에서 면적, 층수, 방향 파싱 (예: "170B/137m², 8/30층, 남향")
                const specParts = (item.spec || '').split(',').map((s: string) => s.trim());
                const areaMatch = specParts[0]?.match(/(\d+(?:\.\d+)?)\s*[/㎡m]/);
                const floorMatch = specParts[1]?.match(/(\d+|저|중|고)\s*\/\s*(\d+)/);
                const direction = specParts[2] || '-';

                articles.push({
                    articleNo: `scraped_${Date.now()}_${item.index}`,
                    articleName: item.name || '정보 없음',
                    realEstateType: 'APT',
                    realEstateTypeName: '아파트',
                    tradeType: tradeType,
                    tradeTypeName: item.tradeType || '-',
                    dealPrice: tradeType === 'A1' ? priceValue : undefined,
                    warrantPrice: tradeType === 'B1' ? priceValue : undefined,
                    rentPrice: tradeType === 'B2' ? priceValue : undefined,
                    priceText: item.price,  // 네이버 원본 가격 포맷
                    articleCount: parseInt(item.articleCount) || undefined,  // 매물 개수
                    area1: 0,
                    area2: areaMatch ? parseFloat(areaMatch[1]) : this.parseArea(item.size || item.spec),
                    direction: direction,
                    floor: floorMatch ? floorMatch[1] : '-',
                    totalFloor: floorMatch ? floorMatch[2] : '-',
                    region,
                    cpName: item.cp || item.agent || '-',
                    realtorName: item.agent || undefined,
                    confirmDate: item.confirmDate || undefined,
                    description: item.desc || undefined,
                    thumbnail: item.thumbnail || undefined,
                    createdAt: new Date().toISOString().split('T')[0],
                });
            }
        } catch (error: any) {
            console.error('Scrape error:', error);
        }

        return articles;
    }

    // 가격 텍스트 파싱 (예: "45억", "14.75억", "5,000")
    private parsePriceText(priceStr: string): number {
        if (!priceStr) return 0;

        const text = priceStr.replace(/\s/g, '');
        let total = 0;

        // "X억" 패턴
        const billionMatch = text.match(/([\d.]+)억/);
        if (billionMatch) {
            total += parseFloat(billionMatch[1]) * 10000;
        }

        // 억 뒤의 숫자 (예: "45억 5,000")
        const afterBillion = text.match(/억([\d,]+)/);
        if (afterBillion) {
            total += parseInt(afterBillion[1].replace(/,/g, ''));
        }

        // 억이 없는 경우 (만원 단위로 가정)
        if (!billionMatch) {
            const plainMatch = text.match(/([\d,]+)/);
            if (plainMatch) {
                total = parseInt(plainMatch[1].replace(/,/g, ''));
            }
        }

        return total;
    }

    // 거래 유형 정규화
    private normalizeTradeType(tradeType: string): string {
        if (!tradeType) return 'A1';
        if (tradeType.includes('매')) return 'A1';
        if (tradeType.includes('전세')) return 'B1';
        if (tradeType.includes('월세')) return 'B2';
        return 'A1';
    }

    // 면적 파싱
    private parseArea(areaStr: string): number {
        if (!areaStr) return 0;
        const match = areaStr.match(/([\d.]+)\s*[㎡m]/);
        return match ? parseFloat(match[1]) : 0;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }

    isLaunched(): boolean {
        return this.browser !== null;
    }
}
