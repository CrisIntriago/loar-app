import { Button } from "@/components/ui/button";
import { CheckCircle, Home, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SuccessStep({ lastOrderDetails, onAddAnother }: { lastOrderDetails: any, onAddAnother: () => void }) {
    const router = useRouter();

    const handleFinish = () => {
        window.location.reload(); // Hard refresh to clear everything
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in zoom-in duration-500">
            <div className="relative">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                <div className="bg-green-100 p-6 rounded-full relative z-10">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-900">¡Pedido Enviado!</h2>
                <p className="text-gray-500 max-w-xs mx-auto">
                    Gracias {lastOrderDetails?.nombre || "por tu compra"}. <br />
                    Hemos recibido tus {lastOrderDetails?.count || ""} productos correctamente.
                    Te contactaremos al whatsapp {lastOrderDetails?.whatsapp} para confirmar el pago.
                </p>
            </div>

            <div className="w-full max-w-xs space-y-3 pt-8">
                <Button
                    onClick={onAddAnother}
                    className="w-full bg-black text-white h-14 text-lg font-bold shadow-xl shadow-black/20 flex items-center justify-center gap-2"
                >
                    <ShoppingBag className="w-5 h-5" />
                    Agregar otro producto
                </Button>

                <Button
                    variant="ghost"
                    onClick={handleFinish}
                    className="w-full h-12 text-gray-400 hover:text-gray-900"
                >
                    <Home className="mr-2 w-4 h-4" />
                    Finalizar y Salir
                </Button>
            </div>
        </div>
    );
}
