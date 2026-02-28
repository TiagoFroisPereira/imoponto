import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { SellerPlansContent } from "./SellerPlansContent";
import { Sparkles } from "lucide-react";

interface SellerPlansModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
}

export function SellerPlansModal({ open, onOpenChange, title, description }: SellerPlansModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-none shadow-2xl">
                <div className="bg-primary/5 px-6 py-8 md:px-12 md:py-12">
                    <DialogHeader className="mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 w-fit mx-auto md:mx-0">
                            <Sparkles className="w-3 h-3" />
                            <span>Upgrade Necessário</span>
                        </div>
                        <DialogTitle className="text-3xl md:text-4xl font-bold tracking-tight text-center md:text-left">
                            {title || "Desbloqueie todo o potencial"}
                        </DialogTitle>
                        <DialogDescription className="text-lg text-muted-foreground text-center md:text-left max-w-2xl">
                            {description || "Parece que atingiu o limite do seu plano atual. Escolha uma opção para continuar."}
                        </DialogDescription>
                    </DialogHeader>

                    <SellerPlansContent
                        showHero={false}
                        showProfessionals={false}
                        onPlanSelected={() => onOpenChange(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
