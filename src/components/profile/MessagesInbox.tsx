import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMessaging, useConversationMessages, ConversationWithDetails, ParticipantInfo } from "@/hooks/useMessaging";
import { VisitMessageActions } from "@/components/profile/VisitMessageActions";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MessageSquare,
  MessageSquareOff,
  Send,
  User,
  Briefcase,
  Calendar,
  Clock,
  ArrowLeft,
  MoreVertical,
  Mail,
  MailOpen,
  Archive,
  ArchiveRestore,
  Trash2,
  Building2,
  ShieldCheck,
  XCircle,
  CheckSquare,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

interface MessagesInboxProps {
  userId?: string;
  propertyId?: string;
  onRead?: () => void;
}

export function MessagesInbox({ userId, propertyId, onRead }: MessagesInboxProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    conversations,
    archivedConversations,
    loading,
    totalUnread,
    currentUserId,
    sendMessage,
    markAsRead,
    markAsUnread,
    archiveConversation,
    unarchiveConversation,
    deleteConversation,
    deleteMessages,
  } = useMessaging();

  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<"inbox" | "archived">("inbox");
  const [filterPropertyId, setFilterPropertyId] = useState<string | undefined>(propertyId);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
  const [deletingMessages, setDeletingMessages] = useState(false);
  const [chatSelectionMode, setChatSelectionMode] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState<Set<string>>(new Set());
  const [deletingChats, setDeletingChats] = useState(false);

  // Sync internal filter with propertyId prop
  useEffect(() => {
    setFilterPropertyId(propertyId);
  }, [propertyId]);

  const displayedConversations = (activeTab === "inbox" ? conversations : archivedConversations)
    .filter(c => !filterPropertyId || c.property_id === filterPropertyId);

  // Filtered counts for tabs
  const inboxCount = conversations.filter(c => !filterPropertyId || c.property_id === filterPropertyId).length;
  const archivedCount = archivedConversations.filter(c => !filterPropertyId || c.property_id === filterPropertyId).length;

  const handleClearFilter = () => {
    setFilterPropertyId(undefined);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('propertyId');
    if (!newParams.get('tab')) {
      newParams.set('tab', 'messages');
    }
    setSearchParams(newParams);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, loading: messagesLoading, refetch: refetchMessages } = useConversationMessages(
    selectedConversation?.id || null
  );

  // Handle conversation selection from URL param
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.length > 0) {
      const targetConversation = conversations.find(c => c.id === conversationId);
      if (targetConversation) {
        handleSelectConversation(targetConversation);
        // Clean up the URL param after selecting
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('conversation');
        setSearchParams(newParams, { replace: true });
      } else {
        // Check archived conversations
        const archivedTarget = archivedConversations.find(c => c.id === conversationId);
        if (archivedTarget) {
          setActiveTab("archived");
          handleSelectConversation(archivedTarget);
          // Clean up the URL param after selecting
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('conversation');
          setSearchParams(newParams, { replace: true });
        }
      }
    }
  }, [searchParams, conversations, archivedConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-select first matching conversation when filtering by property
  useEffect(() => {
    if (filterPropertyId && displayedConversations.length > 0 && !selectedConversation) {
      handleSelectConversation(displayedConversations[0]);
    }
  }, [filterPropertyId, displayedConversations, selectedConversation]);

  const handleSelectConversation = async (conversation: ConversationWithDetails) => {
    setSelectedConversation(conversation);
    // Mark all unread messages as read when opening conversation
    if (conversation.unread_count > 0) {
      await markAsRead(conversation.id);
      onRead?.();
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSendingMessage(true);
    await sendMessage(selectedConversation.id, newMessage.trim());
    await refetchMessages();
    setNewMessage("");
    setSendingMessage(false);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(prev => !prev);
    setSelectedMessageIds(new Set());
  };

  const toggleMessageSelection = (messageId: string) => {
    setSelectedMessageIds(prev => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedMessageIds.size === messages.length) {
      setSelectedMessageIds(new Set());
    } else {
      setSelectedMessageIds(new Set(messages.map(m => m.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedMessageIds.size === 0) return;
    setDeletingMessages(true);
    const success = await deleteMessages(Array.from(selectedMessageIds));
    if (success) {
      setSelectedMessageIds(new Set());
      setSelectionMode(false);
      await refetchMessages();
    }
    setDeletingMessages(false);
  };

  // Chat selection handlers
  const toggleChatSelectionMode = () => {
    setChatSelectionMode(prev => !prev);
    setSelectedChatIds(new Set());
  };

  const toggleChatSelection = (chatId: string) => {
    setSelectedChatIds(prev => {
      const next = new Set(prev);
      if (next.has(chatId)) {
        next.delete(chatId);
      } else {
        next.add(chatId);
      }
      return next;
    });
  };

  const handleSelectAllChats = () => {
    if (selectedChatIds.size === displayedConversations.length) {
      setSelectedChatIds(new Set());
    } else {
      setSelectedChatIds(new Set(displayedConversations.map(c => c.id)));
    }
  };

  const handleDeleteSelectedChats = async () => {
    if (selectedChatIds.size === 0) return;
    setDeletingChats(true);
    for (const chatId of selectedChatIds) {
      await deleteConversation(chatId);
    }
    setSelectedChatIds(new Set());
    setChatSelectionMode(false);
    setSelectedConversation(null);
    setDeletingChats(false);
  };

  const getSenderIcon = (conversation: ConversationWithDetails) => {
    if (conversation.other_participant?.is_professional) {
      return <Briefcase className="w-5 h-5 text-indigo-500" />;
    }
    if (conversation.last_message?.message_type === 'scheduling') {
      return <Calendar className="w-5 h-5 text-orange-500" />;
    }
    return <User className="w-5 h-5 text-primary" />;
  };

  const getFormattedParticipantName = (participant: ParticipantInfo | null): {
    displayName: string;
    badge: string | null;
    isVerified: boolean;
  } => {
    if (!participant) {
      return {
        displayName: "Perfil incompleto",
        badge: null,
        isVerified: false
      };
    }

    if (participant.is_professional) {
      // Format: "Profissional • Área + Nome"
      const areaLabel = participant.professional_area || "Serviços";
      return {
        displayName: participant.name,
        badge: `Profissional • ${areaLabel}`,
        isVerified: participant.is_verified
      };
    }

    // Regular user - just show name
    return {
      displayName: participant.name,
      badge: null,
      isVerified: false
    };
  };
  const handleNavigateToParticipant = (conversation: ConversationWithDetails, e: React.MouseEvent) => {
    e.stopPropagation();
    const participant = conversation.other_participant;
    if (participant?.is_professional && participant.professional_id) {
      navigate(`/profissional/${participant.professional_id}`);
    } else if (conversation.property_id) {
      navigate(`/imovel/${conversation.property_id}`);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (conversations.length === 0 && archivedConversations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquareOff className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Sem mensagens</h3>
          <p className="text-muted-foreground mt-2">
            As mensagens de compradores e profissionais aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Specific empty state for property filter
  if (filterPropertyId && displayedConversations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquareOff className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Nenhuma conversa</h3>
          <p className="text-muted-foreground mt-2">
            Ainda não existem conversas relacionadas com este imóvel.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={handleClearFilter}
          >
            Ver todas as mensagens
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Mensagens</h2>
          {totalUnread > 0 && (
            <Badge variant="destructive" className="ml-2">
              {totalUnread} não lida{totalUnread > 1 ? 's' : ''}
            </Badge>
          )}
          {filterPropertyId && displayedConversations.length > 0 && (
            <Badge variant="outline" className="ml-2 border-primary text-primary">
              Filtrado por imóvel
              <Button
                variant="ghost"
                size="icon"
                className="h-3 w-3 ml-1 p-0 hover:bg-transparent"
                onClick={handleClearFilter}
              >
                <XCircle className="h-3 w-3" />
                <span className="sr-only">Limpar</span>
              </Button>
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs for Inbox and Archived - Only show if archived results exist for the filter or we are not in a limited view */}
      {(archivedCount > 0 || activeTab === "archived") && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "inbox" | "archived")}>
          <TabsList>
            <TabsTrigger value="inbox" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Caixa de Entrada ({inboxCount})
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Arquivadas ({archivedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)] md:h-[600px]">
        {/* Conversations List */}
        <Card className={`lg:col-span-1 ${selectedConversation ? "hidden lg:block" : ""}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {activeTab === "inbox" ? "Conversas" : "Arquivadas"}
              </CardTitle>
              <Button
                variant={chatSelectionMode ? "default" : "ghost"}
                size="sm"
                onClick={toggleChatSelectionMode}
                className="gap-2"
              >
                <CheckSquare className="w-4 h-4" />
                {chatSelectionMode ? "Cancelar" : "Selecionar"}
              </Button>
            </div>
            {chatSelectionMode && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllChats}
                    className="text-xs"
                  >
                    {selectedChatIds.size === displayedConversations.length ? "Desselecionar tudo" : "Selecionar tudo"}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {selectedChatIds.size} de {displayedConversations.length}
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelectedChats}
                  disabled={selectedChatIds.size === 0 || deletingChats}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {deletingChats ? "..." : `(${selectedChatIds.size})`}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {displayedConversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {activeTab === "inbox" ? "Sem mensagens" : "Sem mensagens arquivadas"}
                </div>
              ) : (
                displayedConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`relative border-b border-border/50 ${selectedConversation?.id === conversation.id ? "bg-muted" : ""
                        } ${conversation.unread_count > 0 && selectedConversation?.id !== conversation.id ? "bg-primary/10 border-l-4 border-l-primary" : ""
                        } ${chatSelectionMode && selectedChatIds.has(conversation.id) ? "ring-2 ring-primary ring-inset" : ""}`}
                    >
                    <div className="flex items-start">
                      {chatSelectionMode && (
                        <div className="flex-shrink-0 pl-4 pt-5">
                          <Checkbox
                            checked={selectedChatIds.has(conversation.id)}
                            onCheckedChange={() => toggleChatSelection(conversation.id)}
                          />
                        </div>
                      )}
                    <button
                      onClick={() => chatSelectionMode ? toggleChatSelection(conversation.id) : handleSelectConversation(conversation)}
                      className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${conversation.unread_count > 0 ? "bg-primary/20" : "bg-muted"
                          }`}>
                          {getSenderIcon(conversation)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <p
                                className={`font-medium text-foreground truncate cursor-pointer hover:underline hover:text-primary transition-colors ${conversation.unread_count > 0 ? "font-bold" : ""}`}
                                onClick={(e) => handleNavigateToParticipant(conversation, e)}
                              >
                                {getFormattedParticipantName(conversation.other_participant).displayName}
                              </p>
                              {getFormattedParticipantName(conversation.other_participant).isVerified && (
                                <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                              )}
                            </div>
                            {conversation.unread_count > 0 && (
                              <Badge variant="default" className="ml-auto flex-shrink-0">
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                          {getFormattedParticipantName(conversation.other_participant).badge && (
                            <p className="text-xs text-indigo-600 font-medium mt-0.5 flex items-center gap-1">
                              <Briefcase className="w-3 h-3 flex-shrink-0" />
                              {getFormattedParticipantName(conversation.other_participant).badge}
                            </p>
                          )}
                          {conversation.property_title && (
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                              <Building2 className="w-3 h-3 flex-shrink-0" />
                              {conversation.property_title}
                            </p>
                          )}
                          {conversation.last_message && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {conversation.last_message.content.length > 60
                                ? `${conversation.last_message.content.substring(0, 60)}...`
                                : conversation.last_message.content}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {conversation.last_message_at && formatDistanceToNow(
                              new Date(conversation.last_message_at),
                              { addSuffix: true, locale: pt }
                            )}
                          </p>
                        </div>
                      </div>
                    </button>
                    </div>

                    {/* Actions Menu - hide in selection mode */}
                    {!chatSelectionMode && (
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {conversation.unread_count === 0 ? (
                              <DropdownMenuItem onClick={() => markAsUnread(conversation.id)}>
                                <Mail className="h-4 w-4 mr-2" />
                                Marcar como não lida
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => markAsRead(conversation.id)}>
                                <MailOpen className="h-4 w-4 mr-2" />
                                Marcar como lida
                              </DropdownMenuItem>
                            )}
                            {activeTab === "inbox" ? (
                              <DropdownMenuItem onClick={() => archiveConversation(conversation.id)}>
                                <Archive className="h-4 w-4 mr-2" />
                                Arquivar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => unarchiveConversation(conversation.id)}>
                                <ArchiveRestore className="h-4 w-4 mr-2" />
                                Restaurar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => deleteConversation(conversation.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages Panel */}
        <Card className={`lg:col-span-2 ${!selectedConversation ? "hidden lg:flex lg:items-center lg:justify-center" : ""}`}>
          {selectedConversation ? (
            <>
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden"
                      onClick={() => { setSelectedConversation(null); setSelectionMode(false); setSelectedMessageIds(new Set()); }}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedConversation.unread_count > 0 ? "bg-primary/20" : "bg-muted"
                      }`}>
                      {getSenderIcon(selectedConversation)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle
                          className="text-lg cursor-pointer hover:underline hover:text-primary transition-colors"
                          onClick={(e) => handleNavigateToParticipant(selectedConversation, e)}
                        >
                          {getFormattedParticipantName(selectedConversation.other_participant).displayName}
                        </CardTitle>
                        {getFormattedParticipantName(selectedConversation.other_participant).isVerified && (
                          <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      {getFormattedParticipantName(selectedConversation.other_participant).badge && (
                        <p className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {getFormattedParticipantName(selectedConversation.other_participant).badge}
                          {getFormattedParticipantName(selectedConversation.other_participant).isVerified && (
                            <span className="text-green-600 ml-1">• Verificado</span>
                          )}
                        </p>
                      )}
                      {selectedConversation.property_title && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" />
                          {selectedConversation.property_title}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Selection mode toggle */}
                  <Button
                    variant={selectionMode ? "default" : "ghost"}
                    size="sm"
                    onClick={toggleSelectionMode}
                    className="gap-2"
                  >
                    <CheckSquare className="w-4 h-4" />
                    {selectionMode ? "Cancelar" : "Selecionar"}
                  </Button>
                </div>

                {/* Selection toolbar */}
                {selectionMode && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        className="text-xs"
                      >
                        {selectedMessageIds.size === messages.length ? "Desselecionar tudo" : "Selecionar tudo"}
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {selectedMessageIds.size} de {messages.length} selecionada{messages.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteSelected}
                      disabled={selectedMessageIds.size === 0 || deletingMessages}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deletingMessages ? "A eliminar..." : `Eliminar (${selectedMessageIds.size})`}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[500px]">
                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex items-start gap-2 ${message.sender_id === currentUserId ? "justify-end" : "justify-start"
                            }`}
                        >
                          {/* Checkbox on the left for received messages in selection mode */}
                          {selectionMode && message.sender_id !== currentUserId && (
                            <div className="flex-shrink-0 mt-2">
                              <Checkbox
                                checked={selectedMessageIds.has(message.id)}
                                onCheckedChange={() => toggleMessageSelection(message.id)}
                              />
                            </div>
                          )}
                          <div
                            className={`max-w-[75%] rounded-lg px-4 py-2 cursor-default ${
                              selectionMode && selectedMessageIds.has(message.id)
                                ? "ring-2 ring-primary ring-offset-1"
                                : ""
                            } ${message.sender_id === currentUserId
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                              }`}
                            onClick={selectionMode ? () => toggleMessageSelection(message.id) : undefined}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className={`text-xs mt-1 ${message.sender_id === currentUserId
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                              }`}>
                              {format(new Date(message.created_at), "dd MMM, HH:mm", { locale: pt })}
                            </p>
                            {message.message_type === 'scheduling' && selectedConversation && currentUserId && (
                              <VisitMessageActions
                                propertyId={selectedConversation.property_id}
                                buyerId={selectedConversation.buyer_id}
                                currentUserId={currentUserId}
                                sellerId={selectedConversation.seller_id}
                              />
                            )}
                          </div>
                          {/* Checkbox on the right for sent messages in selection mode */}
                          {selectionMode && message.sender_id === currentUserId && (
                            <div className="flex-shrink-0 mt-2">
                              <Checkbox
                                checked={selectedMessageIds.has(message.id)}
                                onCheckedChange={() => toggleMessageSelection(message.id)}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                <div className="p-4 border-t border-border/50">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Escreva uma mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      disabled={sendingMessage}
                    />
                    <Button
                      onClick={handleSendMessage}
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
    </div>
  );
}
