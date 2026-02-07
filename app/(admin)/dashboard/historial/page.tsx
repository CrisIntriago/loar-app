import { getSupabaseAdmin } from "@/lib/supabase";

export default async function HistorialPage() {
    let logs: any[] = [];
    try {
        const admin = getSupabaseAdmin(); // Use admin client to bypass RLS if needed or just consistent server access

        // Fetch from 'historial_acciones' table
        const { data, error } = await admin
            .from('historial_acciones')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            logs = data;
        }
    } catch (e) {
        console.error("Error fetching logs:", e);
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Historial de Acciones</h1>
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden animate-in fade-in duration-500">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3 font-medium">Fecha</th>
                                <th className="px-6 py-3 font-medium">Acción</th>
                                <th className="px-6 py-3 font-medium">Usuario</th>
                                <th className="px-6 py-3 font-medium">Detalles</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No hay registros de actividad aun.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium capitalize">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                ${log.accion.includes('creo') ? 'bg-green-100 text-green-800' :
                                                    log.accion.includes('elimino') ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'}`}>
                                                {log.accion.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                            {log.usuario_id}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                                            {log.entidad_tipo}: {log.entidad_id}
                                            {log.detalles && <pre className="text-[10px] mt-1 text-gray-400">{JSON.stringify(log.detalles).substring(0, 50)}</pre>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
