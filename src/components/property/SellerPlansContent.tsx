import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
    Check,
    ArrowRight,
    Zap,
    ShieldCheck,
    Camera,
    Building2,
    BadgeCheck,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { subscribeToPlan } from "@/lib/stripe";
import { useToast } from "@/hooks/use-toast";

export const plans = [
    {
        id: "free",
        name: "Plano Free",
        price: "0€",
        description: "Ideal para vender o seu imóvel com total autonomia.",
        features: [
            "1 imóvel ativo",
            "Até 5 fotografias",
            "Ficha básica do imóvel",
            "Visibilidade nos resultados de pesquisa",
            "Contacto direto com compradores",
            "Acesso ao marketplace de profissionais",
            "Cofre Digital disponível por 35€",
        ],
        buttonText: "Começar Grátis",
        buttonVariant: "outline" as const,
        recommended: false,
    },
    {
        id: "start",
        name: "Plano Start",
        price: "9,90€",
        period: "/ mês",
        yearlyPrice: "99€ / ano",
        description: "Mais visibilidade e ferramentas para vender mais rápido.",
        features: [
            "1 imóvel ativo",
            "Até 10 fotografias",
            "1 vídeo",
            "Melhor posicionamento nos resultados",
            "Agenda de marcações de visitas",
            "Contacto direto com compradores",
            "Acesso ao marketplace de profissionais",
            "Acesso ao Cofre Digital incluído",
        ],
        buttonText: "Escolher Start",
        buttonVariant: "outline" as const,
        recommended: true,
    },
    {
        id: "pro",
        name: "Plano Pro",
        price: "19,90€",
        period: "/ mês",
        yearlyPrice: "199€ / ano",
        description: "Para quem quer vender múltiplos imóveis com máxima exposição.",
        features: [
            "Até 3 imóveis ativos",
            "Até 10 fotografias por imóvel",
            "1 vídeo por imóvel",
            "Prioridade nos resultados",
            "Perfil verificado",
            "Agenda de marcações de visitas",
            "Contacto direto com compradores",
            "Acesso ao marketplace de profissionais",
            "Acesso ao Cofre Digital incluído",
        ],
        buttonText: "Escolher Pro",
        buttonVariant: "default" as const,
        recommended: false,
    },
];

interface SellerPlansContentProps {
    onPlanSelected?: (planName: string) => void;
    showHero?: boolean;
    showProfessionals?: boolean;
}

export function SellerPlansContent({ onPlanSelected, showHero = true, showProfessionals = true }: SellerPlansContentProps) {
    const navigate = useNavigate();
    const { userPlan } = usePlanLimits();
    const { toast } = useToast();
    const [isLegalDialogOpen, setIsLegalDialogOpen] = useState(false);
    const [hasAgreed, setHasAgreed] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePlanSelect = (planName: string) => {
        setSelectedPlan(planName);
        setIsLegalDialogOpen(true);
    };

    const handleProceed = async () => {
        if (!hasAgreed) return;

        setIsLegalDialogOpen(false);

        if (onPlanSelected) {
            onPlanSelected(selectedPlan!);
            return;
        }

        // Free plan - just navigate
        if (selectedPlan === "Plano Free") {
            navigate("/criar-anuncio");
            return;
        }

        // Paid plans - use Stripe redirect flow
        setIsProcessing(true);
        try {
            const planType = selectedPlan === "Plano Start" ? 'start' : 'pro';
            await subscribeToPlan(planType, billingPeriod);
        } catch (error) {
            console.error("Payment error:", error);
            toast({
                title: "Erro ao iniciar pagamento",
                description: "Não foi possível contactar o serviço de pagamentos. Tente novamente.",
                variant: "destructive"
            });
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full">
            {showHero && (
                <div className="text-center mb-16 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
                        <Zap className="w-3 h-3" />
                        <span>Transparência Total • Sem Comissões</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6 tracking-tight">
                        Escolha o plano ideal para <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">vender o seu imóvel</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Simples, direto e sem surpresas. Selecione o nível de exposição
                        que o seu imóvel merece.
                    </p>
                </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {plans.map((plan, index) => (
                    <Card
                        key={index}
                        className={`relative flex flex-col border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${plan.recommended
                            ? "border-primary shadow-xl shadow-primary/5 bg-gradient-to-b from-primary/[0.02] to-transparent"
                            : "border-border hover:border-primary/50"
                            }`}
                    >
                        {plan.recommended && userPlan !== plan.id && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                    Mais Popular
                                </span>
                            </div>
                        )}

                        {userPlan === plan.id && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <span className="bg-muted-foreground text-muted text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1.5 border border-border">
                                    <CheckCircle2 className="w-3 h-3" />
                                    O Seu Plano
                                </span>
                            </div>
                        )}

                        <CardHeader className="pt-8 pb-6 text-center">
                            <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                            <CardDescription className="text-sm mt-2">{plan.description}</CardDescription>
                            <div className="mt-6 flex flex-col items-center">
                                <div className="flex items-baseline">
                                    <span className="text-5xl font-black tracking-tighter text-foreground">{plan.price}</span>
                                    {plan.period && <span className="text-muted-foreground ml-1 font-medium">{plan.period}</span>}
                                </div>
                                {plan.yearlyPrice && (
                                    <span className="text-xs text-primary font-semibold mt-2 px-2 py-0.5 rounded-md bg-primary/5">
                                        {plan.yearlyPrice}
                                    </span>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 pb-8">
                            <ul className="space-y-4">
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-start gap-3 group">
                                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <Check className="w-3 h-3 text-primary" />
                                        </div>
                                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter className="pt-0 pb-8 px-8">
                            <Button
                                className="w-full text-base font-bold h-12 rounded-xl"
                                variant={userPlan === plan.id ? "ghost" : plan.buttonVariant}
                                onClick={() => handlePlanSelect(plan.name)}
                                disabled={userPlan === plan.id}
                            >
                                {userPlan === plan.id ? "Plano Atual" : plan.buttonText}
                                {userPlan !== plan.id && <ArrowRight className="w-4 h-4 ml-2" />}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {showProfessionals && (
                <div className="mt-24 text-center">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-10">
                        Apoiado por Profissionais de Confiança
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                        <div className="flex items-center gap-2 text-foreground font-bold hover:scale-105 transition-transform"><ShieldCheck className="w-6 h-6 text-primary" /><span>JurídicoPT</span></div>
                        <div className="flex items-center gap-2 text-foreground font-bold hover:scale-105 transition-transform"><Camera className="w-6 h-6 text-primary" /><span>PhotoIMOV</span></div>
                        <div className="flex items-center gap-2 text-foreground font-bold hover:scale-105 transition-transform"><Building2 className="w-6 h-6 text-primary" /><span>ArquitectosLX</span></div>
                        <div className="flex items-center gap-2 text-foreground font-bold hover:scale-105 transition-transform"><BadgeCheck className="w-6 h-6 text-primary" /><span>Certificado+</span></div>
                    </div>
                </div>
            )}

            <Dialog open={isLegalDialogOpen} onOpenChange={setIsLegalDialogOpen}>
                <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
                    <div className="bg-primary/5 px-8 pt-8 pb-6">
                        <DialogHeader>
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                <ShieldCheck className="w-6 h-6 text-primary" />
                            </div>
                            <DialogTitle className="text-2xl font-bold">Compromisso de Transparência</DialogTitle>
                            <DialogDescription className="text-base text-muted-foreground">
                                Antes de prosseguir com a sua subscrição, por favor reveja a nossa Nota Legal.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="px-8 py-8 space-y-6">
                        <div className="max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                            <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
                                <p><strong>A ImoPonto</strong> é uma plataforma tecnológica de publicação e facilitação de contacto entre particulares e profissionais.</p>
                                <p>A ImoPonto limita-se a disponibilizar uma infraestrutura tecnológica. Não prestamos aconselhamento jurídico, imobiliário ou financeiro.</p>
                                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                    <p className="font-semibold text-foreground mb-2 flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" />Conformidade Legal (SIMPLEX)</p>
                                    <p className="text-xs">O utilizador declara estar em conformidade com o <strong>Decreto-Lei n.º 10/2023</strong> e reconhece a obrigatoriedade da inclusão da classe do Certificado Energético no anúncio.</p>
                                </div>
                            </div>
                        </div>

                        {selectedPlan && selectedPlan !== "Plano Free" && (
                            <div className="space-y-3">
                                <p className="text-sm font-semibold text-foreground">Período de faturação</p>
                                <RadioGroup
                                    value={billingPeriod}
                                    onValueChange={(v) => setBillingPeriod(v as 'monthly' | 'yearly')}
                                    className="grid grid-cols-2 gap-3"
                                >
                                    <Label
                                        htmlFor="billing-monthly"
                                        className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${billingPeriod === 'monthly' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                                    >
                                        <RadioGroupItem value="monthly" id="billing-monthly" className="sr-only" />
                                        <span className="text-lg font-bold text-foreground">
                                            {selectedPlan === "Plano Start" ? "9,90€" : "19,90€"}
                                        </span>
                                        <span className="text-xs text-muted-foreground">por mês</span>
                                    </Label>
                                    <Label
                                        htmlFor="billing-yearly"
                                        className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all relative ${billingPeriod === 'yearly' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                                    >
                                        <RadioGroupItem value="yearly" id="billing-yearly" className="sr-only" />
                                        <span className="absolute -top-2.5 right-2 text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Poupe 17%</span>
                                        <span className="text-lg font-bold text-foreground">
                                            {selectedPlan === "Plano Start" ? "99€" : "199€"}
                                        </span>
                                        <span className="text-xs text-muted-foreground">por ano</span>
                                    </Label>
                                </RadioGroup>
                            </div>
                        )}

                        <div className="flex items-start space-x-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <Checkbox
                                id="legal-agree-modal"
                                checked={hasAgreed}
                                onCheckedChange={(checked) => setHasAgreed(checked as boolean)}
                            />
                            <label htmlFor="legal-agree-modal" className="text-sm font-medium leading-none cursor-pointer">
                                Confirmo que li a Nota Legal e aceito os Termos de Serviço da ImoPonto.
                            </label>
                        </div>
                    </div>

                    <DialogFooter className="px-8 pb-8 gap-3 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsLegalDialogOpen(false)} className="px-6 rounded-xl h-11" disabled={isProcessing}>Cancelar</Button>
                        <Button onClick={handleProceed} disabled={!hasAgreed || isProcessing} className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-11 transition-all">
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {isProcessing ? "A processar..." : "Aceitar e Prosseguir (v2.1)"}
                            {!isProcessing && <ArrowRight className="w-4 h-4 ml-2" />}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
