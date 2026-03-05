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
import { ShieldCheck, Loader2, CheckCircle2, Users, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface LeadMatchingBridgeProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    propertyId: string;
    onSuccess?: () => void;
}

export function LeadMatchingBridge({ open, onOpenChange, propertyId, onSuccess }: LeadMatchingBridgeProps) {
    const [step, setStep] = useState<"confirm" | "matching" | "success">("confirm");
    const { toast } = useToast();

    const handleMatch = async () => {
        setStep("matching");
        // Simulate background matching and notification
        await new Promise(resolve => setTimeout(resolve, 3000));
        setStep("success");
        if (onSuccess) onSuccess();

        toast({
            title: "Pedido enviado!",
            description: "Os 3 advogados parceiros mais ativos na sua zona já foram notificados.",
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            onOpenChange(val);
            if (!val) setTimeout(() => setStep("confirm"), 300);
        }}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                {step === "confirm" && (
                    <>
                        <div className="bg-primary/5 p-8 text-center border-b">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-8 h-8 text-primary" />
                            </div>
                            <DialogTitle className="text-2xl font-bold mb-2">Revisão Jurídica</DialogTitle>
                            <DialogDescription className="text-base">
                                Deseja enviar os documentos do seu Cofre para análise por especialistas?
                            </DialogDescription>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">O advogado terá acesso temporário aos documentos necessários do seu Cofre.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">3 especialistas locais serão notificados para garantir a resposta mais rápida.</p>
                                </div>
                            </div>
                            <DialogFooter className="flex flex-col sm:flex-col gap-3 pt-4">
                                <Button onClick={handleMatch} className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/10">
                                    Sim, Solicitar Revisão por €10
                                </Button>
                                <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full text-muted-foreground text-xs">
                                    Cancelar
                                </Button>
                            </DialogFooter>
                        </div>
                    </>
                )}

                {step === "matching" && (
                    <div className="p-12 text-center space-y-6">
                        <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Users className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">A contactar parceiros...</h3>
                            <p className="text-sm text-muted-foreground">Estamos a selecionar os 3 advogados mais ativos na sua zona.</p>
                        </div>
                    </div>
                )}

                {step === "success" && (
                    <div className="p-12 text-center space-y-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto scale-in-center">
                            <Send className="w-10 h-10 text-green-600" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">Pedido Enviado com Sucesso!</h3>
                            <p className="text-sm text-muted-foreground px-4">
                                Enviámos o seu pedido aos nossos 3 especialistas parceiros. Assim que um deles aceitar, receberá uma notificação.
                            </p>
                        </div>
                        <Button onClick={() => onOpenChange(false)} className="w-full h-12 font-bold rounded-xl">
                            Entendido
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
