import { Article, RawArticle, SEOUL_DISTRICTS } from '@/types';

// Raw API 응답을 정규화된 Article 형태로 변환
export function parseArticle(raw: RawArticle, region: string): Article {
    // 가격 파싱
    const priceStr = raw.dealOrWarrantPrc.replace(/,/g, '');
    const price = parseInt(priceStr, 10) || 0;

    // 층 정보 파싱 (ex: "10/25")
    const floorParts = raw.floorInfo.split('/');
    const floor = floorParts[0] || '-';
    const totalFloor = floorParts[1] || '-';

    // 거래 유형에 따라 가격 분류
    let dealPrice: number | undefined;
    let warrantPrice: number | undefined;
    let rentPrice: number | undefined;

    if (raw.tradeTypeCode === 'A1') {
        dealPrice = price;
    } else if (raw.tradeTypeCode === 'B1') {
        warrantPrice = price;
    } else if (raw.tradeTypeCode === 'B2') {
        warrantPrice = price;
        const rentStr = raw.rentPrc?.replace(/,/g, '') || '0';
        rentPrice = parseInt(rentStr, 10) || 0;
    }

    return {
        articleNo: raw.articleNo,
        articleName: raw.articleName,
        realEstateType: raw.realEstateTypeCode,
        realEstateTypeName: raw.realEstateTypeName,
        tradeType: raw.tradeTypeCode,
        tradeTypeName: raw.tradeTypeName,
        dealPrice,
        warrantPrice,
        rentPrice,
        area1: raw.area1,
        area2: raw.area2,
        direction: raw.direction || '-',
        floor,
        totalFloor,
        region,
        cpName: raw.cpName,
        confirmDate: raw.articleConfirmYmd,
        createdAt: new Date().toISOString().split('T')[0],
        latitude: raw.latitude,
        longitude: raw.longitude,
    };
}

// 여러 매물 파싱
export function parseArticles(rawArticles: RawArticle[], region: string): Article[] {
    return rawArticles.map(raw => parseArticle(raw, region));
}

// 지역 이름으로 cortarNo 조회
export function getCortarNo(regionName: string): string | undefined {
    return SEOUL_DISTRICTS[regionName];
}

// 가격 포맷팅 (만원 단위)
export function formatPrice(price: number): string {
    if (price >= 10000) {
        const billion = Math.floor(price / 10000);
        const thousand = price % 10000;
        return thousand > 0 ? `${billion}억 ${thousand}만` : `${billion}억`;
    }
    return `${price.toLocaleString()}만`;
}

// 면적 포맷팅 (㎡ → 평)
export function formatArea(areaM2: number): string {
    const pyeong = (areaM2 / 3.305785).toFixed(1);
    return `${areaM2.toFixed(2)}㎡ (${pyeong}평)`;
}
