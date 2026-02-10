"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Loader2, Trash2, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function ProductEditForm({ product }: { product: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const initialForm = {
        nombre: product.nombre,
        categoria: product.categoria,
        precio_base: product.precio_base,
        stock: product.stock,
        tallas: Array.isArray(product.tallas) ? product.tallas.join(',') : product.tallas,
        colores: Array.isArray(product.colores) ? product.colores.join(',') : product.colores,
        tecnicas: Array.isArray(product.tecnicas) ? product.tecnicas.join(',') : product.tecnicas
    };

    const [form, setForm] = useState(initialForm);
    const [precios, setPrecios] = useState<{ min: string, max: string, precio: string }[]>(
        product.producto_precios
            ? product.producto_precios.map((p: any) => ({
                min: p.cantidad_minima?.toString() || "",
                max: p.cantidad_maxima?.toString() || "",
                precio: p.precio_unitario?.toString() || ""
            }))
            : []
    );

    const addPrecioRow = () => setPrecios([...precios, { min: "", max: "", precio: "" }]);
    const updatePrecioRow = (index: number, field: 'min' | 'max' | 'precio', value: string) => {
        const newPrecios = [...precios];
        newPrecios[index][field] = value;
        setPrecios(newPrecios);
    };
    const removePrecioRow = (index: number) => setPrecios(precios.filter((_, i) => i !== index));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...form,
                precio_base: parseFloat(form.precio_base),
                stock: parseInt(form.stock),
                tallas: form.tallas.split(',').map((s: string) => s.trim()),
                colores: form.colores.split(',').map((s: string) => s.trim()),
                tecnicas: form.tecnicas.split(',').map((s: string) => s.trim()),
                precios: precios.filter(p => p.min && p.precio).map(p => ({
                    cantidad_minima: parseInt(p.min),
                    cantidad_maxima: p.max ? parseInt(p.max) : null,
                    precio_unitario: parseFloat(p.precio)
                }))
            };

            const res = await fetch(`/api/inventario/${product.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.refresh();
                alert("Producto actualizado");
            } else {
                alert("Error al actualizar");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de eliminar este producto?")) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/inventario/${product.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                router.push('/dashboard/inventario');
                router.refresh();
            } else {
                alert("Error al eliminar");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/inventario" className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Editar Producto</h1>
                </div>
                <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    Eliminar
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nombre</label>
                        <Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Categoría</label>
                        <Select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                            {['camiseta', 'crop_top', 'ranglan', 'oversize', 'polo', 'hoodie', 'buzo', 'boxer', 'pijama', 'almohada', 'taza'].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Precio Base ($)</label>
                        <Input type="number" step="0.01" value={form.precio_base} onChange={e => setForm({ ...form, precio_base: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Stock</label>
                        <Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-4 w-full">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-700">Precios Mayoristas (Escalas)</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addPrecioRow} className="h-7 text-xs">+ Agregar</Button>
                    </div>

                    <div className="space-y-2">
                        {precios.length > 0 && (
                            <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 px-1">
                                <div className="col-span-3">Min</div>
                                <div className="col-span-3">Max</div>
                                <div className="col-span-4">Precio</div>
                                <div className="col-span-2"></div>
                            </div>
                        )}
                        {precios.map((p, i) => (
                            <div key={i} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-3">
                                    <Input
                                        type="number"
                                        value={p.min}
                                        onChange={e => updatePrecioRow(i, 'min', e.target.value)}
                                        placeholder="Min"
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <Input
                                        type="number"
                                        value={p.max}
                                        onChange={e => updatePrecioRow(i, 'max', e.target.value)}
                                        placeholder="Inf"
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="col-span-4">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={p.precio}
                                        onChange={e => updatePrecioRow(i, 'precio', e.target.value)}
                                        placeholder="$"
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="col-span-2 text-right">
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removePrecioRow(i)} className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600">
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {precios.length === 0 && (
                            <p className="text-xs text-gray-400 italic text-center py-2">No hay escalas definidas.</p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Tallas (separadas por coma)</label>
                    <Input value={form.tallas} onChange={e => setForm({ ...form, tallas: e.target.value })} />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Colores (separados por coma)</label>
                    <Input value={form.colores} onChange={e => setForm({ ...form, colores: e.target.value })} />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Técnicas (separadas por coma)</label>
                    <Input value={form.tecnicas} onChange={e => setForm({ ...form, tecnicas: e.target.value })} />
                </div>

                <div className="pt-4 flex justify-end">
                    <Button type="submit" className="bg-black text-white px-8" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Guardar Cambios
                    </Button>
                </div>
            </form>
        </div>
    );
}
