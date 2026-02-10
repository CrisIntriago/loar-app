"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { PreviewDiseño } from "./PreviewDiseño";
import { Shirt, Package, Smile, Coffee, ChevronRight, ChevronLeft, Check, Loader2, ShoppingBag, Plus, Trash2, Paperclip, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Categorias map
const CATEGORIAS = [
    { id: 'camiseta', label: 'Camiseta', icon: Shirt },
    { id: 'crop_top', label: 'Crop Top', icon: Shirt },
    { id: 'ranglan', label: 'Ranglan', icon: Shirt },
    { id: 'oversize', label: 'Oversize', icon: Shirt },
    { id: 'polo', label: 'Polo', icon: Shirt },
    { id: 'hoodie', label: 'Hoodie', icon: Package },
    { id: 'buzo', label: 'Buzo', icon: Package },
    { id: 'boxer', label: 'Boxer', icon: Package },
    { id: 'pijama', label: 'Pijama', icon: Smile },
    { id: 'almohada', label: 'Almohada', icon: Smile },
    { id: 'taza', label: 'Taza', icon: Coffee },
];

interface CartItem {
    tempId: string;
    producto: any;
    config: {
        talla: string;
        color: string;
        tecnica: string;
        cantidad: number;
        precioUnitario: number;
        isMayorista: boolean;
        designFile: File | null;
        designPreview: string | null;
    };
    subtotal: number;
}

export default function ProductoForm() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);

    // Cart State
    const [cart, setCart] = useState<CartItem[]>([]);

    // Selection State
    const [categoria, setCategoria] = useState<string>("");
    const [producto, setProducto] = useState<any>(null);
    const [config, setConfig] = useState({
        talla: "",
        color: "",
        tecnica: "",
        cantidad: 1,
        designFile: null as File | null,
        designPreview: null as string | null
    });

    const [cliente, setCliente] = useState({
        nombre: "",
        whatsapp: "+593"
    });

    // Fetch products
    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch('/api/inventario');
                const data = await res.json();
                if (Array.isArray(data)) setProducts(data);
            } catch (e) {
                console.error("Error fetching products", e);
            }
        }
        fetchProducts();
    }, []);

    // Handlers
    const handleNext = () => setStep(p => p + 1);
    const handleBack = () => {
        if (step === 4 && cart.length > 0) {
            // Check if we want to confirm going back? 
            // Actually Step 4 is Cart Summary. Back from Cart could go to Home (Step 1) if empty?
            if (cart.length === 0) setStep(1);
            // If items in cart, keeping state is fine.
        }
        setStep(p => p - 1);
    };

    // Calculate Price for Current Selection
    // Calculate Price for Current Selection
    const calculateCurrentPrice = () => {
        if (!producto) return { unitPrice: 0, isMayorista: false, total: 0, priceDetails: "" };

        let unitPrice = Number(producto.precio_base);
        let isMayorista = false;
        let priceDescription = "";

        // Check tiered pricing
        if (producto.producto_precios && producto.producto_precios.length > 0) {
            const qty = config.cantidad;
            const matchingTier = producto.producto_precios.find((p: any) =>
                qty >= p.cantidad_minima &&
                (p.cantidad_maxima === null || qty <= p.cantidad_maxima)
            );

            if (matchingTier) {
                unitPrice = Number(matchingTier.precio_unitario);
                isMayorista = true;
                const maxStr = matchingTier.cantidad_maxima ? `-${matchingTier.cantidad_maxima}` : "+";
                priceDescription = `Escala aplicada: ${matchingTier.cantidad_minima}${maxStr} unidades a $${unitPrice.toFixed(2)} c/u`;
            }
        } else {
            // Fallback to legacy fields if no tiers defined (optional, but good for stability)
            const cantMayorista = producto.cantidad_mayorista || 6;
            if (producto.precio_mayorista && config.cantidad >= cantMayorista) {
                unitPrice = Number(producto.precio_mayorista);
                isMayorista = true;
                priceDescription = `Precio mayorista aplicado (Min ${cantMayorista})`;
            }
        }

        return { unitPrice, isMayorista, total: unitPrice * config.cantidad, priceDetails: priceDescription };
    };

    const addToCart = () => {
        const { unitPrice, isMayorista } = calculateCurrentPrice(); // @ts-ignore
        const newItem: CartItem = {
            tempId: crypto.randomUUID(),
            producto: producto,
            config: {
                ...config,
                precioUnitario: unitPrice,
                isMayorista
            },
            subtotal: unitPrice * config.cantidad
        };
        setCart([...cart, newItem]);
        // Reset Item State
        setProducto(null);
        setCategoria("");
        setConfig({ talla: "", color: "", tecnica: "", cantidad: 1, designFile: null, designPreview: null });
        setStep(4); // Go to Cart Summary
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter(i => i.tempId !== id));
        if (cart.length === 1) setStep(1); // Go back to start if empty
    };

    const handleDesignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setConfig({ ...config, designFile: file, designPreview: preview });
        }
    };

    // Upload image to Supabase Storage
    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            const ext = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
            const { data, error } = await supabase.storage
                .from('disenos')
                .upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage.from('disenos').getPublicUrl(fileName);
            return publicUrl;
        } catch (e) {
            console.error("Upload error:", e);
            return null;
        }
    };

    const handleSubmit = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        try {
            // Process each item
            for (const item of cart) {
                let disenoUrl = null;
                // Upload design if exists
                if (item.config.designFile) {
                    disenoUrl = await uploadImage(item.config.designFile);
                }

                const payload = {
                    producto_id: item.producto.id,
                    talla: item.config.talla,
                    color: item.config.color,
                    tecnica: item.config.tecnica,
                    cantidad: item.config.cantidad,
                    cliente_nombre: cliente.nombre,
                    cliente_whatsapp: cliente.whatsapp,
                    total: item.subtotal,
                    diseno_url: disenoUrl
                };

                const res = await fetch('/api/pedidos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || "Error al crear pedido");
                }
            }

            // Success
            setStep(6); // Success Step

        } catch (e: any) {
            alert("Ocurrió un error: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseWebView = () => {
        if (window.parent) {
            window.parent.postMessage({ type: 'webview:close' }, '*');
        }
    };

    // Rendering Logic
    const renderStep = () => {
        switch (step) {
            case 1: // Categoría
                return (
                    <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {CATEGORIAS.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => { setCategoria(cat.id); handleNext(); }}
                                className="flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-gray-50 active:scale-95 transition-all aspect-square bg-white shadow-sm"
                            >
                                <cat.icon className="w-8 h-8 mb-2 text-gray-700" />
                                <span className="medium text-xs text-center leading-tight">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                );

            case 2: // Producto
                const filtered = products.filter(p => p.categoria === categoria);
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="font-bold text-xl mb-4 capitalize">Selecciona {categoria}</h2>
                        {filtered.length === 0 ? <p className="text-gray-500 text-center py-8">No hay productos disponibles.</p> :
                            <div className="grid grid-cols-2 gap-3">
                                {filtered.map(p => (
                                    <Card
                                        key={p.id}
                                        className="cursor-pointer hover:border-black transition-colors"
                                        onClick={() => {
                                            setProducto(p);
                                            setConfig({
                                                talla: p.tallas[0] || '',
                                                color: p.colores[0] || '',
                                                tecnica: p.tecnicas[0] || '',
                                                cantidad: 1,
                                                designFile: null,
                                                designPreview: null
                                            });
                                            handleNext();
                                        }}
                                    >
                                        <CardContent className="p-3 text-center">
                                            <div className="w-full aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center text-2xl font-bold text-gray-300">
                                                {p.nombre ? p.nombre.substring(0, 2) : 'P'}
                                            </div>
                                            <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5em]">{p.nombre}</h3>
                                            <p className="font-bold mt-1">${p.precio_base}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>}
                    </div>
                );

            case 3: // Configuración
                const pricing = calculateCurrentPrice(); // @ts-ignore
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="font-bold text-xl">Personaliza tu {producto.nombre}</h2>

                        <div className="space-y-5">
                            {/* Talla */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Talla</label>
                                <div className="flex flex-wrap gap-2">
                                    {producto.tallas.map((t: string) => (
                                        <button
                                            key={t}
                                            onClick={() => setConfig({ ...config, talla: t })}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${config.talla === t ? 'bg-black text-white border-black' : 'hover:bg-gray-50 bg-white'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {producto.colores.map((c: string) => (
                                        <button
                                            key={c}
                                            onClick={() => setConfig({ ...config, color: c })}
                                            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${config.color === c ? 'ring-2 ring-black ring-offset-1 border-gray-300 bg-gray-50' : 'hover:bg-gray-50 bg-white'}`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Diseño Upload */}
                            <div>
                                <label className="text-sm font-medium mb-2 block flex justify-between">
                                    <span>Sube tu diseño (Opcional)</span>
                                    {config.designFile && <span className="text-xs text-green-600 font-bold flex items-center"><Check className="w-3 h-3 mr-1" /> Listo</span>}
                                </label>
                                <div className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative overflow-hidden group">
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={handleDesignUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                    />
                                    {config.designPreview ? (
                                        <div className="relative w-full aspect-video">
                                            <img src={config.designPreview} alt="Preview" className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs font-medium">Cambiar imagen</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-2">
                                                <Paperclip className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium">JPG, PNG o PDF</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Técnica */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Técnica</label>
                                <Select
                                    value={config.tecnica}
                                    onChange={(e) => setConfig({ ...config, tecnica: e.target.value })}
                                >
                                    {producto.tecnicas.map((t: string) => (
                                        <option key={t} value={t}>{t.toUpperCase()}</option>
                                    ))}
                                </Select>
                            </div>

                            {/* Cantidad & Precio */}
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <label className="text-sm font-medium mb-2 block">Cantidad</label>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 bg-white rounded-lg border p-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setConfig({ ...config, cantidad: Math.max(1, config.cantidad - 1) })}>-</Button>
                                        <span className="font-bold text-lg w-6 text-center">{config.cantidad}</span>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setConfig({ ...config, cantidad: Math.min(producto.stock, config.cantidad + 1) })}>+</Button>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black">${pricing.total.toFixed(2)}</div>
                                        {pricing.isMayorista && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Precio Mayorista</span>}
                                        {!pricing.isMayorista && <span className="text-[10px] text-gray-400">Unitario: ${pricing.unitPrice}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button className="w-full bg-black text-white hover:bg-gray-900" size="lg" onClick={addToCart}>
                                Agregar al Pedido
                            </Button>
                        </div>
                    </div>
                );

            case 4: // Cart Summary
                const totalCart = cart.reduce((sum, item) => sum + item.subtotal, 0);
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="font-bold text-xl flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5" /> Tu Pedido
                        </h2>

                        <div className="space-y-3">
                            {cart.map((item) => (
                                <div key={item.tempId} className="flex gap-4 p-3 border rounded-xl bg-white relative group">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 font-bold text-gray-300">
                                        {item.producto.nombre.substring(0, 2)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-sm truncate pr-6">{item.producto.nombre}</h3>
                                            <button onClick={() => removeFromCart(item.tempId)} className="text-gray-400 hover:text-red-500 absolute top-3 right-3">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {item.config.talla} / {item.config.color} / {item.config.tecnica}
                                        </p>
                                        <div className="flex justify-between items-end mt-2">
                                            <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">x{item.config.cantidad}</span>
                                            <span className="font-bold text-sm">${item.subtotal.toFixed(2)}</span>
                                        </div>
                                        {item.config.designFile && (
                                            <div className="mt-2 flex items-center gap-1 text-[10px] text-green-600 font-medium">
                                                <Paperclip className="w-3 h-3" /> Diseño adjunto
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-6">
                                <span className="font-medium text-gray-500">Total a Pagar</span>
                                <span className="text-3xl font-black">${totalCart.toFixed(2)}</span>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    className="w-full bg-black text-white hover:bg-gray-900"
                                    size="lg"
                                    onClick={() => handleNext()}
                                >
                                    Continuar con mis datos
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    size="lg"
                                    onClick={() => { setStep(1); setCategoria(""); }}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Agregar otro producto
                                </Button>
                            </div>
                        </div>
                    </div>
                );

            case 5: // Cliente Info
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="font-bold text-xl">Tus Datos</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Nombre Completo</label>
                                <Input
                                    placeholder="Ej. Juan Pérez"
                                    value={cliente.nombre}
                                    onChange={e => setCliente({ ...cliente, nombre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">WhatsApp</label>
                                <Input
                                    placeholder="+593..."
                                    value={cliente.whatsapp}
                                    onChange={e => setCliente({ ...cliente, whatsapp: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground mt-1">Te contactaremos por aquí para confirmar.</p>
                            </div>
                        </div>
                        <div className="pt-4">
                            <Button
                                className="w-full bg-black text-white"
                                size="lg"
                                onClick={handleSubmit}
                                disabled={!cliente.nombre || !cliente.whatsapp || cliente.whatsapp.length < 10 || loading}
                            >
                                {loading ? <Loader2 className="animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                Confirmar y Enviar Pedido
                            </Button>
                        </div>
                    </div>
                );

            case 6: // Success
                return (
                    <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in duration-500 py-10">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                            <Check className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight mb-2">¡Pedido Enviado!</h2>
                            <p className="text-gray-500 max-w-xs mx-auto">
                                Te contactaremos por WhatsApp para confirmar tu pago y detalles.
                            </p>
                        </div>

                        <div className="w-full max-w-xs space-y-3 pt-6">
                            <Button
                                className="w-full bg-white text-black border-2 border-black hover:bg-gray-50"
                                size="lg"
                                onClick={() => {
                                    setCart([]);
                                    setStep(1);
                                    setConfig({ talla: "", color: "", tecnica: "", cantidad: 1, designFile: null, designPreview: null });
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Agregar otro pedido
                            </Button>
                            <Button
                                className="w-full bg-black text-white hover:bg-gray-900"
                                size="lg"
                                onClick={handleCloseWebView}
                            >
                                Finalizar y Cerrar
                            </Button>
                        </div>
                    </div>
                );

            default: return null;
        }
    };

    return (
        <div className="w-full max-w-md mx-auto min-h-[50vh] flex flex-col">
            {/* Header with back button - Only show if not in success step */}
            {step > 1 && step < 6 && (
                <div className="mb-4">
                    <Button variant="ghost" size="sm" onClick={handleBack} className="-ml-2 text-gray-500 hover:text-black">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Atrás
                    </Button>
                </div>
            )}

            <div className="flex-1">
                {renderStep()}
            </div>

            {/* Progress Dots (Hide on success and cart?) */}
            {step < 6 && (
                <div className="flex justify-center gap-2 mt-8 mb-4">
                    {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? 'w-6 bg-black' : 'w-1.5 bg-gray-200'}`} />
                    ))}
                </div>
            )}
        </div>
    );
}
