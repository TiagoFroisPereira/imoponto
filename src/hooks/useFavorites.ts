import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading: loading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return (data || []) as Favorite[];
    },
    enabled: !!user?.id,
    staleTime: 60000, // 60 seconds
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!user) {
        toast({
          title: "Inicie sessão",
          description: "Precisa de iniciar sessão para guardar favoritos",
          variant: "destructive"
        });
        throw new Error("Not authenticated");
      }

      const existingFavorite = favorites.find(f => f.property_id === propertyId);

      if (existingFavorite) {
        const { error } = await (supabase
          .from('favorites')
          .delete()
          .eq('id', existingFavorite.id) as any);

        if (error) throw error;
        return { type: 'removed' as const };
      } else {
        const { data, error } = await (supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            property_id: propertyId
          } as any)
          .select()
          .single() as any);

        if (error) throw error;
        return { type: 'added' as const, data };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      if (result.type === 'removed') {
        toast({
          title: "Removido",
          description: "Imóvel removido dos favoritos"
        });
      } else {
        toast({
          title: "Adicionado",
          description: "Imóvel adicionado aos favoritos"
        });
      }
    },
    onError: (error: any) => {
      if (error.message === "Not authenticated") return;
      console.error('Error toggling favorite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os favoritos",
        variant: "destructive"
      });
    }
  });

  const isFavorite = (propertyId: string): boolean => {
    return favorites.some(f => f.property_id === propertyId);
  };

  const getFavoritePropertyIds = (): string[] => {
    return favorites.map(f => f.property_id);
  };

  return {
    favorites,
    loading,
    isFavorite,
    toggleFavorite: (propertyId: string) => toggleFavoriteMutation.mutateAsync(propertyId),
    getFavoritePropertyIds,
    isAuthenticated: !!user?.id
  };
}
