import { useState } from "react";
import { MessageSquare, Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversations, useMessages } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

export function DashboardMessages() {
  const { user } = useAuth();
  const { conversations, loading, sendMessage, markAsRead, totalUnread } = useConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const { messages, loading: messagesLoading } = useMessages(selectedConversationId);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const handleSelectConversation = async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    await markAsRead(conversationId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    await sendMessage(selectedConversationId, newMessage);
    setNewMessage("");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mensagens</h1>
          <p className="text-muted-foreground mt-1">
            Comunique com interessados nos seus imóveis.
          </p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mensagens</h1>
          <p className="text-muted-foreground mt-1">
            Comunique com interessados nos seus imóveis.
          </p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-12 text-center">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Sem mensagens</h3>
          <p className="text-muted-foreground mt-2">
            As mensagens dos interessados aparecerão aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mensagens</h1>
        <p className="text-muted-foreground mt-1">
          {totalUnread > 0 ? `${totalUnread} mensagem(ns) não lida(s)` : 'Comunique com interessados nos seus imóveis.'}
        </p>
      </div>

      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
          {/* Conversations List */}
          <div className={`border-r border-border/50 ${selectedConversationId ? 'hidden md:block' : ''}`}>
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold text-foreground">Conversas</h3>
            </div>
            <ScrollArea className="h-[450px]">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-4 border-b border-border/50 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedConversationId === conv.id ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => handleSelectConversation(conv.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        Imóvel: {conv.property_id}
                      </p>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {conv.last_message?.content || 'Sem mensagens'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {conv.last_message_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true, locale: pt })}
                        </span>
                      )}
                      {(conv.unread_count || 0) > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Messages */}
          <div className={`col-span-2 flex flex-col ${!selectedConversationId ? 'hidden md:flex' : ''}`}>
            {selectedConversationId ? (
              <>
                <div className="p-4 border-b border-border/50 flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden"
                    onClick={() => setSelectedConversationId(null)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h3 className="font-semibold text-foreground">
                    Conversa
                  </h3>
                </div>
                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-3/4" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              msg.sender_id === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            <p>{msg.content}</p>
                            <span className="text-xs opacity-70 mt-1 block">
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: pt })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <div className="p-4 border-t border-border/50">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Escreva uma mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                  <p>Selecione uma conversa para ver as mensagens</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
