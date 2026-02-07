export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <main className="bg-white min-h-[100dvh] w-full max-w-md mx-auto relative flex flex-col shadow-sm">
            {/* Top bar logic or branding could go here */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 py-8">
                {children}
            </div>
        </main>
    )
}
