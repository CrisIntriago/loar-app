"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Box, Package, ShoppingBag, History, LogOut, Menu, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const menus = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Pedidos", href: "/dashboard/pedidos", icon: ShoppingBag },
    { name: "Productos", href: "/dashboard/productos", icon: Package },
    { name: "Variantes", href: "/dashboard/variantes", icon: Box },
    { name: "Historial", href: "/dashboard/historial", icon: History },
];

interface SidebarProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
}

export function Sidebar({ isCollapsed, toggleCollapse, isMobileOpen, setIsMobileOpen }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Trigger */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Button variant="outline" size="icon" onClick={() => setIsMobileOpen(!isMobileOpen)}>
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 bg-white border-r transform transition-all duration-300 ease-in-out 
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
                ${isCollapsed ? 'w-[70px]' : 'w-64'}
                `}
            >
                <div className="h-full flex flex-col justify-between p-4">
                    <div>
                        <div className={`mb-8 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-2`}>
                            {!isCollapsed && (
                                <div>
                                    <h1 className="text-2xl font-black tracking-tight">LOAR</h1>
                                    <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Gestión Admin</p>
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleCollapse}
                                className="hidden md:flex"
                            >
                                {isCollapsed ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                            </Button>
                        </div>

                        <nav className="space-y-1">
                            <TooltipProvider delayDuration={0}>
                                {menus.map((menu) => {
                                    const Icon = menu.icon;
                                    const isActive = pathname === menu.href;

                                    const LinkContent = (
                                        <Link
                                            key={menu.href}
                                            href={menu.href}
                                            onClick={() => setIsMobileOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                                ? "bg-black text-white shadow-lg shadow-black/20"
                                                : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
                                                } ${isCollapsed ? 'justify-center' : ''}`}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                                            {!isCollapsed && <span>{menu.name}</span>}
                                        </Link>
                                    );

                                    if (isCollapsed) {
                                        return (
                                            <Tooltip key={menu.href}>
                                                <TooltipTrigger asChild>
                                                    {LinkContent}
                                                </TooltipTrigger>
                                                <TooltipContent side="right" className="bg-black text-white border-black">
                                                    {menu.name}
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    }

                                    return LinkContent;
                                })}
                            </TooltipProvider>
                        </nav>
                    </div>

                    <div className="pb-4">
                        <TooltipProvider>
                            {isCollapsed ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => { }}>
                                            <LogOut className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="bg-black text-white border-black">
                                        Cerrar Sesión
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => { }}>
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Cerrar Sesión
                                </Button>
                            )}
                        </TooltipProvider>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileOpen(false)} />}
        </>
    );
}
