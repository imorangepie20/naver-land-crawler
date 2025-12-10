'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Database, Download, Search, Filter, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ArticleData {
    articleNo: string;
    articleName: string;
    complexName?: string;
    region: string;
    realEstateType?: string;
    realEstateTypeName?: string;
    tradeType?: string;
    tradeTypeName?: string;
    dealPrice?: number;
    warrantPrice?: number;
    rentPrice?: number;
    priceText?: string;
    area1?: number;
    area2?: number;
    floor?: string;
    totalFloor?: string;
    direction?: string;
    cpName?: string;
    realtorName?: string;
    confirmDate?: string;
    ownerType?: string;
    description?: string;
    thumbnail?: string;
    createdAt: string;
}

export default function DataPage() {
    const [complexData, setComplexData] = useState<ArticleData[]>([]);
    const [detailData, setDetailData] = useState<ArticleData[]>([]);
    const [activeTab, setActiveTab] = useState<'complex' | 'detail'>('complex');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRegion, setFilterRegion] = useState('');
    const [filterType, setFilterType] = useState('');

    // sessionStorage에서 데이터 로드
    useEffect(() => {
        const loadData = async () => {
            try {
                // URL 쿼리 파라미터 확인
                const params = new URLSearchParams(window.location.search);
                const source = params.get('source');

                // 북마클릿에서 온 경우 API에서 데이터 가져오기
                if (source === 'bookmarklet') {
                    try {
                        const response = await fetch('/api/receive');
                        const result = await response.json();
                        if (result.success && result.articles) {
                            // URL에서 지역 정보 추출 시도
                            let regionFromUrl = '';
                            if (result.url) {
                                const urlMatch = result.url.match(/cortarNo=(\d+)/);
                                if (urlMatch) {
                                    // cortarNo로 지역 추정
                                    const cortarNo = urlMatch[1];
                                    regionFromUrl = getRegionFromCortarNo(cortarNo);
                                }
                            }

                            // 북마클릿 데이터를 단지 데이터로 저장
                            const articles = result.articles.map((item: any, index: number) => ({
                                articleNo: item.id || `bm_${Date.now()}_${index}`,
                                articleName: item.name || '-',
                                complexName: item.complexTitle || result.complexTitle || '',
                                region: item.region || result.region || extractRegionFromName(item.name) || '수집됨',
                                tradeTypeName: item.tradeType || '-',
                                priceText: item.price || '-',
                                dealPrice: parsePrice(item.price),
                                area2: parseArea(item.spec),
                                floor: parseFloor(item.spec),
                                direction: parseDirection(item.spec),
                                description: item.desc || '',
                                cpName: item.cp || '',
                                realtorName: item.agent || '',
                                confirmDate: item.confirmDate || '',
                                createdAt: new Date().toISOString().split('T')[0],
                            }));
                            setComplexData(articles);
                            sessionStorage.setItem('crawledData', JSON.stringify(articles));
                        }
                    } catch (e) {
                        console.error('Failed to load bookmarklet data:', e);
                    }
                }

                // 단지 데이터
                const storedComplex = sessionStorage.getItem('crawledData');
                if (storedComplex) {
                    setComplexData(JSON.parse(storedComplex));
                }
                // 상세 매물 데이터
                const storedDetails = sessionStorage.getItem('crawledDetails');
                if (storedDetails) {
                    setDetailData(JSON.parse(storedDetails));
                }
            } catch (e) {
                console.error('Failed to load data:', e);
            }
        };
        loadData();

        // 페이지 포커스 시 데이터 리로드
        window.addEventListener('focus', loadData);
        return () => window.removeEventListener('focus', loadData);
    }, []);

    // cortarNo에서 지역명 추출
    const getRegionFromCortarNo = (cortarNo: string): string => {
        const regionMap: { [key: string]: string } = {
            '1168000000': '강남구', '1165000000': '서초구', '1171000000': '송파구',
            '1174000000': '강동구', '1162000000': '관악구', '1159000000': '동작구',
            '1156000000': '영등포구', '1150000000': '강서구', '1153000000': '양천구',
            '1147000000': '구로구', '1144000000': '금천구', '1141000000': '관악구',
            '1138000000': '중랑구', '1135000000': '노원구', '1132000000': '도봉구',
            '1129000000': '강북구', '1126000000': '성북구', '1123000000': '동대문구',
            '1120000000': '광진구', '1117000000': '성동구', '1114000000': '중구',
            '1111000000': '종로구', '1108000000': '용산구', '1105000000': '마포구',
            '1102000000': '서대문구', '1104400000': '은평구',
        };
        // 앞 5자리로 매칭
        const prefix = cortarNo.slice(0, 5);
        for (const [key, value] of Object.entries(regionMap)) {
            if (key.startsWith(prefix)) {
                return value;
            }
        }
        return '';
    };

    // 매물명에서 지역 추출 시도
    const extractRegionFromName = (name: string): string => {
        if (!name) return '';
        // 일반적인 아파트 이름에서 지역 추출
        const patterns = [
            /^(강남|서초|송파|강동|마포|용산|성동|광진|동대문|성북|강북|도봉|노원|중랑|은평|서대문|종로|중구|영등포|동작|관악|구로|금천|양천|강서)/,
            /(강남|서초|송파|강동|마포|용산|성동|광진|동대문|성북|강북|도봉|노원|중랑|은평|서대문|종로|영등포|동작|관악|구로|금천|양천|강서)/,
        ];
        for (const pattern of patterns) {
            const match = name.match(pattern);
            if (match) {
                return match[1] + (match[1].endsWith('구') ? '' : '구');
            }
        }
        return '';
    };

    // 가격 파싱
    const parsePrice = (priceStr: string): number => {
        if (!priceStr) return 0;
        let total = 0;
        const cleaned = priceStr.replace(/\s/g, '');
        const billionMatch = cleaned.match(/(\d+)억/);
        if (billionMatch) {
            total += parseInt(billionMatch[1]) * 10000;
        }
        const afterBillion = cleaned.match(/억([\d,]+)/);
        if (afterBillion) {
            total += parseInt(afterBillion[1].replace(/,/g, ''));
        }
        if (!billionMatch) {
            const plainMatch = cleaned.match(/([\d,]+)/);
            if (plainMatch) {
                total = parseInt(plainMatch[1].replace(/,/g, ''));
            }
        }
        return total;
    };

    // 스펙에서 면적 추출
    const parseArea = (spec: string): number => {
        if (!spec) return 0;
        const match = spec.match(/(\d+(?:\.\d+)?)\s*[㎡m]/);
        return match ? parseFloat(match[1]) : 0;
    };

    // 스펙에서 층수 추출
    const parseFloor = (spec: string): string => {
        if (!spec) return '-';
        const match = spec.match(/(\d+|저|중|고)\s*\/\s*(\d+)\s*층/);
        return match ? match[1] : '-';
    };

    // 스펙에서 방향 추출
    const parseDirection = (spec: string): string => {
        if (!spec) return '-';
        const match = spec.match(/(동향|서향|남향|북향|남동향|남서향|북동향|북서향)/);
        return match ? match[1] : '-';
    };

    const refreshData = () => {
        try {
            const storedComplex = sessionStorage.getItem('crawledData');
            if (storedComplex) {
                setComplexData(JSON.parse(storedComplex));
            }
            const storedDetails = sessionStorage.getItem('crawledDetails');
            if (storedDetails) {
                setDetailData(JSON.parse(storedDetails));
            }
        } catch (e) {
            console.error('Failed to refresh data:', e);
        }
    };

    // 현재 탭에 따른 데이터
    const data = activeTab === 'complex' ? complexData : detailData;

    // 지역 목록 추출
    const uniqueRegions = [...new Set(data.map(d => d.region))].filter(Boolean);

    const filteredData = data.filter(item => {
        const matchSearch = item.articleName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.complexName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchRegion = !filterRegion || item.region === filterRegion;
        const matchType = !filterType || item.tradeTypeName === filterType;
        return matchSearch && matchRegion && matchType;
    });

    const exportToExcel = () => {
        if (filteredData.length === 0) {
            alert('내보낼 데이터가 없습니다.');
            return;
        }
        const ws = XLSX.utils.json_to_sheet(filteredData.map(item => ({
            '단지명': item.articleName,
            '지역': item.region,
            '유형': item.realEstateTypeName || item.realEstateType || '아파트',
            '거래': item.tradeTypeName || item.tradeType || '-',
            '가격': item.priceText || `${(item.dealPrice || item.warrantPrice || 0).toLocaleString()}만원`,
            '전용면적(㎡)': item.area2 || 0,
            '층수': item.floor && item.totalFloor ? `${item.floor}/${item.totalFloor}` : '-',
            '방향': item.direction || '-',
            '설명': item.description || '',
            '중개사': item.realtorName || item.cpName || '-',
            '확인일': item.confirmDate || '',
            '수집일': item.createdAt,
        })));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '매물데이터');
        XLSX.writeFile(wb, `naver_land_data_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const formatPrice = (price: number) => {
        if (price >= 10000) {
            const billion = Math.floor(price / 10000);
            const thousand = price % 10000;
            return thousand > 0 ? `${billion}억 ${thousand}만` : `${billion}억`;
        }
        return `${price.toLocaleString()}만`;
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <Sidebar />

            <main className="ml-0 lg:ml-[260px] transition-[margin] duration-300">
                <Header
                    title="데이터"
                    breadcrumb={[
                        { label: '홈' },
                        { label: '데이터', current: true },
                    ]}
                />

                <div className="p-4 lg:p-8">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setActiveTab('complex')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'complex'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-white'
                                }`}
                        >
                            🏢 단지 목록 ({complexData.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('detail')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'detail'
                                ? 'bg-purple-600 text-white'
                                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-white'
                                }`}
                        >
                            🏠 상세 매물 ({detailData.length})
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
                            <p className="text-[var(--text-tertiary)] text-sm">{activeTab === 'complex' ? '총 단지' : '총 매물'}</p>
                            <p className="text-2xl font-bold mt-1">{data.length}</p>
                        </div>
                        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
                            <p className="text-[var(--text-tertiary)] text-sm">검색 결과</p>
                            <p className="text-2xl font-bold mt-1">{filteredData.length}</p>
                        </div>
                        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
                            <p className="text-[var(--text-tertiary)] text-sm">평균 가격</p>
                            <p className="text-2xl font-bold mt-1">
                                {data.length > 0 ? formatPrice(Math.round(data.reduce((sum, d) => sum + (d.dealPrice || d.warrantPrice || 0), 0) / data.length)) : '-'}
                            </p>
                        </div>
                        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
                            <p className="text-[var(--text-tertiary)] text-sm">지역 수</p>
                            <p className="text-2xl font-bold mt-1">{new Set(data.map(d => d.region)).size}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 mb-6">
                        <div className="flex flex-wrap gap-4 items-center">
                            {/* Search */}
                            <div className="flex-1 min-w-[200px] flex items-center gap-3 px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg">
                                <Search size={16} className="text-[var(--text-tertiary)]" />
                                <input
                                    type="text"
                                    placeholder="단지명 검색..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                                />
                            </div>

                            {/* Region Filter */}
                            <select
                                value={filterRegion}
                                onChange={(e) => setFilterRegion(e.target.value)}
                                className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]"
                            >
                                <option value="">전체 지역</option>
                                {uniqueRegions.map(region => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>

                            {/* Type Filter */}
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]"
                            >
                                <option value="">전체 거래</option>
                                <option value="매매">매매</option>
                                <option value="전세">전세</option>
                                <option value="월세">월세</option>
                            </select>

                            {/* Export Button */}
                            <button
                                onClick={exportToExcel}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                            >
                                <Download size={16} />
                                XLSX 내보내기
                            </button>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead>
                                    {activeTab === 'complex' ? (
                                        <tr className="border-b border-[var(--border-color)] text-[var(--text-tertiary)] text-sm">
                                            <th className="text-left px-4 lg:px-6 py-3 font-medium">단지명</th>
                                            <th className="text-left px-4 lg:px-6 py-3 font-medium">지역</th>
                                            <th className="text-left px-4 lg:px-6 py-3 font-medium">거래</th>
                                            <th className="text-right px-4 lg:px-6 py-3 font-medium">가격</th>
                                            <th className="text-left px-4 lg:px-6 py-3 font-medium">면적</th>
                                            <th className="text-left px-4 lg:px-6 py-3 font-medium">매물수</th>
                                            <th className="text-left px-4 lg:px-6 py-3 font-medium">수집일</th>
                                        </tr>
                                    ) : (
                                        <tr className="border-b border-[var(--border-color)] text-[var(--text-tertiary)] text-sm">
                                            <th className="text-left px-4 lg:px-6 py-3 font-medium">단지명</th>
                                            <th className="text-left px-4 lg:px-6 py-3 font-medium">매물명</th>
                                            <th className="text-left px-4 lg:px-6 py-3 font-medium">거래</th>
                                            <th className="text-right px-4 lg:px-6 py-3 font-medium">가격</th>
                                            <th className="text-left px-4 lg:px-6 py-3 font-medium">면적</th>
                                            <th className="text-left px-4 lg:px-6 py-3 font-medium">층/방향</th>
                                            <th className="text-left px-4 lg:px-6 py-3 font-medium">중개사</th>
                                            <th className="text-left px-4 lg:px-6 py-3 font-medium">확인일</th>
                                            <th className="text-left px-4 lg:px-6 py-3 font-medium">구분</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody className="text-sm">
                                    {activeTab === 'complex' ? (
                                        // 단지 목록
                                        filteredData.map((item, index) => (
                                            <tr key={item.articleNo + '_' + index} className="border-b border-[var(--border-color)] hover:bg-white/[0.02]">
                                                <td className="px-4 lg:px-6 py-4 font-medium">{item.articleName}</td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    <span className="px-2 py-1 bg-[var(--bg-tertiary)] rounded text-xs">{item.region}</span>
                                                </td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.tradeTypeName?.includes('매') ? 'bg-emerald-500/15 text-emerald-400' :
                                                        item.tradeTypeName?.includes('전') ? 'bg-blue-500/15 text-blue-400' :
                                                            'bg-purple-500/15 text-purple-400'
                                                        }`}>
                                                        {item.tradeTypeName || item.tradeType || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 lg:px-6 py-4 text-right font-medium text-emerald-400">
                                                    {item.priceText || formatPrice(item.dealPrice || item.warrantPrice || 0)}
                                                </td>
                                                <td className="px-4 lg:px-6 py-4 text-[var(--text-secondary)]">
                                                    {item.area2 ? `${item.area2}㎡` : '-'}
                                                </td>
                                                <td className="px-4 lg:px-6 py-4 text-blue-400">
                                                    {(item as any).articleCount || '-'}
                                                </td>
                                                <td className="px-4 lg:px-6 py-4 text-[var(--text-tertiary)]">{item.createdAt}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        // 상세 매물 목록
                                        filteredData.map((item, index) => (
                                            <tr key={item.articleNo + '_detail_' + index} className="border-b border-[var(--border-color)] hover:bg-white/[0.02]">
                                                <td className="px-4 lg:px-6 py-4">
                                                    <span className="px-2 py-1 bg-cyan-500/15 text-cyan-400 rounded text-xs whitespace-nowrap">{item.complexName || '-'}</span>
                                                </td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    <p className="font-medium">{item.articleName}</p>
                                                    {item.description && (
                                                        <p className="text-xs text-[var(--text-tertiary)] mt-1 truncate max-w-[300px]">{item.description}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${item.tradeTypeName?.includes('매') ? 'bg-emerald-500/15 text-emerald-400' :
                                                        item.tradeTypeName?.includes('전') ? 'bg-blue-500/15 text-blue-400' :
                                                            'bg-purple-500/15 text-purple-400'
                                                        }`}>
                                                        {item.tradeTypeName || item.tradeType || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 lg:px-6 py-4 text-right font-medium text-emerald-400">
                                                    {item.priceText || formatPrice(item.dealPrice || item.warrantPrice || 0)}
                                                </td>
                                                <td className="px-4 lg:px-6 py-4 text-[var(--text-secondary)]">
                                                    {item.area2 ? `${item.area2}㎡` : '-'}
                                                </td>
                                                <td className="px-4 lg:px-6 py-4 text-[var(--text-secondary)]">
                                                    {item.floor && item.totalFloor ? `${item.floor}/${item.totalFloor}층` : '-'} · {item.direction || '-'}
                                                </td>
                                                <td className="px-4 lg:px-6 py-4 text-[var(--text-secondary)]">
                                                    {item.realtorName || item.cpName || '-'}
                                                </td>
                                                <td className="px-4 lg:px-6 py-4 text-[var(--text-tertiary)]">{item.confirmDate || '-'}</td>
                                                <td className="px-4 lg:px-6 py-4">
                                                    {item.ownerType && (
                                                        <span className="px-2 py-1 bg-orange-500/15 text-orange-400 rounded text-xs whitespace-nowrap">{item.ownerType}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-color)]">
                            <p className="text-sm text-[var(--text-tertiary)]">
                                총 {filteredData.length}개 중 {filteredData.length}개 표시
                            </p>
                            <div className="flex items-center gap-2">
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-white transition-colors">
                                    <ChevronLeft size={16} />
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                                    1
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-white transition-colors">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
