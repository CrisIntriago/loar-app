import { Header } from '@/components/dashboard/Header';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <DashboardLayout>
            <Header />

            <div className="max-w-7xl mx-auto p-6 md:p-8">
                {children}
            </div>
        </DashboardLayout>
    )
}
