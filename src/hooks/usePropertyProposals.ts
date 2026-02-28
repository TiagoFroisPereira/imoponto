import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface PropertyProposal {
  id: string;
  property_id: string;
  user_id: string;
  name: string;
  amount: number;
  deadline: string;
  requires_financing: boolean;
  has_written_proposal: boolean;
  notes: string | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface CreateProposalData {
  property_id: string;
  name: string;
  amount: number;
  deadline: string;
  requires_financing: boolean;
  has_written_proposal: boolean;
  notes?: string;
}

export function usePropertyProposals(propertyId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: proposals = [], isLoading, refetch } = useQuery({
    queryKey: ["property-proposals", propertyId],
    queryFn: async () => {
      if (!user || !propertyId) return [];

      const { data, error } = await supabase
        .from("property_proposals")
        .select("*")
        .eq("property_id", propertyId)
        .order("amount", { ascending: false });

      if (error) {
        console.error("Error fetching proposals:", error);
        throw error;
      }

      return (data || []) as PropertyProposal[];
    },
    enabled: !!user && !!propertyId,
  });

  const createProposal = useMutation({
    mutationFn: async (data: CreateProposalData) => {
      if (!user) throw new Error("User not authenticated");

      const { data: result, error } = await supabase
        .from("property_proposals")
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-proposals", propertyId] });
      toast({
        title: "Proposta adicionada",
        description: "A proposta foi registada com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error creating proposal:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a proposta.",
        variant: "destructive",
      });
    },
  });

  const updateProposal = useMutation({
    mutationFn: async ({ id, ...data }: Partial<PropertyProposal> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("property_proposals")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-proposals", propertyId] });
    },
    onError: (error) => {
      console.error("Error updating proposal:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a proposta.",
        variant: "destructive",
      });
    },
  });

  const acceptProposal = useMutation({
    mutationFn: async (proposalId: string) => {
      // First, reject all other proposals
      const otherProposals = proposals.filter((p) => p.id !== proposalId);
      for (const proposal of otherProposals) {
        await supabase
          .from("property_proposals")
          .update({ status: "rejected" })
          .eq("id", proposal.id);
      }

      // Then accept the selected proposal
      const { data: result, error } = await supabase
        .from("property_proposals")
        .update({ status: "accepted" })
        .eq("id", proposalId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-proposals", propertyId] });
      toast({
        title: "Proposta aceite",
        description: "A proposta foi aceite. As restantes foram rejeitadas.",
      });
    },
    onError: (error) => {
      console.error("Error accepting proposal:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aceitar a proposta.",
        variant: "destructive",
      });
    },
  });

  const deleteProposal = useMutation({
    mutationFn: async (proposalId: string) => {
      const { error } = await supabase
        .from("property_proposals")
        .delete()
        .eq("id", proposalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-proposals", propertyId] });
      toast({
        title: "Proposta eliminada",
        description: "A proposta foi removida.",
      });
    },
    onError: (error) => {
      console.error("Error deleting proposal:", error);
      toast({
        title: "Erro",
        description: "Não foi possível eliminar a proposta.",
        variant: "destructive",
      });
    },
  });

  const rejectProposal = useMutation({
    mutationFn: async (proposalId: string) => {
      const { data: result, error } = await supabase
        .from("property_proposals")
        .update({ status: "rejected" })
        .eq("id", proposalId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-proposals", propertyId] });
      toast({
        title: "Proposta rejeitada",
        description: "A proposta foi marcada como rejeitada.",
      });
    },
    onError: (error) => {
      console.error("Error rejecting proposal:", error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a proposta.",
        variant: "destructive",
      });
    },
  });

  const resetProposalStatus = useMutation({
    mutationFn: async (proposalId: string) => {
      const { data: result, error } = await supabase
        .from("property_proposals")
        .update({ status: "pending" })
        .eq("id", proposalId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-proposals", propertyId] });
      toast({
        title: "Estado atualizado",
        description: "A proposta foi marcada como pendente.",
      });
    },
    onError: (error) => {
      console.error("Error resetting proposal status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o estado da proposta.",
        variant: "destructive",
      });
    },
  });

  // Check if can advance in wizard
  const acceptedProposal = proposals.find((p) => p.status === "accepted");
  const hasAcceptedProposal = !!acceptedProposal;
  const canAdvanceWizard =
    hasAcceptedProposal &&
    acceptedProposal.amount > 0 &&
    acceptedProposal.deadline.trim() !== "" &&
    acceptedProposal.has_written_proposal;

  const highestProposal = proposals.length > 0
    ? proposals.reduce((max, p) => (p.amount > max.amount ? p : max), proposals[0])
    : null;

  return {
    proposals,
    isLoading,
    refetch,
    createProposal,
    updateProposal,
    acceptProposal,
    rejectProposal,
    resetProposalStatus,
    deleteProposal,
    hasAcceptedProposal,
    acceptedProposal,
    canAdvanceWizard,
    highestProposal,
  };
}
