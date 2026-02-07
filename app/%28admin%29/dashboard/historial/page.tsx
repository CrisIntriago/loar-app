import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { getSupabaseAdmin } from "@/lib/supabase";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = 'force-dynamic';

export default async function HistorialPage() {
    let logs = [];
    try {
        const admin = getSupabaseAdmin();
        const { data, error } = await admin.from('historial_acciones').select('*').order('created_at', { ascending: false }).limit(100);
        if (!error) logs = data || [];
    } catch (e) {
        console.error("Historial fetch error", e);
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-gray-900">Historial</h1>
                    <p className="text-gray-500 mt-2 font-medium">Auditoría de cambios (últimos 100)</p>
                </div>
            </div>

            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Acción</TableHead>
                            <TableHead>Entidad</TableHead>
                            <TableHead>Detalles</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log: any) => (
                            <TableRow key={log.id} className="hover:bg-gray-50/50">
                                <TableCell className="font-mono text-xs text-gray-500">
                                    {format(new Date(log.created_at), "dd MMM HH:mm:ss", { locale: es })}
                                </TableCell>
                                <TableCell className="font-medium text-xs">{log.usuario_id}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${log.accion.includes('creo') ? 'bg-green-100 text-green-700' :
                                            log.accion.includes('elimino') ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {log.accion.replace('_', ' ')}
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs font-mono">{log.entidad_tipo} #{log.entidad_id?.substring(0, 8)}</TableCell>
                                <TableCell className="text-xs text-gray-500 max-w-xs truncate font-mono">
                                    {JSON.stringify(log.detalles)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
