import { NextResponse } from 'next/server';
import { NaverLandBrowserCrawler } from '@/lib/crawler/browser';
import { TRADE_TYPES, PROPERTY_TYPES, Article } from '@/types';

// Puppeteer 크롤러 인스턴스
let crawlerInstance: NaverLandBrowserCrawler | null = null;

export async function POST(request: Request) {
    const logs: string[] = [];
    const addLog = (msg: string) => {
        logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
    };

    try {
        const body = await request.json();
        const { regions, propertyTypes, tradeTypes } = body;

        if (!regions || regions.length === 0) {
            return NextResponse.json(
                { error: '최소 1개 이상의 지역을 선택해주세요.' },
                { status: 400 }
            );
        }

        addLog('🚀 브라우저 크롤링 시작');
        addLog('📌 Puppeteer 브라우저 실행 중...');

        // 브라우저 시작
        const crawler = new NaverLandBrowserCrawler();
        await crawler.launch();
        crawlerInstance = crawler;

        addLog('✅ 브라우저 준비 완료');

        const allArticles: Article[] = [];
        let totalCount = 0;

        // 각 지역별로 크롤링
        for (const region of regions) {
            for (const propType of propertyTypes) {
                for (const tradeType of tradeTypes) {
                    addLog(`📍 ${region} - ${propType} - ${tradeType} 크롤링...`);

                    try {
                        const articles = await crawler.crawlArticles(
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

        // 브라우저 종료
        await crawler.close();
        crawlerInstance = null;

        addLog(`🎉 크롤링 완료! 총 ${totalCount}개 매물 수집`);

        return NextResponse.json({
            success: true,
            data: allArticles,
            count: totalCount,
            logs,
        });

    } catch (error: any) {
        // 에러 시 브라우저 정리
        if (crawlerInstance) {
            await crawlerInstance.close();
            crawlerInstance = null;
        }

        addLog(`❌ 치명적 에러: ${error.message}`);

        return NextResponse.json({
            success: false,
            error: error.message || '크롤링 중 오류가 발생했습니다.',
            logs,
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Naver Land Browser Crawler API',
        version: '2.0.0',
        method: 'Puppeteer (실제 브라우저)',
        endpoints: {
            POST: 'Start crawling with regions, propertyTypes, tradeTypes',
        },
    });
}
