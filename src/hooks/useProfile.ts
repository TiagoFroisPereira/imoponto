import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  phone_verified: boolean;
  chat_enabled: boolean;
  phone_visible: boolean;
  plan_type: string | null;
  premium_until: string | null;
  notification_settings?: Record<string, boolean>;
  created_at: string;
  updated_at: string;
  plan?: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: loading, refetch } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        throw error;
      }

      return data as Profile;
    },
    enabled: !!user,
  });

  const updateMutation = useMutation<Partial<Profile>, Error, Partial<Profile>>({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await (supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id) as any);

      if (error) throw error;
      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso"
      });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil",
        variant: "destructive"
      });
    }
  });

  const isProfileComplete = !!profile?.phone && profile.phone.trim().length > 0;

  return {
    profile: profile || null,
    loading,
    isProfileComplete,
    updateProfile: updateMutation.mutateAsync,
    refetch
  };
}
