import InventarioTable from "@/components/dashboard/InventarioTable";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function InventarioPage() {
    let products = [];
    try {
        const admin = getSupabaseAdmin();
        const { data, error } = await admin.from('productos').select('*').order('created_at', { ascending: false });
        if (!error) products = data || [];
    } catch (e) {
        console.error("Dashboard inventory fetch error", e);
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-gray-900">Inventario</h1>
                    <p className="text-gray-500 mt-2 font-medium">Gestión de productos y stock</p>
                </div>
            </div>
            <InventarioTable initialProducts={products} />
        </div>
    )
}
