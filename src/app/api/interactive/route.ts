import { NextResponse } from 'next/server';
import { InteractiveCrawler } from '@/lib/crawler/interactive';
import { TRADE_TYPES, PROPERTY_TYPES, Article } from '@/types';

// 전역 크롤러 인스턴스 (세션 유지)
let crawler: InteractiveCrawler | null = null;

// POST: 작업 실행 (launch, open, scrape, close)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, region, realEstateType, tradeType } = body;

        switch (action) {
            case 'launch':
                // 브라우저 시작
                if (crawler && crawler.isLaunched()) {
                    return NextResponse.json({
                        success: true,
                        message: '브라우저가 이미 실행 중입니다.',
                    });
                }

                crawler = new InteractiveCrawler();
                await crawler.launch();

                return NextResponse.json({
                    success: true,
                    message: '✅ Chrome 브라우저가 열렸습니다!',
                    instruction: '이제 "페이지 열기"를 클릭하세요.',
                });

            case 'open':
                // 페이지 열기
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
                        ? '⚠️ 캡챠나 로그인이 필요하면 브라우저에서 직접 해결하세요. 완료 후 "데이터 수집" 버튼을 클릭!'
                        : result.message,
                });

            case 'scrape':
                // 데이터 수집
                if (!crawler || !crawler.isLaunched()) {
                    return NextResponse.json({
                        success: false,
                        message: '브라우저가 실행되지 않았습니다.',
                    });
                }

                const articles = await crawler.scrapeCurrentPage(region || '서울');

                return NextResponse.json({
                    success: true,
                    data: articles,
                    count: articles.length,
                    message: `🎉 ${articles.length}개 매물 수집 완료!`,
                });

            case 'close':
                // 브라우저 종료
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
        console.error('Interactive API Error:', error);

        return NextResponse.json({
            success: false,
            error: error.message || '오류가 발생했습니다.',
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Interactive Browser Crawler API',
        version: '4.0.0',
        status: crawler?.isLaunched() ? 'running' : 'stopped',
        actions: {
            launch: '브라우저 시작',
            open: '페이지 열기 (region, realEstateType, tradeType)',
            scrape: '현재 페이지에서 데이터 수집',
            close: '브라우저 종료',
        },
    });
}
