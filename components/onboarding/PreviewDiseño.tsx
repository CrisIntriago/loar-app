import { Card, CardContent } from "@/components/ui/card";

interface PreviewProps {
    producto: any;
    config: {
        talla: string;
        color: string;
        tecnica: string;
        cantidad: number;
    };
}

export function PreviewDiseño({ producto, config }: PreviewProps) {
    if (!producto) return null;

    return (
        <Card className="w-full max-w-sm mx-auto overflow-hidden shadow-none border-0 bg-transparent">
            <div className="aspect-square bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center relative mb-4">
                {/* Placeholder image logic. In real app, use producto.image_url */}
                <div className="text-6xl font-black text-gray-100 select-none">
                    {producto.nombre.substring(0, 2).toUpperCase()}
                </div>

                {/* Visual overlay based on configuration */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <span className="text-xs uppercase tracking-widest">{config.tecnica}</span>
                </div>

                {config.color && (
                    <div
                        className="absolute bottom-4 right-4 w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                        style={{ backgroundColor: config.color.toLowerCase() === 'blanco' ? '#fff' : config.color.toLowerCase() === 'negro' ? '#000' : config.color }}
                        title={`Color: ${config.color}`}
                    />
                )}
            </div>

            <CardContent className="p-0 space-y-1">
                <h3 className="font-bold text-lg text-gray-900 leading-tight">{producto.nombre}</h3>
                <p className="text-sm text-gray-500 capitalize">{producto.categoria}</p>

                <div className="pt-3 flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">Talla {config.talla}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">{config.color}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">{config.tecnica}</span>
                </div>

                <div className="pt-4 mt-2 flex justify-between items-center font-bold text-lg border-t border-gray-100">
                    <span className="text-gray-900">Total ({config.cantidad})</span>
                    <span className="text-black">${(producto.precio_base * config.cantidad).toFixed(2)}</span>
                </div>
            </CardContent>
        </Card>
    );
}
