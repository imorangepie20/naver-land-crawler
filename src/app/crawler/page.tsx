'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Play, MapPin, Home, Building, Loader2, CheckCircle, AlertCircle, Eye, ExternalLink, X } from 'lucide-react';

// 서울시 구 목록
const seoulDistricts = [
    '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
    '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구',
    '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'
];

// 부동산 유형
const propertyTypes = [
    { id: 'APT', name: '아파트', icon: Building },
    { id: 'OPST', name: '오피스텔', icon: Building },
    { id: 'VL', name: '빌라/연립', icon: Home },
    { id: 'ABYG', name: '아파트분양권', icon: Home },
];

// 거래 유형
const tradeTypes = [
    { id: 'A1', name: '매매' },
    { id: 'B1', name: '전세' },
    { id: 'B2', name: '월세' },
];

type CrawlStatus = 'idle' | 'running' | 'complete' | 'error';

export default function CrawlerPage() {
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>(['APT']);
    const [selectedTrades, setSelectedTrades] = useState<string[]>(['A1']);
    const [crawlStatus, setCrawlStatus] = useState<CrawlStatus>('idle');
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    // 미리보기 관련 상태
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const toggleRegion = (region: string) => {
        setSelectedRegions(prev =>
            prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
        );
    };

    const toggleType = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const toggleTrade = (trade: string) => {
        setSelectedTrades(prev =>
            prev.includes(trade) ? prev.filter(t => t !== trade) : [...prev, trade]
        );
    };

    const selectAllRegions = () => {
        setSelectedRegions(seoulDistricts);
    };

    const clearAllRegions = () => {
        setSelectedRegions([]);
    };

    // 미리보기 로드
    const loadPreview = async () => {
        if (selectedRegions.length === 0) {
            alert('미리보기할 지역을 선택해주세요.');
            return;
        }

        setPreviewLoading(true);
        setShowPreview(true);

        try {
            const response = await fetch('/api/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    region: selectedRegions[0],
                    realEstateType: selectedTypes[0] || 'APT',
                    tradeType: selectedTrades[0] || 'A1',
                }),
            });

            const result = await response.json();

            if (result.success) {
                setPreviewImage(result.screenshot);
                setPreviewUrl(result.url);
            } else {
                alert('미리보기 로드 실패: ' + result.error);
                setShowPreview(false);
            }
        } catch (error: any) {
            alert('미리보기 오류: ' + error.message);
            setShowPreview(false);
        } finally {
            setPreviewLoading(false);
        }
    };

    // 네이버 부동산 새 탭으로 열기
    const openNaverLand = () => {
        if (selectedRegions.length === 0) {
            alert('지역을 선택해주세요.');
            return;
        }
        const cortarNo = {
            '강남구': '1168000000', '강동구': '1174000000', '강북구': '1130500000',
            '서초구': '1165000000', '송파구': '1171000000', '마포구': '1144000000',
            '용산구': '1117000000', '성동구': '1120000000', '영등포구': '1156000000',
        }[selectedRegions[0]] || '1168000000';

        const url = `https://new.land.naver.com/complexes?ms=37.5172,127.0473,16&a=${selectedTypes[0] || 'APT'}&b=${selectedTrades[0] || 'A1'}&e=RETAIL&cortarNo=${cortarNo}`;
        window.open(url, '_blank');
    };

    const startCrawling = async () => {
        if (selectedRegions.length === 0) {
            alert('최소 1개 이상의 지역을 선택해주세요.');
            return;
        }
        if (selectedTypes.length === 0) {
            alert('최소 1개 이상의 부동산 유형을 선택해주세요.');
            return;
        }

        setCrawlStatus('running');
        setProgress(10);
        setLogs([`[${new Date().toLocaleTimeString()}] 크롤링 시작...`]);

        try {
            setProgress(30);
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] API 요청 중...`]);

            const response = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    regions: selectedRegions,
                    propertyTypes: selectedTypes,
                    tradeTypes: selectedTrades,
                }),
            });

            setProgress(70);

            const result = await response.json();

            if (result.success) {
                setProgress(100);
                setLogs(prev => [...prev, ...result.logs]);
                setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ 총 ${result.count}개 매물 수집 완료!`]);
                setCrawlStatus('complete');

                // 수집된 데이터를 sessionStorage에 저장
                if (result.data && result.data.length > 0) {
                    sessionStorage.setItem('crawledData', JSON.stringify(result.data));
                }
            } else {
                throw new Error(result.error || '알 수 없는 오류');
            }
        } catch (error: any) {
            setProgress(0);
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ 에러: ${error.message}`]);
            setCrawlStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <Sidebar />

            <main className="ml-0 lg:ml-[260px] transition-[margin] duration-300">
                <Header
                    title="크롤링"
                    breadcrumb={[
                        { label: '홈' },
                        { label: '크롤링', current: true },
                    ]}
                />

                <div className="p-4 lg:p-8">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
                        {/* Left: Settings */}
                        <div className="xl:col-span-2 space-y-4 lg:space-y-6">
                            {/* Region Selection */}
                            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 lg:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={20} className="text-emerald-400" />
                                        <h3 className="font-semibold">지역 선택</h3>
                                        <span className="text-sm text-[var(--text-tertiary)]">
                                            ({selectedRegions.length}개 선택)
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={loadPreview}
                                            disabled={previewLoading || selectedRegions.length === 0}
                                            className="text-xs px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                                        >
                                            <Eye size={14} />
                                            미리보기
                                        </button>
                                        <button
                                            onClick={openNaverLand}
                                            disabled={selectedRegions.length === 0}
                                            className="text-xs px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                                        >
                                            <ExternalLink size={14} />
                                            새 탭
                                        </button>
                                        <button
                                            onClick={selectAllRegions}
                                            className="text-xs px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                                        >
                                            전체 선택
                                        </button>
                                        <button
                                            onClick={clearAllRegions}
                                            className="text-xs px-3 py-1.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            초기화
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                    {seoulDistricts.map(district => (
                                        <button
                                            key={district}
                                            onClick={() => toggleRegion(district)}
                                            className={`px-3 py-2 text-sm rounded-lg border transition-all ${selectedRegions.includes(district)
                                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                                : 'bg-[var(--bg-tertiary)] border-transparent text-[var(--text-secondary)] hover:border-[var(--border-color)]'
                                                }`}
                                        >
                                            {district}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Property Type */}
                            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 lg:p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Building size={20} className="text-purple-400" />
                                    <h3 className="font-semibold">부동산 유형</h3>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {propertyTypes.map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => toggleType(type.id)}
                                            className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${selectedTypes.includes(type.id)
                                                ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                                                : 'bg-[var(--bg-tertiary)] border-transparent text-[var(--text-secondary)] hover:border-[var(--border-color)]'
                                                }`}
                                        >
                                            <type.icon size={18} />
                                            <span className="text-sm font-medium">{type.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Trade Type */}
                            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 lg:p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Home size={20} className="text-blue-400" />
                                    <h3 className="font-semibold">거래 유형</h3>
                                </div>
                                <div className="flex gap-3">
                                    {tradeTypes.map(trade => (
                                        <button
                                            key={trade.id}
                                            onClick={() => toggleTrade(trade.id)}
                                            className={`flex-1 p-3 rounded-lg border text-center transition-all ${selectedTrades.includes(trade.id)
                                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                                : 'bg-[var(--bg-tertiary)] border-transparent text-[var(--text-secondary)] hover:border-[var(--border-color)]'
                                                }`}
                                        >
                                            <span className="text-sm font-medium">{trade.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Actions & Progress */}
                        <div className="space-y-4 lg:space-y-6">
                            {/* Start Button */}
                            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 lg:p-6">
                                <button
                                    onClick={startCrawling}
                                    disabled={crawlStatus === 'running'}
                                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-lg transition-all ${crawlStatus === 'running'
                                        ? 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed'
                                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5'
                                        }`}
                                >
                                    {crawlStatus === 'running' ? (
                                        <>
                                            <Loader2 size={24} className="animate-spin" />
                                            크롤링 중...
                                        </>
                                    ) : (
                                        <>
                                            <Play size={24} />
                                            크롤링 시작
                                        </>
                                    )}
                                </button>

                                {/* Summary */}
                                <div className="mt-4 p-4 bg-[var(--bg-tertiary)] rounded-lg">
                                    <p className="text-sm text-[var(--text-tertiary)] mb-2">수집 설정</p>
                                    <div className="space-y-1 text-sm">
                                        <p>📍 지역: <span className="text-white">{selectedRegions.length}개</span></p>
                                        <p>🏠 유형: <span className="text-white">{selectedTypes.length}개</span></p>
                                        <p>💰 거래: <span className="text-white">{selectedTrades.length}개</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Progress */}
                            {crawlStatus !== 'idle' && (
                                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 lg:p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold">진행 상황</h3>
                                        {crawlStatus === 'complete' && (
                                            <CheckCircle size={20} className="text-emerald-400" />
                                        )}
                                        {crawlStatus === 'error' && (
                                            <AlertCircle size={20} className="text-red-400" />
                                        )}
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-[var(--text-tertiary)]">진행률</span>
                                            <span className="text-emerald-400">{progress}%</span>
                                        </div>
                                        <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Logs */}
                                    <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 max-h-40 overflow-y-auto font-mono text-xs">
                                        {logs.map((log, i) => (
                                            <div key={i} className="text-[var(--text-tertiary)] py-0.5">
                                                {log}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-secondary)] rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Eye size={20} className="text-blue-400" />
                                페이지 미리보기 - {selectedRegions[0]}
                            </h3>
                            <div className="flex items-center gap-2">
                                {previewUrl && (
                                    <a
                                        href={previewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 flex items-center gap-1"
                                    >
                                        <ExternalLink size={14} />
                                        새 탭에서 열기
                                    </a>
                                )}
                                <button
                                    onClick={() => { setShowPreview(false); setPreviewImage(null); }}
                                    className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 overflow-auto max-h-[calc(90vh-70px)]">
                            {previewLoading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 size={48} className="animate-spin text-blue-400 mb-4" />
                                    <p className="text-[var(--text-secondary)]">페이지 캡처 중...</p>
                                    <p className="text-xs text-[var(--text-tertiary)] mt-1">5~10초 정도 소요됩니다</p>
                                </div>
                            ) : previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="Naver Land Preview"
                                    className="w-full rounded-lg border border-[var(--border-color)]"
                                />
                            ) : (
                                <div className="text-center py-20 text-[var(--text-tertiary)]">
                                    미리보기를 로드할 수 없습니다
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
