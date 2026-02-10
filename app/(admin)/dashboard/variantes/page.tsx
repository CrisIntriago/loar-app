import { getSupabaseAdmin } from "@/lib/supabase";
import VariantesTable from "@/components/dashboard/VariantesTable";

export const dynamic = 'force-dynamic';

export default async function VariantesPage({ searchParams }: { searchParams: { producto_id?: string } }) {
    const admin = getSupabaseAdmin();
    let query = admin
        .from('variantes')
        .select(`
            *,
            productos (nombre)
        `)
        .eq('activo', true)
        .order('created_at', { ascending: false });

    if (searchParams.producto_id) {
        query = query.eq('producto_id', searchParams.producto_id);
    }

    const { data: variantes } = await query;

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div>
                <h1 className="text-3xl font-black tracking-tight">Variantes de Inventario</h1>
                <p className="text-muted-foreground">Gestiona stock y precios por variante.</p>
            </div>

            <VariantesTable initialData={variantes || []} />
        </div>
    );
}
