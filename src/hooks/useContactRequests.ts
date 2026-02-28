import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface ContactRequest {
  id: string;
  professional_id: string;
  user_id: string;
  message: string;
  status: "pending" | "responded" | "closed";
  rejection_reason?: string | null;
  expires_at?: string;
  property_id?: string | null;
  service_type?: string | null;
  created_at: string;
  updated_at: string;
  professional?: {
    id: string;
    name: string;
  };
}

export function useContactRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contact requests made by the current user
  const { data: myRequests = [], isLoading: loadingMyRequests } = useQuery({
    queryKey: ["my-contact-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("contact_requests")
        .select(`
          *,
          professional:professionals(id, name)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as ContactRequest[];
    },
    enabled: !!user?.id,
  });

  // Fetch contact requests received by the professional (if user is a professional)
  const { data: receivedRequests = [], isLoading: loadingReceivedRequests } = useQuery({
    queryKey: ["received-contact-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First check if user is a professional
      const { data: professional } = await supabase
        .from("professionals")
        .select("id, name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!professional) return [];

      const { data, error } = await supabase
        .from("contact_requests")
        .select("*")
        .eq("professional_id", professional.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map(req => ({
        ...req,
        professional: { id: professional.id, name: professional.name }
      })) as ContactRequest[];
    },
    enabled: !!user?.id,
  });

  // Mark request as closed and send review notification
  const closeRequestMutation = useMutation({
    mutationFn: async ({ requestId, professionalId, professionalName }: {
      requestId: string;
      professionalId: string;
      professionalName: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Update the request status to closed
      const { error: updateError } = await (supabase
        .from("contact_requests")
        .update({ status: "closed" } as any)
        .eq("id", requestId) as any);

      if (updateError) throw updateError;

      // Send notification to the user to review the professional
      // We need to know who made the request
      const { data: request } = await (supabase
        .from("contact_requests")
        .select("user_id")
        .eq("id", requestId)
        .maybeSingle() as any);

      if (request?.user_id) {
        const { error: notifError } = await (supabase
          .from("notifications")
          .insert({
            user_id: request.user_id,
            type: "review_request",
            title: "Avalie o serviço prestado",
            message: `O serviço com ${professionalName} foi concluído. Por favor, avalie a sua experiência.`,
            metadata: {
              professional_id: professionalId,
              professional_name: professionalName,
              contact_request_id: requestId
            }
          } as any) as any);

        if (notifError) {
          console.error("Error creating review notification:", notifError);
        }
      }

      return { requestId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-contact-requests", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["received-contact-requests", user?.id] });
      toast({
        title: "Serviço concluído",
        description: "O utilizador será convidado a avaliar o serviço.",
      });
    },
    onError: (error) => {
      console.error("Error closing request:", error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar o serviço como concluído.",
        variant: "destructive",
      });
    },
  });

  // Update request status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      const { error } = await (supabase
        .from("contact_requests")
        .update({ status } as any)
        .eq("id", requestId) as any);

      if (error) throw error;
      return { requestId, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-contact-requests", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["received-contact-requests", user?.id] });
    },
    onError: (error) => {
      console.error("Error updating status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o estado.",
        variant: "destructive",
      });
    },
  });

  return {
    myRequests,
    receivedRequests,
    loadingMyRequests,
    loadingReceivedRequests,
    closeRequest: (params: any) => closeRequestMutation.mutate(params),
    updateStatus: (params: any) => updateStatusMutation.mutate(params),
    isClosing: closeRequestMutation.isPending,
  };
}
