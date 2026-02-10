import { getSupabaseAdmin } from "@/lib/supabase";
import ProductEditForm from "@/components/dashboard/ProductEditForm";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: { id: string } }) {
    let product = null;

    try {
        const admin = getSupabaseAdmin();
        const { data, error } = await admin
            .from('productos')
            .select('*, producto_precios(id, cantidad_minima, cantidad_maxima, precio_unitario)')
            .eq('id', params.id)
            .single();

        if (data) {
            product = data;
        }
    } catch (e) {
        console.error("Error fetching product:", e);
    }

    if (!product) {
        notFound();
    }

    return (
        <div className="animate-in fade-in zoom-in duration-500">
            <ProductEditForm product={product} />
        </div>
    );
}
