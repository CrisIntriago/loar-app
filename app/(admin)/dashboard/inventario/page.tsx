import { getSupabaseAdmin } from "@/lib/supabase";
import InventarioTable from "@/components/dashboard/InventarioTable";

export const dynamic = 'force-dynamic';

export default async function InventarioPage() {
    let products: any[] = [];

    try {
        const admin = getSupabaseAdmin();
        const { data, error } = await admin
            .from('productos')
            .select('*, producto_precios(cantidad_minima, cantidad_maxima, precio_unitario)')
            .order('nombre');

        if (!error && data) {
            products = data;
        }
    } catch (e) {
        console.error("Error fetching products:", e);
    }

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div>
                <h1 className="text-3xl font-black tracking-tight">Inventario</h1>
                <p className="text-muted-foreground">Gestiona tus productos, stock y precios.</p>
            </div>

            <InventarioTable initialProducts={products} />
        </div>
    );
}
