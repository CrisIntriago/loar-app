"use client";

import { LayoutDashboard } from 'lucide-react';

export function Header() {
    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 justify-between md:hidden shadow-sm sticky top-0 z-20">
            <span className="font-black text-lg">LOAR</span>
            <button className="p-2 bg-gray-100 rounded-md">
                <LayoutDashboard className="w-5 h-5" />
            </button>
        </header>
    );
}
