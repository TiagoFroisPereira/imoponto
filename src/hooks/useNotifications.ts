import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  user_id: string;
  property_id: string | null;
  type: 'favorite' | 'view' | 'share' | 'visit_booking' | 'message' | 'visit_confirmed' | 'visit_cancelled' | 'professional_added' | 'review_request' | 'contact_accepted' | 'vault_access_approved' | 'contact_rejected' | 'vault_access_rejected' | 'buyer_vault_request' | 'buyer_vault_approved' | 'buyer_vault_rejected' | 'buyer_vault_paid' | 'vault_upload' | 'vault_delete' | 'vault_validated' | 'vault_rejected_doc' | 'vault_updated' | 'new_contact_request' | 'new_vault_access_request';
  title: string;
  message: string;
  is_read: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

// Get navigation target based on notification type
export function getNotificationTarget(notification: Notification): {
  path: string;
  conversationId?: string;
} {
  const metadata = notification.metadata || {};

  switch (notification.type) {
    case 'message':
    case 'visit_booking':
      if (metadata.conversation_id) {
        return {
          path: `/mensagens?conversation=${metadata.conversation_id}`,
          conversationId: metadata.conversation_id
        };
      }
      return { path: '/mensagens' };

    case 'share':
    case 'favorite':
    case 'view':
      if (notification.property_id) {
        return { path: `/imovel/${notification.property_id}?tab=stats` };
      }
      return { path: '/meus-imoveis' };

    case 'visit_confirmed':
    case 'visit_cancelled':
      if (metadata.conversation_id) {
        return {
          path: `/mensagens?conversation=${metadata.conversation_id}`,
          conversationId: metadata.conversation_id
        };
      }
      return { path: '/agenda' };

    case 'professional_added':
      if (notification.property_id) {
        return { path: `/imovel/${notification.property_id}?tab=professionals` };
      }
      return { path: '/meus-imoveis' };

    case 'contact_accepted':
    case 'vault_access_approved':
      if (metadata.conversation_id) {
        return {
          path: `/mensagens?conversation=${metadata.conversation_id}`,
          conversationId: metadata.conversation_id
        };
      }
      return { path: '/mensagens' };

    case 'contact_rejected':
    case 'vault_access_rejected':
    case 'buyer_vault_rejected':
      return { path: '/meu-perfil' };

    case 'buyer_vault_request':
      return { path: '/meu-perfil' };

    case 'buyer_vault_approved':
      if (metadata.request_id) {
        return { path: `/checkout?type=vault_access&requestId=${metadata.request_id}&propertyId=${notification.property_id || ''}` };
      }
      if (notification.property_id) {
        return { path: `/imovel/${notification.property_id}` };
      }
      return { path: '/meu-perfil' };

    case 'buyer_vault_paid':
      if (notification.property_id) {
        return { path: `/imovel/${notification.property_id}` };
      }
      return { path: '/meu-perfil' };

    case 'review_request':
      if (metadata.professional_id) {
        return { path: `/profissional/${metadata.professional_id}?openReview=true` };
      }
      return { path: '/servicos' };

    case 'vault_upload':
    case 'vault_delete':
    case 'vault_validated':
    case 'vault_rejected_doc':
    case 'vault_updated':
      if (notification.property_id) {
        return { path: `/imovel/${notification.property_id}?tab=vault` };
      }
      return { path: '/meu-perfil' };

    case 'new_contact_request':
    case 'new_vault_access_request':
      return { path: '/painel-profissional?section=requests' };

    default:
      return { path: '/meu-perfil' };
  }
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as Notification[];
    },
    enabled: !!user?.id,
    staleTime: 60000, // 60 seconds
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await (supabase
        .from('notifications')
        .update({ is_read: true } as any)
        .eq('id', notificationId) as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await (supabase
        .from('notifications')
        .update({ is_read: true } as any)
        .eq('user_id', user.id)
        .eq('is_read', false) as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await (supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId) as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    }
  });

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`notifications-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead: (id: string) => markAsReadMutation.mutateAsync(id),
    markAllAsRead: () => markAllAsReadMutation.mutateAsync(),
    deleteNotification: (id: string) => deleteNotificationMutation.mutateAsync(id),
    refetch
  };
}
