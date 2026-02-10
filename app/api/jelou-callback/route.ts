import { NextResponse } from 'next/server';
import { jelouCallback } from '@/lib/jelou';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { executionId, success, data, error } = body;

        if (!executionId) {
            return NextResponse.json({ error: 'executionId es requerido' }, { status: 400 });
        }

        const result = await jelouCallback({ executionId, success, data, error });

        return NextResponse.json(result, { status: result.ok ? 200 : 502 });
    } catch (e: any) {
        console.error('Jelou callback error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
