import { Button } from "@/components/ui/button";
import { Badge } from "lucide-react";

export default function ProductGrid({ products, onSelect }: { products: any[], onSelect: (product: any) => void }) {
    if (products.length === 0) {
        return <div className="text-center p-8 text-gray-400">No hay productos disponibles.</div>;
    }

    return (
        <div className="grid grid-cols-2 gap-4 pb-20">
            {products.map((p) => (
                <div
                    key={p.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden active:scale-95 group border border-gray-100"
                    onClick={() => onSelect(p)}
                >
                    <div className="aspect-square bg-gray-100 relative group overflow-hidden">
                        {p.imagen_url ? (
                            <img src={p.imagen_url} alt={p.nombre} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sin imagen</div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <div className="p-3">
                        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-2 min-h-[2.5em]">{p.nombre}</h3>
                        <p className="text-xs text-gray-500 capitalize mb-2">{p.categoria.replace('_', ' ')}</p>
                        <Button size="sm" className="w-full bg-black text-white text-xs h-8 hover:bg-gray-800 shadow-md shadow-black/10">
                            Personalizar
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
