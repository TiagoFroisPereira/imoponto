import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface BuyerVaultProperty {
  id: string;
  title: string;
  address: string;
  accessId: string;
  expiresAt: string | null;
}

export function useBuyerVaultAccess() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["buyer-vault-access", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("vault_buyer_access")
        .select("id, property_id, expires_at, status, payment_status")
        .eq("buyer_id", user.id)
        .eq("status", "paid");

      if (error) {
        console.error("Error fetching buyer vault access:", error);
        return [];
      }

      if (!data || data.length === 0) return [];

      // Fetch property details for each access
      const propertyIds = data.map((d) => d.property_id);
      const { data: properties, error: propError } = await supabase
        .from("properties")
        .select("id, title, address")
        .in("id", propertyIds);

      if (propError) {
        console.error("Error fetching properties:", propError);
        return [];
      }

      const propertyMap = new Map(
        (properties || []).map((p) => [p.id, p])
      );

      return data
        .map((access) => {
          const prop = propertyMap.get(access.property_id);
          if (!prop) return null;
          return {
            id: prop.id,
            title: prop.title,
            address: prop.address,
            accessId: access.id,
            expiresAt: access.expires_at,
          } as BuyerVaultProperty;
        })
        .filter(Boolean) as BuyerVaultProperty[];
    },
    enabled: !!user,
  });
}
