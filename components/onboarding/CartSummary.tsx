import { Button } from "@/components/ui/button";
import { Trash2, ArrowRight, PlusCircle } from "lucide-react";
import { CartItem } from "./OnboardingFlow";

export default function CartSummary({ cart, onRemove, onAddAnother, onCheckout }: { cart: CartItem[], onRemove: (id: string) => void, onAddAnother: () => void, onCheckout: () => void }) {
    const total = cart.reduce((acc, item) => acc + item.subtotal, 0);

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <h2 className="font-bold text-2xl mb-4">Tu Carrito ({cart.length})</h2>

            <div className="space-y-4">
                {cart.map((item) => (
                    <div key={item.id} className="bg-white border rounded-xl p-4 shadow-sm relative flex gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {item.product.imagen_url && <img src={item.product.imagen_url} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm line-clamp-1">{item.product.nombre}</h3>
                            <p className="text-xs text-gray-500 mb-1">{item.config.tecnica} / {item.config.talla} / {item.config.color}</p>
                            <div className="flex justify-between items-end mt-2">
                                <div className="text-xs font-medium bg-gray-100 px-2 py-1 rounded inline-block">
                                    Cant: {item.config.cantidad}
                                </div>
                                <div className="font-bold text-lg">${item.subtotal.toFixed(2)}</div>
                            </div>
                        </div>
                        <button
                            onClick={() => onRemove(item.id)}
                            className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="border-t pt-4 mt-8 flex justify-between items-center">
                <span className="text-gray-500 font-medium">Total a Pagar</span>
                <span className="text-3xl font-black text-black tracking-tighter">${total.toFixed(2)}</span>
            </div>

            <div className="space-y-3 pt-4">
                <Button
                    onClick={onCheckout}
                    className="w-full bg-black text-white h-14 text-lg font-bold shadow-xl shadow-black/20 flex items-center justify-center gap-2"
                >
                    Confirmar Pedido <ArrowRight className="w-5 h-5" />
                </Button>

                <Button
                    variant="outline"
                    onClick={onAddAnother}
                    className="w-full h-12 text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                    <PlusCircle className="mr-2 w-4 h-4" /> Agregar otro producto
                </Button>
            </div>
        </div>
    );
}
