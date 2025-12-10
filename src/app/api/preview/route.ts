import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { SEOUL_DISTRICTS } from '@/types';

export async function POST(request: Request) {
    let browser = null;

    try {
        const body = await request.json();
        const { region, realEstateType = 'APT', tradeType = 'A1' } = body;

        const cortarNo = SEOUL_DISTRICTS[region];
        if (!cortarNo) {
            return NextResponse.json({ error: '잘못된 지역입니다.' }, { status: 400 });
        }

        // 브라우저 시작
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        await page.setViewport({ width: 1400, height: 900 });

        // 네이버 부동산 페이지로 이동
        const url = `https://new.land.naver.com/complexes?ms=37.5172,127.0473,16&a=${realEstateType}&b=${tradeType}&e=RETAIL&cortarNo=${cortarNo}`;

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // 로딩 대기
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 스크린샷 캡처 (base64)
        const screenshot = await page.screenshot({
            encoding: 'base64',
            fullPage: false,
        });

        await browser.close();

        return NextResponse.json({
            success: true,
            screenshot: `data:image/png;base64,${screenshot}`,
            url,
        });

    } catch (error: any) {
        if (browser) await browser.close();

        return NextResponse.json({
            success: false,
            error: error.message || '스크린샷 캡처 실패',
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Page Preview API',
        usage: 'POST with { region, realEstateType, tradeType }',
    });
}
