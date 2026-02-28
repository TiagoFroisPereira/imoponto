import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, FileText, XCircle, Info, AlertCircle, Loader2, Upload } from "lucide-react";
import { getCategoryLabel } from "@/data/documentCategories";
import { useState } from "react";
import { DocumentGuideModal } from "./DocumentGuideModal";

interface DocumentStatusItemProps {
    category?: string;
    label?: string;
    status: "validated" | "uploaded" | "missing";
    onOpenVault?: () => void;
    compact?: boolean;
}

export function DocumentStatusItem({
    category,
    label: customLabel,
    status,
    onOpenVault,
    compact = false
}: DocumentStatusItemProps) {
    const [guideOpen, setGuideOpen] = useState(false);
    const label = customLabel || (category ? getCategoryLabel(category) : "");

    const getStatusConfig = () => {
        switch (status) {
            case 'validated':
                return {
                    label: 'Validado',
                    icon: CheckCircle2,
                    className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30',
                    dotClassName: 'bg-green-500'
                };
            case 'uploaded':
                return {
                    label: 'Carregado',
                    icon: FileText,
                    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
                    dotClassName: 'bg-blue-500'
                };
            case 'missing':
                return {
                    label: 'Em falta',
                    icon: AlertCircle,
                    className: 'bg-muted/30 text-muted-foreground border-border/50',
                    dotClassName: 'bg-muted-foreground'
                };
            default:
                return {
                    label: 'Pendente',
                    icon: AlertCircle,
                    className: 'bg-amber-500/5 text-amber-700 border-amber-500/30',
                    dotClassName: 'bg-amber-500'
                };
        }
    };

    const config = getStatusConfig();
    const StatusIcon = config.icon;

    return (
        <div className="group">
            <div
                className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all hover:shadow-sm",
                    config.className
                )}
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                        status === 'missing' ? "bg-muted text-muted-foreground" : config.className
                    )}>
                        <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className={cn("font-semibold text-foreground", compact ? "text-xs" : "text-sm")}>{label}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className={cn("text-[10px] h-4 px-1.5 border-none bg-transparent p-0", config.className)}>
                                <div className={cn("w-1 h-1 rounded-full mr-1.5", config.dotClassName)} />
                                {config.label}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {category && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => setGuideOpen(true)}
                        >
                            <Info className="w-4 h-4 mr-1.5" />
                            Como obter
                        </Button>
                    )}

                    {status === "missing" && onOpenVault && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-[10px] font-semibold hidden sm:flex"
                            onClick={onOpenVault}
                        >
                            <Upload className="w-3 h-3 mr-1.5" />
                            Carregar
                        </Button>
                    )}
                </div>
            </div>

            {category && (
                <DocumentGuideModal
                    open={guideOpen}
                    onOpenChange={setGuideOpen}
                    category={category}
                    onUpload={status === 'missing' ? onOpenVault : undefined}
                />
            )}
        </div>
    );
}
