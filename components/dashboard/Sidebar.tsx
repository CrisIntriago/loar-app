"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, History, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
    const pathname = usePathname();

    const links = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/pedidos', label: 'Pedidos', icon: ShoppingCart },
        { href: '/dashboard/inventario', label: 'Inventario', icon: Package },
        { href: '/dashboard/historial', label: 'Historial', icon: History },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col shadow-sm z-10 h-full">
            <div className="p-6 h-16 flex items-center justify-center border-b border-gray-50">
                <span className="font-black text-xl tracking-tight">LOAR ADMIN</span>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-4">
                {links.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group",
                                isActive
                                    ? "bg-gray-100 text-black font-semibold"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors",
                                isActive ? "text-black" : "text-gray-400 group-hover:text-black"
                            )} />
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-50">
                <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-50 text-red-500 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
