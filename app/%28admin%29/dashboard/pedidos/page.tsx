import PedidosTable from "@/components/dashboard/PedidosTable";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function PedidosPage() {
    let pedidos = [];
    try {
        const admin = getSupabaseAdmin();
        const { data, error } = await admin
            .from('pedidos')
            .select('*, productos(nombre)')
            .order('created_at', { ascending: false });
        if (!error) pedidos = data || [];
    } catch (e) {
        console.error("Fetch orders failed", e);
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black tracking-tight">Pedidos</h1>
                {/* Export utility placeholder */}
                <div className="flex gap-2">
                    <button className="bg-white border text-black px-4 py-2 rounded-md text-sm font-bold shadow-sm hover:bg-gray-50 flex items-center gap-2">
                        Actualizar
                    </button>
                </div>
            </div>
            <PedidosTable initialPedidos={pedidos} />
        </div>
    )
}
