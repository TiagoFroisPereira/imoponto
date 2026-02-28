import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck, ArrowRight, Loader2, Scale } from "lucide-react";
import { useLegalAcceptance } from "@/hooks/useLegalAcceptance";
import { useToast } from "@/hooks/use-toast";

interface LegalAcceptanceModalProps {
    open: boolean;
    onAccepted: () => void;
}

export function LegalAcceptanceModal({ open, onAccepted }: LegalAcceptanceModalProps) {
    const [hasChecked, setHasChecked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { acceptLegal } = useLegalAcceptance();
    const { toast } = useToast();

    const handleAccept = async () => {
        if (!hasChecked) return;

        setIsSubmitting(true);
        const success = await acceptLegal();

        if (success) {
            toast({
                title: "Nota Legal aceite",
                description: "Pode agora continuar a utilizar a plataforma.",
            });
            onAccepted();
        } else {
            toast({
                title: "Erro",
                description: "Não foi possível guardar a aceitação. Tente novamente.",
                variant: "destructive",
            });
        }

        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent
                className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <div className="bg-primary/5 px-8 pt-8 pb-6">
                    <DialogHeader>
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                            <Scale className="w-7 h-7 text-primary" />
                        </div>
                        <DialogTitle className="text-2xl font-bold">Nota Legal</DialogTitle>
                        <DialogDescription className="text-base text-muted-foreground">
                            Antes de prosseguir, leia e aceite a seguinte informação importante.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-8 py-8 space-y-6">
                    <div className="p-5 bg-muted/30 rounded-xl border border-border">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                            </div>
                            <div className="space-y-3">
                                <p className="text-sm text-foreground leading-relaxed">
                                    <strong>A ImoPonto</strong> limita-se a disponibilizar uma plataforma tecnológica de publicação e contacto.
                                </p>
                                <p className="text-sm text-foreground leading-relaxed">
                                    Toda a informação inserida é da <strong>exclusiva responsabilidade do utilizador</strong>.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <Checkbox
                            id="legal-acceptance"
                            checked={hasChecked}
                            onCheckedChange={(checked) => setHasChecked(checked as boolean)}
                            className="mt-0.5"
                        />
                        <label
                            htmlFor="legal-acceptance"
                            className="text-sm font-medium leading-relaxed cursor-pointer"
                        >
                            Li e compreendi a Nota Legal apresentada.
                        </label>
                    </div>
                </div>

                <DialogFooter className="px-8 pb-8">
                    <Button
                        onClick={handleAccept}
                        disabled={!hasChecked || isSubmitting}
                        className="w-full h-12 text-base font-bold rounded-xl"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                A guardar...
                            </>
                        ) : (
                            <>
                                Aceitar e Continuar
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
