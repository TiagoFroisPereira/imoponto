import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Property {
  id: string;
  user_id: string;
  title: string;
  address: string;
  location: string;
  price: number;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  description: string | null;
  image_url: string | null;
  status: string;
  views_count: number;
  inquiries_count: number;
  favorites_count: number;
  shares_count: number;
  documentation_level: string;
  created_at: string;
  updated_at: string;
  wizard_step?: number;
  visits_count?: number;
}

export function useProperties() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: enrichedData, isLoading: loading, refetch } = useQuery({
    queryKey: ['properties', user?.id],
    queryFn: async () => {
      if (!user) return { properties: [], visitBookingsCount: 0 };

      // Fetch properties
      const { data: propertiesData, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch visit bookings count grouped by property
      const { data: visitsData, error: visitsError } = await supabase
        .from('visit_bookings')
        .select('property_id')
        .eq('seller_id', user.id);

      if (visitsError) throw visitsError;

      const validVisitsData = visitsData || [];
      const visitsMap = new Map();

      validVisitsData.forEach((visit: any) => {
        if (visit.property_id) {
          visitsMap.set(visit.property_id, (visitsMap.get(visit.property_id) || 0) + 1);
        }
      });

      const enrichedProperties = (propertiesData || []).map(property => ({
        ...property,
        visits_count: visitsMap.get(property.id) || 0
      }));

      return {
        properties: enrichedProperties as Property[],
        visitBookingsCount: validVisitsData.length
      };
    },
    enabled: !!user,
  });

  const properties = enrichedData?.properties || [];
  const visitBookingsCount = enrichedData?.visitBookingsCount || 0;

  const createMutation = useMutation({
    mutationFn: async (property: Omit<Property, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'views_count' | 'inquiries_count' | 'favorites_count' | 'shares_count' | 'visits_count'>) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await (supabase
        .from('properties')
        .insert({ ...property, user_id: user.id })
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties', user?.id] });
      toast({ title: "Sucesso", description: "Imóvel criado com sucesso" });
    },
    onError: (error) => {
      console.error('Error creating property:', error);
      toast({ title: "Erro", description: "Não foi possível criar o imóvel", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Property> }) => {
      const { error } = await (supabase
        .from('properties')
        .update(updates)
        .eq('id', id) as any);
      if (error) throw error;
      return { id, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties', user?.id] });
      toast({ title: "Sucesso", description: "Imóvel atualizado com sucesso" });
    },
    onError: (error) => {
      console.error('Error updating property:', error);
      toast({ title: "Erro", description: "Não foi possível atualizar o imóvel", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from('properties')
        .delete()
        .eq('id', id) as any);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties', user?.id] });
      toast({ title: "Sucesso", description: "Imóvel eliminado com sucesso" });
    },
    onError: (error) => {
      console.error('Error deleting property:', error);
      toast({ title: "Erro", description: "Não foi possível eliminar o imóvel", variant: "destructive" });
    }
  });

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await updateMutation.mutateAsync({ id, updates: { status: newStatus } });
      return true;
    } catch {
      return false;
    }
  };

  const totalInquiriesFromProperties = properties.reduce((sum, p) => sum + p.inquiries_count, 0);
  const totalContacts = totalInquiriesFromProperties + visitBookingsCount;
  const totalViews = properties.reduce((sum, p) => sum + p.views_count, 0);

  const stats = {
    totalProperties: properties.filter(p => p.status === 'active').length,
    totalViews,
    totalInquiries: totalContacts,
    totalFavorites: properties.reduce((sum, p) => sum + (p.favorites_count || 0), 0),
    totalShares: properties.reduce((sum, p) => sum + (p.shares_count || 0), 0),
    conversionRate: totalViews > 0 ? ((totalContacts / totalViews) * 100).toFixed(1) : '0'
  };

  return {
    properties,
    loading,
    stats,
    createProperty: createMutation.mutateAsync,
    updateProperty: (id: string, updates: Partial<Property>) => updateMutation.mutateAsync({ id, updates }),
    deleteProperty: deleteMutation.mutateAsync,
    toggleStatus,
    refetch
  };
}
