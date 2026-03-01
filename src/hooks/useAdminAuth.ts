import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useAdminAuth() {
  const { user, loading: authLoading } = useAuth();

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["admin-role", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (error) {
        console.error("[useAdminAuth] Error checking role:", error);
        return false;
      }
      return data === true;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  return {
    user,
    isAdmin: isAdmin ?? false,
    loading: authLoading || roleLoading,
  };
}
