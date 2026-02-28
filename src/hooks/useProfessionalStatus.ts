import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useProfessionalStatus() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['professional_status', user?.id],
        queryFn: async () => {
            if (!user) return null;

            const { data, error } = await supabase
                .from("professionals")
                .select("id, profile_completed")
                .eq("user_id", user.id)
                .maybeSingle();

            if (error) {
                console.error('Error fetching professional status:', error);
                throw error;
            }

            return data ? {
                isProfessional: true,
                profile_completed: (data as any).profile_completed
            } : {
                isProfessional: false,
                profile_completed: null
            };
        },
        enabled: !!user,
    });
}
