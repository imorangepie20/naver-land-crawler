import { NextResponse } from 'next/server';
import { NaverLandScraper } from '@/lib/crawler/scraper';
import { TRADE_TYPES, PROPERTY_TYPES, Article } from '@/types';

export async function POST(request: Request) {
    const logs: string[] = [];
    const addLog = (msg: string) => {
        logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
    };

    let scraper: NaverLandScraper | null = null;

    try {
        const body = await request.json();
        const { regions, propertyTypes, tradeTypes } = body;

        if (!regions || regions.length === 0) {
            return NextResponse.json(
                { error: '최소 1개 이상의 지역을 선택해주세요.' },
                { status: 400 }
            );
        }

        addLog('🚀 페이지 스크래핑 시작');
        addLog('📌 Chrome 브라우저 실행 중...');

        scraper = new NaverLandScraper();
        await scraper.launch();

        addLog('✅ 브라우저 준비 완료');
        addLog('📄 실제 페이지에서 DOM 데이터 추출 방식');

        const allArticles: Article[] = [];
        let totalCount = 0;

        for (const region of regions) {
            for (const propType of propertyTypes) {
                for (const tradeType of tradeTypes) {
                    addLog(`📍 ${region} - ${propType} - ${tradeType} 스크래핑...`);

                    try {
                        const articles = await scraper.scrapeArticles(
                            region,
                            PROPERTY_TYPES[propType] || propType,
                            TRADE_TYPES[tradeType] || tradeType,
                            addLog
                        );

                        allArticles.push(...articles);
                        totalCount += articles.length;
                    } catch (error: any) {
                        addLog(`❌ 에러: ${error.message}`);
                    }
                }
            }
        }

        await scraper.close();

        addLog(`🎉 스크래핑 완료! 총 ${totalCount}개 매물 수집`);

        return NextResponse.json({
            success: true,
            data: allArticles,
            count: totalCount,
            logs,
        });

    } catch (error: any) {
        if (scraper) {
            await scraper.close();
        }

        addLog(`❌ 치명적 에러: ${error.message}`);

        return NextResponse.json({
            success: false,
            error: error.message || '스크래핑 중 오류가 발생했습니다.',
            logs,
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Naver Land Page Scraper API',
        version: '3.0.0',
        method: 'DOM Scraping (페이지 렌더링 후 HTML 추출)',
    });
}
