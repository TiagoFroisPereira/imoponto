import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    CreditCard,
    Smartphone,
    CheckCircle2,
    Loader2,
    ArrowLeft,
    ShieldCheck,
    Camera,
    Video,
    Star,
    Building2,
    Zap,
    Lock,
    Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { subscribeToPlan, purchaseVaultAccess, purchaseAddon } from "@/lib/stripe";

import { useQuery } from "@tanstack/react-query";

const ADDONS = {
    vault: {
        name: "Cofre Digital",
        price: "35€",
        icon: ShieldCheck,
        description: "Armazenamento seguro de documentos",
        lifetime: true,
    },
    extra_photos: {
        name: "Pack Extra Fotos",
        price: "4,90€",
        icon: Camera,
        description: "+15 fotografias em alta definição",
        lifetime: true,
    },
    video: {
        name: "Video & 3D Tour",
        price: "9,90€",
        icon: Video,
        description: "Suporte para vídeos e visitas virtuais",
        lifetime: true,
    },
    promotion: {
        name: "Destaque Platinum",
        price: "14,90€",
        icon: Star,
        description: "Top 3 resultados e selo de destaque",
        lifetime: false,
        duration: "30 Dias",
    },
};

const PLANS = {
    start: {
        name: "Plano Start",
        price: "9,90€",
        icon: Zap,
        description: "Mais visibilidade e ferramentas",
        period: "/ mês",
    },
    pro: {
        name: "Plano Pro",
        price: "19,90€",
        icon: Building2,
        description: "Máxima exposição para múltiplos imóveis",
        period: "/ mês",
    },
};

export default function Checkout() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { toast } = useToast();

    const type = searchParams.get("type"); // 'addon' | 'plan' | 'vault_access'
    const id = searchParams.get("id"); // e.g., 'vault', 'pro'
    const propertyId = searchParams.get("propertyId");
    const period = searchParams.get("period"); // 'monthly' | 'yearly'
    const requestId = searchParams.get("requestId"); // vault_buyer_access request id

    const [paymentMethod, setPaymentMethod] = useState<"card" | "mbway">("card");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Check if this is a vault access payment
    const isVaultAccess = type === "vault_access" && requestId;

    // Fetch vault access request details
    const { data: vaultRequest } = useQuery({
        queryKey: ['vault-access-request', requestId],
        queryFn: async () => {
            if (!requestId) return null;
            const { data, error } = await supabase
                .from("vault_buyer_access")
                .select("id, property_id, status, payment_amount, payment_status")
                .eq("id", requestId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!requestId,
    });

    // Fetch property title
    const effectivePropertyId = isVaultAccess ? (vaultRequest?.property_id || propertyId) : propertyId;
    const { data: property } = useQuery({
        queryKey: ['property-basic', effectivePropertyId],
        queryFn: async () => {
            if (!effectivePropertyId) return null;
            const { data, error } = await supabase
                .from('properties')
                .select('title')
                .eq('id', effectivePropertyId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!effectivePropertyId
    });

    // Get item details for non-vault-access types
    const item = type === "addon" ? ADDONS[id as keyof typeof ADDONS] : type === "plan" ? PLANS[id as keyof typeof PLANS] : null;

    const displayPrice = isVaultAccess
        ? '10€'
        : (type === 'plan' && period === 'yearly')
            ? (id === 'start' ? '99€' : '199€')
            : item?.price;

    const displayPeriod = isVaultAccess
        ? 'Pagamento Único — Acesso por 30 dias'
        : type === 'plan'
            ? (period === 'yearly' ? 'Subscrição Anual' : 'Subscrição Mensal')
            : (item && (item as any).lifetime ? 'Pagamento Único' : '30 Dias');

    useEffect(() => {
        if (isVaultAccess) return; // vault_access is valid
        if (!type || !id || !item) {
            navigate("/planos");
        }
    }, [type, id, item, navigate, isVaultAccess]);

    // Redirect if vault request already paid or invalid
    useEffect(() => {
        if (isVaultAccess && vaultRequest) {
            if (vaultRequest.status === 'paid') {
                toast({ title: "Já tem acesso", description: "O pagamento já foi efetuado para este cofre." });
                navigate(effectivePropertyId ? `/imovel/${effectivePropertyId}` : '/meu-perfil');
            } else if (vaultRequest.status !== 'approved') {
                toast({ title: "Pedido inválido", description: "Este pedido ainda não foi aprovado.", variant: "destructive" });
                navigate('/meu-perfil');
            }
        }
    }, [vaultRequest, isVaultAccess, navigate, toast, effectivePropertyId]);

    const handlePayment = async () => {
        setIsProcessing(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Não autenticado");

            if (paymentMethod === "mbway") {
                // Keep simulation for MB Way for now as it's not fully implemented in the stripe lib
                await new Promise(resolve => setTimeout(resolve, 1500));
                // ... same logic as before for simulation if needed, but the user wants real Stripe for card
            }

            if (isVaultAccess && requestId) {
                await purchaseVaultAccess(requestId);
            } else if (type === "addon" && propertyId) {
                await purchaseAddon(propertyId, id as string);
            } else if (type === "plan") {
                await subscribeToPlan(id as 'start' | 'pro', (period as 'monthly' | 'yearly') || 'monthly');
            }
        } catch (error: any) {
            console.error("Checkout error:", error);
            toast({
                title: "Erro no pagamento",
                description: "Ocorreu um erro ao processar o seu pedido.",
                variant: "destructive"
            });
            setIsProcessing(false);
        }
    };

    if (!isVaultAccess && !item) return null;

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-4 animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold">Pagamento Confirmado!</h1>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        {isVaultAccess
                            ? <>O acesso ao Cofre Digital foi ativado.<br />Válido por 30 dias. A redirecionar...</>
                            : <>O seu {type === 'addon' ? 'Power-up' : 'Plano'} foi ativado.<br />A redirecionar para a sua funcionalidade...</>
                        }
                    </p>
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mt-4" />
                </div>
            </div>
        );
    }

    const ItemIcon = isVaultAccess ? Eye : (item?.icon || ShieldCheck);
    const itemName = isVaultAccess ? "Acesso ao Cofre Digital" : item?.name || "";
    const itemDescription = isVaultAccess
        ? "Acesso aos documentos do imóvel aprovado pelo proprietário"
        : item?.description || "";

    return (
        <div className="bg-muted/30">
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <Button
                    variant="ghost"
                    className="mb-8"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                </Button>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column: Order Summary */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Resumo do Pedido</h2>
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <ItemIcon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">{itemName}</CardTitle>
                                        <CardDescription>{itemDescription}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {property && (
                                    <div className="flex justify-between text-sm items-center py-3 border-t">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Building2 className="w-4 h-4" /> Imóvel
                                        </span>
                                        <span className="font-medium truncate max-w-[150px]">{property.title}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm items-center py-3 border-t">
                                    <span className="text-muted-foreground">Tipo</span>
                                    <span className="font-medium">
                                        {displayPeriod}
                                    </span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-4 border-t">
                                    <span>Total</span>
                                    <span className="text-primary">{displayPrice}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                            <Lock className="w-3 h-3" />
                            Pagamento seguro e encriptado
                        </div>
                    </div>

                    {/* Right Column: Payment Details */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Pagamento</h2>
                        <Card className="border-2 border-primary/20">
                            <CardContent className="pt-6 space-y-6">
                                <RadioGroup
                                    value={paymentMethod}
                                    onValueChange={(v) => setPaymentMethod(v as any)}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <div>
                                        <RadioGroupItem value="card" id="card" className="sr-only" />
                                        <Label
                                            htmlFor="card"
                                            className={`flex flex-col items-center justify-between rounded-md border-2 bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${paymentMethod === 'card' ? 'border-primary' : 'border-muted'}`}
                                        >
                                            <CreditCard className="mb-3 h-6 w-6" />
                                            <span className="text-sm font-medium">Cartão</span>
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="mbway" id="mbway" className="sr-only" />
                                        <Label
                                            htmlFor="mbway"
                                            className={`flex flex-col items-center justify-between rounded-md border-2 bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${paymentMethod === 'mbway' ? 'border-primary' : 'border-muted'}`}
                                        >
                                            <Smartphone className="mb-3 h-6 w-6" />
                                            <span className="text-sm font-medium">MB Way</span>
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {paymentMethod === "card" ? (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                                        <div className="space-y-2">
                                            <Label htmlFor="cardNumber">Número do Cartão</Label>
                                            <Input id="cardNumber" placeholder="0000 0000 0000 0000" disabled={isProcessing} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="expiry">Validade</Label>
                                                <Input id="expiry" placeholder="MM/AA" disabled={isProcessing} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cvv">CVV</Label>
                                                <Input id="cvv" placeholder="123" disabled={isProcessing} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Telemóvel MB Way</Label>
                                            <Input id="phone" placeholder="912 345 678" type="tel" disabled={isProcessing} />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Irá receber uma notificação na aplicação MB Way para confirmar o pagamento.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full text-lg h-12"
                                    size="lg"
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            A processar...
                                        </>
                                    ) : (
                                        `Pagar ${displayPrice}`
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
