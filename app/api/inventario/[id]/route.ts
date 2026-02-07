import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { id } = params;
        const admin = getSupabaseAdmin();

        const { data, error } = await admin
            .from('productos')
            .update({ ...body, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Historial
        await admin.from('historial_acciones').insert({
            usuario_id: 'admin_user',
            accion: 'actualizo_stock', // Could be generic update
            entidad_tipo: 'producto',
            entidad_id: id,
            detalles: body
        });

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
