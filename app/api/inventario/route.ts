import { NextResponse } from 'next/server';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';

// GET: Listar productos activos (Public)
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .eq('activo', true)
            .order('nombre');

        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST: Crear nuevo producto (Admin)
export async function POST(request: Request) {
    try {
        // TODO: Validate admin session
        const body = await request.json();
        const admin = getSupabaseAdmin();

        const { data: producto, error } = await admin
            .from('productos')
            .insert(body)
            .select()
            .single();

        if (error) throw error;

        // Historial
        await admin.from('historial_acciones').insert({
            usuario_id: 'admin_user', // Placeholder
            accion: 'creo_producto',
            entidad_tipo: 'producto',
            entidad_id: producto.id,
            detalles: body
        });

        return NextResponse.json(producto, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
