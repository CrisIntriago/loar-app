import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Retrieve internal or env config for the actual WhatsApp API endpoint
        // Or if this endpoint IS the webhook receiver from external services, handles logic.
        // Based on "POST notificación a dueño", this is likely an outgoing proxy or the endpoint called BY the order system.

        const targetUrl = process.env.WEBHOOK_WHATSAPP_URL;

        if (!targetUrl) {
            console.warn("WEBHOOK_WHATSAPP_URL not set");
            return NextResponse.json({ error: 'Configuration missing' }, { status: 500 });
        }

        // Forward to actual provider (e.g. Zapier, Jelou)
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                ...body
            }),
            signal: AbortSignal.timeout(5000) // 5s timeout
        });

        if (!response.ok) {
            throw new Error(`Upstream webhook failed: ${response.status}`);
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Webhook proxy error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
