// Re-export region types
export * from './regions';

// 서울시 구별 cortarNo 코드
export const SEOUL_DISTRICTS: Record<string, string> = {
    '강남구': '1168000000',
    '강동구': '1174000000',
    '강북구': '1130500000',
    '강서구': '1150000000',
    '관악구': '1162000000',
    '광진구': '1121500000',
    '구로구': '1153000000',
    '금천구': '1154500000',
    '노원구': '1135000000',
    '도봉구': '1132000000',
    '동대문구': '1123000000',
    '동작구': '1159000000',
    '마포구': '1144000000',
    '서대문구': '1141000000',
    '서초구': '1165000000',
    '성동구': '1120000000',
    '성북구': '1129000000',
    '송파구': '1171000000',
    '양천구': '1147000000',
    '영등포구': '1156000000',
    '용산구': '1117000000',
    '은평구': '1138000000',
    '종로구': '1111000000',
    '중구': '1114000000',
    '중랑구': '1126000000',
};

// 부동산 유형 코드
export const PROPERTY_TYPES: Record<string, string> = {
    'APT': 'APT',           // 아파트
    'OPST': 'OPST',         // 오피스텔
    'VL': 'VL',             // 빌라
    'ABYG': 'ABYG',         // 아파트분양권
};

// 거래 유형 코드
export const TRADE_TYPES: Record<string, string> = {
    'A1': 'A1',   // 매매
    'B1': 'B1',   // 전세
    'B2': 'B2',   // 월세
};

// 매물 데이터 타입
export interface Article {
    articleNo: string;
    articleName: string;
    complexNo?: string;
    complexName?: string;
    realEstateType: string;
    realEstateTypeName: string;
    tradeType: string;
    tradeTypeName: string;
    dealPrice?: number;
    warrantPrice?: number;
    rentPrice?: number;
    priceText?: string;  // 네이버 원본 가격 표시 (예: "13억", "95억")
    articleCount?: number;  // 매물 개수 (예: 10)
    area1: number;
    area2: number;
    direction: string;
    floor: string;
    totalFloor: string;
    region: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    cpName?: string;        // CP 제공업체 (예: "매경부동산 제공")
    realtorName?: string;   // 중개사 이름
    confirmDate?: string;   // 확인매물 일자
    ownerType?: string;     // 집주인 여부 등 (예: "집주인")
    description?: string;   // 매물 설명
    thumbnail?: string;     // 썸네일 이미지 URL
    createdAt: string;
}

// 단지 정보 타입
export interface Complex {
    complexNo: string;
    complexName: string;
    cortarAddress: string;
    roadAddress?: string;
    latitude: number;
    longitude: number;
    totalHouseholdCount?: number;
    totalBuildingCount?: number;
    useApproveYmd?: string;
}

// API 응답 타입
export interface NaverLandResponse {
    isMoreData: boolean;
    articleList: RawArticle[];
}

export interface RawArticle {
    articleNo: string;
    articleName: string;
    realEstateTypeCode: string;
    realEstateTypeName: string;
    tradeTypeCode: string;
    tradeTypeName: string;
    dealOrWarrantPrc: string;
    rentPrc?: string;
    area1: number;
    area2: number;
    direction: string;
    floorInfo: string;
    cpName: string;
    cpid: string;
    sameAddrCnt: number;
    sameAddrDirectCnt: number;
    sameAddrHash: string;
    sameAddrMaxPrc: string;
    sameAddrMinPrc: string;
    realtorName: string;
    articleConfirmYmd: string;
    articleFeatureDesc: string;
    tagList: string[];
    buildingName: string;
    sameAddrPremiumCnt: number;
    representativeImgUrl: string;
    representativeImgTypeCode: string;
    cpLinkVO: {
        cpId: string;
        mobileArticleUrl: string;
        articleUrl: string;
    };
    detailAddress?: string;
    latitude?: number;
    longitude?: number;
}
