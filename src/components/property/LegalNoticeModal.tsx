import { useState } from "react";
import {
    ShieldCheck,
    Building2,
    ArrowRight
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface LegalNoticeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAccept: () => void;
}

export function LegalNoticeModal({ open, onOpenChange, onAccept }: LegalNoticeModalProps) {
    const [hasAgreed, setHasAgreed] = useState(false);

    const handleProceed = () => {
        if (hasAgreed) {
            onAccept();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
                <div className="bg-primary/5 px-8 pt-8 pb-6">
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <DialogTitle className="text-2xl font-bold">Compromisso de Transparência</DialogTitle>
                        <DialogDescription className="text-base text-muted-foreground">
                            Antes de publicar o seu anúncio, por favor reveja a nossa Nota Legal.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-8 py-8 space-y-6">
                    <div className="max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                        <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
                            <p>
                                <strong>A ImoPonto</strong> é uma plataforma tecnológica de publicação e facilitação de contacto entre particulares e profissionais.
                                Não somos uma imobiliária, não realizamos mediação e não intervimos em negociações.
                            </p>
                            <p>
                                A ImoPonto limita-se a disponibilizar uma infraestrutura tecnológica. Não prestamos aconselhamento jurídico, imobiliário ou financeiro.
                            </p>
                            <p>
                                <strong>Responsabilidade da Informação:</strong> Toda a informação inserida pelo utilizador (descrições, fotos, preços, áreas) é da sua exclusiva responsabilidade.
                            </p>
                            <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-primary" />
                                    Conformidade Legal (SIMPLEX)
                                </p>
                                <p className="text-xs">
                                    O utilizador declara estar em conformidade com o <strong>Decreto-Lei n.º 10/2023</strong> e reconhece a obrigatoriedade da inclusão da classe do Certificado Energético (ADENE) no anúncio, conforme exigido por lei.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-primary/5 rounded-xl border border-primary/10 transition-colors">
                        <Checkbox
                            id="legal-agree-modal"
                            checked={hasAgreed}
                            onCheckedChange={(checked) => setHasAgreed(checked as boolean)}
                            className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <label
                            htmlFor="legal-agree-modal"
                            className="text-sm font-medium leading-none cursor-pointer select-none"
                        >
                            Confirmo que li a Nota Legal e aceito os Termos de Serviço da ImoPonto.
                        </label>
                    </div>
                </div>

                <DialogFooter className="px-8 pb-8 gap-3 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="px-6 rounded-xl h-11"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleProceed}
                        disabled={!hasAgreed}
                        className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-11 transition-all"
                    >
                        Aceitar e Publicar
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
