import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Calendar,
  MessageSquare,
  User,
  Phone,
  Mail,
  CheckCircle,
  Briefcase,
  ChevronRight,
  ArrowRight,
  Settings,
  Building2,
  Zap,
  CreditCard,
  ShieldCheck,
  Scale
} from "lucide-react";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useProperties } from "@/hooks/useProperties";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useProfessionalStatus } from "@/hooks/useProfessionalStatus";

export default function MyProfile() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const { userPlan, hasFeature } = usePlanLimits();
  const { properties, loading: propertiesLoading } = useProperties();
  const { data: profData, isLoading: profLoading } = useProfessionalStatus();

  const hasActiveListings = properties.some(p => p.status === 'active');
  const isProfessional = !!profData?.isProfessional;
  const [legalAcceptedAt, setLegalAcceptedAt] = useState<string | null>(null);

  const loading = profileLoading || propertiesLoading || profLoading;

  const planLabels: Record<string, string> = {
    'free': 'Plano Free',
    'start': 'Plano Start',
    'pro': 'Plano Pro'
  };

  useEffect(() => {
    if (!profile) return;

    const fetchLegalAcceptance = async () => {
      const { data } = await supabase
        .from("user_legal_acceptances" as any)
        .select("accepted_at")
        .eq("user_id", profile.id)
        .maybeSingle();

      if (data) {
        setLegalAcceptedAt((data as any).accepted_at);
      }
    };

    fetchLegalAcceptance();
  }, [profile]);

  useEffect(() => {
    if (!profileLoading && !profile) {
      navigate("/auth");
    }
  }, [profile, profileLoading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background">

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8 animate-in fade-in duration-500">

          {/* Profile Card */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">

                {/* Identity */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center border border-primary/10">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-foreground">
                        {profile?.full_name || "Nome não definido"}
                      </h2>
                      {hasFeature('verified_badge') && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <ShieldCheck className="w-6 h-6 text-blue-500 fill-blue-500/10 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Perfil Verificado - Plano Premium Pro</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{profile?.email || 'Email não disponível'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">
                          {profile?.phone || "Telefone não definido"}
                        </span>
                        {profile?.phone_verified && <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verificado
                        </Badge>}
                      </div>
                    </div>

                    {/* Plan Info Subtile Integration */}
                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-primary/10">
                          <Zap className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{planLabels[userPlan] || 'Plano Essencial'}</span>
                      </div>
                      <button
                        onClick={() => navigate('/planos')}
                        className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                      >
                        <CreditCard className="w-3 h-3" />
                        Gerir Plano
                      </button>
                    </div>

                    {/* Legal Acceptance Info */}
                    {legalAcceptedAt && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Scale className="w-3 h-3" />
                        <span>
                          Nota Legal aceite em {format(new Date(legalAcceptedAt), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: pt })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => navigate('/definicoes')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Definições
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Grid (The "Hub") */}
          <div>
            <h3 className="text-lg font-semibold mb-4 px-1">Atalhos Rápidos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <button
                onClick={() => navigate('/meus-imoveis')}
                className="flex flex-col items-start p-6 bg-card hover:bg-accent/5 transition-colors border border-border/50 rounded-xl text-left group"
              >
                <div className="p-3 rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">Meus Imóveis</span>
                <p className="text-sm text-muted-foreground leading-snug">
                  Gerir os seus anúncios e estatísticas.
                </p>
                <div className="mt-auto pt-4 w-full flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
              </button>

              <button
                onClick={() => navigate('/documentos')}
                className="flex flex-col items-start p-6 bg-card hover:bg-accent/5 transition-colors border border-border/50 rounded-xl text-left group"
              >
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">Documentação</span>
                <p className="text-sm text-muted-foreground leading-snug">
                  Gerir certificações, cadernetas e contratos.
                </p>
                <div className="mt-auto pt-4 w-full flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
              </button>

              <button
                onClick={() => navigate('/agenda')}
                className="flex flex-col items-start p-6 bg-card hover:bg-accent/5 transition-colors border border-border/50 rounded-xl text-left group"
              >
                <div className="p-3 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">Agenda</span>
                <p className="text-sm text-muted-foreground leading-snug">
                  Próximas visitas e disponibilidade.
                </p>
                <div className="mt-auto pt-4 w-full flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
              </button>

              <button
                onClick={() => navigate('/mensagens')}
                className="flex flex-col items-start p-6 bg-card hover:bg-accent/5 transition-colors border border-border/50 rounded-xl text-left group relative"
              >
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform relative">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">Mensagens</span>
                <p className="text-sm text-muted-foreground leading-snug">
                  Conversas com compradores e interessados.
                </p>
                <div className="mt-auto pt-4 w-full flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
              </button>

              {isProfessional && (
                <button
                  onClick={() => navigate('/painel-profissional')}
                  className="flex flex-col items-start p-6 bg-card hover:bg-accent/5 transition-colors border border-border/50 rounded-xl text-left group"
                >
                  <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">Profissional</span>
                  <p className="text-sm text-muted-foreground leading-snug">
                    Ferramentas e métricas profissionais.
                  </p>
                  <div className="mt-auto pt-4 w-full flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                </button>
              )}

            </div>
          </div>

          {/* CTA Banner */}
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-bold">Quer vender {hasActiveListings ? 'outro' : 'o seu'} imóvel?</h3>
              <p className="text-primary-foreground/80 max-w-lg">
                Publique gratuitamente e comece a receber propostas hoje mesmo. Sem comissões.
              </p>
            </div>
            <Button size="lg" variant="secondary" onClick={() => navigate('/publicar')} className="whitespace-nowrap shadow-md">
              Vender agora
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}