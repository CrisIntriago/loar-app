import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { estado } = body;
        const { id } = params;
        const admin = getSupabaseAdmin();

        // 1. Obtener pedido actual con datos de producto
        const { data: pedido, error: fetchError } = await admin
            .from('pedidos')
            .select('*, productos(stock)')
            .eq('id', id)
            .single();

        if (fetchError || !pedido) {
            return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
        }

        const productoasociado = (pedido as any).productos;

        // 2. Lógica de cambio de estado a 'pagado' -> decrementar stock
        if (estado === 'pagado' && pedido.estado !== 'pagado') {
            // Verificar stock
            const stockActual = productoasociado?.stock || 0;
            if (stockActual < pedido.cantidad) {
                return NextResponse.json({ error: `Stock insuficiente (${stockActual}) para aprobar pedido` }, { status: 400 });
            }

            // Decrementar stock
            const { error: stockError } = await admin
                .from('productos')
                .update({ stock: stockActual - pedido.cantidad })
                .eq('id', pedido.producto_id);

            if (stockError) throw stockError;

            // Historial stock
            await admin.from('historial_acciones').insert({
                usuario_id: 'system',
                accion: 'actualizo_stock',
                entidad_tipo: 'producto',
                entidad_id: pedido.producto_id,
                detalles: { cambio: -pedido.cantidad, motivo: `Pedido ${id} pagado` }
            });
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
            usuario_id: 'admin_user',
            accion: 'aprobo_pago',
            entidad_tipo: 'pedido',
            entidad_id: id,
            detalles: { estado_anterior: pedido.estado, nuevo_estado: estado }
        });

        return NextResponse.json(updatedOrder);

    } catch (e: any) {
        console.error("Error patching pedido:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
