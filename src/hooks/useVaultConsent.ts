import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

interface VaultConsentData {
  declaration_responsibility_accepted: boolean;
  declaration_no_validation_accepted: boolean;
  declaration_professional_validation_accepted: boolean;
  declaration_access_responsibility_accepted: boolean;
  declaration_terms_accepted: boolean;
}

export const useVaultConsent = (propertyId: string | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: consent, isLoading } = useQuery({
    queryKey: ["vault-consent", propertyId, user?.id],
    queryFn: async () => {
      if (!user?.id || !propertyId) return null;
      
      const { data, error } = await supabase
        .from("vault_consent_acceptances")
        .select("*")
        .eq("user_id", user.id)
        .eq("property_id", propertyId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching vault consent:", error);
        throw error;
      }

      return data;
    },
    enabled: !!user?.id && !!propertyId,
  });

  const acceptConsentMutation = useMutation({
    mutationFn: async (declarations: VaultConsentData) => {
      if (!user?.id || !propertyId) {
        throw new Error("User or property not found");
      }

      // Get IP address (best effort, may be blocked by browser)
      let ipAddress = null;
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch (e) {
        console.log("Could not fetch IP address");
      }

      const { data, error } = await supabase
        .from("vault_consent_acceptances")
        .insert({
          user_id: user.id,
          property_id: propertyId,
          declaration_responsibility_accepted: declarations.declaration_responsibility_accepted,
          declaration_no_validation_accepted: declarations.declaration_no_validation_accepted,
          declaration_professional_validation_accepted: declarations.declaration_professional_validation_accepted,
          declaration_access_responsibility_accepted: declarations.declaration_access_responsibility_accepted,
          declaration_terms_accepted: declarations.declaration_terms_accepted,
          ip_address: ipAddress,
          user_agent: navigator.userAgent,
          terms_version: "1.0",
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving vault consent:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault-consent", propertyId, user?.id] });
      toast({
        title: "Cofre Digital ativado",
        description: "O seu Cofre Digital está agora disponível.",
      });
    },
    onError: (error) => {
      console.error("Failed to save vault consent:", error);
      toast({
        title: "Erro",
        description: "Não foi possível ativar o Cofre Digital. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const hasConsent = !!consent;

  return {
    consent,
    hasConsent,
    isLoading,
    acceptConsent: acceptConsentMutation.mutate,
    isAccepting: acceptConsentMutation.isPending,
  };
};
