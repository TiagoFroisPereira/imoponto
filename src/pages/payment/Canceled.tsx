import { Link, useSearchParams } from "react-router-dom";
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Canceled() {
    const [searchParams] = useSearchParams();
    const retryUrl = searchParams.get("retry_url") || "/planos";

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-muted/30">
            <Card className="max-w-md w-full border-2 border-destructive/20 shadow-xl overflow-hidden animate-in zoom-in duration-500">
                <div className="h-2 bg-destructive w-full" />
                <CardHeader className="text-center pb-2">
                    <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-12 h-12 text-destructive" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Pagamento Cancelado</CardTitle>
                    <CardDescription className="text-base mt-2">
                        Não foi possível concluir o seu pagamento. Nenhuma cobrança foi efetuada.
                    </CardDescription>
                </CardHeader>
                <CardContent className="py-8 space-y-6 text-center">
                    <p className="text-muted-foreground">
                        Pode ter ocorrido um erro no processamento ou decidiu cancelar a transação. Se tiver alguma dúvida, a nossa equipa está disponível para ajudar.
                    </p>

                    <div className="flex items-center justify-center gap-2 text-sm font-medium p-3 rounded-lg bg-muted text-muted-foreground">
                        <HelpCircle className="w-4 h-4" />
                        Precisa de suporte? <Link to="/contactos" className="text-primary hover:underline">Contacte-nos</Link>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pb-8">
                    <Button asChild className="w-full h-12 text-lg font-bold">
                        <Link to={retryUrl}>
                            Tentar Novamente
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link to="/meu-perfil">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar ao Perfil
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
