import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

export type PlanType = 'free' | 'start' | 'pro';

export interface PlanLimits {
    properties: number;
    photos: number;
    videos: number;
    features: string[];
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
    free: {
        properties: 1,
        photos: 5,
        videos: 0,
        features: ['basic_fiche', 'standard_visibility', 'contact_direct', 'marketplace'],
    },
    start: {
        properties: 1,
        photos: 10,
        videos: 1,
        features: ['better_positioning', 'contact_direct', 'marketplace', 'vault', 'visit_scheduling'],
    },
    pro: {
        properties: 3,
        photos: 10,
        videos: 1,
        features: ['priority_results', 'verified_badge', 'contact_direct', 'marketplace', 'vault', 'visit_scheduling'],
    },
};

export function usePlanLimits(propertyId?: string) {
    const { profile, loading: profileLoading } = useProfile();
    const userPlan = (profile?.plan || 'free') as PlanType;

    const { data: addons = [], isLoading: addonsLoading } = useQuery({
        queryKey: ['property_addons', propertyId],
        queryFn: async () => {
            if (!propertyId) return [];

            const { data, error } = await (supabase
                .from('property_addons' as any)
                .select('addon_type')
                .eq('property_id', propertyId)
                .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`) as any);

            if (error) throw error;
            return (data || []).map((a: any) => a.addon_type) as string[];
        },
        enabled: !!propertyId,
    });

    const loading = profileLoading || (!!propertyId && addonsLoading);
    const limits = PLAN_LIMITS[userPlan];

    const checkPhotos = (count: number) => {
        const baseLimit = limits.photos;
        if (addons.includes('extra_photos')) {
            return count < Math.max(baseLimit, 25);
        }
        return count < baseLimit;
    };

    const checkVideos = (count: number) => {
        const baseLimit = limits.videos;
        if (addons.includes('video')) {
            return count < Math.max(baseLimit, 1);
        }
        return count < baseLimit;
    };

    const checkProperties = (count: number) => count < limits.properties;

    const hasFeature = (feature: string) => {
        if (limits.features.includes(feature)) return true;
        if (feature === 'vault' && addons.includes('vault')) return true;
        if (feature === '3d_virtual_tour' && addons.includes('video')) return true;
        if (feature === 'priority_results' && addons.includes('promotion')) return true;
        return false;
    };

    return {
        userPlan,
        limits,
        addons,
        loading,
        checkPhotos,
        checkVideos,
        checkProperties,
        hasFeature,
    };
}
