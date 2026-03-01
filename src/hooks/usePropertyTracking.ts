import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePropertyTracking() {
  const trackViewMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const { data, error } = await (supabase.rpc('track_property_view', {
        property_uuid: propertyId
      }) as any);
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('Property view tracked:', variables);
    },
    onError: (error) => {
      console.error('Error tracking property view:', error);
    }
  });

  const trackShareMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const { data, error } = await (supabase.rpc('track_property_share', {
        property_uuid: propertyId
      }) as any);
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('Property share tracked:', variables);
    },
    onError: (error) => {
      console.error('Error tracking property share:', error);
    }
  });

  return {
    trackView: trackViewMutation.mutateAsync,
    trackShare: trackShareMutation.mutateAsync,
    isTrackingView: trackViewMutation.isPending,
    isTrackingShare: trackShareMutation.isPending,
  };
}
