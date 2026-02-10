import { NextResponse } from 'next/server';
import { getSupabaseAdmin, supabase } from '@/lib/supabase';

// GET: Detail (Public)
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { data, error } = await supabase
            .from('variantes')
            .select('*')
            .eq('id', params.id)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Variante no encontrada' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PATCH: Update (Admin)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const admin = getSupabaseAdmin();

        const { data, error } = await admin
            .from('variantes')
            .update({ ...body })
            .eq('id', params.id)
            .select()
            .single();

        if (error) throw error;

        await admin.from('historial_acciones').insert({
            usuario_id: 'admin',
            accion: 'actualizo_variante',
            entidad_tipo: 'variante',
            entidad_id: params.id,
            detalles: body
        });

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE: Soft Delete (Admin)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const admin = getSupabaseAdmin();

        const { data, error } = await admin
            .from('variantes')
            .update({ activo: false })
            .eq('id', params.id)
            .select()
            .single();

        if (error) throw error;

        await admin.from('historial_acciones').insert({
            usuario_id: 'admin',
            accion: 'elimino_variante',
            entidad_tipo: 'variante',
            entidad_id: params.id
        });

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
