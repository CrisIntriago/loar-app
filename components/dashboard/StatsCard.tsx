import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
    className?: string;
}

export function StatsCard({ title, value, description, icon, trend, trendUp, className }: StatsCardProps) {
    return (
        <Card className={cn("shadow-sm border-gray-100 hover:shadow-md transition-shadow", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {title}
                </CardTitle>
                {icon && <div className="text-gray-400">{icon}</div>}
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold text-gray-900">{value}</div>
                {(description || trend) && (
                    <p className={cn("text-xs mt-1 font-medium", trendUp === false ? "text-red-500" : "text-green-600")}>
                        {trend && <span>{trend} </span>}
                        <span className="text-muted-foreground ml-1">{description}</span>
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
