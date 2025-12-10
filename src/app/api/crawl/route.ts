import { NextResponse } from 'next/server';
import { naverLandClient } from '@/lib/crawler/client';
import { parseArticles, getCortarNo } from '@/lib/crawler/parser';
import { TRADE_TYPES, PROPERTY_TYPES } from '@/types';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { regions, propertyTypes, tradeTypes } = body;

        if (!regions || regions.length === 0) {
            return NextResponse.json(
                { error: '최소 1개 이상의 지역을 선택해주세요.' },
                { status: 400 }
            );
        }

        const allArticles: any[] = [];
        const logs: string[] = [];
        let totalCount = 0;
        let errorCount = 0;

        logs.push(`[시작] 크롤링 시작 - 지역: ${regions.length}개, 유형: ${propertyTypes.length}개`);
        logs.push(`[정보] Rate Limiting 적용: 요청 간 3-4.5초 대기`);

        // 각 지역별로 크롤링
        for (const region of regions) {
            const cortarNo = getCortarNo(region);

            if (!cortarNo) {
                logs.push(`[경고] ${region}: 지역 코드를 찾을 수 없음`);
                continue;
            }

            // 각 부동산 유형별로 크롤링
            for (const propType of propertyTypes) {
                // 각 거래 유형별로 크롤링
                for (const tradeType of tradeTypes) {
                    try {
                        logs.push(`[진행] ${region} - ${propType} - ${tradeType} 조회 중...`);

                        const response = await naverLandClient.getArticlesByRegion(
                            cortarNo,
                            PROPERTY_TYPES[propType] || propType,
                            TRADE_TYPES[tradeType] || tradeType,
                            1
                        );

                        if (response && response.articleList) {
                            const articles = parseArticles(response.articleList, region);
                            allArticles.push(...articles);
                            totalCount += articles.length;
                            logs.push(`[성공] ${region} - ${propType} - ${tradeType}: ${articles.length}개 매물`);
                        } else {
                            logs.push(`[정보] ${region} - ${propType} - ${tradeType}: 매물 없음`);
                        }
                    } catch (error: any) {
                        errorCount++;
                        const status = error.response?.status;

                        if (status === 429) {
                            logs.push(`[차단] ${region} - ${propType} - ${tradeType}: 네이버가 요청을 차단함 (429)`);
                            logs.push(`[안내] 잠시 후 다시 시도해주세요. 소량씩 크롤링을 권장합니다.`);

                            // 429 에러 시 조기 종료
                            return NextResponse.json({
                                success: false,
                                error: '네이버가 크롤링을 차단했습니다. 5분 후 다시 시도해주세요.',
                                data: allArticles,
                                count: totalCount,
                                logs,
                            });
                        } else {
                            logs.push(`[에러] ${region} - ${propType} - ${tradeType}: ${error.message || '알 수 없는 오류'}`);
                        }
                    }
                }
            }
        }

        logs.push(`[완료] 총 ${totalCount}개 매물 수집 완료 (에러: ${errorCount}건)`);

        return NextResponse.json({
            success: true,
            data: allArticles,
            count: totalCount,
            errorCount,
            logs,
        });
    } catch (error: any) {
        console.error('Crawl API Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || '크롤링 중 오류가 발생했습니다.',
                logs: [`[에러] ${error.message}`],
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Naver Land Crawler API',
        version: '1.0.0',
        endpoints: {
            POST: 'Start crawling with regions, propertyTypes, tradeTypes',
        },
        notice: '네이버 부동산은 크롤링을 제한합니다. 소량씩 테스트하세요.',
    });
}
