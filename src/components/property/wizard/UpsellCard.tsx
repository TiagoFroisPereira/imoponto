import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles, ArrowRight, Zap, ShieldCheck } from "lucide-react";

interface UpsellCardProps {
    title: string;
    description: string;
    badge?: string;
    price?: string;
    buttonLabel: string;
    secondaryButtonLabel?: string;
    onSecondaryClick?: () => void;
    variant?: 'default' | 'premium' | 'accent';
    onClick?: () => void;
    className?: string;
}

export function UpsellCard({
    title,
    description,
    badge,
    price,
    buttonLabel,
    secondaryButtonLabel,
    onSecondaryClick,
    variant = 'default',
    onClick,
    className
}: UpsellCardProps) {
    const isPremium = variant === 'premium';
    const isAccent = variant === 'accent';

    return (
        <div className={cn(
            "relative overflow-hidden rounded-xl border p-5 transition-all duration-300 group",
            isPremium ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-sm hover:shadow-md" :
                isAccent ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm hover:shadow-md" :
                    "bg-card border-slate-200 hover:border-primary/30",
            className
        )}>
            {/* Background elements */}
            {isPremium && (
                <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <Sparkles className="w-24 h-24 text-amber-500" />
                </div>
            )}
            {isAccent && (
                <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <Zap className="w-24 h-24 text-blue-500" />
                </div>
            )}

            <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            {isPremium ? (
                                <Sparkles className="w-4 h-4 text-amber-600" />
                            ) : isAccent ? (
                                <Zap className="w-4 h-4 text-blue-600" />
                            ) : (
                                <ShieldCheck className="w-4 h-4 text-primary" />
                            )}
                            <h3 className={cn(
                                "font-bold text-base md:text-lg",
                                isPremium ? "text-amber-900" : isAccent ? "text-blue-900" : "text-foreground"
                            )}>
                                {title}
                            </h3>
                        </div>
                        {badge && (
                            <Badge variant="secondary" className={cn(
                                "text-[10px] font-bold uppercase tracking-wider h-5",
                                isPremium ? "bg-amber-100 text-amber-700 hover:bg-amber-100" :
                                    isAccent ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : ""
                            )}>
                                {badge}
                            </Badge>
                        )}
                    </div>
                    {price && (
                        <div className="text-right shrink-0">
                            <span className={cn(
                                "text-lg md:text-xl font-black",
                                isPremium ? "text-amber-700" : isAccent ? "text-blue-700" : "text-primary"
                            )}>
                                {price}
                            </span>
                        </div>
                    )}
                </div>

                <p className={cn(
                    "text-sm leading-relaxed",
                    isPremium ? "text-amber-800/80" : isAccent ? "text-blue-800/80" : "text-muted-foreground"
                )}>
                    {description}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button
                        onClick={onClick}
                        className={cn(
                            "w-full sm:flex-1 font-bold shadow-sm transition-all",
                            isPremium ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200" :
                                isAccent ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200" :
                                    "variant-outline border-primary/20 hover:border-primary/50 text-primary"
                        )}
                        variant={isPremium || isAccent ? "default" : "outline"}
                    >
                        {buttonLabel}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    {secondaryButtonLabel && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onSecondaryClick}
                            className="text-xs text-muted-foreground hover:text-foreground h-10 w-full sm:w-auto"
                        >
                            {secondaryButtonLabel}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
