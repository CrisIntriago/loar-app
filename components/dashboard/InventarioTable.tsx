"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit2, Save, X, Trash2, AlertTriangle, AlertCircle } from "lucide-react";
import NuevoProductoModal from "./NuevoProductoModal";
import { useRouter } from "next/navigation";

export default function InventarioTable({ initialProducts }: { initialProducts: any[] }) {
    const [products, setProducts] = useState(initialProducts);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editStock, setEditStock] = useState<string>("");

    // Delete State
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // View Prices State
    const [viewingPricesId, setViewingPricesId] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        setProducts(initialProducts);
    }, [initialProducts]);

    const handleSave = async (id: string, newStock: string) => {
        try {
            const res = await fetch(`/api/inventario/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stock: parseInt(newStock) })
            });
            if (res.ok) {
                setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: parseInt(newStock) } : p));
                setEditingId(null);
                router.refresh();
            } else {
                alert("Error al guardar");
            }
        } catch (e) {
            alert("Error actualizando stock");
        }
    };

    const confirmDelete = (id: string) => {
        setDeletingId(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            const res = await fetch(`/api/inventario/${deletingId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setProducts(prev => prev.filter(p => p.id !== deletingId));
                setIsDeleteModalOpen(false);
                setDeletingId(null);
                router.refresh();
            } else {
                alert("Error al eliminar");
            }
        } catch (e) {
            alert("Error de conexión");
        }
    };

    const handleCreated = () => {
        router.refresh();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-bold text-gray-900">Total:</span> {products.length} productos
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
                            <TableHead>Mayorista</TableHead>
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
                                            {p.nombre ? p.nombre.substring(0, 2).toUpperCase() : '??'}
                                        </div>
                                        <Link href={`/dashboard/inventario/${p.id}`} className="font-semibold text-gray-900 hover:underline">
                                            {p.nombre}
                                        </Link>
                                    </div>
                                </TableCell>
                                <TableCell className="capitalize text-gray-500">{p.categoria}</TableCell>
                                <TableCell className="font-medium">${p.precio_base}</TableCell>
                                <TableCell className="text-gray-500 text-xs">
                                    {p.producto_precios && p.producto_precios.length > 0 ? (
                                        <button
                                            onClick={() => setViewingPricesId(p.id)}
                                            className="text-blue-600 hover:underline font-medium"
                                        >
                                            Ver {p.producto_precios.length} escalas
                                        </button>
                                    ) : p.precio_mayorista ? (
                                        <div>
                                            <span className="font-bold text-gray-700">${p.precio_mayorista}</span>
                                            <span className="text-gray-400 ml-1">(min {p.cantidad_mayorista || 6})</span>
                                        </div>
                                    ) : '-'}
                                </TableCell>
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
                                            <Button size="sm" onClick={() => handleSave(p.id, editStock)} className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"><Save className="w-4 h-4" /></Button>
                                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8 w-8 p-0"><X className="w-4 h-4" /></Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setEditingId(p.id); setEditStock(p.stock.toString()); }}>
                                            <span className={`font-bold px-2 py-0.5 rounded text-sm ${p.stock < 5 ? 'bg-red-100 text-red-600' : p.stock < 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                                {p.stock}
                                            </span>
                                            {p.stock < 5 && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
                                            <Edit2 className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button size="sm" variant="ghost" onClick={() => confirmDelete(p.id)} className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">¿Eliminar producto?</h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    ¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer (se marcará como inactivo).
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button variant="destructive" className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleDelete}>
                                    Eliminar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Prices Modal */}
            {viewingPricesId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Escalas de Precios</h3>
                            <button onClick={() => setViewingPricesId(null)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-gray-500 mb-1">Producto</p>
                                <p className="font-bold">{products.find(p => p.id === viewingPricesId)?.nombre}</p>
                            </div>

                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="h-8 text-xs">Mínimo</TableHead>
                                            <TableHead className="h-8 text-xs">Máximo</TableHead>
                                            <TableHead className="h-8 text-xs text-right">Precio Unitario</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.find(p => p.id === viewingPricesId)?.producto_precios?.sort((a: any, b: any) => a.cantidad_minima - b.cantidad_minima).map((price: any) => (
                                            <TableRow key={price.id}>
                                                <TableCell className="py-2 text-sm">{price.cantidad_minima}</TableCell>
                                                <TableCell className="py-2 text-sm">{price.cantidad_maxima || '∞'}</TableCell>
                                                <TableCell className="py-2 text-sm text-right font-bold">${price.precio_unitario}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button onClick={() => setViewingPricesId(null)}>Cerrar</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
