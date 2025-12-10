'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Bookmark, Copy, CheckCircle, ExternalLink, Download, Zap, Plus } from 'lucide-react';

export default function BookmarkletPage() {
    const [copied, setCopied] = useState(false);
    const [baseUrl, setBaseUrl] = useState('');
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        setBaseUrl(window.location.origin);
    }, []);

    // 북마클릿 코드 생성
    const getBookmarkletCode = () => {
        const targetUrl = baseUrl || 'https://naver-land-crawler-falling-butterfly-5617.fly.dev';

        // 더 많은 정보를 추출하는 개선된 북마클릿
        const code = `javascript:(function(){
const items=document.querySelectorAll('.item');
const articles=[];
const pageTitle=document.title||'';
const complexTitleEl=document.querySelector('#complexTitle');
const complexTitle=complexTitleEl?.textContent?.trim()||'';
const addressEl=document.querySelector('.complex_title_area .address')||document.querySelector('.address');
const address=addressEl?.textContent?.trim()||'';
const regionMatch=address.match(/(서울|경기|인천|부산|대구|광주|대전|울산|세종|강원|충북|충남|전북|전남|경북|경남|제주)[^\\s]*\\s*([^\\s]+구|[^\\s]+시|[^\\s]+군)/);
const region=regionMatch?regionMatch[0].replace(/\\s+/g,' '):pageTitle.split('|')[0]?.split('-')[0]?.trim()||'';
items.forEach((item,i)=>{
try{
const name=item.querySelector('.item_title .text')?.textContent?.trim()||'';
const tradeType=item.querySelector('.price_line .type')?.textContent?.trim()||'';
const price=item.querySelector('.price_line .price')?.textContent?.trim()||'';
const specEls=item.querySelectorAll('.info_area .spec');
const spec=specEls[0]?.textContent?.trim()||'';
const desc=specEls[1]?.textContent?.trim()||'';
const agentEls=item.querySelectorAll('.agent_name');
const cp=agentEls[0]?.textContent?.trim()||'';
const agent=agentEls[1]?.textContent?.trim()||'';
if(name&&price){
articles.push({id:'bm_'+Date.now()+'_'+i,name,tradeType,price,spec,desc,cp,agent,region,complexTitle,address});
}
}catch(e){}
});
if(articles.length===0){alert('매물을 찾을 수 없습니다.');return;}
fetch('${targetUrl}/api/receive',{
method:'POST',
headers:{'Content-Type':'application/json'},
mode:'cors',
body:JSON.stringify({articles,url:location.href,pageTitle,complexTitle,address,region})
}).then(r=>r.json()).then(d=>{
if(d.success){alert('✅ '+d.count+'개 매물 전송 완료!');window.open('${targetUrl}/data?source=bookmarklet','_blank');}
else{alert('❌ 전송 실패');}
}).catch(e=>{
const blob=new Blob([JSON.stringify(articles)],{type:'application/json'});
const url=URL.createObjectURL(blob);
const a=document.createElement('a');a.href=url;a.download='naver_land.json';a.click();
alert('서버 전송 실패. JSON 다운로드됨.');
});
})();`;

        // 압축
        return code.replace(/\n/g, '').replace(/\s{2,}/g, ' ');
    };

    const bookmarkletCode = getBookmarkletCode();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(bookmarkletCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <Sidebar />

            <main className="ml-0 lg:ml-[260px] transition-[margin] duration-300">
                <Header
                    title="북마클릿"
                    breadcrumb={[
                        { label: '홈' },
                        { label: '북마클릿', current: true },
                    ]}
                />

                <div className="p-4 lg:p-8">
                    {/* 소개 배너 */}
                    <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                <Zap size={24} className="text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold mb-2">네이버 부동산 북마클릿</h2>
                                <p className="text-[var(--text-secondary)]">
                                    네이버 부동산 페이지에서 <strong>클릭 한 번</strong>으로 매물 데이터를 수집합니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 왼쪽: 설치 방법 */}
                        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Bookmark size={20} className="text-emerald-400" />
                                북마클릿 설치 (3단계)
                            </h3>

                            {/* Step 1: 코드 복사 */}
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold text-sm">1</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium mb-2">코드 복사하기</p>
                                        <button
                                            onClick={copyToClipboard}
                                            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${copied
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/30'
                                                }`}
                                        >
                                            {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                                            {copied ? '✅ 복사 완료!' : '북마클릿 코드 복사'}
                                        </button>
                                    </div>
                                </div>

                                {/* Step 2: 북마크바 우클릭 */}
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold text-sm">2</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium mb-2">북마크 추가</p>
                                        <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 text-sm space-y-1">
                                            <p>• 북마크바 <strong>우클릭</strong> → "페이지 추가" 또는 "북마크 추가"</p>
                                            <p>• 또는 <code className="bg-black/30 px-1 rounded">Ctrl+D</code> 눌러서 북마크 추가</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 3: URL에 붙여넣기 */}
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold text-sm">3</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium mb-2">URL에 붙여넣기</p>
                                        <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 text-sm space-y-1">
                                            <p>• 이름: <strong>🏠 네이버부동산 수집</strong></p>
                                            <p>• URL: 복사한 코드 <strong>붙여넣기</strong> (Ctrl+V)</p>
                                            <p>• 저장!</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 코드 미리보기 */}
                            <div className="mt-6 border-t border-[var(--border-color)] pt-4">
                                <p className="text-xs text-[var(--text-tertiary)] mb-2">코드 미리보기:</p>
                                <pre className="bg-[var(--bg-tertiary)] rounded-lg p-3 text-xs overflow-x-auto max-h-20 overflow-y-auto font-mono text-[var(--text-tertiary)]">
                                    {bookmarkletCode.slice(0, 150)}...
                                </pre>
                            </div>
                        </div>

                        {/* 오른쪽: 사용 방법 */}
                        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
                            <h3 className="font-semibold text-lg mb-4">📖 사용 방법</h3>

                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-emerald-400 font-bold text-sm">1</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">네이버 부동산 방문</p>
                                        <p className="text-sm text-[var(--text-tertiary)]">
                                            <a
                                                href="https://new.land.naver.com"
                                                target="_blank"
                                                className="text-blue-400 hover:underline inline-flex items-center gap-1"
                                            >
                                                new.land.naver.com <ExternalLink size={12} />
                                            </a>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-emerald-400 font-bold text-sm">2</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">매물 목록 페이지로 이동</p>
                                        <p className="text-sm text-[var(--text-tertiary)]">
                                            원하는 단지 클릭 → 매물 목록 확인
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-emerald-400 font-bold text-sm">3</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">북마클릿 클릭!</p>
                                        <p className="text-sm text-[var(--text-tertiary)]">
                                            북마크바에서 "🏠 네이버부동산 수집" 클릭
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-emerald-400 font-bold text-sm">4</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">결과 확인</p>
                                        <p className="text-sm text-[var(--text-tertiary)]">
                                            자동으로 결과 페이지 열림 → XLSX 다운로드
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 주의사항 */}
                            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <p className="text-yellow-400 text-sm font-medium mb-1">⚠️ 주의</p>
                                <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                                    <li>• <strong>매물 목록</strong>이 보이는 페이지에서 실행하세요</li>
                                    <li>• 팝업 차단 시 허용해주세요</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* 결과 페이지 링크 */}
                    <div className="mt-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">수집된 데이터 확인</h3>
                                <p className="text-sm text-[var(--text-tertiary)]">북마클릿으로 수집한 데이터 확인 & 다운로드</p>
                            </div>
                            <a
                                href="/data?source=bookmarklet"
                                className="px-4 py-2 bg-emerald-600 rounded-lg font-medium hover:bg-emerald-500 flex items-center gap-2"
                            >
                                <Download size={18} />
                                결과 보기
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
