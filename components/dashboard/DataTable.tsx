"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps<T> {
    columns: {
        header: string;
        accessorKey?: keyof T;
        cell?: (item: T) => React.ReactNode;
        className?: string;
    }[];
    data: T[];
    keyExtractor: (item: T) => string | number;
    isLoading?: boolean;
    onRowClick?: (item: T) => void;
    pagination?: {
        page: number;
        totalPages: number;
        onPageChange: (page: number) => void;
    };
}

export function DataTable<T>({
    columns,
    data,
    keyExtractor,
    isLoading,
    onRowClick,
    pagination
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="w-full h-64 flex items-center justify-center text-gray-400">
                Loading...
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="w-full h-64 flex items-center justify-center text-gray-400 border rounded-lg bg-gray-50/50">
                No data found.
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="bg-gray-50/50 border-b">
                            <tr className="hover:bg-muted/50 transition-colors">
                                {columns.map((col, idx) => (
                                    <th
                                        key={idx}
                                        className={cn(
                                            "h-12 px-4 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
                                            col.className
                                        )}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {data.map((item) => (
                                <tr
                                    key={keyExtractor(item)}
                                    className={cn(
                                        "border-b transition-colors hover:bg-gray-50/50",
                                        onRowClick && "cursor-pointer"
                                    )}
                                    onClick={() => onRowClick && onRowClick(item)}
                                >
                                    {columns.map((col, idx) => (
                                        <td
                                            key={idx}
                                            className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                                        >
                                            {col.cell
                                                ? col.cell(item)
                                                : (col.accessorKey ? String(item[col.accessorKey]) : null)
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2">
                    <button
                        className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => pagination.onPageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-gray-500">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => pagination.onPageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
