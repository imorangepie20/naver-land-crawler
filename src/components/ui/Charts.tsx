'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface ChartProps {
    className?: string;
    data?: { name: string; value: number }[];
}

// 기본 샘플 데이터
const defaultData = [
    { name: '강남구', value: 1250 },
    { name: '서초구', value: 980 },
    { name: '송파구', value: 870 },
    { name: '마포구', value: 650 },
    { name: '용산구', value: 520 },
    { name: '영등포구', value: 480 },
];

export default function RegionChart({ className, data = defaultData }: ChartProps) {
    return (
        <div className={className}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="name"
                        stroke="#71717a"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#71717a"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(18, 18, 26, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                        }}
                        labelStyle={{ color: '#a1a1aa', marginBottom: '5px' }}
                        itemStyle={{ color: '#fff', fontSize: '13px' }}
                        formatter={(value: number) => [`${value.toLocaleString()}개`, '매물 수']}
                    />
                    <Bar dataKey="value" name="매물 수" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// 가격 추이 차트
const priceData = [
    { month: '7월', avg: 85000, max: 125000 },
    { month: '8월', avg: 87000, max: 128000 },
    { month: '9월', avg: 86500, max: 130000 },
    { month: '10월', avg: 88000, max: 132000 },
    { month: '11월', avg: 89500, max: 135000 },
    { month: '12월', avg: 91000, max: 138000 },
];

export function PriceTrendChart({ className }: ChartProps) {
    return (
        <div className={className}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="maxGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="month"
                        stroke="#71717a"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#71717a"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${(value / 10000).toFixed(0)}억`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(18, 18, 26, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                        }}
                        labelStyle={{ color: '#a1a1aa', marginBottom: '5px' }}
                        itemStyle={{ fontSize: '13px' }}
                        formatter={(value: number, name: string) => [
                            `${(value / 10000).toFixed(1)}억`,
                            name === 'avg' ? '평균가' : '최고가'
                        ]}
                    />
                    <Area
                        type="monotone"
                        dataKey="avg"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#avgGradient)"
                    />
                    <Area
                        type="monotone"
                        dataKey="max"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="url(#maxGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
