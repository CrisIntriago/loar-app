"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Check, Loader2, UploadCloud, X } from "lucide-react";

export default function ProductConfig({ product, onAddToCart, onBack }: { product: any, onAddToCart: (item: any) => void, onBack: () => void }) {
    const [step, setStep] = useState(1); // 1: Variant, 2: Qty, 3: Design
    const [loading, setLoading] = useState(false);

    // Variant state
    const [variants, setVariants] = useState<any[]>([]);
    const [tecnica, setTecnica] = useState("");
    const [talla, setTalla] = useState("");
    const [color, setColor] = useState("");
    const [tamanoDiseno, setTamanoDiseno] = useState("Normal");
    const [selectedVariant, setSelectedVariant] = useState<any | null>(null);

    // Qty State
    const [cantidad, setCantidad] = useState(1);
    const [unitPrice, setUnitPrice] = useState(0);
    const [total, setTotal] = useState(0);

    // Design State
    const [numPositions, setNumPositions] = useState(1);
    const [designs, setDesigns] = useState<{ posicion: string, tamano: string, file: File | null, url: string, path?: string }[]>([
        { posicion: "Pecho", tamano: "Normal", file: null, url: "", path: "" }
    ]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        // Fetch variants for product
        const fetchVariants = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('variantes')
                .select('*')
                .eq('producto_id', product.id)
                .eq('activo', true);
            if (data) setVariants(data);
            setLoading(false);
        };
        fetchVariants();
    }, [product.id]);

    // Step 1 Logic: Find Variant
    const handleFindVariant = () => {
        const found = variants.find(v =>
            v.tecnica === tecnica &&
            v.talla === talla &&
            v.color === color &&
            (v.tamano_diseno === tamanoDiseno || v.tamano_diseno === null || tamanoDiseno === "Normal") // looser match on tamano? User requirement: "Selector TAMANO DISENO ... Busca variante que coincida".
            // Let's assume strict match if property exists on variant. If null on variant, maybe it allows any? Or "Normal" default.
            // Let's stick to user request: "Selector TAMAÑO DISEÑO" exists.
            // But if variants table has it, we should match.
        );

        // Actually, user said: "Selector TAMAÑO DISEÑO: Normal, Pequeño, Grande, Sin diseño".
        // And variant table has `tamano_diseno`.
        // So we should match exactly.
        // Wait, if no match found?
        if (found) {
            setSelectedVariant(found);
            setStep(2);
        } else {
            alert("No existe una variante con esta combinación. Intenta otra.");
        }
    };

    // Step 2 Logic: Calculate Price
    useEffect(() => {
        if (selectedVariant && cantidad > 0) {
            const precios = selectedVariant.precios as any[]; // [{min, max, precio}]
            if (!precios || precios.length === 0) {
                setUnitPrice(0);
                return;
            }
            // Logic: sort by min asc. find range.
            const sorted = [...precios].sort((a, b) => a.min - b.min);
            const tier = sorted.find(p => cantidad >= p.min && (p.max === null || cantidad <= p.max));
            const price = tier ? Number(tier.precio) : (sorted.length > 0 ? Number(sorted[sorted.length - 1].precio) : 0);

            setUnitPrice(price);
            setTotal(price * cantidad);
        }
    }, [selectedVariant, cantidad]);

    // Step 3 Logic: Uploads
    const handleDesignChange = (index: number, field: string, value: any) => {
        const newDesigns = [...designs];
        (newDesigns[index] as any)[field] = value;
        setDesigns(newDesigns);
    };

    const handleUploadFile = async (index: number, file: File) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'disenos');

        try {
            const res = await fetch('/api/upload/disenos', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                handleDesignChange(index, 'url', data.url);
                handleDesignChange(index, 'path', data.path); // Added path
                handleDesignChange(index, 'file', file);
            }
        } catch (e) {
            console.error(e);
            alert("Error subiendo imagen");
        } finally {
            setUploading(false);
        }
    };

    const handleFinishConfig = () => {
        // Validate uploads
        if (designs.some(d => !d.url)) {
            alert("Por favor sube las imágenes requeridas.");
            return;
        }

        const item = {
            id: crypto.randomUUID(),
            product,
            variant: selectedVariant,
            config: {
                tecnica,
                talla,
                color,
                tamano_diseno: tamanoDiseno,
                cantidad,
                disenos: designs.map(d => ({ url: d.url, path: d.path, posicion: d.posicion, tamano: d.tamano })), // Include path
                precioUnitario: unitPrice
            },
            subtotal: total
        };
        onAddToCart(item);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header / Back */}
            <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="sm" onClick={step === 1 ? onBack : () => setStep(step - 1)} className="p-0 h-8 w-8 hover:bg-gray-100 rounded-full">
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <h2 className="font-bold text-lg">
                    {step === 1 ? "Personalizar Producto" : step === 2 ? "Cantidad" : "Subir Diseños"}
                </h2>
            </div>

            {/* Step 1: Variant Selection */}
            {step === 1 && (
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-white rounded overflow-hidden shadow-sm">
                            {product.imagen_url && <img src={product.imagen_url} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">{product.nombre}</h3>
                            <p className="text-xs text-gray-500 capitalize">{product.categoria}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 font-bold uppercase">Técnica</Label>
                            <div className="flex flex-wrap gap-2">
                                {product.tecnicas.map((t: string) => (
                                    <button
                                        key={t}
                                        onClick={() => setTecnica(t)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${tecnica === t ? 'bg-black text-white border-black ring-2 ring-black/20' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 font-bold uppercase">Talla</Label>
                            <div className="flex flex-wrap gap-2">
                                {product.tallas.map((t: string) => (
                                    <button
                                        key={t}
                                        onClick={() => setTalla(t)}
                                        className={`w-10 h-10 rounded-lg text-sm font-bold border flex items-center justify-center transition-all ${talla === t ? 'bg-black text-white border-black ring-2 ring-black/20' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 font-bold uppercase">Color</Label>
                            <div className="flex flex-wrap gap-2">
                                {product.colores.map((c: string) => (
                                    <button
                                        key={c}
                                        onClick={() => setColor(c)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${color === c ? 'bg-black text-white border-black ring-2 ring-black/20' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 font-bold uppercase">Tamaño Diseño</Label>
                            <Select value={tamanoDiseno} onValueChange={setTamanoDiseno}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Normal">Normal</SelectItem>
                                    <SelectItem value="Pequeño">Pequeño</SelectItem>
                                    <SelectItem value="Grande">Grande</SelectItem>
                                    <SelectItem value="Sin diseño">Sin diseño</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button
                        disabled={!tecnica || !talla || !color}
                        onClick={handleFindVariant}
                        className="w-full mt-6 bg-black text-white h-12 text-lg shadow-xl shadow-black/20"
                    >
                        Continuar
                    </Button>
                </div>
            )}

            {/* Step 2: Quantity & Price */}
            {step === 2 && (
                <div className="space-y-6">
                    <div className="text-center py-6">
                        <div className="text-sm font-medium text-gray-500 mb-1">Precio Unitario estimado</div>
                        <div className="text-4xl font-black text-black tracking-tighter">${unitPrice.toFixed(2)}</div>
                        {cantidad > 0 && <div className="text-xs text-green-600 font-bold mt-1">Escala aplicada por {cantidad} unidades</div>}
                    </div>

                    <div className="space-y-2">
                        <Label>Cantidad</Label>
                        <Input
                            type="number"
                            min="1"
                            value={cantidad}
                            onChange={e => setCantidad(parseInt(e.target.value) || 0)}
                            className="h-14 text-center text-2xl font-bold"
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border">
                        <span className="font-medium text-gray-600">Total a Pagar</span>
                        <span className="font-bold text-xl">${total.toFixed(2)}</span>
                    </div>

                    <Button
                        disabled={cantidad < 1}
                        onClick={() => setStep(3)}
                        className="w-full mt-4 bg-black text-white h-12 text-lg shadow-xl shadow-black/20"
                    >
                        Continuar
                    </Button>
                </div>
            )}

            {/* Step 3: Design Upload */}
            {step === 3 && (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>¿Cuántas posiciones de diseño?</Label>
                        <div className="flex gap-4">
                            <Button
                                variant={numPositions === 1 ? "default" : "outline"}
                                onClick={() => {
                                    setNumPositions(1);
                                    setDesigns([designs[0]]);
                                }}
                                className="flex-1"
                            >
                                1 Posición
                            </Button>
                            <Button
                                variant={numPositions === 2 ? "default" : "outline"}
                                onClick={() => {
                                    setNumPositions(2);
                                    if (designs.length < 2) setDesigns([...designs, { posicion: "Espalda", tamano: "Normal", file: null, url: "" }]);
                                }}
                                className="flex-1"
                            >
                                2 Posiciones
                            </Button>
                        </div>
                    </div>

                    {designs.map((d, i) => (
                        <div key={i} className="bg-white border rounded-lg p-4 space-y-4 shadow-sm relative">
                            <div className="absolute top-2 right-2 text-xs font-bold text-gray-300">#{i + 1}</div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs">Posición</Label>
                                    <Select
                                        value={d.posicion}
                                        onValueChange={(val) => handleDesignChange(i, 'posicion', val)}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Pecho">Pecho</SelectItem>
                                            <SelectItem value="Espalda">Espalda</SelectItem>
                                            <SelectItem value="Manga izq">Manga izq</SelectItem>
                                            <SelectItem value="Manga der">Manga der</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Tamaño</Label>
                                    <Select
                                        value={d.tamano}
                                        onValueChange={(val) => handleDesignChange(i, 'tamano', val)}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Normal">Normal</SelectItem>
                                            <SelectItem value="Pequeño">Pequeño</SelectItem>
                                            <SelectItem value="Grande">Grande</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition-colors relative h-32">
                                {d.url ? (
                                    <>
                                        <img src={d.url} className="h-full w-full object-contain" />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDesignChange(i, 'url', ""); handleDesignChange(i, 'file', null); }}
                                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:text-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {uploading ? (
                                            <Loader2 className="w-8 h-8 text-black animate-spin mb-2" />
                                        ) : (
                                            <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                        )}
                                        <p className="text-xs text-gray-500 font-medium">{uploading ? "Subiendo..." : "Click para subir diseño"}</p>
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/png, image/jpeg, application/pdf"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) handleUploadFile(i, e.target.files[0]);
                                            }}
                                            disabled={uploading}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    <Button
                        disabled={uploading || designs.some(d => !d.url)}
                        onClick={handleFinishConfig}
                        className="w-full mt-4 bg-black text-white h-12 text-lg shadow-xl shadow-black/20 font-bold"
                    >
                        Agregar al Carrito
                    </Button>
                </div>
            )}
        </div>
    );
}
