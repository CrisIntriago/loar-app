import { getSupabaseAdmin } from "@/lib/supabase";
import PedidosTable from "@/components/dashboard/PedidosTable";

export const dynamic = 'force-dynamic';

export default async function PedidosPage() {
    const admin = getSupabaseAdmin();
    // Fetch orders
    const { data: pedidos } = await admin
        .from('pedidos')
        .select(`
            *,
            variantes (
                sku,
                tecnica,
                talla,
                color,
                productos (nombre, imagen_url)
            )
        `)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div>
                <h1 className="text-3xl font-black tracking-tight">Pedidos</h1>
                <p className="text-muted-foreground">Administra y procesa tus órdenes.</p>
            </div>

            <PedidosTable initialData={pedidos || []} />
        </div>
    );
}
