"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, ImageOff } from "lucide-react";

export default function DesignThumbnail({ url, path, alt }: { url: string, path?: string, alt: string }) {
    const [src, setSrc] = useState(url);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (path) {
                // Generate fresh signed URL
                const { data, error } = await supabase.storage.from('disenos').createSignedUrl(path, 3600);
                if (data?.signedUrl) {
                    setSrc(data.signedUrl);
                } else {
                    console.error("Error signing url", error);
                    // Fallback to original url (might be expired)
                }
            }
            setLoading(false);
        };
        load();
    }, [path, url]);

    if (error) return <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400"><ImageOff className="w-6 h-6" /></div>;

    return (
        <div className="relative w-full h-full">
            <img
                src={src}
                alt={alt}
                className={`w-full h-full object-contain transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setLoading(false)}
                onError={() => setError(true)}
            />
            {loading && <div className="absolute inset-0 flex items-center justify-center bg-gray-50"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>}
        </div>
    );
}
