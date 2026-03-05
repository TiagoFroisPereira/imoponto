import { useState, useEffect } from "react";
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
import { Zap, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createCheckoutSession } from "@/lib/stripe";
import { useToast } from "@/hooks/use-toast";

interface QuickCheckoutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productKey: string;
    propertyId?: string;
    quantity?: number;
    metadata?: Record<string, any>;
    onSuccess?: () => void;
    onBeforeCheckout?: () => Promise<string | undefined>; // Returns propertyId if newly created
}

export function QuickCheckoutDialog({
    open,
    onOpenChange,
    productKey,
    propertyId: initialPropertyId,
    quantity = 1,
    metadata = {},
    onSuccess,
    onBeforeCheckout,
}: QuickCheckoutDialogProps) {
    const { toast } = useToast();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [propertyId, setPropertyId] = useState<string | undefined>(initialPropertyId);

    useEffect(() => {
        setPropertyId(initialPropertyId);
    }, [initialPropertyId]);

    useEffect(() => {
        if (open && productKey) {
            fetchProduct();
        }
    }, [open, productKey]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('plans_addons')
                .select('*')
                .eq('key', productKey)
                .single();

            if (error) throw error;
            setProduct(data);
        } catch (error) {
            console.error("Error fetching product:", error);
            toast({
                title: "Erro ao carregar produto",
                description: "Não foi possível carregar os detalhes do pagamento.",
                variant: "destructive",
            });
            onOpenChange(false);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!product) return;

        setIsProcessing(true);
        try {
            let finalPropertyId = propertyId;

            if (onBeforeCheckout) {
                const newId = await onBeforeCheckout();
                if (newId) {
                    finalPropertyId = newId;
                }
            }

            // Use standard checkout session creation
            await createCheckoutSession({
                mode: 'payment',
                productKey: product.key,
                propertyId: finalPropertyId,
                quantity: quantity,
                successUrl: `${window.location.origin}/pagamentos/sucesso?session_id={CHECKOUT_SESSION_ID}&from=${encodeURIComponent(window.location.pathname + window.location.search)}`,
                cancelUrl: `${window.location.origin}/pagamentos/cancelado?retry_url=${encodeURIComponent(window.location.pathname + window.location.search)}`,
                metadata: {
                    ...metadata,
                    propertyId: finalPropertyId,
                    source: 'quick_checkout',
                }
            });

            // Note: createCheckoutSession typically handles redirection
            // If we move to a popup-based flow in the future, we could handle it here
        } catch (error) {
            console.error("Payment error:", error);
            toast({
                title: "Erro ao iniciar pagamento",
                description: "Não foi possível contactar o serviço de pagamentos. Tente novamente.",
                variant: "destructive",
            });
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] overflow-hidden rounded-2xl border-none shadow-2xl p-0">
                {loading ? (
                    <div className="p-12 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : product ? (
                    <>
                        <div className="bg-primary/5 px-6 pt-8 pb-6">
                            <DialogHeader>
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                    <Zap className="w-6 h-6 text-primary fill-primary/20" />
                                </div>
                                <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground mt-2">
                                    Ative esta funcionalidade instantaneamente para o seu imóvel.
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="px-6 py-8 space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-xl border border-primary/10 bg-primary/[0.02]">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground mb-1">
                                        {product.description}
                                        {quantity > 1 && <span className="text-primary ml-2">(x{quantity})</span>}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Pagamento único • Ativação imediata</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-primary">€{(product.price * quantity).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    <span>Seguro e encriptado via Stripe</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    <span>Acesso vitalício para este imóvel</span>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="px-6 pb-8 flex-col sm:flex-col gap-3">
                            <Button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full h-12 text-base font-bold rounded-xl bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Zap className="w-4 h-4 mr-2 fill-current" />
                                )}
                                {isProcessing ? "A processar..." : `Pagar €${(product.price * quantity).toFixed(2)} agora`}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                disabled={isProcessing}
                                className="w-full text-xs text-muted-foreground hover:bg-transparent"
                            >
                                Cancelar e voltar
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <div className="p-12 text-center space-y-4">
                        <AlertCircle className="w-12 h-12 text-destructive mx-auto opacity-50" />
                        <p className="text-sm text-muted-foreground">Produto não encontrado.</p>
                        <Button onClick={() => onOpenChange(false)} variant="outline">Fechar</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
