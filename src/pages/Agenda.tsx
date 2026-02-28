import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Home, CalendarCheck, CalendarDays, Lock } from "lucide-react";
import { VisitAgendaManager } from "@/components/profile/VisitAgendaManager";
import { MyVisitsAgenda } from "@/components/profile/MyVisitsAgenda";
import { MyEventsAgenda } from "@/components/profile/MyEventsAgenda";
import { useEffect } from "react";
import { useProperties } from "@/hooks/useProperties";
import { usePlanLimits } from "@/hooks/usePlanLimits";

export default function Agenda() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { profile, loading } = useProfile();
    const { properties } = useProperties();
    const { hasFeature, loading: planLoading } = usePlanLimits();
    const propertyId = searchParams.get('propertyId') || undefined;

    const hasVisitScheduling = hasFeature('visit_scheduling');

    // Determine default tab: if user has properties, show seller view; otherwise visitor view
    const hasSellableProperties = properties.length > 0;
    const defaultTab = hasSellableProperties && hasVisitScheduling ? "seller" : "visitor";

    useEffect(() => {
        if (!loading && !profile) {
            navigate("/auth");
        }
    }, [profile, loading, navigate]);

    if (loading || planLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-background">
            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate('/meu-perfil')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar ao Perfil
                        </Button>
                        <h1 className="text-2xl font-bold">Agenda de Visitas</h1>
                    </div>

                    {hasSellableProperties && !hasVisitScheduling && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-center space-y-3">
                            <Lock className="w-8 h-8 text-amber-600 mx-auto" />
                            <h3 className="text-lg font-semibold text-foreground">Agenda de Marcações indisponível no Plano Gratuito</h3>
                            <p className="text-sm text-muted-foreground">
                                A gestão de agenda de visitas está disponível nos planos Start e Pro. 
                                Subscreva um plano para permitir que os compradores agendem visitas aos seus imóveis.
                            </p>
                            <Button onClick={() => navigate('/planos')} className="mt-2">
                                Ver Planos
                            </Button>
                        </div>
                    )}

                    <Tabs defaultValue={defaultTab} className="space-y-6">
                        <TabsList>
                            {hasSellableProperties && (
                                <TabsTrigger value="seller" className="gap-2" disabled={!hasVisitScheduling}>
                                    <Home className="w-4 h-4" />
                                    Os Meus Imóveis
                                    {!hasVisitScheduling && <Lock className="w-3 h-3 ml-1" />}
                                </TabsTrigger>
                            )}
                            <TabsTrigger value="visitor" className="gap-2">
                                <CalendarCheck className="w-4 h-4" />
                                Minhas Visitas
                            </TabsTrigger>
                            <TabsTrigger value="events" className="gap-2">
                                <CalendarDays className="w-4 h-4" />
                                Eventos
                            </TabsTrigger>
                        </TabsList>

                        {hasSellableProperties && hasVisitScheduling && (
                            <TabsContent value="seller">
                                <VisitAgendaManager userId={profile?.id} initialPropertyId={propertyId} />
                            </TabsContent>
                        )}

                        <TabsContent value="visitor">
                            <MyVisitsAgenda userId={profile?.id} />
                        </TabsContent>

                        <TabsContent value="events">
                            <MyEventsAgenda userId={profile?.id} />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
