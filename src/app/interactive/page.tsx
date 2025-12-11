'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import {
    Loader2, CheckCircle, MapPin, Monitor, ExternalLink, Database, RefreshCw, Globe, Tv, X
} from 'lucide-react';

// 전국 시/도 목록
const provinces = [
    '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시',
    '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원특별자치도',
    '충청북도', '충청남도', '전북특별자치도', '전라남도', '경상북도', '경상남도', '제주특별자치도'
];

const propertyTypes = [
    { id: 'APT', name: '아파트' },
    { id: 'OPST', name: '오피스텔' },
    { id: 'VL', name: '빌라' },
];

const tradeTypes = [
    { id: 'A1', name: '매매' },
    { id: 'B1', name: '전세' },
    { id: 'B2', name: '월세' },
];

type Step = 'idle' | 'browser_launched' | 'page_opened' | 'scraping' | 'complete';

interface RegionItem {
    cortarNo: string;
    cortarName: string;
    cortarType: string;
}

export default function InteractiveCrawlerPage() {
    const [selectedProvince, setSelectedProvince] = useState('서울특별시');
    const [selectedCity, setSelectedCity] = useState('');
    const [cities, setCities] = useState<RegionItem[]>([]);
    const [loadingCities, setLoadingCities] = useState(false);
    const [selectedType, setSelectedType] = useState('APT');
    const [selectedTrade, setSelectedTrade] = useState('A1');
    const [step, setStep] = useState<Step>('idle');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [articles, setArticles] = useState<any[]>([]);
    const [pageUrl, setPageUrl] = useState('');
    const [showVnc, setShowVnc] = useState(false);
    const [vncUrl, setVncUrl] = useState('');

    // API 호출 헬퍼
    const callApi = async (action: string, params: any = {}) => {
        const response = await fetch('/api/stealth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...params }),
        });
        return response.json();
    };

    // 현재 URL 주기적 업데이트
    const updateCurrentUrl = useCallback(async () => {
        if (step === 'page_opened' || step === 'browser_launched') {
            const result = await callApi('get_url');
            if (result.success && result.url) {
                setPageUrl(result.url);
            }
        }
    }, [step]);

    useEffect(() => {
        const interval = setInterval(updateCurrentUrl, 3000);
        return () => clearInterval(interval);
    }, [updateCurrentUrl]);

    // VNC URL 설정 (같은 호스트, 포트 6090)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const host = window.location.hostname;
            setVncUrl(`http://${host}:6090/vnc.html?autoconnect=true`);
        }
    }, []);

    // 시/도 변경 시 시/군/구 목록 가져오기
    useEffect(() => {
        const fetchCities = async () => {
            setLoadingCities(true);
            try {
                const response = await fetch(`/api/regions/hierarchy?province=${encodeURIComponent(selectedProvince)}&level=city`);
                const data = await response.json();
                if (data.success && data.data) {
                    setCities(data.data);
                    if (data.data.length > 0) {
                        setSelectedCity(data.data[0].cortarName);
                    }
                }
            } catch (e) {
                console.error('Failed to fetch cities:', e);
            } finally {
                setLoadingCities(false);
            }
        };
        fetchCities();
    }, [selectedProvince]);

    // Step 1: 브라우저 시작
    const launchBrowser = async () => {
        setLoading(true);
        setMessage('🛡️ 스텔스 모드 Chrome 실행 중...');

        try {
            const result = await callApi('launch');
            if (result.success) {
                // 새 세션 시작 시 이전 데이터 초기화
                sessionStorage.removeItem('crawledData');
                sessionStorage.removeItem('crawledDetails');
                setArticles([]);

                setStep('browser_launched');
                setMessage(result.message);
            } else {
                setMessage('❌ ' + result.message);
            }
        } catch (e: any) {
            setMessage('❌ 오류: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 2a: 자유 탐색 모드
    const openFreeBrowse = async () => {
        setLoading(true);
        setMessage('🌐 네이버 부동산 열기...');

        try {
            const result = await callApi('open_free');
            if (result.success) {
                setStep('page_opened');
                setPageUrl(result.url);
                setMessage(result.instruction);
            } else {
                setMessage('❌ ' + result.message);
            }
        } catch (e: any) {
            setMessage('❌ 오류: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 2b: 특정 지역 페이지 열기
    const openRegionPage = async () => {
        setLoading(true);
        setMessage('📍 지역 페이지 로딩 중...');

        try {
            const regionName = selectedCity || selectedProvince;
            const result = await callApi('open', {
                region: regionName,
                realEstateType: selectedType,
                tradeType: selectedTrade,
            });

            if (result.success) {
                setStep('page_opened');
                setPageUrl(result.url);
                setMessage(result.instruction);
            } else {
                setMessage('❌ ' + result.message);
            }
        } catch (e: any) {
            setMessage('❌ ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 3: 데이터 수집
    const scrapeData = async () => {
        setLoading(true);
        setStep('scraping');
        setMessage('📊 데이터 수집 중...');

        try {
            const regionName = selectedCity || selectedProvince;
            const result = await callApi('scrape', { region: regionName });

            if (result.success) {
                setArticles(result.data || []);
                setPageUrl(result.url || pageUrl);
                setStep('complete');
                setMessage(result.message);

                if (result.data && result.data.length > 0) {
                    sessionStorage.setItem('crawledData', JSON.stringify(result.data));
                }
            } else {
                setMessage('❌ ' + result.message);
                setStep('page_opened');
            }
        } catch (e: any) {
            setMessage('❌ 오류: ' + e.message);
            setStep('page_opened');
        } finally {
            setLoading(false);
        }
    };

    // 다시 수집 (페이지는 유지)
    const scrapeAgain = async () => {
        setStep('page_opened');
        setArticles([]);
        setMessage('🔄 브라우저에서 원하는 페이지로 이동 후 다시 수집하세요.');
    };

    // 단지 클릭 후 상세 매물 수집
    const clickComplexAndScrape = async (complexName: string) => {
        setLoading(true);
        setMessage(`🏠 "${complexName}" 단지 클릭 중...`);

        try {
            const result = await callApi('click_complex', { complexName });

            if (result.success) {
                setMessage(`📊 "${complexName}" 매물 ${result.data?.length || 0}개 수집 완료!`);

                // 상세 매물 데이터를 별도로 저장 (기존 단지 데이터 유지)
                if (result.data && result.data.length > 0) {
                    const existingDetails = sessionStorage.getItem('crawledDetails');
                    const details = existingDetails ? JSON.parse(existingDetails) : [];
                    const newDetails = [...details, ...result.data];
                    sessionStorage.setItem('crawledDetails', JSON.stringify(newDetails));

                    // 통합 데이터도 업데이트
                    const existingData = sessionStorage.getItem('crawledData');
                    const allData = existingData ? JSON.parse(existingData) : [];
                    sessionStorage.setItem('crawledData', JSON.stringify([...allData, ...result.data]));
                }

                setPageUrl(result.url || pageUrl);
            } else {
                setMessage('❌ ' + result.message);
            }
        } catch (e: any) {
            setMessage('❌ 오류: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    // 브라우저 닫기
    const closeBrowser = async () => {
        await callApi('close');
        setStep('idle');
        setMessage('');
        setArticles([]);
        setPageUrl('');
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <Sidebar />

            <main className="ml-0 lg:ml-[260px] transition-[margin] duration-300">
                <Header
                    title="인터렉티브 크롤링"
                    breadcrumb={[
                        { label: '홈' },
                        { label: '인터렉티브 크롤링', current: true },
                    ]}
                />

                <div className="p-4 lg:p-8">
                    {/* Info Banner */}
                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
                        <p className="text-purple-400 font-medium mb-1">🛡️ 스텔스 모드 인터렉티브 크롤링</p>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Chrome 브라우저가 열리면 자유롭게 탐색하세요. 원하는 페이지에서 "데이터 수집" 버튼을 클릭하면 현재 화면의 데이터를 추출합니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Settings & Steps */}
                        <div className="space-y-6">
                            {/* Quick Settings */}
                            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <MapPin size={18} className="text-emerald-400" />
                                    빠른 설정 (선택)
                                </h3>

                                <div className="space-y-4">
                                    {/* 시/도 선택 */}
                                    <div>
                                        <label className="text-sm text-[var(--text-tertiary)] mb-2 block">시/도</label>
                                        <select
                                            value={selectedProvince}
                                            onChange={(e) => setSelectedProvince(e.target.value)}
                                            disabled={step !== 'idle' && step !== 'browser_launched'}
                                            className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg disabled:opacity-50"
                                        >
                                            {provinces.map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 시/군/구 선택 */}
                                    <div>
                                        <label className="text-sm text-[var(--text-tertiary)] mb-2 block">
                                            시/군/구 {loadingCities && <span className="text-xs text-blue-400">(로딩중...)</span>}
                                        </label>
                                        <select
                                            value={selectedCity}
                                            onChange={(e) => setSelectedCity(e.target.value)}
                                            disabled={step !== 'idle' && step !== 'browser_launched' || loadingCities}
                                            className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg disabled:opacity-50"
                                        >
                                            {cities.map(c => (
                                                <option key={c.cortarNo} value={c.cortarName}>{c.cortarName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-[var(--text-tertiary)] mb-2 block">유형</label>
                                            <select
                                                value={selectedType}
                                                onChange={(e) => setSelectedType(e.target.value)}
                                                disabled={step !== 'idle' && step !== 'browser_launched'}
                                                className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg disabled:opacity-50"
                                            >
                                                {propertyTypes.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm text-[var(--text-tertiary)] mb-2 block">거래</label>
                                            <select
                                                value={selectedTrade}
                                                onChange={(e) => setSelectedTrade(e.target.value)}
                                                disabled={step !== 'idle' && step !== 'browser_launched'}
                                                className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg disabled:opacity-50"
                                            >
                                                {tradeTypes.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Steps */}
                            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
                                <h3 className="font-semibold mb-4">📋 진행 단계</h3>

                                <div className="space-y-3">
                                    {/* Step 1: 브라우저 시작 */}
                                    <div className={`flex items-center gap-3 p-3 rounded-lg ${step === 'idle' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-[var(--bg-tertiary)]'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step !== 'idle' ? 'bg-emerald-500 text-white' : 'bg-[var(--bg-tertiary)]'}`}>
                                            {step !== 'idle' ? <CheckCircle size={18} /> : '1'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">브라우저 시작</p>
                                            <p className="text-xs text-[var(--text-tertiary)]">스텔스 모드 Chrome 실행</p>
                                        </div>
                                        {step === 'idle' && (
                                            <button
                                                onClick={launchBrowser}
                                                disabled={loading}
                                                className="px-4 py-2 bg-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-500 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Monitor size={16} />}
                                                시작
                                            </button>
                                        )}
                                    </div>

                                    {/* Step 2: 페이지 열기 */}
                                    <div className={`flex items-center gap-3 p-3 rounded-lg ${step === 'browser_launched' ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-[var(--bg-tertiary)]'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['page_opened', 'scraping', 'complete'].includes(step) ? 'bg-emerald-500 text-white' : 'bg-[var(--bg-tertiary)]'}`}>
                                            {['page_opened', 'scraping', 'complete'].includes(step) ? <CheckCircle size={18} /> : '2'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">페이지 열기</p>
                                            <p className="text-xs text-[var(--text-tertiary)]">자유 탐색 또는 지역 선택</p>
                                        </div>
                                        {step === 'browser_launched' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={openFreeBrowse}
                                                    disabled={loading}
                                                    className="px-3 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50 flex items-center gap-1"
                                                >
                                                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                                                    자유탐색
                                                </button>
                                                <button
                                                    onClick={openRegionPage}
                                                    disabled={loading}
                                                    className="px-3 py-2 bg-purple-600 rounded-lg text-sm font-medium hover:bg-purple-500 disabled:opacity-50 flex items-center gap-1"
                                                >
                                                    {loading ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
                                                    지역열기
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Step 3: 데이터 수집 */}
                                    <div className={`flex items-center gap-3 p-3 rounded-lg ${step === 'page_opened' ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-[var(--bg-tertiary)]'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'complete' ? 'bg-emerald-500 text-white' : 'bg-[var(--bg-tertiary)]'}`}>
                                            {step === 'complete' ? <CheckCircle size={18} /> : '3'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">데이터 수집</p>
                                            <p className="text-xs text-[var(--text-tertiary)]">현재 페이지에서 데이터 추출</p>
                                        </div>
                                        {step === 'page_opened' && (
                                            <button
                                                onClick={scrapeData}
                                                disabled={loading}
                                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-sm font-medium hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                                                수집하기
                                            </button>
                                        )}
                                        {step === 'complete' && (
                                            <button
                                                onClick={scrapeAgain}
                                                className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500 flex items-center gap-2"
                                            >
                                                <RefreshCw size={16} />
                                                다시 수집
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {step !== 'idle' && (
                                    <button
                                        onClick={closeBrowser}
                                        className="w-full mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30"
                                    >
                                        🔄 처음부터 다시
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Right: Status & Results */}
                        <div className="space-y-6">
                            {/* Status */}
                            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
                                <h3 className="font-semibold mb-3">📢 상태</h3>
                                <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 min-h-[80px]">
                                    {message ? (
                                        <p className="text-sm whitespace-pre-wrap">{message}</p>
                                    ) : (
                                        <p className="text-sm text-[var(--text-tertiary)]">"브라우저 시작" 버튼을 클릭하세요.</p>
                                    )}
                                </div>
                                {pageUrl && (
                                    <div className="mt-3 p-3 bg-blue-500/10 rounded-lg">
                                        <p className="text-xs text-[var(--text-tertiary)] mb-1">현재 URL:</p>
                                        <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline break-all">
                                            {pageUrl}
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Results */}
                            {articles.length > 0 && (
                                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold">📊 수집 결과</h3>
                                        <span className="text-emerald-400 font-medium">{articles.length}개</span>
                                    </div>

                                    <div className="max-h-[600px] overflow-y-auto space-y-2">
                                        {articles.map((article, i) => (
                                            <div
                                                key={i}
                                                className="bg-[var(--bg-tertiary)] rounded-lg p-3 cursor-pointer hover:bg-[var(--bg-tertiary)]/80 hover:ring-1 hover:ring-emerald-500/50 transition-all"
                                                onClick={() => !loading && clickComplexAndScrape(article.articleName)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-sm truncate flex-1">{article.articleName}</p>
                                                    <span className="text-xs text-emerald-400 ml-2">클릭→매물수집</span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-tertiary)]">
                                                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                                                        {article.tradeTypeName}
                                                        {article.articleCount && ` ${article.articleCount}`}
                                                    </span>
                                                    <span className="text-emerald-400 font-medium">
                                                        {article.priceText || `${(article.dealPrice || article.warrantPrice || 0).toLocaleString()}만원`}
                                                    </span>
                                                    {article.area2 > 0 && <span>{article.area2}㎡</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <a href="/data" className="block mt-4 w-full text-center py-2 bg-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-500">
                                        데이터 페이지에서 보기 →
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* VNC 팝업 버튼 (고정) */}
            <button
                onClick={() => setShowVnc(true)}
                className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-full shadow-lg z-40 transition-all hover:scale-110"
                title="원격 브라우저 보기"
            >
                <Tv className="w-6 h-6" />
            </button>

            {/* VNC 모달 */}
            {showVnc && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-secondary)] rounded-xl w-full max-w-6xl h-[85vh] flex flex-col">
                        {/* 모달 헤더 */}
                        <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)]">
                            <div className="flex items-center gap-3">
                                <Tv className="w-5 h-5 text-purple-400" />
                                <h3 className="font-medium">원격 브라우저 (noVNC)</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={vncUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-[var(--text-secondary)] hover:text-white flex items-center gap-1"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    새 탭에서 열기
                                </a>
                                <button
                                    onClick={() => setShowVnc(false)}
                                    className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {/* VNC iframe */}
                        <div className="flex-1 p-2">
                            <iframe
                                src={vncUrl}
                                className="w-full h-full rounded-lg border border-[var(--border-primary)]"
                                allow="clipboard-read; clipboard-write"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

