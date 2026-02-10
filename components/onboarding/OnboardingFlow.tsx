"use client";

import { useState } from "react";
import ProductGrid from "./ProductGrid";
import ProductConfig from "./ProductConfig";
import CustomerForm from "./CustomerForm";
import CartSummary from "./CartSummary";
import SuccessStep from "./SuccessStep";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export type CartItem = {
    id: string; // unique cart id
    product: any;
    variant: any; // fetched variant
    config: {
        tecnica: string;
        talla: string;
        color: string;
        tamano_diseno: string;
        cantidad: number;
        disenos: any[]; // { url, posicion, tamano }
        precioUnitario: number;
    };
    subtotal: number;
};

export default function OnboardingFlow({ initialProducts, executionId }: { initialProducts: any[]; executionId?: string }) {
    const [step, setStep] = useState<'GRID' | 'CONFIG' | 'CART' | 'CUSTOMER' | 'SUCCESS'>('GRID');
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [lastOrderDetails, setLastOrderDetails] = useState<any>(null); // For success screen

    const handleSelectProduct = (product: any) => {
        setSelectedProduct(product);
        setStep('CONFIG');
    };

    const handleAddToCart = (item: CartItem) => {
        setCart([...cart, item]);
        setStep('CART');
    };

    const handleRemoveFromCart = (id: string) => {
        setCart(cart.filter(i => i.id !== id));
        if (cart.length === 1) { // removing last item
            // Maybe keep in CART step but empty? Or go to GRID? Keep in CART.
        }
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        setStep('CUSTOMER');
    };

    const handleOrderSuccess = (details: any) => {
        setLastOrderDetails(details);
        setCart([]); // Clear cart
        setStep('SUCCESS');
    };

    const handleContinueShopping = () => {
        setStep('GRID');
        setSelectedProduct(null);
    };

    return (
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl overflow-hidden relative pb-20">
            {/* Header */}
            <div className="bg-black text-white p-4 sticky top-0 z-10 flex justify-between items-center shadow-md">
                <h1 className="font-black text-lg tracking-tight">LOAR</h1>
                {step !== 'CART' && step !== 'SUCCESS' && cart.length > 0 && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-gray-800 relative"
                        onClick={() => setStep('CART')}
                    >
                        <ShoppingCart className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                            {cart.length}
                        </span>
                    </Button>
                )}
            </div>

            <div className="p-4 safe-area-bottom">
                {step === 'GRID' && (
                    <ProductGrid products={initialProducts} onSelect={handleSelectProduct} />
                )}

                {step === 'CONFIG' && selectedProduct && (
                    <ProductConfig
                        product={selectedProduct}
                        onAddToCart={handleAddToCart}
                        onBack={() => setStep('GRID')}
                    />
                )}

                {step === 'CART' && (
                    <CartSummary
                        cart={cart}
                        onRemove={handleRemoveFromCart}
                        onAddAnother={handleContinueShopping}
                        onCheckout={handleCheckout}
                    />
                )}

                {step === 'CUSTOMER' && (
                    <CustomerForm
                        cart={cart}
                        onSuccess={handleOrderSuccess}
                        onBack={() => setStep('CART')}
                        executionId={executionId}
                    />
                )}

                {step === 'SUCCESS' && (
                    <SuccessStep
                        lastOrderDetails={lastOrderDetails}
                        onAddAnother={handleContinueShopping}
                    />
                )}
            </div>
        </div>
    );
}
