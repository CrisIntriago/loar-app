"use client";

import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit2, Save, X, Trash2, AlertTriangle } from "lucide-react";
import NuevoProductoModal from "./NuevoProductoModal";
import { useRouter } from "next/navigation";

export default function InventarioTable({ initialProducts }: { initialProducts: any[] }) {
    const [products, setProducts] = useState(initialProducts);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editStock, setEditStock] = useState<string>("");
    const router = useRouter();

    const handleSave = async (id: string) => {
        try {
            const res = await fetch(`/api/inventario/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stock: parseInt(editStock) })
            });
            if (res.ok) {
                setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: parseInt(editStock) } : p));
                setEditingId(null);
                router.refresh(); // Sync server state
            } else {
                alert("Error al guardar");
            }
        } catch (e) {
            alert("Error actualizando stock");
        }
    };

    const handleCreated = () => {
        router.refresh();
        // In a real app we'd fetch again or optimistic update. 
        // For now, reload window or just router.refresh() 
        // router.refresh() updates server components but not client state until props change.
        // We can just reload for simplicity in this demo or fetch manually.
        window.location.reload();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="font-bold">Total:</span> {products.length} productos
                </div>
                <NuevoProductoModal onCreated={handleCreated} />
            </div>

            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[300px]">Producto</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.sort((a, b) => a.stock - b.stock).map(p => (
                            <TableRow key={p.id} className="hover:bg-gray-50/50">
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                                            {p.nombre.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-semibold text-gray-900">{p.nombre}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="capitalize text-gray-500">{p.categoria}</TableCell>
                                <TableCell className="font-medium">${p.precio_base}</TableCell>
                                <TableCell>
                                    {editingId === p.id ? (
                                        <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                                            <Input
                                                type="number"
                                                value={editStock}
                                                onChange={e => setEditStock(e.target.value)}
                                                className="w-20 h-8"
                                                autoFocus
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold px-2 py-0.5 rounded text-sm ${p.stock < 5 ? 'bg-red-100 text-red-600' : p.stock < 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                                {p.stock}
                                            </span>
                                            {p.stock < 5 && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {editingId === p.id ? (
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="default" onClick={() => handleSave(p.id)} className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"><Save className="w-4 h-4" /></Button>
                                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8 w-8 p-0"><X className="w-4 h-4" /></Button>
                                        </div>
                                    ) : (
                                        <Button size="sm" variant="ghost" onClick={() => { setEditingId(p.id); setEditStock(p.stock.toString()); }} className="h-8 w-8 p-0 text-gray-400 hover:text-black">
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
