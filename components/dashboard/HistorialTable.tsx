"use client";

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format } from "date-fns";

export default function HistorialTable({ initialData }: { initialData: any[] }) {
    return (
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
                    {initialData.map((h) => (
                        <TableRow key={h.id}>
                            <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                                {format(new Date(h.created_at), 'dd/MM/yyyy HH:mm')}
                            </TableCell>
                            <TableCell className="font-medium">{h.usuario_id}</TableCell>
                            <TableCell className="capitalize">{h.accion.replace(/_/g, ' ')}</TableCell>
                            <TableCell>
                                <div className="text-xs">
                                    <span className="font-bold">{h.entidad_tipo}</span>
                                    {h.entidad_id && <span className="text-gray-400 block truncate w-24">({h.entidad_id})</span>}
                                </div>
                            </TableCell>
                            <TableCell className="text-xs font-mono text-gray-500">
                                {h.detalles && JSON.stringify(h.detalles, null, 2)}
                            </TableCell>
                        </TableRow>
                    ))}
                    {initialData.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-400 italic">No hay registros de historial.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
