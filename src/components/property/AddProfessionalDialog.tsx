import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfessionalsWithReviews, categoryLabels, ServiceCategory } from "@/hooks/useProfessionals";
import { StarRating } from "@/components/services/StarRating";
import { User, MapPin, Shield, Euro, Filter, Scale, Landmark, Ruler, Megaphone, Eye, Loader2 } from "lucide-react";

interface AddProfessionalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyTitle: string;
  vaultDocumentIds: string[];
  requestedDocumentName?: string;
  ownerId?: string;
}

const categoryFilters: { id: ServiceCategory; label: string; icon: typeof Scale }[] = [
  { id: "juridico", label: "Jurídico", icon: Scale },
  { id: "financeiro", label: "Financeiro", icon: Landmark },
  { id: "tecnico", label: "Técnico", icon: Ruler },
  { id: "marketing", label: "Marketing", icon: Megaphone },
];

export function AddProfessionalDialog({
  open,
  onOpenChange,
  propertyId,
  propertyTitle,
  vaultDocumentIds,
  requestedDocumentName,
  ownerId,
}: AddProfessionalDialogProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const { data: professionals, isLoading } = useProfessionalsWithReviews(selectedCategory || undefined);
  const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [requestingSelfAccess, setRequestingSelfAccess] = useState(false);
  const [contactedProfessionalIds, setContactedProfessionalIds] = useState<Set<string>>(new Set());

  // Fetch previously contacted professionals
  useEffect(() => {
    const fetchContacted = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("contact_requests")
        .select("professional_id")
        .eq("user_id", user.id);

      if (data) {
        setContactedProfessionalIds(new Set(data.map(r => r.professional_id)));
      }
    };

    if (open) fetchContacted();
  }, [open]);

  // Sort professionals: contacted first
  const sortedProfessionals = professionals
    ? [...professionals].sort((a, b) => {
        const aContacted = contactedProfessionalIds.has(a.id) ? 0 : 1;
        const bContacted = contactedProfessionalIds.has(b.id) ? 0 : 1;
        return aContacted - bContacted;
      })
    : [];
  const handleToggleProfessional = (professionalId: string) => {
    setSelectedProfessionals((prev) =>
      prev.includes(professionalId)
        ? prev.filter((id) => id !== professionalId)
        : [...prev, professionalId]
    );
  };

  const handleCategoryFilter = (category: ServiceCategory) => {
    setSelectedCategory(selectedCategory === category ? null : category);
    setSelectedProfessionals([]);
  };

  const handleRequestSelfAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Autenticação necessária", description: "Por favor, inicie sessão.", variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (!ownerId) {
      toast({ title: "Erro", description: "Não foi possível identificar o proprietário.", variant: "destructive" });
      return;
    }

    setRequestingSelfAccess(true);
    try {
      // Check existing request
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

      const { error } = await supabase.from("vault_buyer_access").insert({
        property_id: propertyId,
        buyer_id: user.id,
        owner_id: ownerId,
        message: `Pedido de acesso pessoal ao cofre do imóvel "${propertyTitle}"`,
        status: "pending",
        payment_status: "unpaid",
        payment_amount: 10.0,
      });

      if (error) throw error;

      // Fetch buyer name for notification
      const { data: buyerProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();
      const buyerName = buyerProfile?.full_name || buyerProfile?.email?.split("@")[0] || "Um potencial comprador";

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
      onOpenChange(false);
    } catch (error) {
      console.error("Error requesting self access:", error);
      toast({ title: "Erro", description: "Não foi possível enviar o pedido.", variant: "destructive" });
    } finally {
      setRequestingSelfAccess(false);
    }
  };

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Por favor, inicie sessão para solicitar acesso.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (selectedProfessionals.length === 0) {
      toast({
        title: "Selecione profissionais",
        description: "Por favor, selecione pelo menos um profissional.",
        variant: "destructive",
      });
      return;
    }

    if (vaultDocumentIds.length === 0) {
      toast({
        title: "Sem documentos",
        description: "Não há documentos disponíveis para solicitar acesso.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create vault access requests for each selected professional
      const requests = selectedProfessionals.flatMap((professionalId) =>
        vaultDocumentIds.map((documentId) => ({
          professional_id: professionalId,
          requester_id: user.id,
          vault_document_id: documentId,
          property_id: propertyId,
          payment_amount: 10.0,
          message: `Pedido de acesso: ${requestedDocumentName || propertyTitle}`,
          status: "pending",
          payment_status: "unpaid",
        }))
      );

      const { error } = await supabase
        .from("vault_access_requests")
        .insert(requests);

      if (error) throw error;

      // Get property owner ID to send notification
      const { data: property } = await supabase
        .from("properties")
        .select("user_id")
        .eq("id", propertyId)
        .maybeSingle();

      // Get selected professionals names for the notification
      const selectedProfessionalNames = sortedProfessionals
        ?.filter((p) => selectedProfessionals.includes(p.id))
        .map((p) => p.name)
        .join(", ");

      // Create notification for property owner about professionals added to vault
      if (property?.user_id) {
        await supabase.from("notifications").insert({
          user_id: property.user_id,
          property_id: propertyId,
          type: "professional_added",
          title: "Profissional adicionado ao cofre!",
          message: `${selectedProfessionals.length} profissional(is) foi(ram) adicionado(s) ao cofre do imóvel "${propertyTitle}": ${selectedProfessionalNames}`,
          metadata: {
            professionals_count: selectedProfessionals.length,
            professional_names: selectedProfessionalNames,
            requester_id: user.id,
          },
        });
      }

      // Notify each selected professional about the new vault access request
      for (const professionalId of selectedProfessionals) {
        const prof = sortedProfessionals?.find(p => p.id === professionalId);
        if (prof?.user_id) {
          await supabase.from("notifications").insert({
            user_id: prof.user_id,
            property_id: propertyId,
            type: "new_vault_access_request",
            title: "Novo pedido de acesso ao cofre!",
            message: `Recebeu um pedido de acesso ao cofre digital do imóvel "${propertyTitle}".`,
            metadata: { requester_id: user.id, property_id: propertyId },
          });
        }
      }

      const totalCost = selectedProfessionals.length * 10;

      toast({
        title: "Pedido enviado",
        description: `Pedido de acesso enviado para ${selectedProfessionals.length} profissional(is). Custo estimado: €${totalCost}`,
      });

      setSelectedProfessionals([]);
      setSelectedCategory(null);
      setShowConfirmation(false);
      setConfirmChecked(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding professionals:", error);
      toast({
        title: "Erro ao enviar pedido",
        description: "Ocorreu um erro ao enviar o pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCost = selectedProfessionals.length * 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Solicitar Acesso a Profissional</DialogTitle>
          <DialogDescription>
            {requestedDocumentName 
              ? `Selecione o profissional para aceder a "${requestedDocumentName}" do imóvel "${propertyTitle}".`
              : `Selecione os profissionais que terão acesso aos documentos do imóvel "${propertyTitle}".`
            }
            Cada acesso tem um custo de €10.
          </DialogDescription>
        </DialogHeader>

        {/* Self-access option for buyer */}
        {ownerId && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground text-sm">Aceder ao cofre pessoalmente</h4>
                <p className="text-xs text-muted-foreground">
                  Solicite acesso direto ao cofre. Após aprovação do proprietário, será pedido o pagamento de €10.
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleRequestSelfAccess}
                disabled={requestingSelfAccess}
                className="flex-shrink-0"
              >
                {requestingSelfAccess ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    Solicitar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtrar por categoria:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryFilters.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <Button
                  key={cat.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryFilter(cat.id)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </Button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : sortedProfessionals.length > 0 ? (
          <div className="space-y-4">
            <div className="grid gap-3">
              {sortedProfessionals.map((professional) => (
                <div
                  key={professional.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedProfessionals.includes(professional.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleToggleProfessional(professional.id)}
                >
                  <Checkbox
                    checked={selectedProfessionals.includes(professional.id)}
                    onCheckedChange={() => handleToggleProfessional(professional.id)}
                    className="mt-1"
                  />

                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    {professional.avatar_url ? (
                      <img
                        src={professional.avatar_url}
                        alt={professional.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-foreground">{professional.name}</h4>
                      {contactedProfessionalIds.has(professional.id) && (
                        <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                          Contactado
                        </Badge>
                      )}
                      {professional.is_verified && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">{professional.service_type}</p>

                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <Badge variant="outline">{categoryLabels[professional.category]}</Badge>
                      
                      {professional.location && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {professional.location}
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        <StarRating rating={professional.averageRating} size="sm" />
                        <span className="text-xs text-muted-foreground">
                          ({professional.totalReviews})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-lg font-bold text-primary flex items-center">
                      <Euro className="w-4 h-4" />
                      10
                    </span>
                    <span className="text-xs text-muted-foreground">por acesso</span>
                  </div>
                </div>
              ))}
            </div>

            {selectedProfessionals.length > 0 && !showConfirmation && (
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl sticky bottom-0">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {selectedProfessionals.length} profissional(is) selecionado(s)
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    Total: €{totalCost}
                  </p>
                </div>
                <Button
                  onClick={() => { setShowConfirmation(true); setConfirmChecked(false); }}
                  className="min-w-[140px]"
                >
                  Continuar
                </Button>
              </div>
            )}

            {selectedProfessionals.length > 0 && showConfirmation && (
              <div className="space-y-4 p-4 bg-muted/50 border border-border rounded-xl sticky bottom-0">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Confirmação Obrigatória
                </h4>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="confirm-fees"
                    checked={confirmChecked}
                    onCheckedChange={(checked) => setConfirmChecked(checked as boolean)}
                    className="mt-0.5"
                  />
                  <label htmlFor="confirm-fees" className="text-sm text-foreground leading-relaxed cursor-pointer">
                    Confirmo que o profissional foi previamente contactado e/ou estou ciente de que os honorários 
                    são definidos diretamente com o profissional. A <strong>Imoponto não define, não cobra e não intervém 
                    nos honorários</strong>, atuando exclusivamente como plataforma tecnológica.
                  </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConfirmation(false)}
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !confirmChecked}
                    className="min-w-[140px]"
                  >
                    {isSubmitting ? "A processar..." : `Solicitar Acesso (€${totalCost})`}
                  </Button>
                </div>
              </div>
            )}

            {selectedProfessionals.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Selecione os profissionais que pretende contactar
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>
              {selectedCategory 
                ? `Não há profissionais disponíveis na categoria "${categoryLabels[selectedCategory]}".`
                : "Não há profissionais disponíveis de momento."
              }
            </p>
            {selectedCategory && (
              <Button 
                variant="link" 
                onClick={() => setSelectedCategory(null)}
                className="mt-2"
              >
                Ver todos os profissionais
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
