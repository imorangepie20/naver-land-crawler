import { NextResponse } from 'next/server';

// CORS 헤더 설정
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 메모리 저장소 (서버 재시작 시 초기화됨)
// 실제 프로덕션에서는 Redis나 DB 사용 권장
let receivedData: {
    articles: any[];
    receivedAt: string;
    url: string;
} | null = null;

// OPTIONS: CORS preflight 요청 처리
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
    });
}

// POST: 북마클릿에서 데이터 수신
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { articles, url } = body;

        if (!articles || !Array.isArray(articles)) {
            return NextResponse.json({
                success: false,
                error: '매물 데이터가 없습니다.',
            }, { status: 400, headers: corsHeaders });
        }

        // 데이터 저장
        receivedData = {
            articles,
            receivedAt: new Date().toISOString(),
            url: url || '',
        };

        console.log(`[Receive API] ${articles.length}개 매물 수신 from ${url}`);

        return NextResponse.json({
            success: true,
            count: articles.length,
            message: `🎉 ${articles.length}개 매물 데이터 수신 완료!`,
            redirectUrl: '/data?source=bookmarklet',
        }, { headers: corsHeaders });

    } catch (error: any) {
        console.error('Receive API Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || '데이터 수신 중 오류가 발생했습니다.',
        }, { status: 500, headers: corsHeaders });
    }
}

// GET: 최근 수신된 데이터 조회
export async function GET() {
    if (!receivedData) {
        return NextResponse.json({
            success: false,
            message: '수신된 데이터가 없습니다.',
            articles: [],
        }, { headers: corsHeaders });
    }

    return NextResponse.json({
        success: true,
        ...receivedData,
        count: receivedData.articles.length,
    }, { headers: corsHeaders });
}

// DELETE: 데이터 초기화
export async function DELETE() {
    receivedData = null;
    return NextResponse.json({
        success: true,
        message: '데이터가 초기화되었습니다.',
    }, { headers: corsHeaders });
}
