import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const bucket = formData.get('bucket') as string || 'disenos';
        const folder = formData.get('folder') as string || 'uploads';

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Use crypto.randomUUID()
        const filename = `${folder}/${crypto.randomUUID()}-${file.name.replace(/\s/g, '_')}`;

        const admin = getSupabaseAdmin();

        // Upload
        const { error: uploadError } = await admin
            .storage
            .from(bucket)
            .upload(filename, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) throw uploadError;

        // Get Signed URL (valid for 1 hour for preview, frontend should handle re-signing if needed later)
        // Actually, for immediate preview in ProductConfig, 1 hour is fine.
        // For Admin Dashboard, we will sign again.
        const { data: { signedUrl } } = await admin
            .storage
            .from(bucket)
            .createSignedUrl(filename, 3600); // 1 hour

        return NextResponse.json({
            path: filename,
            url: signedUrl
        });
    } catch (e: any) {
        console.error("Upload error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
