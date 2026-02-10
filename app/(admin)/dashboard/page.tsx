import { getSupabaseAdmin } from "@/lib/supabase";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ShoppingBag, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const admin = getSupabaseAdmin();

    // Fetch Stats
    const { count: totalPedidos } = await admin
        .from('pedidos')
        .select('*', { count: 'exact', head: true });

    const { count: pendientes } = await admin
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente');

    const { count: lowStock } = await admin
        .from('variantes')
        .select('*', { count: 'exact', head: true })
        .lt('stock', 5);

    // Recent Orders
    const { data: recentOrders } = await admin
        .from('pedidos')
        .select('*, variantes(sku, productos(nombre))')
        .order('created_at', { ascending: false })
        .limit(5);

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div>
                <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Resumen de actividad.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    title="Pedidos Totales"
                    value={totalPedidos || 0}
                    icon={ShoppingBag}
                    description="Histórico"
                />
                <StatsCard
                    title="Pendientes de Pago"
                    value={pendientes || 0}
                    icon={Clock}
                    description="Requieren atención"
                />
                <StatsCard
                    title="Stock Bajo"
                    value={lowStock || 0}
                    icon={AlertTriangle}
                    description="Variantes con < 5 unidades"
                />
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">Pedidos Recientes</h2>
                    <Link href="/dashboard/pedidos" className="text-sm font-medium text-blue-600 hover:underline">Ver todos</Link>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentOrders?.map((order: any) => (
                            <TableRow key={order.id}>
                                <TableCell className="text-gray-500 text-xs">
                                    {format(new Date(order.created_at), 'dd/MM HH:mm')}
                                </TableCell>
                                <TableCell className="font-medium">{order.cliente_nombre}</TableCell>
                                <TableCell className="text-sm">
                                    {order.variantes?.productos?.nombre} <span className="text-gray-400 text-xs">({order.variantes?.sku})</span>
                                </TableCell>
                                <TableCell className="font-bold">${order.total}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize 
                                        ${order.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                                            order.estado === 'pagado' ? 'bg-green-100 text-green-700' :
                                                order.estado === 'en_produccion' ? 'bg-blue-100 text-blue-700' :
                                                    order.estado === 'cancelado' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'}`}>
                                        {order.estado.replace('_', ' ')}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!recentOrders || recentOrders.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-400 italic">No hay pedidos recientes.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
