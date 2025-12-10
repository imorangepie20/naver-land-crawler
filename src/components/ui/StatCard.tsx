import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    description?: string;
    icon: LucideIcon;
    iconColor?: 'green' | 'purple' | 'blue' | 'orange';
    badge?: string;
}

const iconColors = {
    green: 'bg-emerald-500/15 text-emerald-400',
    purple: 'bg-purple-500/15 text-purple-400',
    blue: 'bg-blue-500/15 text-blue-400',
    orange: 'bg-orange-500/15 text-orange-400',
};

const changeColors = {
    positive: 'text-emerald-400',
    negative: 'text-red-400',
    neutral: 'text-[var(--text-tertiary)]',
};

export default function StatCard({
    title,
    value,
    change,
    changeType = 'neutral',
    description,
    icon: Icon,
    iconColor = 'green',
    badge,
}: StatCardProps) {
    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 hover:border-[var(--border-color-hover)] transition-all hover:-translate-y-0.5 group">
            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColors[iconColor]}`}>
                    <Icon size={22} />
                </div>
                <div className="flex-1">
                    <p className="text-[var(--text-tertiary)] text-sm">{title}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold">{value}</span>
                        {change && (
                            <span className={`text-sm font-medium ${changeColors[changeType]}`}>
                                {change}
                            </span>
                        )}
                        {badge && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/15 text-emerald-400 rounded-full">
                                {badge}
                            </span>
                        )}
                    </div>
                    {description && (
                        <p className="text-[var(--text-tertiary)] text-xs mt-1">{description}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
