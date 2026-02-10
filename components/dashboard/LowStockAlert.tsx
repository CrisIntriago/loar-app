"use client";

import { DataTable } from "./DataTable";

export function LowStockAlert({ products }: { products: any[] }) {
    const columns = [
        {
            header: "Producto",
            accessorKey: "nombre",
            cell: (item: any) => (
                <div className="font-medium text-gray-900">{item.nombre}</div>
            )
        },
        {
            header: "Stock",
            accessorKey: "stock",
            cell: (item: any) => (
                <div className="font-bold text-red-600">{item.stock}</div>
            )
        },
        {
            header: "Categoría",
            accessorKey: "categoria",
            cell: (item: any) => (
                <span className="capitalize text-gray-500">{item.categoria}</span>
            )
        }
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-red-600 flex items-center gap-2">
                Alertas de Stock
            </h2>
            <DataTable
                columns={columns}
                data={products}
                keyExtractor={(item) => item.id}
            />
        </div>
    );
}
