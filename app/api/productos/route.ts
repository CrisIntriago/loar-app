import { NextResponse } from 'next/server';
import { getSupabaseAdmin, supabase } from '@/lib/supabase'; // Assuming standard imports

// GET: Listar productos activos con sus variantes
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const adminMode = searchParams.get('admin') === 'true';

        // Use public client for read-only if not admin mode to respect RLS policies
        // But for simplicity/performance in this MVP, we might just use admin client or standard client
        const query = supabase
            .from('productos')
            .select('*, variantes(*)')
            .order('created_at', { ascending: false });

        if (!adminMode) {
            query.eq('activo', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST: Crear producto (Solo Admin)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const admin = getSupabaseAdmin();

        const { data, error } = await admin
            .from('productos')
            .insert(body)
            .select()
            .single();

        if (error) throw error;

        // Log action
        await admin.from('historial_acciones').insert({
            usuario_id: 'admin', // Replace with real auth id if available
            accion: 'creo_producto',
            entidad_tipo: 'producto',
            entidad_id: data.id,
            detalles: { nombre: data.nombre }
        });

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
