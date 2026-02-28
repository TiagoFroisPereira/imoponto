import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Eye, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RequestBuyerAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyTitle: string;
  ownerId: string;
}

export function RequestBuyerAccessDialog({
  open,
  onOpenChange,
  propertyId,
  propertyTitle,
  ownerId,
}: RequestBuyerAccessDialogProps) {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!termsAccepted) {
      toast({ title: "Atenção", description: "Tem de aceitar os termos de acesso.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Erro", description: "Precisa estar autenticado.", variant: "destructive" });
        return;
      }

      // Check for 48h anti-spam block from rejected requests
      const { data: rejected } = await supabase
        .from("vault_buyer_access")
        .select("id, updated_at")
        .eq("property_id", propertyId)
        .eq("buyer_id", user.id)
        .eq("status", "rejected");

      if (rejected && rejected.length > 0) {
        const lastRejected = rejected[rejected.length - 1];
        const rejectedAt = new Date(lastRejected.updated_at);
        const hoursSince = (Date.now() - rejectedAt.getTime()) / (1000 * 60 * 60);
        if (hoursSince < 48) {
          const hoursLeft = Math.ceil(48 - hoursSince);
          toast({
            title: "Pedido bloqueado",
            description: `O seu pedido anterior foi recusado. Pode tentar novamente em ${hoursLeft}h.`,
            variant: "destructive",
          });
          onOpenChange(false);
          return;
        }
      }

      // Check if already has a pending/approved/paid request
      const { data: existing } = await supabase
        .from("vault_buyer_access")
        .select("id, status")
        .eq("property_id", propertyId)
        .eq("buyer_id", user.id)
        .in("status", ["pending", "approved", "paid"]);

      if (existing && existing.length > 0) {
        const status = existing[0].status;
        const msgs: Record<string, string> = {
          pending: "Já tem um pedido pendente para este cofre.",
          approved: "O seu pedido já foi aprovado. Aguarda pagamento.",
          paid: "Já tem acesso a este cofre.",
        };
        toast({ title: "Pedido existente", description: msgs[status] || "Já existe um pedido." });
        onOpenChange(false);
        return;
      }

      // Get IP address for audit log
      let ipAddress: string | null = null;
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        ipAddress = ipData.ip;
      } catch {
        console.warn("Could not fetch IP address");
      }

      const { error } = await supabase.from("vault_buyer_access").insert({
        property_id: propertyId,
        buyer_id: user.id,
        owner_id: ownerId,
        message: message.trim() || null,
        status: "pending",
        payment_status: "unpaid",
        payment_amount: 10.0,
        terms_accepted: true,
        ip_address: ipAddress,
      });

      if (error) throw error;

      // Fetch buyer name for notification
      const { data: buyerProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();
      const buyerName = buyerProfile?.full_name || buyerProfile?.email?.split("@")[0] || "Um potencial comprador";

      // Notify the owner
      await supabase.from("notifications").insert({
        user_id: ownerId,
        property_id: propertyId,
        type: "buyer_vault_request",
        title: "Pedido de acesso ao cofre!",
        message: `${buyerName} solicitou acesso ao cofre digital do imóvel "${propertyTitle}".`,
        metadata: { buyer_id: user.id, buyer_name: buyerName, request_type: "buyer_vault_access" },
      });

      toast({
        title: "Pedido enviado!",
        description: "O proprietário será notificado. Após aprovação, será solicitado o pagamento de €10.",
      });

      setMessage("");
      setTermsAccepted(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error requesting buyer access:", error);
      toast({ title: "Erro", description: "Não foi possível enviar o pedido.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Solicitar Acesso ao Cofre
          </DialogTitle>
          <DialogDescription>
            O acesso depende da autorização do proprietário. Em caso de aprovação, será cobrada uma taxa única de €10.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Shield className="w-4 h-4 text-primary" />
              Como funciona
            </div>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>O proprietário recebe o seu pedido</li>
              <li>Após aprovação, será solicitado o pagamento de <strong className="text-foreground">€10</strong></li>
              <li>Após pagamento, terá acesso aos documentos do cofre</li>
            </ol>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Mensagem (opcional)
            </label>
            <Textarea
              placeholder="Ex: Estou interessado neste imóvel e gostaria de consultar a documentação..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border p-3 bg-muted/20">
            <Checkbox
              id="terms-acceptance"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              className="mt-0.5"
            />
            <label htmlFor="terms-acceptance" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
              Declaro que aceito os termos de acesso ao Cofre Digital e compreendo que o acesso está sujeito à aprovação do proprietário e ao pagamento da taxa de €10.
            </label>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !termsAccepted}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                A enviar pedido...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Confirmar Pedido
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
