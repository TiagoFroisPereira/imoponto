import React, { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConversationWithDetails, ParticipantInfo } from '@/hooks/useMessaging';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';

interface MessagingContextType {
    conversations: ConversationWithDetails[];
    archivedConversations: ConversationWithDetails[];
    loading: boolean;
    totalUnread: number;
    currentUserId: string | null;
    fetchConversations: () => void;
    sendMessage: (conversationId: string, content: string, messageType?: 'buyer_to_seller' | 'scheduling' | 'professional_contact' | 'system') => Promise<any>;
    createConversationAndSendMessage: (propertyId: string, sellerId: string, content: string, propertyTitle: string, messageType?: 'buyer_to_seller' | 'scheduling' | 'professional_contact' | 'system') => Promise<any>;
    markAsRead: (conversationId: string) => Promise<void>;
    markAsUnread: (conversationId: string) => Promise<void>;
    archiveConversation: (conversationId: string) => Promise<void>;
    unarchiveConversation: (conversationId: string) => Promise<void>;
    deleteConversation: (conversationId: string) => Promise<void>;
    deleteMessages: (messageIds: string[]) => Promise<boolean>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: allConversations = [], isLoading: loading, refetch: fetchConversations } = useQuery({
        queryKey: ['conversations', user?.id],
        queryFn: async () => {
            if (!user) return [];

            console.log('--- [MessagingContext] Fetching conversations via View ---');

            // 1. Fetch from the optimized view
            const { data: convData, error: convError } = await supabase
                .from('view_conversation_details' as any)
                .select('*')
                .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
                .order('last_message_at', { ascending: false, nullsFirst: false });

            if (convError) throw convError;

            const conversationsFromView = (convData || []) as any[];
            if (conversationsFromView.length === 0) return [];

            // 2. Fetch profiles for participants (we still need this for the display name logic)
            const participantIds = Array.from(new Set(
                conversationsFromView.flatMap(c => [c.buyer_id, c.seller_id])
            ));

            const [profilesRes, professionalsRes] = await Promise.all([
                supabase.from('profiles').select('id, full_name').in('id', participantIds),
                supabase.from('professionals').select('id, user_id, name, service_type, is_verified, email').in('user_id', participantIds)
            ]);

            const profMap = new Map(professionalsRes.data?.map(p => [p.user_id, { ...p, service_type: p.service_type || null }]));
            const profileMap = new Map(profilesRes.data?.map(p => {
                const prof = profMap.get(p.id);
                return [p.id, {
                    ...p,
                    email: prof?.email || null,
                    professionals: prof ? [prof] : []
                }];
            }));

            // 3. Simple mapping
            return conversationsFromView.map((conv) => {
                const isUserSeller = user.id === conv.seller_id;
                const otherParticipantId = isUserSeller ? conv.buyer_id : conv.seller_id;
                const otherProfile: any = profileMap.get(otherParticipantId);
                const professionalData = otherProfile?.professionals?.[0] || null;

                const isArchived = isUserSeller ? conv.is_archived_by_seller : conv.is_archived_by_buyer;
                const unreadCount = isUserSeller ? conv.unread_count_seller : conv.unread_count_buyer;
                const lastMessage = conv.last_message;

                let senderType: 'buyer' | 'professional' = lastMessage?.message_type === 'professional_contact' ? 'professional' : 'buyer';

                let participantInfo: ParticipantInfo | null = null;
                const getDisplayName = (): string | null => {
                    if (otherProfile?.full_name?.trim()) return otherProfile.full_name;
                    if (otherProfile?.email) return otherProfile.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                    return null;
                };

                const displayName = getDisplayName();
                if (professionalData) {
                    participantInfo = {
                        name: professionalData.name || displayName || 'Profissional',
                        is_professional: true,
                        professional_area: professionalData.service_type,
                        is_verified: professionalData.is_verified || false,
                        professional_id: professionalData.id || null,
                        user_id: otherParticipantId,
                    };
                    senderType = 'professional';
                } else {
                    participantInfo = {
                        name: displayName || 'Utilizador',
                        is_professional: false,
                        professional_area: null,
                        is_verified: false,
                        professional_id: null,
                        user_id: otherParticipantId,
                    };
                }

                return {
                    ...conv,
                    unread_count: unreadCount || 0,
                    sender_type: senderType,
                    is_archived: isArchived,
                    other_participant: participantInfo,
                } as ConversationWithDetails;
            });
        },
        enabled: !!user?.id,
        staleTime: 30000, // 30 seconds
    });

    const conversations = useMemo(() => allConversations.filter(c => !c.is_archived), [allConversations]);
    const archivedConversations = useMemo(() => allConversations.filter(c => c.is_archived), [allConversations]);

    const invalidateConversations = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    }, [queryClient, user?.id]);

    const sendMessageMutation = useMutation({
        mutationFn: async ({ conversationId, content, messageType }: { conversationId: string, content: string, messageType?: any }) => {
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await (supabase
                .from('messages') as any)
                .insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    content,
                    message_type: messageType || 'buyer_to_seller'
                })
                .select()
                .maybeSingle();

            if (error) throw error;

            await (supabase
                .from('conversations') as any)
                .update({ last_message_at: new Date().toISOString() })
                .eq('id', conversationId);

            return data;
        },
        onSuccess: () => invalidateConversations(),
        onError: (error) => {
            console.error('Error sending message:', error);
            toast({ title: "Erro", description: "Não foi possível enviar a mensagem", variant: "destructive" });
        }
    });

    const sendMessage = async (conversationId: string, content: string, messageType: 'buyer_to_seller' | 'scheduling' | 'professional_contact' | 'system' = 'buyer_to_seller') => {
        return sendMessageMutation.mutateAsync({ conversationId, content, messageType });
    };

    const createConversationAndSendMessage = async (propertyId: string, sellerId: string, content: string, propertyTitle: string, messageType: 'buyer_to_seller' | 'scheduling' | 'professional_contact' | 'system' = 'buyer_to_seller') => {
        if (!user) return null;

        let query = (supabase.from('conversations') as any)
            .select('id')
            .eq('buyer_id', user.id)
            .eq('seller_id', sellerId);

        if (propertyId && propertyId !== "none" && propertyId !== "service-request" && propertyId !== "null") {
            query = query.eq('property_id', propertyId);
        } else {
            query = query.is('property_id', null);
        }

        const { data: existingConv } = await query.maybeSingle();

        let conversationId: string;
        if (existingConv) {
            conversationId = existingConv.id;
        } else {
            const { data: newConv, error: convError } = await (supabase
                .from('conversations') as any)
                .insert({
                    property_id: (propertyId && propertyId !== "none" && propertyId !== "service-request" && propertyId !== "null") ? propertyId : null,
                    buyer_id: user.id,
                    seller_id: sellerId
                })
                .select()
                .maybeSingle();

            if (convError) throw convError;
            if (!newConv) throw new Error('Failed to create conversation'); // Fix for newConv null check
            conversationId = newConv.id;
        }

        return sendMessage(conversationId, content, messageType);
    };

    const markAsReadMutation = useMutation({
        mutationFn: async (conversationId: string) => {
            if (!user) return;

            await (supabase
                .from('messages') as any)
                .update({ is_read: true })
                .eq('conversation_id', conversationId)
                .neq('sender_id', user.id);

            await (supabase
                .from('notifications') as any)
                .update({ is_read: true })
                .eq('user_id', user.id)
                .contains('metadata', { conversation_id: conversationId })
                .eq('is_read', false);
        },
        onSuccess: () => invalidateConversations()
    });

    const markAsRead = async (conversationId: string) => {
        return markAsReadMutation.mutateAsync(conversationId);
    };

    const markAsUnread = async (conversationId: string) => {
        if (!user) return;
        const { data: lastMsg } = await (supabase
            .from('messages') as any)
            .select('id')
            .eq('conversation_id', conversationId)
            .neq('sender_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (lastMsg?.[0]) {
            await (supabase.from('messages') as any).update({ is_read: false }).eq('id', lastMsg[0].id);
            invalidateConversations();
        }
    };

    const updateArchiveMutation = useMutation({
        mutationFn: async ({ conversationId, archived }: { conversationId: string, archived: boolean }) => {
            if (!user) return;

            // Fetch current conversation to know if user is buyer or seller
            const { data: conv } = await supabase
                .from('conversations')
                .select('buyer_id, seller_id')
                .eq('id', conversationId)
                .single();

            if (!conv) return;

            const isBuyer = user.id === conv.buyer_id;
            const updateObj = isBuyer
                ? { is_archived_by_buyer: archived }
                : { is_archived_by_seller: archived };

            await (supabase
                .from('conversations') as any)
                .update(updateObj)
                .eq('id', conversationId);
        },
        onSuccess: (_, variables) => {
            toast({ title: variables.archived ? "Arquivada" : "Desarquivada", description: `Conversa ${variables.archived ? 'arquivada' : 'restaurada'} com sucesso` });
            invalidateConversations();
        }
    });

    const archiveConversation = async (id: string) => updateArchiveMutation.mutateAsync({ conversationId: id, archived: true });
    const unarchiveConversation = async (id: string) => updateArchiveMutation.mutateAsync({ conversationId: id, archived: false });

    const deleteConversationMutation = useMutation({
        mutationFn: async (conversationId: string) => {
            await supabase.from('messages').delete().eq('conversation_id', conversationId);
            await supabase.from('conversations').delete().eq('id', conversationId);
        },
        onSuccess: () => {
            toast({ title: "Eliminada", description: "Conversa eliminada com sucesso" });
            invalidateConversations();
        }
    });

    const deleteConversation = async (id: string) => deleteConversationMutation.mutateAsync(id);

    const deleteMessagesMutation = useMutation({
        mutationFn: async (messageIds: string[]) => {
            const { error } = await supabase.from('messages').delete().in('id', messageIds);
            if (error) throw error;
            return true;
        },
        onSuccess: (_, variables) => {
            toast({ title: "Mensagens eliminadas", description: `${variables.length} mensagem(ns) eliminada(s) com sucesso` });
            invalidateConversations();
        }
    });

    const deleteMessages = async (ids: string[]) => deleteMessagesMutation.mutateAsync(ids);

    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel(`messaging-updates-${user.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => invalidateConversations())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => invalidateConversations())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, invalidateConversations]);

    const totalUnread = useMemo(() => conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0), [conversations]);

    return (
        <MessagingContext.Provider value={{
            conversations,
            archivedConversations,
            loading,
            totalUnread,
            currentUserId: user?.id || null,
            fetchConversations: () => void invalidateConversations(),
            sendMessage,
            createConversationAndSendMessage,
            markAsRead,
            markAsUnread,
            archiveConversation,
            unarchiveConversation,
            deleteConversation,
            deleteMessages
        }}>
            {children}
        </MessagingContext.Provider>
    );
};

export const useMessagingContext = () => {
    const context = useContext(MessagingContext);
    if (context === undefined) throw new Error('useMessagingContext must be used within a MessagingProvider');
    return context;
};
