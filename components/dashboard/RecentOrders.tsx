"use client";

import { DataTable } from "./DataTable";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Helper for simple badge if component doesn't exist
function SimpleBadge({ children, className }: { children: React.ReactNode, className?: string }) {
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${className}`}>{children}</span>;
}

export function RecentOrders({ orders }: { orders: any[] }) {
    const columns = [
        {
            header: "Cliente",
            accessorKey: "cliente_nombre",
            cell: (item: any) => (
                <div>
                    <div className="font-medium text-gray-900">{item.cliente_nombre}</div>
                    <div className="text-xs text-gray-500">{item.cliente_whatsapp}</div>
                </div>
            )
        },
        {
            header: "Producto",
            cell: (item: any) => (
                <div className="text-sm">
                    <span className="font-medium">{item.productos?.nombre || 'Producto eliminado'}</span>
                    <span className="text-gray-500 text-xs ml-1">({item.cantidad})</span>
                </div>
            )
        },
        {
            header: "Total",
            cell: (item: any) => (
                <div className="font-bold text-gray-900">${item.total}</div>
            )
        },
        {
            header: "Estado",
            cell: (item: any) => {
                const colors: Record<string, string> = {
                    pendiente: "bg-yellow-100 text-yellow-800",
                    pagado: "bg-blue-100 text-blue-800",
                    en_produccion: "bg-purple-100 text-purple-800",
                    entregado: "bg-green-100 text-green-800",
                    cancelado: "bg-red-100 text-red-800"
                };
                return (
                    <SimpleBadge className={colors[item.estado] || "bg-gray-100 text-gray-800"}>
                        {item.estado.replace('_', ' ')}
                    </SimpleBadge>
                );
            }
        },
        {
            header: "Fecha",
            cell: (item: any) => (
                <div className="text-xs text-gray-500">
                    {format(new Date(item.created_at), "d MMM, HH:mm", { locale: es })}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight">Pedidos Recientes</h2>
            <DataTable
                columns={columns}
                data={orders}
                keyExtractor={(item) => item.id}
            />
        </div>
    );
}
