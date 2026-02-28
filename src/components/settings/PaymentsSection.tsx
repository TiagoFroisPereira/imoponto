import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  CreditCard,
  Crown,
  Zap,
  Eye,
  Camera,
  Video,
  Star,
  FileText,
  Download,
  Loader2,
  Calendar,
  Euro,
  ShieldCheck,
  Settings2,
  ExternalLink
} from "lucide-react";
import { createPortalSession } from "@/lib/stripe";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface PaymentRecord {
  id: string;
  type: "addon" | "vault_access";
  label: string;
  description: string;
  amount: string;
  date: string;
}

const ADDON_PRICES: Record<string, string> = {
  vault: "35€",
  extra_photos: "4,90€",
  video: "9,90€",
  promotion: "14,90€",
};

const ADDON_LABELS: Record<string, string> = {
  vault: "Cofre Digital",
  extra_photos: "Pack Extra Fotos",
  video: "Video & 3D Tour",
  promotion: "Destaque Platinum",
};

const PLAN_LABELS: Record<string, string> = {
  free: "Plano Gratuito",
  start: "Plano Start",
  pro: "Plano Pro",
};

const PLAN_PRICES: Record<string, string> = {
  free: "0€",
  start: "9,90€/mês",
  pro: "19,90€/mês",
};

export function PaymentsSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [planData, setPlanData] = useState<{
    plan: string;
    subscription_current_period_end: string | null;
  } | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchAll = async () => {
      setLoading(true);

      // Fetch plan info
      const { data: profileData } = await supabase
        .from("profiles")
        .select("plan, subscription_current_period_end")
        .eq("id", user.id)
        .single();
      if (profileData) setPlanData(profileData);

      const records: PaymentRecord[] = [];

      try {
        // Fetch property addons
        const { data: addons } = await supabase
          .from("property_addons")
          .select("id, addon_type, created_at, property_id")
          .order("created_at", { ascending: false });

        if (addons && addons.length > 0) {
          const propertyIds = [...new Set(addons.map((a) => a.property_id))];
          const { data: properties } = await supabase
            .from("properties")
            .select("id, title")
            .in("id", propertyIds);
          const propMap = new Map(properties?.map((p) => [p.id, p.title]) || []);

          for (const addon of addons) {
            records.push({
              id: addon.id,
              type: "addon",
              label: ADDON_LABELS[addon.addon_type] || addon.addon_type,
              description: `Power-up — ${propMap.get(addon.property_id) || "Imóvel"}`,
              amount: ADDON_PRICES[addon.addon_type] || "—",
              date: addon.created_at,
            });
          }
        }

        // Fetch vault buyer access payments
        const { data: vaultAccess } = await supabase
          .from("vault_buyer_access")
          .select("id, property_id, payment_amount, created_at")
          .eq("buyer_id", user.id)
          .eq("status", "paid")
          .order("created_at", { ascending: false });

        if (vaultAccess && vaultAccess.length > 0) {
          const propertyIds = [...new Set(vaultAccess.map((v) => v.property_id))];
          const { data: properties } = await supabase
            .from("properties")
            .select("id, title")
            .in("id", propertyIds);
          const propMap = new Map(properties?.map((p) => [p.id, p.title]) || []);

          for (const access of vaultAccess) {
            records.push({
              id: access.id,
              type: "vault_access",
              label: "Acesso ao Cofre Digital",
              description: `Cofre — ${propMap.get(access.property_id) || "Imóvel"}`,
              amount: `${access.payment_amount}€`,
              date: access.created_at,
            });
          }
        }

        records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPayments(records);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  const handleManageBilling = async () => {
    try {
      setIsPortalLoading(true);
      await createPortalSession();
    } catch (error: any) {
      toast({
        title: "Erro ao abrir portal",
        description: error.message || "Não foi possível carregar o portal de faturação.",
        variant: "destructive"
      });
    } finally {
      setIsPortalLoading(false);
    }
  };

  const currentPlan = planData?.plan || "free";
  const isPaid = currentPlan !== "free";

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "addon":
        return <Zap className="w-4 h-4 text-amber-500" />;
      case "vault_access":
        return <Eye className="w-4 h-4 text-blue-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isPaid ? <Crown className="w-5 h-5 text-primary" /> : <Zap className="w-5 h-5 text-primary" />}
                Plano Atual
              </CardTitle>
              <CardDescription>O seu plano de subscrição ativo</CardDescription>
            </div>
            {isPaid && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleManageBilling}
                disabled={isPortalLoading}
              >
                {isPortalLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Settings2 className="w-4 h-4" />
                    Gerir Faturação
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                {isPaid ? <Crown className="w-6 h-6 text-primary" /> : <Zap className="w-6 h-6 text-primary" />}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{PLAN_LABELS[currentPlan] || "Plano Gratuito"}</h3>
                <p className="text-sm text-muted-foreground">{PLAN_PRICES[currentPlan] || "0€"}</p>
              </div>
            </div>
            <Badge variant={isPaid ? "default" : "secondary"}>
              {isPaid ? "Ativo" : "Gratuito"}
            </Badge>
          </div>

          {!isPaid && (
            <div className="mt-6 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-foreground">Desbloqueie o máximo potencial</p>
                <p className="text-xs text-muted-foreground">Upgrades a partir de 9.90€/mês</p>
              </div>
              <Button size="sm" className="gap-2" onClick={() => window.location.href = '/planos'}>
                Ver Planos
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {planData?.subscription_current_period_end && (
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Próxima renovação: {format(new Date(planData.subscription_current_period_end), "d 'de' MMMM yyyy", { locale: pt })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Histórico de Pagamentos
          </CardTitle>
          <CardDescription>Todas as transações efetuadas na sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : payments.length === 0 ? (
            <div className="bg-muted/50 border border-dashed border-border rounded-xl p-12 text-center">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Sem pagamentos</h3>
              <p className="text-muted-foreground mt-2">Nenhum pagamento registado nesta conta.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {payments.map((payment, index) => (
                <div key={payment.id}>
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        {getTypeIcon(payment.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm">{payment.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{payment.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(payment.date), "d MMM yyyy, HH:mm", { locale: pt })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{payment.amount}</p>
                        <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-600 border-green-200">
                          Pago
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Descarregar recibo">
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                  {index < payments.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
