"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function NuevaVarianteModal({ onCreated, initialProductId }: { onCreated: () => void, initialProductId?: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);

    // Form State
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [tecnica, setTecnica] = useState("");
    const [talla, setTalla] = useState("");
    const [color, setColor] = useState("");
    const [tamanoDiseno, setTamanoDiseno] = useState("Normal");
    const [stock, setStock] = useState("0");
    const [precios, setPrecios] = useState<{ min: string, max: string, precio: string }[]>([
        { min: "1", max: "", precio: "" }
    ]);

    useEffect(() => {
        if (open) {
            fetchProducts();
        }
    }, [open]);

    const fetchProducts = async () => {
        const { data } = await supabase.from('productos').select('*').eq('activo', true);
        if (data) {
            setProducts(data);
            if (initialProductId) {
                const prod = data.find(p => p.id === initialProductId);
                if (prod) setSelectedProduct(prod);
            }
        }
    };

    const handleProductChange = (val: string) => {
        const p = products.find(prod => prod.id === val);
        setSelectedProduct(p || null);
        // Reset selections
        setTecnica(""); setTalla(""); setColor("");
    };

    const addPriceRow = () => {
        setPrecios([...precios, { min: "", max: "", precio: "" }]);
    };

    const removePriceRow = (index: number) => {
        setPrecios(precios.filter((_, i) => i !== index));
    };

    const updatePriceRow = (index: number, field: keyof typeof precios[0], value: string) => {
        const newPrecios = [...precios];
        newPrecios[index][field] = value;
        setPrecios(newPrecios);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;
        setLoading(true);

        try {
            const formattedPrices = precios
                .filter(p => p.min && p.precio)
                .map(p => ({
                    min: parseInt(p.min),
                    max: p.max ? parseInt(p.max) : null,
                    precio: parseFloat(p.precio)
                }));

            const payload = {
                producto_id: selectedProduct.id,
                tecnica,
                talla,
                color,
                tamano_diseno: tamanoDiseno,
                stock: parseInt(stock),
                precios: formattedPrices,
                activo: true
            };

            const res = await fetch('/api/variantes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                onCreated();
                setOpen(false);
                setStock("0"); setPrecios([{ min: "1", max: "", precio: "" }]); // Reset minimal
            } else {
                alert("Error al crear variante");
            }
        } catch (e) {
            console.error(e);
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/20 transition-all active:scale-95">
                    <PlusCircle className="mr-2 h-4 w-4" /> Nueva Variante
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black tracking-tight">Crear Variante</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Product Select */}
                        <div className="space-y-2 col-span-2">
                            <Label>Producto Base</Label>
                            <Select onValueChange={handleProductChange} value={selectedProduct?.id || ""} disabled={!!initialProductId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar producto..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedProduct && (
                            <>
                                <div className="space-y-2">
                                    <Label>Técnica</Label>
                                    <Select onValueChange={setTecnica} required>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                        <SelectContent>
                                            {selectedProduct.tecnicas?.map((t: string) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Talla</Label>
                                    <Select onValueChange={setTalla} required>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                        <SelectContent>
                                            {selectedProduct.tallas?.map((t: string) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Color</Label>
                                    <Select onValueChange={setColor} required>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                        <SelectContent>
                                            {selectedProduct.colores?.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tamaño Diseño</Label>
                                    <Select onValueChange={setTamanoDiseno} defaultValue="Normal">
                                        <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Normal">Normal</SelectItem>
                                            <SelectItem value="Pequeño">Pequeño</SelectItem>
                                            <SelectItem value="Grande">Grande</SelectItem>
                                            <SelectItem value="Sin diseño">Sin diseño</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Stock Inicial</Label>
                                    <Input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} required />
                                </div>

                                {/* Pricing Table */}
                                <div className="space-y-2 col-span-2 bg-gray-50 p-4 rounded-lg border">
                                    <Label className="mb-2 block">Escalas de Precios</Label>
                                    <div className="space-y-2">
                                        <div className="flex gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                            <div className="flex-1">Mínimo</div>
                                            <div className="flex-1">Máximo (opcional)</div>
                                            <div className="flex-1">Precio Unitario</div>
                                            <div className="w-8"></div>
                                        </div>
                                        {precios.map((row, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <Input
                                                    type="number"
                                                    placeholder="Min"
                                                    value={row.min}
                                                    onChange={e => updatePriceRow(idx, 'min', e.target.value)}
                                                    className="flex-1 h-8 text-sm"
                                                />
                                                <Input
                                                    type="number"
                                                    placeholder="Max (∞)"
                                                    value={row.max}
                                                    onChange={e => updatePriceRow(idx, 'max', e.target.value)}
                                                    className="flex-1 h-8 text-sm"
                                                />
                                                <div className="relative flex-1">
                                                    <span className="absolute left-2 top-1.5 text-xs text-gray-400">$</span>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        value={row.precio}
                                                        onChange={e => updatePriceRow(idx, 'precio', e.target.value)}
                                                        className="pl-5 h-8 text-sm font-bold"
                                                    />
                                                </div>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => removePriceRow(idx)} className="h-8 w-8 p-0 text-gray-400 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={addPriceRow} className="mt-2 w-full border-dashed text-gray-500 hover:text-gray-900">
                                        <PlusCircle className="mr-2 h-3 w-3" /> Agregar Rango
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading || !selectedProduct} className="bg-black hover:bg-gray-800 text-white w-full md:w-auto">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear Variante
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
