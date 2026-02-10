"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const TALLAS = ["S", "M", "L", "XL", "XXL", "Única"];
const COLORES = ["Blanco", "Negro", "Gris", "Azul", "Rojo", "Verde", "Amarillo", "Rosado"];
const TECNICAS = ["DTF", "Bordado", "Sublimado", "Llano"];
const CATEGORIAS = ['camiseta', 'crop_top', 'ranglan', 'oversize', 'polo', 'hoodie', 'buzo', 'boxer', 'pijama', 'almohada', 'taza'];

export default function NuevoProductoModal({ onCreated }: { onCreated: (product: any) => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [nombre, setNombre] = useState("");
    const [categoria, setCategoria] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [tallas, setTallas] = useState<string[]>([]);
    const [colores, setColores] = useState<string[]>([]);
    const [tecnicas, setTecnicas] = useState<string[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState("");

    const handleUpload = async (file: File) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'productos');

        try {
            const res = await fetch('/api/upload/disenos', { // Reusing upload route but specifying bucket
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                setImageUrl(data.url);
            }
        } catch (e) {
            console.error("Upload failed", e);
            alert("Error subiendo imagen");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                nombre,
                categoria,
                descripcion,
                tallas,
                colores,
                tecnicas,
                imagen_url: imageUrl,
                activo: true
            };

            const res = await fetch('/api/productos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const newProduct = await res.json();
                onCreated(newProduct);
                setOpen(false);
                // Reset form
                setNombre(""); setCategoria(""); setDescripcion(""); setTallas([]); setColores([]); setTecnicas([]); setImageUrl(""); setImageFile(null);
            } else {
                alert("Error al crear producto");
            }
        } catch (e) {
            console.error(e);
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/20 transition-all active:scale-95">
                    <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Producto
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black tracking-tight">Crear Nuevo Producto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label>Nombre</Label>
                            <Input value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Ej: Camiseta Oversize" />
                        </div>
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label>Categoría</Label>
                            <Select onValueChange={setCategoria} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIAS.map(c => <SelectItem key={c} value={c} className="capitalize">{c.replace('_', ' ')}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label>Descripción</Label>
                            <Textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Detalles del producto..." />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2 col-span-2">
                            <Label>Imagen Principal</Label>
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-gray-400 transition-colors">
                                    {imageUrl ? (
                                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-gray-400" />
                                    )}
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) handleUpload(e.target.files[0]);
                                        }}
                                    />
                                    {loading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>}
                                </div>
                                <div className="text-xs text-gray-500">
                                    <p>Sube una imagen representativa.</p>
                                    <p>Formatos: JPG, PNG.</p>
                                </div>
                            </div>
                        </div>

                        {/* Multi-Selects */}
                        <div className="space-y-2 col-span-2">
                            <Label>Tallas Disponibles</Label>
                            <div className="flex flex-wrap gap-2">
                                {TALLAS.map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => toggleSelection(t, tallas, setTallas)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${tallas.includes(t) ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label>Colores Disponibles</Label>
                            <div className="flex flex-wrap gap-2">
                                {COLORES.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => toggleSelection(c, colores, setColores)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${colores.includes(c) ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label>Técnicas Disponibles</Label>
                            <div className="flex flex-wrap gap-2">
                                {TECNICAS.map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => toggleSelection(t, tecnicas, setTecnicas)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${tecnicas.includes(t) ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading || !imageUrl || !nombre || !categoria} className="bg-black hover:bg-gray-800 text-white w-full md:w-auto">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Crear Producto Base
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
