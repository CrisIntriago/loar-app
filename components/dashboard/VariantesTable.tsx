"use client";

import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import NuevaVarianteModal from "./NuevaVarianteModal";
import { useRouter } from "next/navigation";

export default function VariantesTable({ initialData }: { initialData: any[] }) {
    const [variantes, setVariantes] = useState(initialData);
    const router = useRouter();

    useEffect(() => {
        setVariantes(initialData);
    }, [initialData]);

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar variante?")) return;
        try {
            const res = await fetch(`/api/variantes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setVariantes(prev => prev.filter(v => v.id !== id));
                router.refresh();
            } else {
                alert("Error al eliminar");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreated = () => {
        router.refresh();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <span className="font-bold text-gray-900 text-sm">Total: {variantes.length} variantes</span>
                <NuevaVarianteModal onCreated={handleCreated} />
            </div>

            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead>SKU</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead>Técnica</TableHead>
                            <TableHead>Talla / Color</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Precios</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {variantes.map((v) => (
                            <TableRow key={v.id}>
                                <TableCell className="font-mono text-xs text-gray-500">{v.sku || '-'}</TableCell>
                                <TableCell className="font-medium text-gray-900">{v.productos?.nombre}</TableCell>
                                <TableCell>{v.tecnica}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-800">{v.talla}</span>
                                        <span className="text-xs text-gray-500">{v.color}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${v.stock < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {v.stock}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="text-xs text-gray-500 space-y-0.5">
                                        {(v.precios as any[])?.slice(0, 2).map((p, i) => (
                                            <div key={i}>
                                                {p.min}{p.max ? `-${p.max}` : '+'}: <strong>${p.precio}</strong>
                                            </div>
                                        ))}
                                        {(v.precios as any[])?.length > 2 && <span>...</span>}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDelete(v.id)}
                                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {variantes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-400 italic">No hay variantes registradas.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
