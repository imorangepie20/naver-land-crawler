'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { ClipboardPaste, Download, Trash2, CheckCircle, AlertCircle, Code } from 'lucide-react';

interface ParsedArticle {
    id: string;
    name: string;
    tradeType: string;
    price: string;
    priceValue: number;
    area: string;
    floor: string;
    direction: string;
    agent: string;
}

export default function PastePage() {
    const [pastedText, setPastedText] = useState('');
    const [articles, setArticles] = useState<ParsedArticle[]>([]);
    const [parseStatus, setParseStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [isHtmlMode, setIsHtmlMode] = useState(false);

    // 가격 파싱 (10억 3,000 → 103000)
    const parsePrice = (text: string): { priceStr: string; priceValue: number } => {
        let priceValue = 0;
        const cleaned = text.replace(/\s/g, '');

        const billionMatch = cleaned.match(/(\d+)억/);
        if (billionMatch) {
            priceValue += parseInt(billionMatch[1]) * 10000;
        }

        const afterBillionMatch = cleaned.match(/억([\d,]+)/);
        if (afterBillionMatch) {
            priceValue += parseInt(afterBillionMatch[1].replace(/,/g, ''));
        }

        if (!billionMatch) {
            const plainMatch = cleaned.match(/([\d,]+)/);
            if (plainMatch) {
                priceValue = parseInt(plainMatch[1].replace(/,/g, ''));
            }
        }

        return { priceStr: text.trim(), priceValue };
    };

    // HTML 파싱 (네이버 부동산 HTML 구조)
    const parseHtml = () => {
        if (!pastedText.trim()) {
            setParseStatus('error');
            setMessage('붙여넣기할 HTML이 없습니다.');
            return;
        }

        const parsed: ParsedArticle[] = [];

        // DOMParser로 HTML 파싱
        const parser = new DOMParser();
        const doc = parser.parseFromString(pastedText, 'text/html');

        // .item 요소들 찾기
        const items = doc.querySelectorAll('.item');

        items.forEach((item, index) => {
            try {
                // 매물명
                const nameEl = item.querySelector('.item_title .text');
                const name = nameEl?.textContent?.trim() || '-';

                // 거래 유형
                const tradeTypeEl = item.querySelector('.price_line .type');
                const tradeType = tradeTypeEl?.textContent?.trim() || '-';

                // 가격
                const priceEl = item.querySelector('.price_line .price');
                const priceText = priceEl?.textContent?.trim() || '';
                const { priceStr, priceValue } = parsePrice(priceText);

                // 상세 정보 (면적, 층수, 방향)
                const specEl = item.querySelector('.info_area .spec');
                const specText = specEl?.textContent?.trim() || '';

                // 스펙 파싱: "71D/48m², 저/18층, 동향"
                const specParts = specText.split(',').map(s => s.trim());
                const areaPart = specParts[0] || '-';
                const floorPart = specParts[1] || '-';
                const directionPart = specParts[2] || '-';

                // 중개사
                const agentEl = item.querySelector('.cp_area .agent_name');
                const agent = agentEl?.textContent?.trim() || '-';

                if (name !== '-' || priceValue > 0) {
                    parsed.push({
                        id: `html_${Date.now()}_${index}`,
                        name,
                        tradeType,
                        price: priceStr,
                        priceValue,
                        area: areaPart,
                        floor: floorPart,
                        direction: directionPart,
                        agent,
                    });
                }
            } catch (e) {
                console.error('Parse error:', e);
            }
        });

        if (parsed.length > 0) {
            setArticles(parsed);
            setParseStatus('success');
            setMessage(`🎉 ${parsed.length}개 매물 파싱 완료!`);
            sessionStorage.setItem('crawledData', JSON.stringify(parsed));
        } else {
            setParseStatus('error');
            setMessage('매물을 찾을 수 없습니다. HTML에 .item 요소가 있는지 확인하세요.');
        }
    };

    // 텍스트 파싱 (일반 텍스트)
    const parseText = () => {
        if (!pastedText.trim()) {
            setParseStatus('error');
            setMessage('붙여넣기할 텍스트가 없습니다.');
            return;
        }

        const parsed: ParsedArticle[] = [];
        const lines = pastedText.split('\n').filter(line => line.trim());

        let current: Partial<ParsedArticle> = {};

        for (const line of lines) {
            const trimmed = line.trim();

            // 가격 라인 (매매 10억, 전세 5억 등)
            if (trimmed.match(/(매매|전세|월세)\s*[\d억,]+/)) {
                if (current.name || current.price) {
                    parsed.push({
                        id: `text_${Date.now()}_${parsed.length}`,
                        name: current.name || '-',
                        tradeType: current.tradeType || '-',
                        price: current.price || '-',
                        priceValue: current.priceValue || 0,
                        area: current.area || '-',
                        floor: current.floor || '-',
                        direction: current.direction || '-',
                        agent: current.agent || '-',
                    });
                }
                current = {};

                if (trimmed.includes('매매')) current.tradeType = '매매';
                else if (trimmed.includes('전세')) current.tradeType = '전세';
                else if (trimmed.includes('월세')) current.tradeType = '월세';

                const { priceStr, priceValue } = parsePrice(trimmed);
                current.price = priceStr;
                current.priceValue = priceValue;
            }

            // 건물명 (동 포함)
            if (trimmed.match(/[가-힣]+.*\d*동/)) {
                if (!current.name) current.name = trimmed;
            }

            // 면적/층수 라인
            if (trimmed.includes('㎡') || trimmed.includes('층')) {
                const parts = trimmed.split(',').map(s => s.trim());
                if (!current.area && parts[0]) current.area = parts[0];
                if (!current.floor && parts[1]) current.floor = parts[1];
                if (!current.direction && parts[2]) current.direction = parts[2];
            }
        }

        // 마지막 항목
        if (current.name || current.price) {
            parsed.push({
                id: `text_${Date.now()}_${parsed.length}`,
                name: current.name || '-',
                tradeType: current.tradeType || '-',
                price: current.price || '-',
                priceValue: current.priceValue || 0,
                area: current.area || '-',
                floor: current.floor || '-',
                direction: current.direction || '-',
                agent: current.agent || '-',
            });
        }

        if (parsed.length > 0) {
            setArticles(parsed);
            setParseStatus('success');
            setMessage(`🎉 ${parsed.length}개 매물 파싱 완료!`);
            sessionStorage.setItem('crawledData', JSON.stringify(parsed));
        } else {
            setParseStatus('error');
            setMessage('매물 정보를 찾을 수 없습니다.');
        }
    };

    // 파싱 실행
    const handleParse = () => {
        if (isHtmlMode || pastedText.includes('<div') || pastedText.includes('class=')) {
            parseHtml();
        } else {
            parseText();
        }
    };

    // XLSX 다운로드
    const downloadXlsx = async () => {
        if (articles.length === 0) return;

        const xlsx = await import('xlsx');

        const data = articles.map(a => ({
            '매물명': a.name,
            '거래유형': a.tradeType,
            '가격': a.price,
            '가격(만원)': a.priceValue,
            '면적': a.area,
            '층수': a.floor,
            '방향': a.direction,
            '중개사': a.agent,
        }));

        const ws = xlsx.utils.json_to_sheet(data);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, '매물목록');

        xlsx.writeFile(wb, `네이버부동산_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // 초기화
    const clearAll = () => {
        setPastedText('');
        setArticles([]);
        setParseStatus('idle');
        setMessage('');
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <Sidebar />

            <main className="ml-0 lg:ml-[260px] transition-[margin] duration-300">
                <Header
                    title="복사-붙여넣기 파서"
                    breadcrumb={[
                        { label: '홈' },
                        { label: '복붙 파서', current: true },
                    ]}
                />

                <div className="p-4 lg:p-8">
                    {/* 안내 배너 */}
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
                        <p className="text-emerald-400 font-medium mb-1">📋 사용방법</p>
                        <p className="text-sm text-[var(--text-secondary)]">
                            1. 네이버 부동산에서 매물 목록 영역 <strong>우클릭 → 검사 → HTML 복사</strong><br />
                            2. 아래 텍스트 영역에 Ctrl+V<br />
                            3. "파싱하기" 클릭 → XLSX 다운로드!
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 왼쪽: 입력 */}
                        <div className="space-y-4">
                            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <ClipboardPaste size={18} className="text-emerald-400" />
                                        텍스트/HTML 붙여넣기
                                    </h3>
                                    <button
                                        onClick={() => setIsHtmlMode(!isHtmlMode)}
                                        className={`px-3 py-1 text-xs rounded-lg flex items-center gap-1 ${isHtmlMode ? 'bg-purple-500/20 text-purple-400' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                                            }`}
                                    >
                                        <Code size={14} />
                                        HTML 모드 {isHtmlMode ? 'ON' : 'OFF'}
                                    </button>
                                </div>

                                <textarea
                                    value={pastedText}
                                    onChange={(e) => setPastedText(e.target.value)}
                                    placeholder={isHtmlMode
                                        ? '네이버 부동산 HTML을 붙여넣으세요...\n\n<div class="item">...</div>'
                                        : '네이버 부동산에서 복사한 텍스트를 붙여넣으세요...\n\n예시:\n펜트힐캐스케이드 1동\n매매 10억 3,000\n아파트 71D/48m², 저/18층, 동향'}
                                    className="w-full h-[300px] px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono text-sm"
                                />

                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={handleParse}
                                        className="flex-1 py-3 bg-emerald-600 rounded-lg font-medium hover:bg-emerald-500 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={18} />
                                        파싱하기
                                    </button>
                                    <button
                                        onClick={clearAll}
                                        className="px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {message && (
                                    <div className={`mt-4 p-3 rounded-lg ${parseStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                        }`}>
                                        {message}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 오른쪽: 결과 */}
                        <div className="space-y-4">
                            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold">📊 파싱 결과 ({articles.length}개)</h3>
                                    {articles.length > 0 && (
                                        <button
                                            onClick={downloadXlsx}
                                            className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500 flex items-center gap-2"
                                        >
                                            <Download size={16} />
                                            XLSX 다운로드
                                        </button>
                                    )}
                                </div>

                                {articles.length > 0 ? (
                                    <div className="max-h-[400px] overflow-y-auto space-y-2">
                                        {articles.map((article) => (
                                            <div key={article.id} className="bg-[var(--bg-tertiary)] rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-sm truncate max-w-[200px]">{article.name}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded ${article.tradeType === '매매' ? 'bg-emerald-500/20 text-emerald-400' :
                                                            article.tradeType === '전세' ? 'bg-blue-500/20 text-blue-400' :
                                                                'bg-purple-500/20 text-purple-400'
                                                        }`}>
                                                        {article.tradeType}
                                                    </span>
                                                </div>
                                                <div className="text-emerald-400 font-bold text-lg mb-1">{article.price}</div>
                                                <div className="flex flex-wrap gap-2 text-xs text-[var(--text-tertiary)]">
                                                    <span>{article.area}</span>
                                                    <span>•</span>
                                                    <span>{article.floor}</span>
                                                    <span>•</span>
                                                    <span>{article.direction}</span>
                                                </div>
                                                {article.agent !== '-' && (
                                                    <div className="text-xs text-[var(--text-tertiary)] mt-1 truncate">
                                                        🏠 {article.agent}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center text-[var(--text-tertiary)]">
                                        <div className="text-center">
                                            <AlertCircle size={40} className="mx-auto mb-2 opacity-50" />
                                            <p>텍스트 또는 HTML을 붙여넣고 파싱하세요</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
