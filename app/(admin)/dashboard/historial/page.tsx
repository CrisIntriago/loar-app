import { getSupabaseAdmin } from "@/lib/supabase";
import HistorialTable from "@/components/dashboard/HistorialTable";

export const dynamic = 'force-dynamic';

export default async function HistorialPage() {
    const admin = getSupabaseAdmin();
    // Fetch orders
    const { data: historial } = await admin
        .from('historial_acciones')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div>
                <h1 className="text-3xl font-black tracking-tight">Historial de Auditoría</h1>
                <p className="text-muted-foreground">Registro de acciones en el sistema.</p>
            </div>

            <HistorialTable initialData={historial || []} />
        </div>
    );
}
