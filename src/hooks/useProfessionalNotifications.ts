import { useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NotificationCounts {
  serviceRequests: number;
  unreadMessages: number;
}

export function useProfessionalNotifications(professionalId: string | undefined, userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: counts = { serviceRequests: 0, unreadMessages: 0 }, refetch } = useQuery({
    queryKey: ["professional-counts", professionalId, userId],
    queryFn: async () => {
      if (!professionalId || !userId) return { serviceRequests: 0, unreadMessages: 0 };

      // Count pending vault access requests
      const { count: vaultCount } = await (supabase
        .from("vault_access_requests") as any)
        .select("*", { count: "exact", head: true })
        .eq("professional_id", professionalId)
        .eq("status", "pending");

      // Count pending contact requests
      const { count: contactCount } = await (supabase
        .from("contact_requests") as any)
        .select("*", { count: "exact", head: true })
        .eq("professional_id", professionalId)
        .eq("status", "pending");

      // Count unread conversations
      const { data: conversations } = await (supabase
        .from("conversations") as any)
        .select("id")
        .eq("seller_id", userId)
        .eq("is_read_by_seller", false);

      return {
        serviceRequests: (vaultCount || 0) + (contactCount || 0),
        unreadMessages: conversations?.length || 0,
      };
    },
    enabled: !!professionalId && !!userId,
  });

  const invalidateCounts = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["professional-counts", professionalId, userId] });
  }, [queryClient, professionalId, userId]);

  useEffect(() => {
    if (!professionalId || !userId) return;

    const channel = supabase
      .channel(`professional-notifs-${professionalId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vault_access_requests', filter: `professional_id=eq.${professionalId}` }, () => invalidateCounts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_requests', filter: `professional_id=eq.${professionalId}` }, () => invalidateCounts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations', filter: `seller_id=eq.${userId}` }, () => invalidateCounts())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => invalidateCounts())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [professionalId, userId, invalidateCounts]);

  const resetServiceRequestsCount = useCallback(() => {
    queryClient.setQueryData(["professional-counts", professionalId, userId], (old: any) =>
      old ? { ...old, serviceRequests: 0 } : old
    );
  }, [queryClient, professionalId, userId]);

  const resetMessagesCount = useCallback(async () => {
    if (!userId) return;
    queryClient.setQueryData(["professional-counts", professionalId, userId], (old: any) =>
      old ? { ...old, unreadMessages: 0 } : old
    );
    await (supabase.from("conversations") as any).update({ is_read_by_seller: true }).eq("seller_id", userId).eq("is_read_by_seller", false);
  }, [userId, queryClient, professionalId]);

  return {
    counts,
    fetchCounts: refetch,
    resetServiceRequestsCount,
    resetMessagesCount,
  };
}
