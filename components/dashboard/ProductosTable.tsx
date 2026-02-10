"use client";

import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Box, Image as ImageIcon } from "lucide-react";
import NuevoProductoModal from "./NuevoProductoModal";
import ProductoEditModal from "./ProductoEditModal";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductosTable({ initialData }: { initialData: any[] }) {
    const [products, setProducts] = useState(initialData);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const router = useRouter();

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar producto?")) return;
        try {
            const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(prev => prev.filter(p => p.id !== id));
                router.refresh();
            } else {
                alert("Error al eliminar");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreated = (newProduct: any) => {
        setProducts([newProduct, ...products]);
        router.refresh();
    };

    const handleUpdated = () => {
        // Optimistic update or refresh? Refresh is safer to get DB state
        router.refresh();
        setEditingProduct(null);
        // Toast logic would act usually here, but since router.refresh() re-fetches, 
        // we might not see immediate reflected change in `products` state unless we update it manually or rely on props update.
        // For now, simpler is manual refresh:
        window.location.reload();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <span className="font-bold text-gray-900 text-sm">Total: {products.length} productos</span>
                <NuevoProductoModal onCreated={handleCreated} />
            </div>

            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[60px]">Img</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Variantes</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>
                                    <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex items-center justify-center border">
                                        {p.imagen_url ? (
                                            <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium text-gray-900">{p.nombre}</TableCell>
                                <TableCell className="capitalize text-gray-500">{p.categoria?.replace('_', ' ')}</TableCell>
                                <TableCell>
                                    <Link href={`/dashboard/variantes?producto_id=${p.id}`}>
                                        <Button variant="outline" size="sm" className="h-8 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
                                            <Box className="w-3 h-3 mr-2" />
                                            {p.variantes?.length || 0}
                                        </Button>
                                    </Link>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setEditingProduct(p)}
                                            className="h-8 w-8 p-0 text-gray-500 hover:text-black hover:bg-gray-100"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(p.id)}
                                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {products.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-400 italic">No hay productos activos.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {editingProduct && (
                <ProductoEditModal
                    open={!!editingProduct}
                    onOpenChange={(open) => !open && setEditingProduct(null)}
                    product={editingProduct}
                    onUpdated={handleUpdated}
                />
            )}
        </div>
    );
}
