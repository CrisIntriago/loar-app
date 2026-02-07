import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    let pedidosCount = 0;
    let pendingCount = 0;
    let stockLowCount = 0;

    try {
        const admin = getSupabaseAdmin();

        // Parallel fetch
        const [pedidosRes, pendingRes, stockRes] = await Promise.all([
            admin.from('pedidos').select('*', { count: 'exact', head: true }),
            admin.from('pedidos').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
            admin.from('productos').select('*', { count: 'exact', head: true }).lt('stock', 5)
        ]);

        pedidosCount = pedidosRes.count || 0;
        pendingCount = pendingRes.count || 0;
        stockLowCount = stockRes.count || 0;

    } catch (error) {
        console.error("Dashboard fetch error (likely missing env vars):", error);
    }

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-black tracking-tight text-gray-900">Dashboard</h1>
                <div className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-full border shadow-sm">
                    {new Date().toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pedidos Totales</CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-gray-400"
                        >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-gray-900">{pedidosCount}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-green-600 font-medium">
                            +0% desde el mes pasado
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pendientes de Pago</CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-orange-500"
                        >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-gray-900">{pendingCount}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-orange-600 font-medium">
                            Requieren atención
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Alertas de Stock</CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-red-500"
                        >
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-gray-900">{stockLowCount}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-red-600 font-medium">
                            Productos con stock bajo
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
