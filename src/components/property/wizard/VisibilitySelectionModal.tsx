import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2, Zap, Clock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface VisibilityOption {
    id: string;
    key: string;
    days: number;
    price: number;
    label: string;
    isPopular?: boolean;
}

const VISIBILITY_OPTIONS: VisibilityOption[] = [
    { id: "7-days", key: "visibility_7", days: 7, price: 14.90, label: "Essencial" },
    { id: "15-days", key: "visibility_15", days: 15, price: 24.90, label: "Recomendado", isPopular: true },
    { id: "30-days", key: "visibility_30", days: 30, price: 39.90, label: "Máxima Exposição" },
];

interface VisibilitySelectionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (option: VisibilityOption) => void;
}

export function VisibilitySelectionModal({ open, onOpenChange, onSelect }: VisibilitySelectionModalProps) {
    const [selectedId, setSelectedId] = useState<string>("15-days");

    const handleConfirm = () => {
        const option = VISIBILITY_OPTIONS.find(o => o.id === selectedId);
        if (option) {
            onSelect(option);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white relative">
                    <div className="absolute top-4 right-4 opacity-10">
                        <Sparkles className="w-24 h-24" />
                    </div>
                    <DialogHeader className="relative z-10">
                        <Badge className="w-fit mb-3 bg-white/20 text-white border-none backdrop-blur-md">
                            Destaque Imediato
                        </Badge>
                        <DialogTitle className="text-3xl font-black mb-2 tracking-tight">
                            Destaque o seu imóvel
                        </DialogTitle>
                        <DialogDescription className="text-blue-100 text-base leading-relaxed">
                            Aumente a visibilidade e receba propostas mais rápidas colocando o seu anúncio no topo.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-4 bg-background">
                    <div className="grid gap-3">
                        {VISIBILITY_OPTIONS.map((option) => (
                            <div
                                key={option.id}
                                onClick={() => setSelectedId(option.id)}
                                className={cn(
                                    "relative p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group",
                                    selectedId === option.id
                                        ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                                        : "border-muted hover:border-primary/30 hover:bg-muted/50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                        selectedId === option.id ? "border-primary bg-primary" : "border-muted-foreground/30"
                                    )}>
                                        {selectedId === option.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-foreground">{option.days} dias</span>
                                            {option.isPopular && (
                                                <Badge variant="secondary" className="text-[10px] h-4 bg-orange-100 text-orange-700 border-none uppercase tracking-wider font-black">
                                                    Popular
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {option.label}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-foreground">€{option.price.toFixed(2)}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase font-medium">Preço fixo</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-muted/30 p-4 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>Apareça nos primeiros resultados de pesquisa</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>Moldura visual exclusiva no anúncio</span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-0 bg-background flex sm:flex-col gap-3">
                    <Button
                        onClick={handleConfirm}
                        className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Zap className="w-4 h-4 mr-2 fill-current" />
                        Ativar Destaque Agora
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="w-full text-muted-foreground text-xs hover:bg-transparent"
                    >
                        Talvez mais tarde
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
