"use client";

interface StatsCardProps {
    label: string;
    value: string | number;
    icon: string;
    trend?: {
        value: number;
        label: string;
    };
    colorClass?: string;
}

export function StatsCard({ label, value, icon, trend, colorClass = "from-primary/20 to-primary/5" }: StatsCardProps) {
    return (
        <div className="glass-card p-5 group hover:border-primary/20 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-lg group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trend.value >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                        {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)} {trend.label}
                    </span>
                )}
            </div>
            <p className="text-2xl font-black tracking-tight text-foreground">{value}</p>
            <p className="text-xs font-medium text-foreground-secondary/50 mt-1 uppercase tracking-wider">{label}</p>
        </div>
    );
}
