import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useProfessionalProfile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["professional-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await (supabase
        .from("professionals") as any)
        .select("id, profile_completed, is_active")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const isProfessional = !!profile;
  const profileComplete = profile?.profile_completed === true;
  const loading = authLoading || profileLoading;

  const redirectIfIncomplete = () => {
    if (!loading && isProfessional && !profileComplete) {
      navigate("/completar-perfil-profissional");
      return true;
    }
    return false;
  };

  return {
    isProfessional,
    profileComplete,
    loading,
    redirectIfIncomplete,
  };
}
