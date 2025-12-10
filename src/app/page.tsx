'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import StatCard from '@/components/ui/StatCard';
import RegionChart, { PriceTrendChart } from '@/components/ui/Charts';
import { Home, TrendingUp, MapPin, Calendar, Play, Activity } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Sidebar />

      <main className="ml-0 lg:ml-[260px] transition-[margin] duration-300">
        <Header
          title="대시보드"
          breadcrumb={[
            { label: '홈' },
            { label: '대시보드', current: true },
          ]}
        />

        <div className="p-4 lg:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5 mb-6 lg:mb-8">
            <StatCard
              title="총 수집 매물"
              value="0"
              description="전체 수집된 매물"
              icon={Home}
              iconColor="green"
            />
            <StatCard
              title="오늘 수집"
              value="0"
              change="+0%"
              changeType="neutral"
              description="오늘 새로 수집"
              icon={TrendingUp}
              iconColor="purple"
            />
            <StatCard
              title="수집 지역"
              value="0"
              description="설정된 지역"
              icon={MapPin}
              iconColor="blue"
            />
            <StatCard
              title="마지막 크롤링"
              value="-"
              description="아직 실행 안됨"
              icon={Calendar}
              iconColor="orange"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-5 mb-6 lg:mb-8">
            {/* Region Distribution */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 lg:p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold">지역별 매물 분포</h3>
              </div>
              <RegionChart className="h-64" />
            </div>

            {/* Price Trend */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 lg:p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold">가격 추이</h3>
              </div>
              <PriceTrendChart className="h-64" />
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-5">
            {/* Quick Actions */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 lg:p-6">
              <h3 className="font-semibold mb-4">빠른 실행</h3>
              <div className="space-y-3">
                <a
                  href="/crawler"
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 hover:border-emerald-500/50 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Play size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">크롤링 시작</p>
                    <p className="text-xs text-[var(--text-tertiary)]">새로운 매물 수집</p>
                  </div>
                </a>
                <a
                  href="/data"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)] hover:bg-white/5 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Activity size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">데이터 조회</p>
                    <p className="text-xs text-[var(--text-tertiary)]">수집된 매물 보기</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Recent Crawling History */}
            <div className="xl:col-span-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
              <div className="flex justify-between items-center p-5 lg:p-6 border-b border-[var(--border-color)]">
                <h3 className="font-semibold">최근 크롤링 기록</h3>
                <a href="/data" className="text-sm text-emerald-400 hover:text-emerald-300">전체 보기 →</a>
              </div>
              <div className="p-5 lg:p-6">
                <div className="text-center py-8 text-[var(--text-tertiary)]">
                  <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                  <p>아직 크롤링 기록이 없습니다</p>
                  <p className="text-sm mt-1">크롤링을 시작해 매물 데이터를 수집하세요</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
