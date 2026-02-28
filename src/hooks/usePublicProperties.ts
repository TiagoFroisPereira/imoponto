import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PublicProperty {
  id: string;
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
  images: string[];
  features: string[];
  status: string;
  documentation_level: string;
  year_built: number | null;
  energy_certification: string | null;
  parking: number;
  floor: string | null;
  has_garden: boolean;
  has_pool: boolean;
  has_garage: boolean;
  has_elevator: boolean;
  has_ac: boolean;
  has_central_heating: boolean;
  pets_allowed: boolean;
  gross_area: number | null;
  condition: string | null;
  transaction_type: string;
  created_at: string;
  user_id: string;
  wizard_step?: number;
  views_count?: number;
  favorites_count?: number;
  shares_count?: number;
  inquiries_count?: number;
}

interface UsePublicPropertiesOptions {
  limit?: number;
  featured?: boolean;
}

export function usePublicProperties(options: UsePublicPropertiesOptions = {}) {
  const { data: properties = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['public-properties', options.limit, options.featured],
    queryFn: async () => {
      let query = (supabase.from('properties') as any)
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((property: any) => ({
        ...property,
        images: property.images || [],
        features: property.features || [],
      })) as PublicProperty[];
    },
  });

  return { properties, loading, refetch };
}

export function usePropertyById(id: string | undefined) {
  const { data: property = null, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await (supabase
        .from('properties') as any)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        images: data.images || [],
        features: data.features || [],
      } as PublicProperty;
    },
    enabled: !!id,
  });

  const errorMessage = error ? 'Erro ao carregar imóvel' : (!loading && !property && id ? 'Imóvel não encontrado' : null);

  return { property, loading, error: errorMessage, refetch };
}
