import { NextResponse } from 'next/server';
import { getSupabaseAdmin, supabase } from '@/lib/supabase';

// Explicit interfaces for strictly typed logic
interface PrecioRango {
    min: number;
    max: number | null;
    precio: number | string; // Database might return string/decimal
}

interface OrderPayload {
    cliente_nombre: string;
    cliente_whatsapp: string;
    variante_id: string;
    cantidad: number;
    disenos: any; // Complex JSON, keeping flexible for now
}

// Helper for tiered pricing - strictly typed
function calculatePrice(qty: number, precios: PrecioRango[]) {
    // Sort by min ascending
    const sorted = [...precios].sort((a, b) => a.min - b.min);
    let unitPrice = 0;

    // Find the tier
    const tier = sorted.find(p => qty >= p.min && (p.max === null || qty <= p.max));

    if (tier) {
        unitPrice = Number(tier.precio);
    } else {
        // Fallback: use highest tier price logic
        if (sorted.length > 0) {
            unitPrice = Number(sorted[sorted.length - 1].precio);
        }
    }
    return unitPrice;
}

// GET: Listar pedidos (Admin)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const estado = searchParams.get('estado');

        let query = supabase
            .from('pedidos')
            .select(`
                *,
                variantes (
                    sku,
                    productos (nombre, categoria, imagen_url)
                )
            `)
            .order('created_at', { ascending: false });

        if (estado) {
            query = query.eq('estado', estado);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST: Crear pedido (Público)
export async function POST(request: Request) {
    try {
        const body = await request.json() as OrderPayload;
        const { cliente_nombre, cliente_whatsapp, variante_id, cantidad, disenos } = body;

        // 1. Fetch Variant
        const { data: variant, error: fetchError } = await supabase
            .from('variantes')
            .select('*')
            .eq('id', variante_id)
            .single();

        if (fetchError || !variant) {
            return NextResponse.json({ error: 'Variante no encontrada' }, { status: 404 });
        }

        // 2. Validate Stock (optional implementation)
        // if (variant.stock < cantidad) { ... }

        // 3. Calculate Price
        // Safe Cast: We know the JSON structure of prices
        const precios = (variant.precios || []) as unknown as PrecioRango[];
        const precioUnitario = calculatePrice(cantidad, precios);
        const total = precioUnitario * cantidad;

        // 4. Create Order
        const admin = getSupabaseAdmin();

        // Cast to any to bypass complex literal type mismatch in some Supabase generated type versions
        const { data: order, error: insertError } = await admin
            .from('pedidos')
            .insert({
                cliente_nombre,
                cliente_whatsapp,
                variante_id,
                cantidad,
                precio_unitario: precioUnitario, // Converted to number in logic
                total,
                disenos,
                estado: 'pendiente'
            } as any)
            .select()
            .single();

        if (insertError) throw insertError;

        // 5. Audit Log (Historial)
        await admin.from('historial_acciones').insert({
            usuario_id: 'public',
            accion: 'creo_pedido',
            entidad_tipo: 'pedido',
            entidad_id: order.id,
            detalles: { cantidad, total }
        } as any);

        return NextResponse.json(order);

    } catch (e: any) {
        console.error("Error creating order:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
