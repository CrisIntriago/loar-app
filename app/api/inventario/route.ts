import { NextResponse } from 'next/server';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';

// GET: Listar productos activos (Public)
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('productos')
            .select('*, producto_precios(id, cantidad_minima, cantidad_maxima, precio_unitario)')
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
        const body = await request.json();
        const { precios, ...productData } = body;
        const admin = getSupabaseAdmin();

        const { data: producto, error } = await admin
            .from('productos')
            .insert(productData)
            .select()
            .single();

        if (error) throw error;

        // Insertar precios si existen
        if (precios && Array.isArray(precios) && precios.length > 0) {
            const preciosPayload = precios.map((p: any) => ({
                producto_id: producto.id,
                cantidad_minima: parseInt(p.cantidad_minima),
                cantidad_maxima: p.cantidad_maxima ? parseInt(p.cantidad_maxima) : null,
                precio_unitario: parseFloat(p.precio_unitario)
            }));

            const { error: preciosError } = await admin
                .from('producto_precios')
                .insert(preciosPayload);

            if (preciosError) console.error("Error insertando precios", preciosError);
        }

        // Historial
        await admin.from('historial_acciones').insert({
            usuario_id: 'admin_user',
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
