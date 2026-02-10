"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { X, Plus, Loader2, Trash2 } from "lucide-react";

export default function NuevoProductoModal({ onCreated }: { onCreated: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        nombre: "",
        categoria: "camiseta",
        precio_base: "",
        stock: "",
        tallas: "S,M,L,XL",
        colores: "Blanco,Negro",
        tecnicas: "dtf,bordado"
    });

    const [precios, setPrecios] = useState<{ min: string, max: string, precio: string }[]>([]);

    const addPrecioRow = () => {
        setPrecios([...precios, { min: "", max: "", precio: "" }]);
    };

    const updatePrecioRow = (index: number, field: 'min' | 'max' | 'precio', value: string) => {
        const newPrecios = [...precios];
        newPrecios[index][field] = value;
        setPrecios(newPrecios);
    };

    const removePrecioRow = (index: number) => {
        setPrecios(precios.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...form,
                precio_base: parseFloat(form.precio_base),
                stock: parseInt(form.stock),
                tallas: form.tallas.split(',').map(s => s.trim()),
                colores: form.colores.split(',').map(s => s.trim()),
                tecnicas: form.tecnicas.split(',').map(s => s.trim()),
                precios: precios.filter(p => p.min && p.precio).map(p => ({
                    cantidad_minima: parseInt(p.min),
                    cantidad_maxima: p.max ? parseInt(p.max) : null,
                    precio_unitario: parseFloat(p.precio)
                }))
            };

            const res = await fetch('/api/inventario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsOpen(false);
                onCreated();
                setForm({ nombre: "", categoria: "camiseta", precio_base: "", stock: "", tallas: "S,M,L,XL", colores: "Blanco,Negro", tecnicas: "dtf,bordado" });
                setPrecios([]);
            } else {
                alert("Error al crear");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return <Button onClick={() => setIsOpen(true)} className="bg-black text-white"><Plus className="w-4 h-4 mr-2" /> Nuevo Producto</Button>
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black tracking-tight">Nuevo Producto</h2>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Nombre</label>
                            <Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required placeholder="Ej. Camsera Oversize" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Categoría</label>
                            <Select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                                {['camiseta', 'crop_top', 'ranglan', 'oversize', 'polo', 'hoodie', 'buzo', 'boxer', 'pijama', 'almohada', 'taza'].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Precio Base ($)</label>
                            <Input type="number" step="0.01" value={form.precio_base} onChange={e => setForm({ ...form, precio_base: e.target.value })} required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Stock Inicial</label>
                            <Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
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

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Tallas (separadas por coma)</label>
                        <Input value={form.tallas} onChange={e => setForm({ ...form, tallas: e.target.value })} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Colores (separados por coma)</label>
                        <Input value={form.colores} onChange={e => setForm({ ...form, colores: e.target.value })} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Técnicas (separadas por coma)</label>
                        <Input value={form.tecnicas} onChange={e => setForm({ ...form, tecnicas: e.target.value })} placeholder="dtf,bordado,sublimado,llano" />
                    </div>

                    <div className="pt-4 flex gap-3 justify-end">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                        <Button type="submit" className="bg-black text-white" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Crear Producto
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
