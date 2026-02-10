"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; // Need to create
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";

export default function CustomerForm({ cart, onSuccess, onBack, executionId }: { cart: any[], onSuccess: (details: any) => void, onBack: () => void, executionId?: string }) {
    const [nombre, setNombre] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [loading, setLoading] = useState(false);
    const [accepted, setAccepted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accepted) {
            alert("Debes aceptar los términos.");
            return;
        }

        // Simple validation for whatsapp
        if (!whatsapp.startsWith('+')) {
            alert("El WhatsApp debe incluir el código de país. Ej: +593...");
            return;
        }

        setLoading(true);

        try {
            const orderPromises = cart.map(item => {
                const payload = {
                    cliente_nombre: nombre,
                    cliente_whatsapp: whatsapp,
                    variante_id: item.variant.id,
                    cantidad: item.config.cantidad,
                    disenos: item.config.disenos,
                    // precio_unitario: item.config.precioUnitario // calculated by backend to be safe? 
                    // My backend logic calculates it inside route.ts based on quantity. 
                    // So frontend total is just display.
                    // But wait, backend route.ts recalculates everything. 
                    // So we just need to pass the basic data.
                };

                return fetch('/api/pedidos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            });

            const responses = await Promise.all(orderPromises);
            const errors = responses.filter(r => !r.ok);

            if (errors.length > 0) {
                // Handle partial failure?
                console.error("Some orders failed", errors);
                alert("Hubo un error al procesar algunos items. Por favor contacta soporte.");
                // For MVP, just fail.
            } else {
                // Success
                const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
                const details = { nombre, whatsapp, total, orderCount: cart.length };

                if (executionId) {
                    fetch('/api/jelou-callback', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            executionId,
                            success: true,
                            data: details,
                        }),
                    }).catch(err => console.error('Jelou callback failed:', err));
                }

                onSuccess(details);
            }

        } catch (e) {
            console.error(e);
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="sm" onClick={onBack} className="p-0 h-8 w-8 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h2 className="font-bold text-lg">Datos de Envío</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label>Nombre Completo</Label>
                    <Input
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        required
                        placeholder="Ej: Juan Pérez"
                        className="h-12"
                    />
                </div>

                <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input
                        value={whatsapp}
                        onChange={e => setWhatsapp(e.target.value)}
                        required
                        placeholder="Ej: +593 999 999 999"
                        className="h-12"
                    />
                    <p className="text-xs text-gray-500">Incluye el código de país (+593 para Ecuador).</p>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={accepted}
                        onChange={e => setAccepted(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Acepto los términos y condiciones
                    </label>
                </div>

                <Button
                    type="submit"
                    disabled={loading || !nombre || !whatsapp || !accepted}
                    className="w-full mt-6 bg-black text-white h-14 text-lg font-bold shadow-xl shadow-black/20"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Confirmar Pedido"}
                </Button>
            </form>
        </div>
    );
}
