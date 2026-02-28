import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ServiceRequestStatus = "pending" | "accepted" | "rejected" | "expired";

export interface ServiceRequest {
  id: string;
  type: "contact" | "vault_access";
  requester_id: string;
  requester_name?: string;
  requester_email?: string;
  professional_id: string;
  property_id?: string | null;
  property_title?: string;
  service_type?: string;
  message: string | null;
  status: ServiceRequestStatus;
  rejection_reason?: string | null;
  expires_at: string;
  created_at: string;
  vault_document_id?: string;
  vault_document_name?: string;
}

interface UseServiceRequestsOptions {
  professionalId: string;
  onCountChange?: () => void;
}

export function useServiceRequests({ professionalId, onCountChange }: UseServiceRequestsOptions) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState<string | null>(null);

  const { data: requests = [], isLoading: loading, refetch } = useQuery({
    queryKey: ["service-requests", professionalId],
    queryFn: async () => {
      if (!professionalId) return [];

      const { data: contactData } = await (supabase.from("contact_requests") as any).select("*").eq("professional_id", professionalId).order("created_at", { ascending: false });
      const { data: vaultData } = await (supabase.from("vault_access_requests") as any).select("*").eq("professional_id", professionalId).order("created_at", { ascending: false });

      const contactRequesterIds = (contactData || []).map((r: any) => r.user_id);
      const vaultRequesterIds = (vaultData || []).map((r: any) => r.requester_id);
      const allRequesterIds = [...new Set([...contactRequesterIds, ...vaultRequesterIds])];

      let profilesMap: Record<string, { full_name: string | null; email: string | null }> = {};
      if (allRequesterIds.length > 0) {
        const { data: profiles } = await (supabase.from("profiles") as any).select("id, full_name, email").in("id", allRequesterIds);
        if (profiles) {
          profilesMap = profiles.reduce((acc: any, p: any) => { acc[p.id] = { full_name: p.full_name, email: p.email }; return acc; }, {});
        }
      }

      const propertyIds = [...(contactData || []).map((r: any) => r.property_id), ...(vaultData || []).map((r: any) => r.property_id)].filter(Boolean) as string[];
      let propertiesMap: Record<string, string> = {};
      if (propertyIds.length > 0) {
        const { data: properties } = await (supabase.from("properties") as any).select("id, title").in("id", propertyIds);
        if (properties) {
          propertiesMap = properties.reduce((acc: any, p: any) => { acc[p.id] = p.title; return acc; }, {});
        }
      }

      const mapStatus = (status: string): ServiceRequestStatus => {
        if (status === "granted" || status === "responded") return "accepted";
        if (status === "rejected" || status === "closed" || status === "denied") return "rejected";
        return status as ServiceRequestStatus;
      };

      const contactRequests: ServiceRequest[] = (contactData || []).map((r: any) => ({
        id: r.id, type: "contact", requester_id: r.user_id, requester_name: profilesMap[r.user_id]?.full_name || "Utilizador", requester_email: profilesMap[r.user_id]?.email || undefined,
        professional_id: r.professional_id, property_id: r.property_id, property_title: r.property_id ? propertiesMap[r.property_id] : undefined, service_type: r.service_type || "Pedido de contacto",
        message: r.message, status: mapStatus(r.status), rejection_reason: r.rejection_reason, expires_at: r.expires_at || new Date(new Date(r.created_at).getTime() + 72 * 60 * 60 * 1000).toISOString(), created_at: r.created_at,
      }));

      const vaultRequests: ServiceRequest[] = (vaultData || []).map((r: any) => ({
        id: r.id, type: "vault_access", requester_id: r.requester_id, requester_name: profilesMap[r.requester_id]?.full_name || "Utilizador", requester_email: profilesMap[r.requester_id]?.email || undefined,
        professional_id: r.professional_id, property_id: r.property_id, property_title: r.property_id ? propertiesMap[r.property_id] : undefined, service_type: "Acesso ao Cofre Digital",
        message: r.message, status: mapStatus(r.status), rejection_reason: r.rejection_reason, vault_document_id: r.vault_document_id, expires_at: r.expires_at || new Date(new Date(r.created_at).getTime() + 72 * 60 * 60 * 1000).toISOString(), created_at: r.created_at,
      }));

      return [...contactRequests, ...vaultRequests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    enabled: !!professionalId,
  });

  const invalidateRequests = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["service-requests", professionalId] });
    onCountChange?.();
  }, [queryClient, professionalId, onCountChange]);

  useEffect(() => {
    if (!professionalId) return;
    const channel = supabase
      .channel('service-requests-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_requests', filter: `professional_id=eq.${professionalId}` }, () => invalidateRequests())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vault_access_requests', filter: `professional_id=eq.${professionalId}` }, () => invalidateRequests())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [professionalId, invalidateRequests]);

  const acceptMutation = useMutation({
    mutationFn: async (request: ServiceRequest) => {
      setUpdating(request.id);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (request.type === "contact") {
        await (supabase.from("contact_requests") as any).update({ status: "responded" }).eq("id", request.id);
      } else {
        await (supabase.from("vault_access_requests") as any).update({ status: "granted" }).eq("id", request.id);
      }

      await (supabase.from("professional_relationships") as any).insert({
        professional_id: request.professional_id, user_id: request.requester_id,
        relationship_type: request.type === "contact" ? "contact_accepted" : "vault_access",
        source_id: request.id, property_id: request.property_id || null, is_active: true,
      });

      const pId = request.property_id || "service-request";
      const pTitle = request.property_title || "Pedido de Serviço";

      const { data: existingConv } = await (supabase.from("conversations") as any).select("id").eq("seller_id", user.id).eq("buyer_id", request.requester_id).eq("property_id", pId).maybeSingle();
      let conversationId = existingConv?.id;

      if (!conversationId) {
        const { data: newConv } = await (supabase.from("conversations") as any).insert({ seller_id: user.id, buyer_id: request.requester_id, property_id: pId, property_title: pTitle }).select("id").single();
        conversationId = newConv?.id;
      }

      if (conversationId) {
        const systemMessage = request.type === "vault_access"
          ? `✅ Pedido de acesso ao Cofre Digital aceite. O profissional tem agora acesso aos documentos do imóvel "${pTitle}".`
          : `✅ Pedido de contacto aceite. Podem agora comunicar diretamente sobre "${pTitle}".`;

        await (supabase.from("messages") as any).insert({ conversation_id: conversationId, sender_id: user.id, content: systemMessage, message_type: "system" });
      }

      await (supabase.from("notifications") as any).insert({
        user_id: request.requester_id, type: request.type === "contact" ? "contact_accepted" : "vault_access_approved",
        title: request.type === "contact" ? "Pedido aceite" : "Acesso ao cofre aprovado",
        message: request.type === "contact" ? "O seu pedido de contacto foi aceite. Pode agora comunicar diretamente." : "O seu pedido de acesso ao cofre foi aprovado.",
        metadata: { professional_id: request.professional_id, request_id: request.id, conversation_id: conversationId }
      });
    },
    onSuccess: () => {
      invalidateRequests();
      toast({ title: "Pedido aceite ✅", description: "Um canal de comunicação foi criado automaticamente." });
    },
    onSettled: () => setUpdating(null),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ request, reason }: { request: ServiceRequest, reason: string }) => {
      setUpdating(request.id);
      if (request.type === "contact") {
        await (supabase.from("contact_requests") as any).update({ status: "closed", rejection_reason: reason || null }).eq("id", request.id);
      } else {
        await (supabase.from("vault_access_requests") as any).update({ status: "rejected", rejection_reason: reason || null }).eq("id", request.id);
      }

      await (supabase.from("notifications") as any).insert({
        user_id: request.requester_id, type: request.type === "contact" ? "contact_rejected" : "vault_access_rejected",
        title: request.type === "contact" ? "Pedido recusado" : "Acesso ao cofre recusado",
        message: reason ? `O seu pedido foi recusado. Motivo: ${reason}` : "O seu pedido foi recusado.",
        metadata: { professional_id: request.professional_id, request_id: request.id, rejection_reason: reason || null }
      });
    },
    onSuccess: () => {
      invalidateRequests();
      toast({ title: "Pedido recusado", description: "O solicitador foi notificado." });
    },
    onSettled: () => setUpdating(null),
  });

  return {
    requests,
    loading,
    updating,
    pendingCount: requests.filter(r => r.status === "pending").length,
    acceptedCount: requests.filter(r => r.status === "accepted").length,
    rejectedCount: requests.filter(r => r.status === "rejected").length,
    acceptRequest: acceptMutation.mutateAsync,
    rejectRequest: (request: ServiceRequest, reason: string) => rejectMutation.mutateAsync({ request, reason }),
    refetch,
  };
}
