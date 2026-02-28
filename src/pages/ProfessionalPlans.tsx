import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check, ArrowRight, Zap, Briefcase, Crown, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const professionalPlans = [
    {
        id: "free",
        name: "Plano Gratuito",
        price: "0€",
        description: "Ideal para começar a receber pedidos de serviço.",
        features: [
            "Perfil público no marketplace",
            "Receber pedidos de contacto",
            "Avaliações de clientes",
            "Acesso básico à plataforma",
        ],
        buttonText: "Começar Grátis",
        buttonVariant: "outline" as const,
        recommended: false,
        icon: Briefcase,
    },
];

export default function ProfessionalPlans() {
    const navigate = useNavigate();

    return (
        <div className="bg-background selection:bg-primary/10">

            <main className="pt-20 pb-24">
                <div className="container mx-auto px-4">
                    {/* Hero */}
                    <div className="text-center mb-16 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
                            <Zap className="w-3 h-3" />
                            <span>Marketplace de Profissionais</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6 tracking-tight">
                            Planos para <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Profissionais</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Faça parte do marketplace ImoPonto e conecte-se com proprietários
                            que precisam dos seus serviços.
                        </p>
                    </div>

                    {/* Plans Grid */}
                    <div className="max-w-md mx-auto">
                        {professionalPlans.map((plan, index) => {
                            const Icon = plan.icon;
                            return (
                                <Card
                                    key={index}
                                    className="relative flex flex-col border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border-primary shadow-xl shadow-primary/5 bg-gradient-to-b from-primary/[0.02] to-transparent"
                                >
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                            Disponível
                                        </span>
                                    </div>

                                    <CardHeader className="pt-10 pb-6 text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                            <Icon className="w-8 h-8 text-primary" />
                                        </div>
                                        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                        <CardDescription className="text-sm mt-2">{plan.description}</CardDescription>
                                        <div className="mt-6 flex flex-col items-center">
                                            <div className="flex items-baseline">
                                                <span className="text-5xl font-black tracking-tighter text-foreground">{plan.price}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground mt-2">
                                                Sem custos de adesão
                                            </span>
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
                                            onClick={() => navigate('/tornar-profissional')}
                                        >
                                            {plan.buttonText}
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Info Section */}
                    <div className="mt-16 max-w-2xl mx-auto text-center">
                        <div className="p-6 rounded-2xl bg-muted/30 border border-border">
                            <h3 className="text-lg font-semibold mb-2">Categorias Profissionais Disponíveis</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Atualmente aceitamos profissionais nas seguintes áreas:
                            </p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {["Advogados Imobiliários", "Notários", "Certificação Energética", "Intermediação de Crédito"].map((cat) => (
                                    <span key={cat} className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
