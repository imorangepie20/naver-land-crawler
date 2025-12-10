// 전국 지역 코드 (시/도)
export const PROVINCES: Record<string, string> = {
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

// 지역 계층 타입
export interface Region {
    cortarNo: string;
    cortarName: string;
    cortarType: 'city' | 'dvsn' | 'sec';  // 시도 / 시군구 / 읍면동
    centerLat?: number;
    centerLon?: number;
}

// 지역 트리 구조
export interface RegionTree {
    province: Region;           // 시/도
    cities: Region[];           // 시/군/구
    districts?: Region[];       // 읍/면/동 (필요시)
}

// 네이버 부동산 지역 API 응답 타입
export interface NaverRegionResponse {
    result: {
        list: Array<{
            cortarNo: string;
            cortarName: string;
            cortarType: string;
            centerLat: number;
            centerLon: number;
        }>;
    };
}
