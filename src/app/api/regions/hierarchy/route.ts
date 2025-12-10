import { NextRequest, NextResponse } from 'next/server';
import { PROVINCES } from '@/types/regions';
import { PROVINCE_CITIES } from '@/data/regions-static';

// GET /api/regions/hierarchy?province=경기도&level=city
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const province = searchParams.get('province');
    const level = searchParams.get('level') || 'province';

    try {
        // 시/도 목록
        if (level === 'province' || !province) {
            const provinces = Object.entries(PROVINCES).map(([name, code]) => ({
                cortarNo: code,
                cortarName: name,
                cortarType: 'city',
            }));
            return NextResponse.json({
                success: true,
                level: 'province',
                data: provinces,
                count: provinces.length,
            });
        }

        // 시/군/구 목록 (정적 데이터 사용)
        if (level === 'city' || province) {
            const cities = PROVINCE_CITIES[province] || [];

            // 정적 데이터를 Region 형식으로 변환
            const cityData = cities.map(c => ({
                cortarNo: c.cortarNo,
                cortarName: c.cortarName,
                cortarType: 'dvsn',
            }));

            return NextResponse.json({
                success: true,
                level: 'city',
                province: province,
                data: cityData,
                count: cityData.length,
            });
        }

        return NextResponse.json({
            success: false,
            error: '잘못된 요청',
        }, { status: 400 });

    } catch (error: any) {
        console.error('Region hierarchy error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || '지역 정보를 가져오는데 실패했습니다.',
        }, { status: 500 });
    }
}
