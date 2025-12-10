import { NextResponse } from 'next/server';
import { ManualStealthCrawler } from '@/lib/crawler/stealth';
import { TRADE_TYPES, PROPERTY_TYPES } from '@/types';

let crawler: ManualStealthCrawler | null = null;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, region, realEstateType, tradeType } = body;

        switch (action) {
            case 'launch':
                if (crawler && crawler.isLaunched()) {
                    return NextResponse.json({
                        success: true,
                        message: '브라우저가 이미 실행 중입니다.',
                    });
                }

                crawler = new ManualStealthCrawler();
                const launchMsg = await crawler.launch();

                return NextResponse.json({
                    success: true,
                    message: launchMsg,
                });

            // 자유 탐색 모드 - 네이버 부동산 메인으로만 이동
            case 'open_free':
                if (!crawler || !crawler.isLaunched()) {
                    return NextResponse.json({
                        success: false,
                        message: '먼저 브라우저를 실행해주세요.',
                    });
                }

                const freeResult = await crawler.openNaverLand();

                return NextResponse.json({
                    success: freeResult.success,
                    url: freeResult.url,
                    message: freeResult.message,
                    instruction: freeResult.success
                        ? '🌐 브라우저에서 자유롭게 탐색하세요! 원하는 페이지에서 "데이터 수집" 버튼을 클릭하면 됩니다.'
                        : freeResult.message,
                });

            // 특정 지역으로 바로 이동
            case 'open':
                if (!crawler || !crawler.isLaunched()) {
                    return NextResponse.json({
                        success: false,
                        message: '먼저 브라우저를 실행해주세요.',
                    });
                }

                const propType = PROPERTY_TYPES[realEstateType] || realEstateType || 'APT';
                const trade = TRADE_TYPES[tradeType] || tradeType || 'A1';

                const result = await crawler.openPage(region, propType, trade);

                return NextResponse.json({
                    success: result.success,
                    url: result.url,
                    message: result.message,
                    instruction: result.success
                        ? '🏠 페이지가 열렸습니다! 브라우저에서 탐색 후 "데이터 수집"을 클릭하세요.'
                        : result.message,
                });

            // 현재 URL 가져오기
            case 'get_url':
                if (!crawler || !crawler.isLaunched()) {
                    return NextResponse.json({
                        success: false,
                        url: '',
                        message: '브라우저가 실행되지 않았습니다.',
                    });
                }

                const currentUrl = await crawler.getCurrentUrl();

                return NextResponse.json({
                    success: true,
                    url: currentUrl,
                });

            // 현재 페이지에서 데이터 스크래핑
            case 'scrape':
                if (!crawler || !crawler.isLaunched()) {
                    return NextResponse.json({
                        success: false,
                        message: '브라우저가 실행되지 않았습니다.',
                    });
                }

                const currentPageUrl = await crawler.getCurrentUrl();
                const articles = await crawler.scrapeCurrentPage(region || '서울');

                return NextResponse.json({
                    success: true,
                    data: articles,
                    count: articles.length,
                    url: currentPageUrl,
                    message: articles.length > 0
                        ? `🎉 ${articles.length}개 데이터 수집 완료!`
                        : '⚠️ 데이터를 찾을 수 없습니다. 페이지를 확인하고 다시 시도하세요.',
                });

            // 단지 클릭 후 상세 매물 수집
            case 'click_complex':
                if (!crawler || !crawler.isLaunched()) {
                    return NextResponse.json({
                        success: false,
                        message: '브라우저가 실행되지 않았습니다.',
                    });
                }

                const { complexName } = body;
                if (!complexName) {
                    return NextResponse.json({
                        success: false,
                        message: '단지명이 필요합니다.',
                    }, { status: 400 });
                }

                const clickResult = await crawler.clickComplexAndScrape(complexName, region || '서울');

                return NextResponse.json({
                    success: clickResult.success,
                    data: clickResult.articles,
                    count: clickResult.articles?.length || 0,
                    url: clickResult.url,
                    message: clickResult.message,
                });

            case 'close':
                if (crawler) {
                    await crawler.close();
                    crawler = null;
                }

                return NextResponse.json({
                    success: true,
                    message: '브라우저가 종료되었습니다.',
                });

            default:
                return NextResponse.json({
                    success: false,
                    message: `알 수 없는 액션: ${action}`,
                }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Stealth API Error:', error);

        return NextResponse.json({
            success: false,
            error: error.message || '오류가 발생했습니다.',
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Interactive Stealth Crawler API',
        version: '6.0.0',
        status: crawler?.isLaunched() ? 'running' : 'stopped',
        features: [
            'launch - 스텔스 모드 Chrome 실행',
            'open_free - 네이버 부동산 메인으로 이동 (자유 탐색)',
            'open - 특정 지역 페이지로 이동',
            'get_url - 현재 URL 가져오기',
            'scrape - 현재 페이지에서 데이터 수집',
            'close - 브라우저 종료',
        ],
    });
}

