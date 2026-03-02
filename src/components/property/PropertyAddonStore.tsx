import { useNavigate } from "react-router-dom";
import { Check, Zap, Camera, ShieldCheck, Video, Star, CreditCard, Loader2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useQuery } from "@tanstack/react-query";

// Define icons mapping for dynamic addons
const ICON_MAP: Record<string, any> = {
    vault: ShieldCheck,
    extra_photos: Camera,
    video: Video,
    promotion: Star,
};

// Features mapping (could also be moved to DB later)
const FEATURE_MAP: Record<string, string[]> = {
    vault: ["Armazenamento ilimitado", "Partilha QR Code", "Validação de documentos"],
    extra_photos: ["+15 fotos HD", "Melhor galeria", "Destaque visual"],
    video: ["Vídeo HD (2 min)", "Suporte 3D Virtual Tour", "Maior retenção"],
    promotion: ["Top 3 resultados", "Selo Platinum", "Estatísticas avançadas"],
};

interface PropertyAddonStoreProps {
    propertyId: string;
    onPurchaseSuccess?: () => void;
}

export function PropertyAddonStore({ propertyId, onPurchaseSuccess }: PropertyAddonStoreProps) {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { addons: purchasedAddons, loading: limitsLoading } = usePlanLimits(propertyId);

    const { data: dbAddons, isLoading: addonsLoading } = useQuery({
        queryKey: ['plans_addons', 'addon'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('plans_addons')
                .select('*')
                .eq('type', 'addon')
                .eq('active', true);

            if (error) throw error;
            return data;
        }
    });

    const handlePurchaseClick = async (addon: any) => {
        try {
            // For all addons, we now use the generic checkout navigation
            // or we could call purchaseAddon directly if we didn't want the checkout page middle-man
            navigate(`/checkout?type=addon&id=${addon.key}&propertyId=${propertyId}`);
        } catch (error) {
            console.error("Purchase error:", error);
            toast({
                title: "Erro ao iniciar compra",
                description: "Não foi possível contactar o serviço de pagamentos.",
                variant: "destructive"
            });
        }
    };

    if (limitsLoading || addonsLoading) return <div className="animate-pulse h-64 bg-muted rounded-xl" />;

    return (
        <>
            <section className="py-12">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Power-ups do Imóvel</h2>
                        <p className="text-sm text-muted-foreground">Maximize o potencial da sua venda com ferramentas extra.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dbAddons?.map((addon) => {
                        const isPurchased = purchasedAddons.includes(addon.key);
                        const Icon = ICON_MAP[addon.key] || Zap;
                        const features = FEATURE_MAP[addon.key] || [];

                        return (
                            <Card key={addon.id} className={`relative overflow-hidden border-2 transition-all ${isPurchased ? 'border-primary/20 bg-primary/[0.01]' : 'hover:border-primary/40'}`}>
                                {isPurchased && (
                                    <div className="absolute top-3 right-3">
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                                            <Check className="w-3 h-3 mr-1" /> Ativo
                                        </Badge>
                                    </div>
                                )}
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isPurchased ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-lg">{addon.name}</CardTitle>
                                    <CardDescription className="line-clamp-2 h-10">{addon.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4">
                                        <span className="text-3xl font-bold text-foreground">€{addon.price}</span>
                                        <span className="text-xs text-muted-foreground ml-2">
                                            Vago até à Venda
                                        </span>
                                    </div>
                                    <ul className="space-y-2">
                                        {features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <div className="w-1 h-1 rounded-full bg-primary" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full"
                                        variant={isPurchased ? "secondary" : "default"}
                                        disabled={isPurchased}
                                        onClick={() => handlePurchaseClick(addon)}
                                    >
                                        {isPurchased ? "Já Ativado" : "Comprar Agora"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </section>
        </>
    );
}
