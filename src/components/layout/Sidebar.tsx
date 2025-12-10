'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    LayoutGrid, Search, Database, Settings,
    Menu, X, Home, Play, Download, Monitor, ClipboardPaste, Zap
} from 'lucide-react';

const navigation = [
    {
        title: '크롤러',
        items: [
            { name: '대시보드', href: '/', icon: LayoutGrid },
            { name: '북마클릿', href: '/bookmarklet', icon: Zap },
            { name: '복붙 파서', href: '/paste', icon: ClipboardPaste },
            { name: '인터랙티브', href: '/interactive', icon: Monitor },
            { name: '데이터', href: '/data', icon: Database },
        ],
    },
    {
        title: '설정',
        items: [
            { name: '설정', href: '/settings', icon: Settings },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 w-11 h-11 flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-lg"
            >
                <Menu size={20} />
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed left-0 top-0 h-screen w-[260px] bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col z-50
                transition-transform duration-300 ease-out
                lg:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Close Button (Mobile) */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[var(--text-tertiary)] hover:text-white"
                >
                    <X size={20} />
                </button>

                {/* Logo */}
                <div className="p-5 border-b border-[var(--border-color)]">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <Home size={20} className="text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">부동산 크롤러</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4">
                    {navigation.map((section) => (
                        <div key={section.title} className="mb-6">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] px-3 mb-2 block">
                                {section.title}
                            </span>
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${isActive
                                                ? 'bg-emerald-500/15 text-white'
                                                : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <item.icon size={18} className={isActive ? 'text-emerald-400' : ''} />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-[var(--border-color)]">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)]">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">🏠</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">네이버 부동산</p>
                            <p className="text-xs text-[var(--text-tertiary)]">Crawler v1.0</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
