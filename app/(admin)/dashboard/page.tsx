import { getSupabaseAdmin } from "@/lib/supabase";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { LowStockAlert } from "@/components/dashboard/LowStockAlert";
import { ShoppingCart, AlertCircle, Package } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    let pedidosCount = 0;
    let pendingCount = 0;
    let stockLowCount = 0;
    let recentOrders: any[] = [];
    let lowStockProducts: any[] = [];

    try {
        const admin = getSupabaseAdmin();

        // Parallel fetch
        const [pedidosRes, pendingRes, stockRes, recentRes, lowStockRes] = await Promise.all([
            admin.from('pedidos').select('*', { count: 'exact', head: true }),
            admin.from('pedidos').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
            admin.from('productos').select('*', { count: 'exact', head: true }).lt('stock', 5),
            admin.from('pedidos').select('*, productos(nombre)').order('created_at', { ascending: false }).limit(5),
            admin.from('productos').select('*').lt('stock', 5).order('stock', { ascending: true }).limit(5)
        ]);

        pedidosCount = pedidosRes.count || 0;
        pendingCount = pendingRes.count || 0;
        stockLowCount = stockRes.count || 0;
        recentOrders = recentRes.data || [];
        lowStockProducts = lowStockRes.data || [];

    } catch (error) {
        console.error("Dashboard fetch error (likely missing env vars):", error);
    }

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-gray-900">Dashboard</h1>
                    <p className="text-muted-foreground mt-2">Bienvenido al panel de administración de LOAR.</p>
                </div>
                <div className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-full border shadow-sm">
                    {new Date().toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <StatsCard
                    title="Pedidos Totales"
                    value={pedidosCount}
                    icon={<ShoppingCart className="h-4 w-4" />}
                    description="Total histórico"
                    className="border-blue-100 bg-blue-50/50"
                />
                <StatsCard
                    title="Pendientes de Pago"
                    value={pendingCount}
                    icon={<AlertCircle className="h-4 w-4 text-orange-500" />}
                    description="Requieren atención"
                    className="border-orange-100 bg-orange-50/50"
                    trendUp={pendingCount === 0}
                />
                <StatsCard
                    title="Alertas de Stock"
                    value={stockLowCount}
                    icon={<Package className="h-4 w-4 text-red-500" />}
                    description="Productos con stock bajo"
                    className="border-red-100 bg-red-50/50"
                    trendUp={stockLowCount === 0}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="md:col-span-4 lg:col-span-4">
                    <RecentOrders orders={recentOrders} />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                    <LowStockAlert products={lowStockProducts} />
                </div>
            </div>
        </div>
    )
}
