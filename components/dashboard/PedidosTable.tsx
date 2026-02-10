"use client";

import { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "lucide-react"; // Wait, Badge is component?
import { Eye, CheckCircle, XCircle, Truck, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import DesignThumbnail from "@/components/dashboard/DesignThumbnail";

const ESTADOS = [
    { value: 'pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'pagado', label: 'Pagado', color: 'bg-green-100 text-green-700' },
    { value: 'en_produccion', label: 'En Producción', color: 'bg-blue-100 text-blue-700' },
    { value: 'entregado', label: 'Entregado', color: 'bg-purple-100 text-purple-700' },
    { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-700' }
];

export default function PedidosTable({ initialData }: { initialData: any[] }) {
    const [pedidos, setPedidos] = useState(initialData);
    const [filterEstado, setFilterEstado] = useState("todos");
    const [search, setSearch] = useState("");
    const [selectedPedido, setSelectedPedido] = useState<any | null>(null);
    const router = useRouter();

    useEffect(() => {
        setPedidos(initialData);
    }, [initialData]);

    // Realtime Subscription
    useEffect(() => {
        const channel = supabase
            .channel('pedidos-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, (payload) => {
                // Play sound?
                const audio = new Audio('/notification.mp3'); // Need file
                audio.play().catch(e => console.log('Audio error', e));
                alert(`Nuevo Pedido de ${payload.new.cliente_nombre}!`);
                router.refresh();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router]);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/pedidos/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: newStatus })
            });

            if (res.ok) {
                const updated = await res.json();
                setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: newStatus } : p));
                router.refresh();
            } else {
                alert("Error actualizando estado");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const filteredPedidos = pedidos.filter(p => {
        const matchesEstado = filterEstado === "todos" || p.estado === filterEstado;
        const matchesSearch = p.cliente_nombre.toLowerCase().includes(search.toLowerCase()) ||
            p.cliente_whatsapp.includes(search);
        return matchesEstado && matchesSearch;
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex gap-2 items-center w-full md:w-auto">
                    <Input
                        placeholder="Buscar por nombre o whatsapp..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full md:w-64"
                    />
                </div>
                <div className="flex gap-2 items-center w-full md:w-auto">
                    <Select value={filterEstado} onValueChange={setFilterEstado}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            {ESTADOS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPedidos.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell className="text-xs text-gray-500">
                                    {format(new Date(p.created_at), 'dd/MM HH:mm')}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-gray-900">{p.cliente_nombre}</div>
                                    <div className="text-xs text-gray-500">{p.cliente_whatsapp}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm font-medium">{p.variantes?.productos?.nombre}</div>
                                    <div className="text-xs text-gray-500 items-center flex gap-1">
                                        <span className="bg-gray-100 px-1 rounded">{p.variantes?.talla}</span>
                                        <span className="bg-gray-100 px-1 rounded">{p.variantes?.color}</span>
                                        <span className="bg-gray-100 px-1 rounded">{p.variantes?.tecnica}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-bold">
                                    ${p.total}
                                    <div className="text-xs text-gray-400 font-normal">x{p.cantidad}</div>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={p.estado}
                                        onValueChange={(val) => handleStatusUpdate(p.id, val)}
                                    >
                                        <SelectTrigger className={`h-8 w-[140px] text-xs font-bold capitalize border-0 ${ESTADOS.find(e => e.value === p.estado)?.color || 'bg-gray-100'}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ESTADOS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedPedido(p)}>
                                                <Eye className="w-4 h-4 text-blue-600" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Detalle del Pedido #{p.id.slice(0, 8)}</DialogTitle>
                                            </DialogHeader>
                                            <div className="grid grid-cols-2 gap-6 mt-4">
                                                <div>
                                                    <h3 className="font-bold mb-2">Cliente</h3>
                                                    <p>Nombre: {p.cliente_nombre}</p>
                                                    <p>WhatsApp:
                                                        <a href={`https://wa.me/${p.cliente_whatsapp.replace('+', '')}`} target="_blank" className="text-green-600 ml-1 hover:underline">
                                                            {p.cliente_whatsapp}
                                                        </a>
                                                    </p>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold mb-2">Producto</h3>
                                                    <p>{p.variantes?.productos?.nombre}</p>
                                                    <p className="text-sm text-gray-500">{p.variantes?.sku}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="badge badge-outline text-xs border px-2 rounded">{p.variantes?.talla}</span>
                                                        <span className="badge badge-outline text-xs border px-2 rounded">{p.variantes?.color}</span>
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <h3 className="font-bold mb-2">Diseños ({p.disenos?.length || 0})</h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {p.disenos?.map((d: any, i: number) => (
                                                            <div key={i} className="border p-2 rounded relative group">
                                                                <p className="text-xs font-bold mb-1">{d.posicion} - {d.tamano}</p>
                                                                <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden rounded relative">
                                                                    <DesignThumbnail url={d.url} path={d.path} alt={`Diseño ${i}`} />
                                                                </div>
                                                                <a href={d.url} download className="absolute bottom-2 right-2 bg-white p-1 rounded shadow text-xs hover:bg-gray-100 z-10">Descargar</a>
                                                            </div>
                                                        ))}
                                                        {(!p.disenos || p.disenos.length === 0) && <p className="text-gray-400 italic">Sin diseños adjuntos.</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredPedidos.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-400 italic">No se encontraron pedidos.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
