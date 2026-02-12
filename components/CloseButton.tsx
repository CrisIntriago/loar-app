"use client";

export default function CloseButton({ executionId }: { executionId?: string }) {
    const handleClose = () => {
        if (executionId) {
            fetch('/api/jelou-callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    executionId,
                    success: true,
                    data: { closed: true },
                }),
            }).catch(err => console.error('Jelou callback failed:', err));
        }
        window.close();
    };

    return (
        <button
            onClick={handleClose}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-lg shadow-red-600/30 transition-all active:scale-95 sm:text-base sm:py-4 sm:px-6 sm:rounded-2xl"
        >
            Cerrar
        </button>
    );
}
