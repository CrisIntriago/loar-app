"use client";

import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Check, Clock, Loader2, X, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Pedido {
    id: string;
    cliente_nombre: string;
    cliente_whatsapp: string;
    total: number;
    estado: string;
    created_at: string;
    productos: { nombre: string } | null;
    cantidad: number;
    talla: string;
    color: string;
    tecnica: string;
}

export default function PedidosTable({ initialPedidos }: { initialPedidos: any[] }) {
    const [pedidos, setPedidos] = useState<Pedido[]>(initialPedidos);
    const [search, setSearch] = useState("");
    const [filterState, setFilterState] = useState("todos");
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const filtered = pedidos.filter(p => {
        const matchSearch = p.cliente_nombre.toLowerCase().includes(search.toLowerCase()) ||
            p.cliente_whatsapp.includes(search);
        const matchState = filterState === "todos" ? true : p.estado === filterState;
        return matchSearch && matchState;
    });

    const updateStatus = async (id: string, newState: string) => {
        setLoadingId(id);
        try {
            const res = await fetch(`/api/pedidos/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: newState })
            });
            if (res.ok) {
                const updated = await res.json();
                setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: newState } : p));
            } else {
                const err = await res.json();
                alert(err.error || "Error");
            }
        } catch (e) {
            alert("Error actualizando");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <Input
                    placeholder="Buscar cliente..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="max-w-sm"
                />
                <div className="w-full sm:w-48">
                    <Select value={filterState} onChange={e => setFilterState(e.target.value)}>
                        <option value="todos">Todos los estados</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="pagado">Pagado</option>
                        <option value="en_produccion">En Producción</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border bg-white text-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead>Detalle</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map(p => (
                            <TableRow key={p.id}>
                                <TableCell className="whitespace-nowrap font-medium text-xs text-gray-500">
                                    {format(new Date(p.created_at), "dd MMM HH:mm", { locale: es })}
                                </TableCell>
                                <TableCell>
                                    <div className="font-bold">{p.cliente_nombre}</div>
                                    <a
                                        href={`https://wa.me/${p.cliente_whatsapp.replace('+', '')}`}
                                        target="_blank"
                                        className="text-xs text-green-600 hover:underline flex items-center gap-1"
                                    >
                                        {p.cliente_whatsapp}
                                    </a>
                                </TableCell>
                                <TableCell>
                                    <div className="max-w-[150px] truncate" title={(p.productos as any)?.nombre}>
                                        {(p.productos as any)?.nombre || "Producto"}
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs">
                                    <div className="flex gap-1 flex-wrap max-w-[200px]">
                                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">x{p.cantidad}</span>
                                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">{p.talla}</span>
                                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">{p.color}</span>
                                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">{p.tecnica}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-black">${Number(p.total).toFixed(2)}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${p.estado === 'pendiente' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                            p.estado === 'pagado' ? 'bg-green-50 text-green-700 border-green-200' :
                                                p.estado === 'en_produccion' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    p.estado === 'entregado' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                                                        'bg-red-50 text-red-700 border-red-200'
                                        }`}>
                                        {p.estado.replace('_', ' ')}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        {p.estado === 'pendiente' && (
                                            <>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => updateStatus(p.id, 'pagado')} disabled={loadingId === p.id} title="Marcar Pagado">
                                                    {loadingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => updateStatus(p.id, 'cancelado')} disabled={loadingId === p.id} title="Cancelar">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                        {p.estado === 'pagado' && (
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => updateStatus(p.id, 'en_produccion')} disabled={loadingId === p.id} title="Pasar a Producción">
                                                <Clock className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {p.estado === 'en_produccion' && (
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-600 hover:text-gray-700 hover:bg-gray-50" onClick={() => updateStatus(p.id, 'entregado')} disabled={loadingId === p.id} title="Marcar Entregado">
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground flex flex-col items-center justify-center w-full">
                                    <AlertCircle className="w-6 h-6 mb-2 opacity-20" />
                                    No se encontraron pedidos
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
