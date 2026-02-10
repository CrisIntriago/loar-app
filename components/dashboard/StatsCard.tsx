import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: string;
}

export function StatsCard({ title, value, description, icon: Icon, trend }: StatsCardProps) {
    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900">{value}</h3>
                {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                <Icon className="w-5 h-5 text-gray-600" />
            </div>
        </div>
    );
}
