"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Image as ImageIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";

const TALLAS = ["S", "M", "L", "XL", "XXL", "Única"];
const COLORES = ["Blanco", "Negro", "Plomo", "Azul", "Rosa", "Verde"];
const TECNICAS = ["DTF", "Sublimado", "Bordado", "Llano"];
const CATEGORIAS = ['camiseta', 'crop_top', 'ranglan', 'oversize', 'hoodie', 'buzo', 'bividi', 'boxer', 'pijama', 'almohada', 'gorra', 'taza'];

interface ProductoEditModalProps {
    product: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdated: () => void;
}

export default function ProductoEditModal({ product, open, onOpenChange, onUpdated }: ProductoEditModalProps) {
    const [loading, setLoading] = useState(false);
    const [nombre, setNombre] = useState(product?.nombre || "");
    const [categoria, setCategoria] = useState(product?.categoria || "");
    const [descripcion, setDescripcion] = useState(product?.descripcion || "");
    const [tallas, setTallas] = useState<string[]>(product?.tallas || []);
    const [colores, setColores] = useState<string[]>(product?.colores || []);
    const [tecnicas, setTecnicas] = useState<string[]>(product?.tecnicas || []);
    const [imageUrl, setImageUrl] = useState(product?.imagen_url || "");

    // Reset state when product changes
    useEffect(() => {
        if (product) {
            setNombre(product.nombre);
            setCategoria(product.categoria);
            setDescripcion(product.descripcion || "");
            setTallas(product.tallas || []);
            setColores(product.colores || []);
            setTecnicas(product.tecnicas || []);
            setImageUrl(product.imagen_url || "");
        }
    }, [product]);

    const handleUpload = async (file: File) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'productos');

        try {
            const res = await fetch('/api/upload/disenos', {
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
        if (!nombre) return;
        setLoading(true);

        try {
            const payload = {
                nombre,
                categoria,
                descripcion,
                tallas,
                colores,
                tecnicas,
                imagen_url: imageUrl
            };

            const res = await fetch(`/api/productos/${product.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                onUpdated();
                onOpenChange(false);
            } else {
                alert("Error al actualizar producto");
            }
        } catch (e) {
            console.error(e);
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto backdrop-blur-sm">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Editar Producto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nombre</Label>
                            <Input value={nombre} onChange={e => setNombre(e.target.value)} required />
                        </div>

                        <div className="space-y-2">
                            <Label>Categoría</Label>
                            <Select value={categoria} onValueChange={setCategoria} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIAS.map(c => <SelectItem key={c} value={c} className="capitalize">{c.replace('_', ' ')}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3} />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label>Imagen</Label>
                            <div className="flex items-center gap-4">
                                <div className="w-[60px] h-[60px] bg-gray-100 rounded overflow-hidden border">
                                    {imageUrl ? (
                                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="w-full max-w-xs text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) handleUpload(e.target.files[0]);
                                        }}
                                    />
                                    {loading && <Loader2 className="absolute top-2 right-2 w-4 h-4 animate-spin" />}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Tallas Disponibles</Label>
                            <CheckboxGroup options={TALLAS} selected={tallas} onChange={setTallas} />
                        </div>

                        <div className="space-y-2">
                            <Label>Colores Base</Label>
                            <CheckboxGroup options={COLORES} selected={colores} onChange={setColores} />
                        </div>

                        <div className="space-y-2">
                            <Label>Técnicas</Label>
                            <CheckboxGroup options={TECNICAS} selected={tecnicas} onChange={setTecnicas} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-black text-white hover:bg-gray-800">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
