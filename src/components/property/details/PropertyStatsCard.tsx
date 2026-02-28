import { Eye, Heart, MessageSquare, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PropertyStatsCardProps {
    viewsCount?: number;
    favoritesCount?: number;
    sharesCount?: number;
    inquiriesCount?: number;
}

export function PropertyStatsCard({
    viewsCount = 0,
    favoritesCount = 0,
    sharesCount = 0,
    inquiriesCount = 0,
}: PropertyStatsCardProps) {
    const stats = [
        {
            label: "Visualizações",
            value: viewsCount,
            icon: Eye,
            color: "text-blue-500",
            bgColor: "bg-blue-50",
        },
        {
            label: "Favoritos",
            value: favoritesCount,
            icon: Heart,
            color: "text-rose-500",
            bgColor: "bg-rose-50",
        },
        {
            label: "Partilhas",
            value: sharesCount,
            icon: Share2,
            color: "text-amber-500",
            bgColor: "bg-amber-50",
        },
        {
            label: "Contactos",
            value: inquiriesCount,
            icon: MessageSquare,
            color: "text-emerald-500",
            bgColor: "bg-emerald-50",
        },
    ];

    return (
        <Card className="border-primary/10">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Estatísticas do Anúncio</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="p-4 rounded-xl border border-primary/5 bg-muted/30 flex flex-col gap-2"
                        >
                            <div className="flex items-center justify-between">
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                </div>
                                <span className="text-xl sm:text-2xl font-bold">{stat.value}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
