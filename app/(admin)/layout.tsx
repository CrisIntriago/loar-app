import Link from 'next/link';
import { LayoutDashboard, ShoppingCart, Package, History, LogOut } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col shadow-sm z-10">
                <div className="p-6 h-16 flex items-center justify-center border-b border-gray-50">
                    <span className="font-black text-xl tracking-tight">LOAR ADMIN</span>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">
                    {[
                        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { href: '/dashboard/pedidos', label: 'Pedidos', icon: ShoppingCart },
                        { href: '/dashboard/inventario', label: 'Inventario', icon: Package },
                        { href: '/dashboard/historial', label: 'Historial', icon: History },
                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-black transition-colors group"
                        >
                            <item.icon className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-50">
                    <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-50 text-red-500 transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium text-sm">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-50/50">
                {/* Mobile Header */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 justify-between md:hidden shadow-sm sticky top-0 z-20">
                    <span className="font-black text-lg">LOAR</span>
                    <button className="p-2 bg-gray-100 rounded-md">
                        <LayoutDashboard className="w-5 h-5" />
                    </button>
                </header>

                <div className="max-w-7xl mx-auto p-6 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
