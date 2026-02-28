import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useLegalAcceptance() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: hasAccepted = null, isLoading: loading, refetch } = useQuery({
        queryKey: ['legal-acceptance', user?.id],
        queryFn: async () => {
            if (!user) return null;
            const { data, error } = await (supabase
                .from('user_legal_acceptances') as any)
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();
            if (error) throw error;
            return !!data;
        },
        enabled: !!user?.id,
    });

    const invalidateAcceptance = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['legal-acceptance', user?.id] });
    }, [queryClient, user?.id]);

    const acceptLegalMutation = useMutation({
        mutationFn: async (): Promise<boolean> => {
            if (!user) return false;
            const { error } = await (supabase
                .from('user_legal_acceptances') as any)
                .insert({
                    user_id: user.id,
                    ip_address: null,
                    user_agent: navigator.userAgent,
                    terms_version: '1.0',
                });
            if (error) throw error;
            return true;
        },
        onSuccess: () => invalidateAcceptance(),
    });

    return {
        hasAccepted,
        loading,
        acceptLegal: acceptLegalMutation.mutateAsync,
        refetch,
    };
}
