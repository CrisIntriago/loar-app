import { getSupabaseAdmin } from "@/lib/supabase";
import ProductosTable from "@/components/dashboard/ProductosTable";

export const dynamic = 'force-dynamic';

export default async function ProductosPage() {
    const admin = getSupabaseAdmin();
    // Fetch products with variants IDs to count them
    const { data: products } = await admin
        .from('productos')
        .select('*, variantes(id)')
        .eq('activo', true)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div>
                <h1 className="text-3xl font-black tracking-tight">Productos</h1>
                <p className="text-muted-foreground">Gestiona tu catálogo base.</p>
            </div>

            <ProductosTable initialData={products || []} />
        </div>
    );
}
