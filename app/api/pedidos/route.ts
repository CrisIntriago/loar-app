import { NextResponse } from 'next/server';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';

// GET: Listar pedidos (Admin)
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('pedidos')
            .select('*, productos(nombre, precio_base)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Crear pedido (Public/Onboarding)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { producto_id, cantidad = 1, cliente_nombre, ...rest } = body;

        // 1. Validar producto y stock
        const { data: product, error: prodError } = await supabase
            .from('productos')
            .select('stock, precio_base, nombre, precio_mayorista, cantidad_mayorista, producto_precios(cantidad_minima, cantidad_maxima, precio_unitario)')
            .eq('id', producto_id)
            .single();

        if (prodError || !product) {
            return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
        }

        if (product.stock < cantidad) {
            return NextResponse.json({ error: `Stock insuficiente. Disponible: ${product.stock}` }, { status: 400 });
        }

        // 2. Calcular total (seguridad: calcular en servidor)
        let precioUnitario = Number(product.precio_base);
        const qty = Number(cantidad);

        // Check tiered pricing first
        if (product.producto_precios && product.producto_precios.length > 0) {
            const matchingTier = product.producto_precios.find((p: any) =>
                qty >= p.cantidad_minima &&
                (p.cantidad_maxima === null || qty <= p.cantidad_maxima)
            );

            if (matchingTier) {
                precioUnitario = Number(matchingTier.precio_unitario);
            }
        } else {
            // Fallback to legacy fields
            const cantidadMayorista = product.cantidad_mayorista || 6;
            if (product.precio_mayorista && qty >= cantidadMayorista) {
                precioUnitario = Number(product.precio_mayorista);
            }
        }

        const totalCalculado = precioUnitario * qty;

        // 3. Crear pedido usando Admin Client (bypass RLS policies si es necesario para invitados)
        const admin = getSupabaseAdmin();

        const { data: order, error: orderError } = await admin
            .from('pedidos')
            .insert({
                producto_id,
                cantidad,
                cliente_nombre,
                total: totalCalculado,
                estado: 'pendiente', // Default a pendiente
                ...rest
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 4. Registrar acción en historial
        await admin.from('historial_acciones').insert({
            usuario_id: 'public_user', // Usuario anónimo
            accion: 'creo_pedido',
            entidad_tipo: 'pedido',
            entidad_id: order.id,
            detalles: { ...body, total: totalCalculado }
        });

        // 5. Notificar por WhatsApp (Lógica interna o llamar a endpoint)
        // Buscamos configuración
        const { data: config } = await admin
            .from('configuracion_webhook')
            .select('webhook_url')
            .eq('tipo', 'nuevo_pedido')
            .eq('activo', true)
            .single();

        if (config?.webhook_url) {
            // Fire and forget
            fetch(config.webhook_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'nuevo_pedido',
                    pedido: order,
                    producto: product.nombre
                })
            }).catch(err => console.error("Error webhook whatsapp:", err));
        }

        return NextResponse.json(order);

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message || 'Error interno' }, { status: 500 });
    }
}
