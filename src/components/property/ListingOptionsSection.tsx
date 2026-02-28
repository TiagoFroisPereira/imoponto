import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useProperties } from "@/hooks/useProperties";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/contexts/AuthModalContext";
import {
    Plus,
    FileText,
    ArrowRight,
    CheckCircle,
    Home,
    Lock,
    AlertCircle,
    Sparkles,
} from "lucide-react";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { SellerPlansModal } from "@/components/property/SellerPlansModal";

interface ListingOptionsSectionProps {
    isStandalone?: boolean;
    id?: string;
}

export default function ListingOptionsSection({ isStandalone = false, id }: ListingOptionsSectionProps) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const { openAuthModal } = useAuthModal();
    const { createProperty, properties } = useProperties();
    const { limits } = usePlanLimits();

    const [showPrivateForm, setShowPrivateForm] = useState(false);
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);

    const handleCreatePrivateProperty = async () => {
        if (!title.trim()) {
            toast({
                title: "Título obrigatório",
                description: "Por favor, insira um título para identificar o imóvel.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const propertyData = {
                title: title.trim(),
                price: price ? parseFloat(price) : 0,
                status: "private" as const,
                property_type: "apartment" as const,
                address: "A definir",
                location: "A definir",
                area: 0,
                bedrooms: 0,
                bathrooms: 0,
                description: "",
                image_url: null,
                documentation_level: "none" as const,
            };

            await createProperty(propertyData);
            toast({
                title: "Imóvel privado criado!",
                description: "Pode agora gerir a documentação e burocracia do seu imóvel.",
            });
            navigate("/meu-perfil");
        } catch (error) {
            console.error("Error creating private property:", error);
            toast({
                title: "Erro ao criar imóvel",
                description: "Ocorreu um erro. Por favor, tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const activePropertiesCount = properties?.length || 0;

    const handleListingAction = (action: () => void, targetRoute?: string) => {
        if (!user) {
            openAuthModal(targetRoute || "/publicar");
            return;
        }

        if (activePropertiesCount >= (limits?.properties || 0)) {
            setShowPlanModal(true);
        } else {
            action();
        }
    };

    return (
        <section id={id} className={`${isStandalone ? "pt-8 pb-16" : "py-16 md:py-24"}`}>
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6 animate-fade-in text-center mx-auto">
                            <Sparkles className="w-3 h-3" />
                            <span>O seu imóvel, as suas regras</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
                            Como deseja gerir o seu imóvel?
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Escolha o caminho que melhor se adapta às suas necessidades.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* Option 1: Create New Public Listing */}
                        <Card
                            className="relative border-2 border-border hover:border-primary hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer group overflow-hidden"
                            onClick={() => handleListingAction(() => navigate("/criar-anuncio"), "/criar-anuncio")}
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    Recomendado
                                </span>
                            </div>
                            <CardHeader className="pb-6 pt-8">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                                    <Plus className="w-8 h-8 text-primary" />
                                </div>
                                <CardTitle className="text-2xl font-bold tracking-tight">Venda Direta</CardTitle>
                                <CardDescription className="text-base mt-2">
                                    Anuncie publicamente no nosso portal para obter o máximo de exposição.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4 text-sm text-muted-foreground mb-8">
                                    <li className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-3.5 h-3.5 text-accent" />
                                        </div>
                                        <span>Visibilidade total para milhares de compradores</span>
                                    </li>
                                </ul>
                                <div className="flex items-center text-primary font-bold group-hover:gap-4 transition-all gap-2 py-2">
                                    Começar Anúncio <ArrowRight className="w-5 h-5" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Option 2: Private Property */}
                        <Card
                            className={`border-2 transition-all cursor-pointer group ${showPrivateForm ? "border-accent" : "border-border hover:border-accent/50"}`}
                            onClick={() => handleListingAction(() => !showPrivateForm && setShowPrivateForm(true))}
                        >
                            <CardHeader className="pb-6 pt-8">
                                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-500">
                                    <FileText className="w-8 h-8 text-accent" />
                                </div>
                                <CardTitle className="text-2xl font-bold tracking-tight">Gestão Privada</CardTitle>
                                <CardDescription className="text-base mt-2">
                                    Ideal se já tem anúncios noutros portais ou prefere gerir de forma privada.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!showPrivateForm ? (
                                    <>
                                        <ul className="space-y-4 text-sm text-muted-foreground mb-8">
                                            <li className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                                                </div>
                                                <span>Imóvel invisível para o mercado público</span>
                                            </li>
                                        </ul>
                                        <div className="flex items-center text-accent font-bold group-hover:gap-4 transition-all gap-2 py-2">
                                            Começar Gestão <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                                            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-muted-foreground">
                                                Este imóvel ficará <strong>privado</strong>.
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Título do Imóvel</label>
                                            <Input placeholder="Ex: T3 em Lisboa" value={title} onChange={(e) => setTitle(e.target.value)} />
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <Button variant="outline" onClick={() => setShowPrivateForm(false)} className="flex-1">Cancelar</Button>
                                            <Button variant="accent" onClick={handleCreatePrivateProperty} disabled={isLoading} className="flex-1">
                                                {isLoading ? "A criar..." : "Criar Imóvel Privado"}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-primary/5 border-primary/10 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Home className="w-24 h-24" />
                        </div>
                        <CardContent className="py-8 relative z-10">
                            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-foreground mb-2">Porquê publicar na ImoPonto?</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Venda o seu imóvel diretamente a compradores particulares, sem intermediários e mantendo 100% da sua poupança.
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <div className="px-4 py-2 rounded-full bg-accent/10 text-accent font-bold text-sm">
                                        0% Comissões
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <SellerPlansModal
                open={showPlanModal}
                onOpenChange={setShowPlanModal}
                title="Limite de Imóveis Atingido"
                description={`O seu plano atual permite até ${limits?.properties || 0} imóveis ativos. Faça upgrade para continuar a crescer o seu portfólio.`}
            />
        </section>
    );
}
