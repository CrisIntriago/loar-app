"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { PreviewDiseño } from "./PreviewDiseño";
// Icons
import { Shirt, Scissors, Package, Smile, Coffee, ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";

// Categorias map
const CATEGORIAS = [
    { id: 'camiseta', label: 'Camiseta', icon: Shirt },
    { id: 'crop_top', label: 'Crop Top', icon: Shirt }, // Icon placeholder
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

export default function ProductoForm() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);

    // Selection State
    const [categoria, setCategoria] = useState<string>("");
    const [producto, setProducto] = useState<any>(null);
    const [config, setConfig] = useState({
        talla: "",
        color: "",
        tecnica: "",
        cantidad: 1
    });
    const [cliente, setCliente] = useState({
        nombre: "",
        whatsapp: "+593"
    });

    // Fetch products
    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch('/api/inventario'); // Public endpoint returns active products
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
    const handleBack = () => setStep(p => p - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                producto_id: producto.id,
                talla: config.talla,
                color: config.color,
                tecnica: config.tecnica,
                cantidad: config.cantidad,
                cliente_nombre: cliente.nombre,
                cliente_whatsapp: cliente.whatsapp,
                total: producto.precio_base * config.cantidad // Server validates this too
            };

            const res = await fetch('/api/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                // Post message to parent (WebView context)
                if (window.parent) {
                    window.parent.postMessage({ type: 'webview:success', data: { pedido_id: data.id, total: data.total } }, '*');
                }
                // Show success / instruction
                alert("Pedido creado exitosamente. ¡Gracias!"); // Replace with proper UI later
                // Reset or redirect? Usually show success screen.
            } else {
                alert("Error: " + data.error);
            }
        } catch (e) {
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    // Steps Rendering
    const renderStep = () => {
        switch (step) {
            case 1: // Categoría
                return (
                    <div className="grid grid-cols-3 gap-3">
                        {CATEGORIAS.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => { setCategoria(cat.id); handleNext(); }}
                                className="flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-gray-50 active:scale-95 transition-all aspect-square"
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
                    <div className="space-y-4">
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
                                                cantidad: 1
                                            });
                                            handleNext();
                                        }}
                                    >
                                        <CardContent className="p-3 text-center">
                                            <div className="w-full aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center text-2xl font-bold text-gray-300">
                                                {p.nombre.substring(0, 2)}
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
                return (
                    <div className="space-y-6">
                        <h2 className="font-bold text-xl">Personaliza tu {producto.nombre}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Talla</label>
                                <div className="flex flex-wrap gap-2">
                                    {producto.tallas.map((t: string) => (
                                        <button
                                            key={t}
                                            onClick={() => setConfig({ ...config, talla: t })}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${config.talla === t ? 'bg-black text-white border-black' : 'hover:bg-gray-50'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {producto.colores.map((c: string) => (
                                        <button
                                            key={c}
                                            onClick={() => setConfig({ ...config, color: c })}
                                            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${config.color === c ? 'ring-2 ring-black ring-offset-1 border-transparent' : 'hover:bg-gray-50'}`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Técnica</label>
                                <Select
                                    value={config.tecnica}
                                    onChange={(e) => setConfig({ ...config, tecnica: e.target.value })}
                                >
                                    {producto.tecnicas.map((t: string) => (
                                        <option key={t} value={t}>{t.toUpperCase()}</option>
                                    ))}
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Cantidad</label>
                                <div className="flex items-center gap-4">
                                    <Button variant="outline" size="icon" onClick={() => setConfig({ ...config, cantidad: Math.max(1, config.cantidad - 1) })}>-</Button>
                                    <span className="font-bold text-lg w-8 text-center">{config.cantidad}</span>
                                    <Button variant="outline" size="icon" onClick={() => setConfig({ ...config, cantidad: Math.min(producto.stock, config.cantidad + 1) })}>+</Button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Disponible: {producto.stock}</p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button className="w-full" size="lg" onClick={handleNext}>Continuar</Button>
                        </div>
                    </div>
                );

            case 4: // Cliente Info
                return (
                    <div className="space-y-6">
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
                                className="w-full"
                                size="lg"
                                onClick={handleNext}
                                disabled={!cliente.nombre || !cliente.whatsapp || cliente.whatsapp.length < 10}
                            >
                                Revisar Pedido
                            </Button>
                        </div>
                    </div>
                );

            case 5: // Resumen
                return (
                    <div className="space-y-6">
                        <h2 className="font-bold text-xl text-center">Resumen del Pedido</h2>
                        <PreviewDiseño producto={producto} config={config} />

                        <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Cliente</span>
                                <span className="font-medium">{cliente.nombre}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">WhatsApp</span>
                                <span className="font-medium">{cliente.whatsapp}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full bg-black hover:bg-gray-900 text-white"
                            size="lg"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                            Confirmar Pedido
                        </Button>
                    </div>
                );

            default: return null;
        }
    };

    return (
        <div className="w-full max-w-md mx-auto min-h-[50vh] flex flex-col">
            {/* Header with back button */}
            {step > 1 && (
                <div className="mb-4">
                    <Button variant="ghost" size="sm" onClick={handleBack} className="-ml-2 text-gray-500">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Atrás
                    </Button>
                </div>
            )}

            <div className="flex-1">
                {renderStep()}
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mt-8 mb-4">
                {[1, 2, 3, 4, 5].map(s => (
                    <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? 'w-6 bg-black' : 'w-1.5 bg-gray-200'}`} />
                ))}
            </div>
        </div>
    );
}
