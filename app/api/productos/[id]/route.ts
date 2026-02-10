import { NextResponse } from 'next/server';
import { getSupabaseAdmin, supabase } from '@/lib/supabase';

// GET: Detail (Public)
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { data, error } = await supabase
            .from('productos')
            .select('*, variantes(*)') // Fetch all variants
            .eq('id', params.id)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
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

        // Destructure only allowed fields to prevent injection
        const { nombre, descripcion, categoria, tallas, colores, tecnicas, imagen_url } = body;

        const { data, error } = await admin
            .from('productos')
            .update({
                nombre,
                descripcion,
                categoria,
                tallas,
                colores,
                tecnicas,
                imagen_url,
                updated_at: new Date().toISOString()
            })
            .eq('id', params.id)
            .select()
            .single();

        if (error) throw error;

        await admin.from('historial_acciones').insert({
            usuario_id: 'admin',
            accion: 'actualizo_producto',
            entidad_tipo: 'producto',
            entidad_id: params.id,
            detalles: { nombre, categoria, updated_at: new Date() }
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
            .from('productos')
            .update({ activo: false, updated_at: new Date().toISOString() })
            .eq('id', params.id)
            .select()
            .single();

        if (error) throw error;

        await admin.from('historial_acciones').insert({
            usuario_id: 'admin',
            accion: 'elimino_producto',
            entidad_tipo: 'producto',
            entidad_id: params.id
        });

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
