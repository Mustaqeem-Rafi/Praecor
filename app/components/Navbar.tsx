'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Activity, LayoutGrid } from 'lucide-react';

export const Navbar = () => {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-teal-600 rounded-lg text-white shadow-md group-hover:bg-teal-500 transition-colors">
                        <Activity className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Praecor <span className="text-teal-600 font-light">Pro</span>
                    </span>
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/"
                        className={clsx(
                            "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                            pathname === '/'
                                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                        )}
                    >
                        <Activity className="w-4 h-4" />
                        Live Simulation
                    </Link>

                    <Link
                        href="/architecture"
                        className={clsx(
                            "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                            pathname === '/architecture'
                                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                        )}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        System Architecture
                    </Link>
                </div>
            </div>
        </nav>
    );
};
