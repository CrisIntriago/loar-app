"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Box, Package, ShoppingBag, History, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const menus = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Pedidos", href: "/dashboard/pedidos", icon: ShoppingBag },
    { name: "Productos", href: "/dashboard/productos", icon: Package },
    { name: "Variantes", href: "/dashboard/variantes", icon: Box },
    { name: "Historial", href: "/dashboard/historial", icon: History },
];

export function Sidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Mobile Trigger */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Button variant="outline" size="icon" onClick={() => setOpen(!open)}>
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col justify-between p-4">
                    <div>
                        <div className="mb-8 px-2">
                            <h1 className="text-2xl font-black tracking-tight">LOAR</h1>
                            <p className="text-xs text-gray-500 font-medium">Gestión Administrativa</p>
                        </div>

                        <nav className="space-y-1">
                            {menus.map((menu) => {
                                const Icon = menu.icon;
                                const isActive = pathname === menu.href;
                                return (
                                    <Link
                                        key={menu.href}
                                        href={menu.href}
                                        onClick={() => setOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? "bg-black text-white shadow-lg shadow-black/20"
                                            : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                                        {menu.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="pb-4">
                        <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => {/* Logout logic usually handled by Supabase Auth Context */ }}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {open && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setOpen(false)} />}
        </>
    );
}
