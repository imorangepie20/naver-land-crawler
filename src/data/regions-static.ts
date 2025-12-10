// 전국 시/도별 시/군/구 데이터 (정적)
// 네이버 API rate limit 우회를 위해 주요 시군구 데이터를 정적으로 저장

export interface StaticRegion {
    cortarNo: string;
    cortarName: string;
}

// 서울특별시 구 목록
export const SEOUL_CITIES: StaticRegion[] = [
    { cortarNo: '1168000000', cortarName: '강남구' },
    { cortarNo: '1174000000', cortarName: '강동구' },
    { cortarNo: '1130500000', cortarName: '강북구' },
    { cortarNo: '1150000000', cortarName: '강서구' },
    { cortarNo: '1162000000', cortarName: '관악구' },
    { cortarNo: '1121500000', cortarName: '광진구' },
    { cortarNo: '1153000000', cortarName: '구로구' },
    { cortarNo: '1154500000', cortarName: '금천구' },
    { cortarNo: '1135000000', cortarName: '노원구' },
    { cortarNo: '1132000000', cortarName: '도봉구' },
    { cortarNo: '1123000000', cortarName: '동대문구' },
    { cortarNo: '1159000000', cortarName: '동작구' },
    { cortarNo: '1144000000', cortarName: '마포구' },
    { cortarNo: '1141000000', cortarName: '서대문구' },
    { cortarNo: '1165000000', cortarName: '서초구' },
    { cortarNo: '1120000000', cortarName: '성동구' },
    { cortarNo: '1129000000', cortarName: '성북구' },
    { cortarNo: '1171000000', cortarName: '송파구' },
    { cortarNo: '1147000000', cortarName: '양천구' },
    { cortarNo: '1156000000', cortarName: '영등포구' },
    { cortarNo: '1117000000', cortarName: '용산구' },
    { cortarNo: '1138000000', cortarName: '은평구' },
    { cortarNo: '1111000000', cortarName: '종로구' },
    { cortarNo: '1114000000', cortarName: '중구' },
    { cortarNo: '1126000000', cortarName: '중랑구' },
];

// 경기도 시/군 목록
export const GYEONGGI_CITIES: StaticRegion[] = [
    { cortarNo: '4128200000', cortarName: '고양시덕양구' },
    { cortarNo: '4128100000', cortarName: '고양시일산동구' },
    { cortarNo: '4128500000', cortarName: '고양시일산서구' },
    { cortarNo: '4129000000', cortarName: '과천시' },
    { cortarNo: '4121000000', cortarName: '광명시' },
    { cortarNo: '4161000000', cortarName: '광주시' },
    { cortarNo: '4131000000', cortarName: '구리시' },
    { cortarNo: '4141000000', cortarName: '군포시' },
    { cortarNo: '4157000000', cortarName: '김포시' },
    { cortarNo: '4136000000', cortarName: '남양주시' },
    { cortarNo: '4125000000', cortarName: '동두천시' },
    { cortarNo: '4119000000', cortarName: '부천시' },
    { cortarNo: '4113500000', cortarName: '성남시분당구' },
    { cortarNo: '4113100000', cortarName: '성남시수정구' },
    { cortarNo: '4113300000', cortarName: '성남시중원구' },
    { cortarNo: '4111900000', cortarName: '수원시권선구' },
    { cortarNo: '4111700000', cortarName: '수원시장안구' },
    { cortarNo: '4111100000', cortarName: '수원시팔달구' },
    { cortarNo: '4111300000', cortarName: '수원시영통구' },
    { cortarNo: '4139000000', cortarName: '시흥시' },
    { cortarNo: '4127300000', cortarName: '안산시단원구' },
    { cortarNo: '4127100000', cortarName: '안산시상록구' },
    { cortarNo: '4155000000', cortarName: '안성시' },
    { cortarNo: '4117300000', cortarName: '안양시동안구' },
    { cortarNo: '4117100000', cortarName: '안양시만안구' },
    { cortarNo: '4163000000', cortarName: '양주시' },
    { cortarNo: '4183000000', cortarName: '양평군' },
    { cortarNo: '4167000000', cortarName: '여주시' },
    { cortarNo: '4180000000', cortarName: '연천군' },
    { cortarNo: '4137000000', cortarName: '오산시' },
    { cortarNo: '4146300000', cortarName: '용인시기흥구' },
    { cortarNo: '4146100000', cortarName: '용인시처인구' },
    { cortarNo: '4146500000', cortarName: '용인시수지구' },
    { cortarNo: '4143000000', cortarName: '의왕시' },
    { cortarNo: '4115000000', cortarName: '의정부시' },
    { cortarNo: '4150000000', cortarName: '이천시' },
    { cortarNo: '4148000000', cortarName: '파주시' },
    { cortarNo: '4122000000', cortarName: '평택시' },
    { cortarNo: '4165000000', cortarName: '포천시' },
    { cortarNo: '4145000000', cortarName: '하남시' },
    { cortarNo: '4159000000', cortarName: '화성시' },
];

// 부산광역시 구/군 목록
export const BUSAN_CITIES: StaticRegion[] = [
    { cortarNo: '2611000000', cortarName: '중구' },
    { cortarNo: '2614000000', cortarName: '서구' },
    { cortarNo: '2617000000', cortarName: '동구' },
    { cortarNo: '2620000000', cortarName: '영도구' },
    { cortarNo: '2623000000', cortarName: '부산진구' },
    { cortarNo: '2626000000', cortarName: '동래구' },
    { cortarNo: '2629000000', cortarName: '남구' },
    { cortarNo: '2632000000', cortarName: '북구' },
    { cortarNo: '2635000000', cortarName: '해운대구' },
    { cortarNo: '2638000000', cortarName: '사하구' },
    { cortarNo: '2641000000', cortarName: '금정구' },
    { cortarNo: '2644000000', cortarName: '강서구' },
    { cortarNo: '2647000000', cortarName: '연제구' },
    { cortarNo: '2650000000', cortarName: '수영구' },
    { cortarNo: '2653000000', cortarName: '사상구' },
    { cortarNo: '2671000000', cortarName: '기장군' },
];

// 인천광역시 구/군 목록
export const INCHEON_CITIES: StaticRegion[] = [
    { cortarNo: '2811000000', cortarName: '중구' },
    { cortarNo: '2814000000', cortarName: '동구' },
    { cortarNo: '2817700000', cortarName: '미추홀구' },
    { cortarNo: '2818500000', cortarName: '연수구' },
    { cortarNo: '2820000000', cortarName: '남동구' },
    { cortarNo: '2823700000', cortarName: '부평구' },
    { cortarNo: '2824500000', cortarName: '계양구' },
    { cortarNo: '2826000000', cortarName: '서구' },
    { cortarNo: '2871000000', cortarName: '강화군' },
    { cortarNo: '2872000000', cortarName: '옹진군' },
];

// 대구광역시 구/군 목록
export const DAEGU_CITIES: StaticRegion[] = [
    { cortarNo: '2711000000', cortarName: '중구' },
    { cortarNo: '2714000000', cortarName: '동구' },
    { cortarNo: '2717000000', cortarName: '서구' },
    { cortarNo: '2720000000', cortarName: '남구' },
    { cortarNo: '2723000000', cortarName: '북구' },
    { cortarNo: '2726000000', cortarName: '수성구' },
    { cortarNo: '2729000000', cortarName: '달서구' },
    { cortarNo: '2771000000', cortarName: '달성군' },
];

// 대전광역시 구 목록
export const DAEJEON_CITIES: StaticRegion[] = [
    { cortarNo: '3011000000', cortarName: '동구' },
    { cortarNo: '3014000000', cortarName: '중구' },
    { cortarNo: '3017000000', cortarName: '서구' },
    { cortarNo: '3020000000', cortarName: '유성구' },
    { cortarNo: '3023000000', cortarName: '대덕구' },
];

// 광주광역시 구 목록
export const GWANGJU_CITIES: StaticRegion[] = [
    { cortarNo: '2911000000', cortarName: '동구' },
    { cortarNo: '2914000000', cortarName: '서구' },
    { cortarNo: '2917000000', cortarName: '남구' },
    { cortarNo: '2920000000', cortarName: '북구' },
    { cortarNo: '2950000000', cortarName: '광산구' },
];

// 울산광역시 구/군 목록
export const ULSAN_CITIES: StaticRegion[] = [
    { cortarNo: '3111000000', cortarName: '중구' },
    { cortarNo: '3114000000', cortarName: '남구' },
    { cortarNo: '3117000000', cortarName: '동구' },
    { cortarNo: '3120000000', cortarName: '북구' },
    { cortarNo: '3171000000', cortarName: '울주군' },
];

// 세종특별자치시
export const SEJONG_CITIES: StaticRegion[] = [
    { cortarNo: '3600000000', cortarName: '세종시' },
];

// 제주특별자치도
export const JEJU_CITIES: StaticRegion[] = [
    { cortarNo: '5011000000', cortarName: '제주시' },
    { cortarNo: '5013000000', cortarName: '서귀포시' },
];

// 강원특별자치도 시/군 목록
export const GANGWON_CITIES: StaticRegion[] = [
    { cortarNo: '5111000000', cortarName: '춘천시' },
    { cortarNo: '5113000000', cortarName: '원주시' },
    { cortarNo: '5115000000', cortarName: '강릉시' },
    { cortarNo: '5117000000', cortarName: '동해시' },
    { cortarNo: '5119000000', cortarName: '태백시' },
    { cortarNo: '5121000000', cortarName: '속초시' },
    { cortarNo: '5123000000', cortarName: '삼척시' },
    { cortarNo: '5172000000', cortarName: '홍천군' },
    { cortarNo: '5173000000', cortarName: '횡성군' },
    { cortarNo: '5175000000', cortarName: '영월군' },
    { cortarNo: '5176000000', cortarName: '평창군' },
    { cortarNo: '5177000000', cortarName: '정선군' },
    { cortarNo: '5178000000', cortarName: '철원군' },
    { cortarNo: '5179000000', cortarName: '화천군' },
    { cortarNo: '5180000000', cortarName: '양구군' },
    { cortarNo: '5181000000', cortarName: '인제군' },
    { cortarNo: '5182000000', cortarName: '고성군' },
    { cortarNo: '5183000000', cortarName: '양양군' },
];

// 충청북도 시/군 목록
export const CHUNGBUK_CITIES: StaticRegion[] = [
    { cortarNo: '4311000000', cortarName: '청주시상당구' },
    { cortarNo: '4311200000', cortarName: '청주시서원구' },
    { cortarNo: '4311400000', cortarName: '청주시흥덕구' },
    { cortarNo: '4311500000', cortarName: '청주시청원구' },
    { cortarNo: '4313000000', cortarName: '충주시' },
    { cortarNo: '4315000000', cortarName: '제천시' },
    { cortarNo: '4372000000', cortarName: '보은군' },
    { cortarNo: '4373000000', cortarName: '옥천군' },
    { cortarNo: '4374000000', cortarName: '영동군' },
    { cortarNo: '4374500000', cortarName: '증평군' },
    { cortarNo: '4375000000', cortarName: '진천군' },
    { cortarNo: '4376000000', cortarName: '괴산군' },
    { cortarNo: '4377000000', cortarName: '음성군' },
    { cortarNo: '4380000000', cortarName: '단양군' },
];

// 충청남도 시/군 목록
export const CHUNGNAM_CITIES: StaticRegion[] = [
    { cortarNo: '4413000000', cortarName: '천안시동남구' },
    { cortarNo: '4413300000', cortarName: '천안시서북구' },
    { cortarNo: '4415000000', cortarName: '공주시' },
    { cortarNo: '4418000000', cortarName: '보령시' },
    { cortarNo: '4420000000', cortarName: '아산시' },
    { cortarNo: '4421000000', cortarName: '서산시' },
    { cortarNo: '4423000000', cortarName: '논산시' },
    { cortarNo: '4425000000', cortarName: '계룡시' },
    { cortarNo: '4427000000', cortarName: '당진시' },
    { cortarNo: '4471000000', cortarName: '금산군' },
    { cortarNo: '4476000000', cortarName: '부여군' },
    { cortarNo: '4477000000', cortarName: '서천군' },
    { cortarNo: '4479000000', cortarName: '청양군' },
    { cortarNo: '4480000000', cortarName: '홍성군' },
    { cortarNo: '4481000000', cortarName: '예산군' },
    { cortarNo: '4482500000', cortarName: '태안군' },
];

// 전북특별자치도 시/군 목록
export const JEONBUK_CITIES: StaticRegion[] = [
    { cortarNo: '5211000000', cortarName: '전주시완산구' },
    { cortarNo: '5211400000', cortarName: '전주시덕진구' },
    { cortarNo: '5213000000', cortarName: '군산시' },
    { cortarNo: '5214000000', cortarName: '익산시' },
    { cortarNo: '5218000000', cortarName: '정읍시' },
    { cortarNo: '5219000000', cortarName: '남원시' },
    { cortarNo: '5221000000', cortarName: '김제시' },
    { cortarNo: '5271000000', cortarName: '완주군' },
    { cortarNo: '5272000000', cortarName: '진안군' },
    { cortarNo: '5273000000', cortarName: '무주군' },
    { cortarNo: '5274000000', cortarName: '장수군' },
    { cortarNo: '5275000000', cortarName: '임실군' },
    { cortarNo: '5277000000', cortarName: '순창군' },
    { cortarNo: '5279000000', cortarName: '고창군' },
    { cortarNo: '5280000000', cortarName: '부안군' },
];

// 전라남도 시/군 목록
export const JEONNAM_CITIES: StaticRegion[] = [
    { cortarNo: '4611000000', cortarName: '목포시' },
    { cortarNo: '4613000000', cortarName: '여수시' },
    { cortarNo: '4615000000', cortarName: '순천시' },
    { cortarNo: '4617000000', cortarName: '나주시' },
    { cortarNo: '4619000000', cortarName: '광양시' },
    { cortarNo: '4671000000', cortarName: '담양군' },
    { cortarNo: '4672000000', cortarName: '곡성군' },
    { cortarNo: '4673000000', cortarName: '구례군' },
    { cortarNo: '4677000000', cortarName: '고흥군' },
    { cortarNo: '4678000000', cortarName: '보성군' },
    { cortarNo: '4679000000', cortarName: '화순군' },
    { cortarNo: '4680000000', cortarName: '장흥군' },
    { cortarNo: '4681000000', cortarName: '강진군' },
    { cortarNo: '4682000000', cortarName: '해남군' },
    { cortarNo: '4683000000', cortarName: '영암군' },
    { cortarNo: '4684000000', cortarName: '무안군' },
    { cortarNo: '4686000000', cortarName: '함평군' },
    { cortarNo: '4687000000', cortarName: '영광군' },
    { cortarNo: '4688000000', cortarName: '장성군' },
    { cortarNo: '4689000000', cortarName: '완도군' },
    { cortarNo: '4690000000', cortarName: '진도군' },
    { cortarNo: '4691000000', cortarName: '신안군' },
];

// 경상북도 시/군 목록
export const GYEONGBUK_CITIES: StaticRegion[] = [
    { cortarNo: '4711000000', cortarName: '포항시남구' },
    { cortarNo: '4711100000', cortarName: '포항시북구' },
    { cortarNo: '4713000000', cortarName: '경주시' },
    { cortarNo: '4715000000', cortarName: '김천시' },
    { cortarNo: '4717000000', cortarName: '안동시' },
    { cortarNo: '4719000000', cortarName: '구미시' },
    { cortarNo: '4721000000', cortarName: '영주시' },
    { cortarNo: '4723000000', cortarName: '영천시' },
    { cortarNo: '4725000000', cortarName: '상주시' },
    { cortarNo: '4727000000', cortarName: '문경시' },
    { cortarNo: '4729000000', cortarName: '경산시' },
    { cortarNo: '4772000000', cortarName: '군위군' },
    { cortarNo: '4773000000', cortarName: '의성군' },
    { cortarNo: '4775000000', cortarName: '청송군' },
    { cortarNo: '4776000000', cortarName: '영양군' },
    { cortarNo: '4777000000', cortarName: '영덕군' },
    { cortarNo: '4782000000', cortarName: '청도군' },
    { cortarNo: '4783000000', cortarName: '고령군' },
    { cortarNo: '4784000000', cortarName: '성주군' },
    { cortarNo: '4785000000', cortarName: '칠곡군' },
    { cortarNo: '4790000000', cortarName: '예천군' },
    { cortarNo: '4792000000', cortarName: '봉화군' },
    { cortarNo: '4793000000', cortarName: '울진군' },
    { cortarNo: '4794000000', cortarName: '울릉군' },
];

// 경상남도 시/군 목록
export const GYEONGNAM_CITIES: StaticRegion[] = [
    { cortarNo: '4812100000', cortarName: '창원시의창구' },
    { cortarNo: '4812300000', cortarName: '창원시성산구' },
    { cortarNo: '4812500000', cortarName: '창원시마산합포구' },
    { cortarNo: '4812700000', cortarName: '창원시마산회원구' },
    { cortarNo: '4812900000', cortarName: '창원시진해구' },
    { cortarNo: '4817000000', cortarName: '진주시' },
    { cortarNo: '4822000000', cortarName: '통영시' },
    { cortarNo: '4824000000', cortarName: '사천시' },
    { cortarNo: '4825000000', cortarName: '김해시' },
    { cortarNo: '4827000000', cortarName: '밀양시' },
    { cortarNo: '4831000000', cortarName: '거제시' },
    { cortarNo: '4833000000', cortarName: '양산시' },
    { cortarNo: '4872000000', cortarName: '의령군' },
    { cortarNo: '4873000000', cortarName: '함안군' },
    { cortarNo: '4874000000', cortarName: '창녕군' },
    { cortarNo: '4882000000', cortarName: '고성군' },
    { cortarNo: '4884000000', cortarName: '남해군' },
    { cortarNo: '4885000000', cortarName: '하동군' },
    { cortarNo: '4886000000', cortarName: '산청군' },
    { cortarNo: '4887000000', cortarName: '함양군' },
    { cortarNo: '4888000000', cortarName: '거창군' },
    { cortarNo: '4889000000', cortarName: '합천군' },
];

// 시도별 시군구 매핑
export const PROVINCE_CITIES: Record<string, StaticRegion[]> = {
    '서울특별시': SEOUL_CITIES,
    '부산광역시': BUSAN_CITIES,
    '대구광역시': DAEGU_CITIES,
    '인천광역시': INCHEON_CITIES,
    '광주광역시': GWANGJU_CITIES,
    '대전광역시': DAEJEON_CITIES,
    '울산광역시': ULSAN_CITIES,
    '세종특별자치시': SEJONG_CITIES,
    '경기도': GYEONGGI_CITIES,
    '강원특별자치도': GANGWON_CITIES,
    '충청북도': CHUNGBUK_CITIES,
    '충청남도': CHUNGNAM_CITIES,
    '전북특별자치도': JEONBUK_CITIES,
    '전라남도': JEONNAM_CITIES,
    '경상북도': GYEONGBUK_CITIES,
    '경상남도': GYEONGNAM_CITIES,
    '제주특별자치도': JEJU_CITIES,
};

// 시군구명으로 cortarNo 찾기
export function findCortarNoByName(cityName: string): string | null {
    for (const cities of Object.values(PROVINCE_CITIES)) {
        const found = cities.find(c => c.cortarName === cityName);
        if (found) return found.cortarNo;
    }
    return null;
}

