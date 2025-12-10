'use client';

import { Search, Bell, Download } from 'lucide-react';

interface HeaderProps {
    title: string;
    breadcrumb?: { label: string; current?: boolean }[];
}

export default function Header({ title, breadcrumb }: HeaderProps) {
    return (
        <header className="h-[70px] border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
            <div className="ml-14 lg:ml-0">
                <h1 className="text-lg lg:text-xl font-semibold">{title}</h1>
                {breadcrumb && (
                    <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--text-tertiary)] mt-0.5">
                        {breadcrumb.map((item, i) => (
                            <span key={i} className="flex items-center gap-2">
                                {i > 0 && (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                )}
                                <span className={item.current ? 'text-[var(--text-secondary)]' : ''}>
                                    {item.label}
                                </span>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
                {/* Search */}
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg w-48 lg:w-64">
                    <Search size={16} className="text-[var(--text-tertiary)]" />
                    <input
                        type="text"
                        placeholder="검색..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                    />
                </div>

                {/* Mobile Search */}
                <button className="md:hidden w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)]">
                    <Search size={18} />
                </button>

                {/* Export Button */}
                <button className="hidden sm:flex items-center gap-2 px-3 lg:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5">
                    <Download size={16} />
                    <span className="hidden lg:inline">XLSX 내보내기</span>
                    <span className="lg:hidden">내보내기</span>
                </button>
            </div>
        </header>
    );
}
