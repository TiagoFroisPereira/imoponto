import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  User,
  Clock,
  MessageSquareOff,
  ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface ProfileChatProps {
  userId?: string;
  chatEnabled: boolean;
}

interface Conversation {
  id: string;
  property_id: string;
  buyer_id: string;
  last_message_at: string;
  is_read_by_seller: boolean;
  buyer_name?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export function ProfileChat({ userId, chatEnabled }: ProfileChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchConversations();
      subscribeToMessages();
    }
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("seller_id", userId)
        .order("last_message_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark conversation as read
      await supabase
        .from("conversations")
        .update({ is_read_by_seller: true })
        .eq("id", conversationId);

      if (user) {
        // Mark messages as read
        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("conversation_id", conversationId)
          .neq("sender_id", user.id);

        // Mark associated notifications as read
        const { error: notifError } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .contains('metadata', { conversation_id: conversationId })
          .eq('is_read', false);

        if (notifError) {
          console.error('Error marking notifications as read:', notifError);
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages"
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (selectedConversation && newMsg.conversation_id === selectedConversation.id) {
            setMessages(prev => [...prev, newMsg]);
          }
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !userId) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedConversation.id,
        sender_id: userId,
        content: newMessage.trim()
      });

      if (error) throw error;

      // Update conversation last_message_at
      await supabase
        .from("conversations")
        .update({
          last_message_at: new Date().toISOString(),
          is_read_by_buyer: false
        })
        .eq("id", selectedConversation.id);

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  if (!chatEnabled) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquareOff className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Chat desativado</h3>
          <p className="text-muted-foreground mt-2">
            Ative o chat no topo da página para receber mensagens de compradores.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Sem mensagens</h3>
          <p className="text-muted-foreground mt-2">
            As mensagens de potenciais compradores aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
      {/* Conversations List */}
      <Card className={`lg:col-span-1 ${selectedConversation ? "hidden lg:block" : ""}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Conversas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => selectConversation(conversation)}
                className={`w-full p-4 text-left border-b border-border/50 hover:bg-muted/50 transition-colors ${selectedConversation?.id === conversation.id ? "bg-muted" : ""
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground truncate">
                        Comprador
                      </p>
                      {!conversation.is_read_by_seller && (
                        <Badge variant="default" className="ml-2">Nova</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Imóvel #{conversation.property_id}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(conversation.last_message_at), "dd MMM, HH:mm", { locale: pt })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className={`lg:col-span-2 ${!selectedConversation ? "hidden lg:flex lg:items-center lg:justify-center" : ""}`}>
        {selectedConversation ? (
          <>
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Comprador</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Imóvel #{selectedConversation.property_id}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-[500px]">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === userId ? "justify-end" : "justify-start"
                        }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${message.sender_id === userId
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                          }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.sender_id === userId
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                          }`}>
                          {format(new Date(message.created_at), "HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border/50">
                <div className="flex gap-2">
                  <Input
                    placeholder="Escreva uma mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    disabled={sendingMessage}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4" />
            <p>Selecione uma conversa para ver as mensagens</p>
          </div>
        )}
      </Card>
    </div>
  );
}
