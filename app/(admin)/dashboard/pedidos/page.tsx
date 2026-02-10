import { getSupabaseAdmin } from "@/lib/supabase";
import PedidosTable from "@/components/dashboard/PedidosTable";

export const dynamic = 'force-dynamic';

export default async function PedidosPage() {
    let pedidos: any[] = [];

    try {
        const admin = getSupabaseAdmin();
        const { data, error } = await admin
            .from('pedidos')
            .select('*, productos(nombre)')
            .order('created_at', { ascending: false });

        if (!error && data) {
            pedidos = data;
        }
    } catch (e) {
        console.error("Error fetching pedidos:", e);
    }

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div>
                <h1 className="text-3xl font-black tracking-tight">Pedidos</h1>
                <p className="text-muted-foreground">Administra y actualiza el estado de los pedidos.</p>
            </div>

            <PedidosTable initialPedidos={pedidos} />
        </div>
    );
}
