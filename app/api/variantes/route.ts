import { NextResponse } from 'next/server';
import { getSupabaseAdmin, supabase } from '@/lib/supabase';

// GET: Listar variantes
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const productoId = searchParams.get('producto_id');

        let query = supabase
            .from('variantes')
            .select('*, productos(nombre)');

        if (productoId) {
            query.eq('producto_id', productoId);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST: Crear variante (Solo Admin)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const admin = getSupabaseAdmin();

        const { data, error } = await admin
            .from('variantes')
            .insert(body)
            .select()
            .single();

        if (error) throw error;

        // Log action (optional for variants, but good for detailed audit)
        await admin.from('historial_acciones').insert({
            usuario_id: 'admin',
            accion: 'creo_variante',
            entidad_tipo: 'variante',
            entidad_id: data.id,
            detalles: { sku: data.sku, producto_id: data.producto_id }
        });

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
