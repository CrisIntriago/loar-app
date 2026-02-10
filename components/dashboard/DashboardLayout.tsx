"use client";

import { Sidebar } from './Sidebar';
import { useSidebarState } from '@/hooks/useSidebarState';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isCollapsed, toggleCollapse, isMobileOpen, setIsMobileOpen } = useSidebarState();

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            <Sidebar
                isCollapsed={isCollapsed}
                toggleCollapse={toggleCollapse}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />
            <main
                className={`flex-1 overflow-auto bg-gray-50/50 transition-all duration-300 ease-in-out ${isCollapsed ? 'md:ml-[70px]' : 'md:ml-64'}`}
            >
                {children}
            </main>
        </div>
    );
}
