import { useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ValidatedRelationship {
  id: string;
  professional_id: string;
  user_id: string;
  relationship_type: "contact_accepted" | "vault_access" | "property_assignment";
  property_id?: string | null;
  is_active: boolean;
  created_at: string;
}

interface UseProfessionalRelationshipsOptions {
  professionalUserId?: string;
  userId?: string;
}

export function useProfessionalRelationships({ professionalUserId, userId }: UseProfessionalRelationshipsOptions) {
  const queryClient = useQueryClient();

  const { data: relationships = [], isLoading: loading, refetch } = useQuery({
    queryKey: ["professional-relationships", professionalUserId, userId],
    queryFn: async () => {
      if (!professionalUserId && !userId) return [];

      let query = (supabase.from("professional_relationships") as any)
        .select("*")
        .eq("is_active", true);

      // If we have a professional user ID, find their professional record first
      if (professionalUserId) {
        const { data: professional } = await (supabase.from("professionals") as any)
          .select("id")
          .eq("user_id", professionalUserId)
          .maybeSingle();

        if (professional) {
          query = query.eq("professional_id", professional.id);
        } else {
          return [];
        }
      }

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching relationships:", error);
        throw error;
      }

      return (data || []).map((r: any) => ({
        ...r,
        relationship_type: r.relationship_type as "contact_accepted" | "vault_access" | "property_assignment"
      })) as ValidatedRelationship[];
    },
    enabled: !!professionalUserId || !!userId,
  });

  const invalidateRelationships = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["professional-relationships", professionalUserId, userId] });
  }, [queryClient, professionalUserId, userId]);

  useEffect(() => {
    if (!professionalUserId && !userId) return;

    const channel = supabase
      .channel('professional-relationships-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_relationships',
        },
        () => {
          invalidateRelationships();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [professionalUserId, userId, invalidateRelationships]);

  const validatedUserIds = new Set(relationships.map(r => r.user_id));

  const hasValidRelationshipWith = useCallback((otherUserId: string) => {
    return validatedUserIds.has(otherUserId);
  }, [validatedUserIds]);

  return {
    relationships,
    loading,
    validatedUserIds,
    hasValidRelationshipWith,
    refetch,
  };
}
