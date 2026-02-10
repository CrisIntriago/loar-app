import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { Database } from '@/types/database';

// Define explicit type for the joined query result
// Base type is Pedido, but we need to tell TS about the joined relation
type Pedido = Database['public']['Tables']['pedidos']['Row'];
type PedidoConVariante = Pedido & {
    variantes: {
        stock: number;
    } | null;
};

// PATCH: Actualizar estado de pedido
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { estado } = body;
        const { id } = params;
        const admin = getSupabaseAdmin();

        // 1. Obtener pedido actual
        const { data: pedidoData, error: fetchError } = await admin
            .from('pedidos')
            .select(`
                *,
                variantes (stock)
            `)
            .eq('id', id)
            .single();

        if (fetchError || !pedidoData) {
            return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
        }

        const pedido = pedidoData as unknown as PedidoConVariante;
        const variante = pedido.variantes;

        // 2. Lógica de cambio de estado a 'pagado' -> decrementar stock
        if (estado === 'pagado' && pedido.estado !== 'pagado') {
            const stockActual = variante?.stock || 0;
            const newStock = Math.max(0, stockActual - pedido.cantidad);

            // Decrementar stock
            const { error: stockError } = await admin
                .from('variantes')
                .update({ stock: newStock })
                .eq('id', pedido.variante_id);

            if (stockError) throw stockError;

            // Historial stock
            await admin.from('historial_acciones').insert({
                usuario_id: 'system',
                accion: 'actualizo_stock',
                entidad_tipo: 'variante',
                entidad_id: pedido.variante_id,
                detalles: { cambio: -pedido.cantidad, motivo: `Pedido ${id} pagado` }
            } as any);
        }

        // 3. Actualizar pedido
        const { data: updatedOrder, error: updateError } = await admin
            .from('pedidos')
            .update({
                estado,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        // 4. Historial pedido
        await admin.from('historial_acciones').insert({
            usuario_id: 'admin',
            accion: 'aprobo_pago',
            entidad_tipo: 'pedido',
            entidad_id: id,
            detalles: { estado_anterior: pedido.estado, nuevo_estado: estado }
        } as any);

        return NextResponse.json(updatedOrder);

    } catch (e: any) {
        console.error("Error updating order:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// GET: Detalle Pedido
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const admin = getSupabaseAdmin();
        const { data, error } = await admin
            .from('pedidos')
            .select(`
                *,
                variantes (
                    sku,
                    productos (nombre, categoria, imagen_url)
                )
            `)
            .eq('id', params.id)
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
