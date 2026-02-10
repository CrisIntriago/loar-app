import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { precios, ...dataToUpdate } = body;
        const { id } = params;
        const admin = getSupabaseAdmin();

        const { data, error } = await admin
            .from('productos')
            .update({ ...dataToUpdate, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Handle precios update if present
        if (precios && Array.isArray(precios)) {
            // 1. Delete existing prices
            await admin.from('producto_precios').delete().eq('producto_id', id);

            // 2. Insert new prices
            if (precios.length > 0) {
                const preciosPayload = precios.map((p: any) => ({
                    producto_id: id,
                    cantidad_minima: parseInt(p.cantidad_minima),
                    cantidad_maxima: p.cantidad_maxima ? parseInt(p.cantidad_maxima) : null,
                    precio_unitario: parseFloat(p.precio_unitario)
                }));

                await admin.from('producto_precios').insert(preciosPayload);
            }
        }

        // Historial
        await admin.from('historial_acciones').insert({
            usuario_id: 'admin_user',
            accion: 'actualizo',
            entidad_tipo: 'producto',
            entidad_id: id,
            detalles: body
        });

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const admin = getSupabaseAdmin();

        // Soft delete (set active = false) or hard delete?
        // Let's do soft delete as per schema active default true
        // But users might want to completely remove.
        // Let's do HARD DELETE for simplicity if no orders attached, or SOFT DELETE otherwise.
        // For now, let's implement SOFT DELETE by setting active=false.

        const { data, error } = await admin
            .from('productos')
            .update({ activo: false })
            .eq('id', id)
            .select()
            .single();

        // Wait, schema says 'activo', let's use 'activo'.

        if (error) throw error;

        // Historial
        await admin.from('historial_acciones').insert({
            usuario_id: 'admin_user',
            accion: 'elimino',
            entidad_tipo: 'producto',
            entidad_id: id,
            detalles: { producto: data.nombre }
        });

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
