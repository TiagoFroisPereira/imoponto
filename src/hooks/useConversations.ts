import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Conversation {
  id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string;
  is_read_by_buyer: boolean;
  is_read_by_seller: boolean;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export function useConversations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await (supabase
        .from('conversations') as any)
        .select('*')
        .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      const conversationsWithDetails = await Promise.all(
        (data || []).map(async (conv: any) => {
          const { data: messages } = await (supabase
            .from('messages') as any)
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const { count } = await (supabase
            .from('messages') as any)
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          return {
            ...conv,
            last_message: messages?.[0] || null,
            unread_count: count || 0
          };
        })
      );

      return conversationsWithDetails as Conversation[];
    },
    enabled: !!user?.id,
  });

  const invalidateConversations = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
  }, [queryClient, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('conv-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => invalidateConversations())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => invalidateConversations())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, invalidateConversations]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string, content: string }) => {
      if (!user) throw new Error('Unauthenticated');
      const { data, error } = await (supabase
        .from('messages') as any)
        .insert({ conversation_id: conversationId, sender_id: user.id, content })
        .select().single();
      if (error) throw error;
      await (supabase.from('conversations') as any).update({ last_message_at: new Date().toISOString() }).eq('id', conversationId);
      return data;
    },
    onSuccess: () => invalidateConversations(),
    onError: (err) => {
      console.error('Error sending message:', err);
      toast({ title: 'Erro', description: 'Não foi possível enviar a mensagem', variant: 'destructive' });
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) return;
      await (supabase.from('messages') as any).update({ is_read: true }).eq('conversation_id', conversationId).neq('sender_id', user.id);
      await (supabase.from('notifications') as any).update({ is_read: true }).eq('user_id', user.id).contains('metadata', { conversation_id: conversationId }).eq('is_read', false);
    },
    onSuccess: () => invalidateConversations(),
  });

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  return {
    conversations,
    loading,
    totalUnread,
    sendMessage: (cid: string, content: string) => sendMessageMutation.mutateAsync({ conversationId: cid, content }),
    markAsRead: markAsReadMutation.mutateAsync,
    refetch
  };
}

export function useMessages(conversationId: string | null) {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await (supabase
        .from('messages') as any)
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`msg-${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, queryClient]);

  return { messages, loading, refetch };
}
