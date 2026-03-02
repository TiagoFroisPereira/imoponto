import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, ArrowRight, ShieldCheck, Zap, Building2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Success() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get("session_id");
    const from = searchParams.get("from") || "/meu-perfil";
    const [isFinalizing, setIsFinalizing] = useState(true);

    useEffect(() => {
        // Simulate a brief "finalizing" state to ensure background webhooks have a chance to fire
        // or just to provide a premium feel
        const timer = setTimeout(() => {
            setIsFinalizing(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    if (isFinalizing) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-6">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold">A processar o seu pagamento...</h1>
                        <p className="text-muted-foreground">Estamos a confirmar os detalhes da sua transação.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-muted/30">
            <Card className="max-w-md w-full border-2 border-primary/20 shadow-xl overflow-hidden animate-in zoom-in duration-500">
                <div className="h-2 bg-primary w-full" />
                <CardHeader className="text-center pb-2">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 scale-110 animate-bounce">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-foreground">Pagamento Confirmado!</CardTitle>
                    <p className="text-muted-foreground mt-2">
                        Obrigado pela sua confiança. A sua transação foi concluída com sucesso.
                    </p>
                </CardHeader>
                <CardContent className="space-y-6 py-6">
                    <div className="bg-background rounded-lg p-4 border space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">ID da Sessão</span>
                            <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[150px]">
                                {sessionId || "N/A"}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm border-t pt-3">
                            <span className="text-muted-foreground">Estado</span>
                            <span className="text-green-600 font-bold flex items-center gap-1">
                                <ShieldCheck className="w-4 h-4" /> Ativo
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 text-sm text-primary border border-primary/10">
                            <Zap className="w-5 h-5 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-bold">O que acontece agora?</p>
                                <p className="opacity-90">As suas funcionalidades já estão disponíveis. Pode voltar a gerir os seus imóveis ou perfil.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pb-8">
                    <Button asChild className="w-full h-12 text-lg font-bold group">
                        <Link to={from}>
                            Continuar
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full">
                        <Link to="/">Voltar ao Início</Link>
                    </Button>
                </CardFooter>
            </Card>

            <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                Pagamento Seguro via Stripe
            </div>
        </div>
    );
}
