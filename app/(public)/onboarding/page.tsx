import ProductoForm from "@/components/onboarding/ProductoForm";

export default function OnboardingPage() {
    return (
        <div className="flex flex-col h-full">
            <header className="mb-8 text-center flex flex-col items-center animate-fade-in-down">
                {/* Logo placeholder or simple text */}
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-3 shadow-lg">
                    <span className="text-white font-bold text-xl">L</span>
                </div>
                <h1 className="text-3xl font-black tracking-tighter uppercase text-black">LOAR</h1>
                <p className="text-gray-400 text-xs font-bold tracking-[0.2em] mt-1">PERSONALIZACIÓN</p>
            </header>

            <ProductoForm />

            <footer className="mt-auto py-6 text-center text-[10px] text-gray-300">
                POWERED BY JELOU
            </footer>
        </div>
    )
}
