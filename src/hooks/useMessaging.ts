import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMessagingContext } from '@/contexts/MessagingContext';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  is_archived: boolean;
  message_type: 'buyer_to_seller' | 'scheduling' | 'professional_contact';
  created_at: string;
}

export interface ParticipantInfo {
  name: string;
  is_professional: boolean;
  professional_area: string | null;
  is_verified: boolean;
  professional_id: string | null;
  user_id: string | null;
}

export interface ConversationWithDetails {
  id: string;
  property_id: string;
  property_title: string | null;
  buyer_id: string;
  seller_id: string;
  is_read_by_buyer: boolean;
  is_read_by_seller: boolean;
  last_message_at: string | null;
  created_at: string;
  last_message?: Message | null;
  unread_count: number;
  sender_type: 'buyer' | 'professional';
  is_archived: boolean;
  other_participant: ParticipantInfo | null;
}

export function useMessaging() {
  const context = useMessagingContext();

  return {
    ...context,
    refetch: context.fetchConversations
  };
}

export function useConversationMessages(conversationId: string | null) {
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

  const invalidateMessages = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
  }, [queryClient, conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`msg-realtime-${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, () => invalidateMessages())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, invalidateMessages]);

  return { messages, loading, refetch };
}
