import { Region, NaverRegionResponse, PROVINCES } from '@/types/regions';

const NAVER_REGION_API = 'https://new.land.naver.com/api/regions/list';

// 네이버 부동산 API에서 지역 목록 가져오기
async function fetchRegionsFromNaver(cortarNo: string): Promise<Region[]> {
    try {
        const response = await fetch(`${NAVER_REGION_API}?cortarNo=${cortarNo}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Referer': 'https://new.land.naver.com/',
            },
        });

        if (!response.ok) {
            console.error('Naver region API error:', response.status);
            return [];
        }

        const data: NaverRegionResponse = await response.json();

        return data.result.list.map(item => ({
            cortarNo: item.cortarNo,
            cortarName: item.cortarName,
            cortarType: item.cortarType as 'city' | 'dvsn' | 'sec',
            centerLat: item.centerLat,
            centerLon: item.centerLon,
        }));
    } catch (error) {
        console.error('Failed to fetch regions:', error);
        return [];
    }
}

// 전국 시/도 목록 가져오기
export async function getProvinces(): Promise<Region[]> {
    // 캐시된 PROVINCES 사용 (빠른 응답)
    const provinces = Object.entries(PROVINCES).map(([name, code]) => ({
        cortarNo: code,
        cortarName: name,
        cortarType: 'city' as const,
    }));

    return provinces;
}

// 특정 시/도의 시/군/구 목록 가져오기
export async function getCities(provinceCode: string): Promise<Region[]> {
    return fetchRegionsFromNaver(provinceCode);
}

// 특정 시/군/구의 읍/면/동 목록 가져오기
export async function getDistricts(cityCode: string): Promise<Region[]> {
    return fetchRegionsFromNaver(cityCode);
}

// 지역 계층 전체 가져오기 (시도 -> 시군구 -> 읍면동)
export async function getRegionHierarchy(provinceCode: string): Promise<{
    province: Region;
    cities: Array<{
        city: Region;
        districts: Region[];
    }>;
}> {
    const provinceName = Object.entries(PROVINCES)
        .find(([, code]) => code === provinceCode)?.[0] || '';

    const province: Region = {
        cortarNo: provinceCode,
        cortarName: provinceName,
        cortarType: 'city',
    };

    const cities = await getCities(provinceCode);

    const citiesWithDistricts = await Promise.all(
        cities.map(async (city) => {
            const districts = await getDistricts(city.cortarNo);
            return {
                city,
                districts,
            };
        })
    );

    return {
        province,
        cities: citiesWithDistricts,
    };
}

// cortarNo로 지역명 찾기
export function getRegionName(cortarNo: string): string {
    // 시도 레벨 확인
    const province = Object.entries(PROVINCES)
        .find(([, code]) => code === cortarNo);

    if (province) {
        return province[0];
    }

    // 시도 코드 추출 (앞 2자리)
    const provincePrefix = cortarNo.substring(0, 2);
    const provinceName = Object.entries(PROVINCES)
        .find(([, code]) => code.startsWith(provincePrefix))?.[0] || '';

    return provinceName;
}
