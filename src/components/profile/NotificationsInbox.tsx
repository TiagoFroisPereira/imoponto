import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications, Notification, getNotificationTarget } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Bell,
  BellOff,
  Heart,
  Eye,
  Share2,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  UserPlus,
  Trash2,
  Check,
  Loader2,
  Building2,
  ExternalLink,
  Star,
  ShieldCheck,
  ShieldX,
  CreditCard,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

const notificationIcons: Record<Notification['type'], React.ReactNode> = {
  favorite: <Heart className="h-5 w-5 text-red-500" />,
  view: <Eye className="h-5 w-5 text-blue-500" />,
  share: <Share2 className="h-5 w-5 text-green-500" />,
  visit_booking: <Calendar className="h-5 w-5 text-orange-500" />,
  message: <MessageSquare className="h-5 w-5 text-purple-500" />,
  visit_confirmed: <CheckCircle className="h-5 w-5 text-green-500" />,
  visit_cancelled: <XCircle className="h-5 w-5 text-red-500" />,
  professional_added: <UserPlus className="h-5 w-5 text-indigo-500" />,
  review_request: <Star className="h-5 w-5 text-yellow-500" />,
  contact_accepted: <CheckCircle className="h-5 w-5 text-green-500" />,
  vault_access_approved: <CheckCircle className="h-5 w-5 text-green-500" />,
  contact_rejected: <XCircle className="h-5 w-5 text-red-500" />,
  vault_access_rejected: <XCircle className="h-5 w-5 text-red-500" />,
  buyer_vault_request: <Eye className="h-5 w-5 text-amber-500" />,
  buyer_vault_approved: <CheckCircle className="h-5 w-5 text-green-500" />,
  buyer_vault_rejected: <XCircle className="h-5 w-5 text-red-500" />,
  buyer_vault_paid: <CreditCard className="h-5 w-5 text-emerald-500" />,
  vault_upload: <Eye className="h-5 w-5 text-blue-500" />,
  vault_delete: <Trash2 className="h-5 w-5 text-red-500" />,
  vault_validated: <CheckCircle className="h-5 w-5 text-green-500" />,
  vault_rejected_doc: <XCircle className="h-5 w-5 text-red-500" />,
  vault_updated: <Eye className="h-5 w-5 text-blue-500" />,
  new_contact_request: <UserPlus className="h-5 w-5 text-blue-500" />,
  new_vault_access_request: <Eye className="h-5 w-5 text-amber-500" />,
};

const notificationTypeLabels: Record<Notification['type'], string> = {
  favorite: "Favoritos",
  view: "Visualizações",
  share: "Partilhas",
  visit_booking: "Visitas",
  message: "Mensagens",
  visit_confirmed: "Visitas Confirmadas",
  visit_cancelled: "Visitas Canceladas",
  professional_added: "Profissionais",
  review_request: "Avaliações",
  contact_accepted: "Pedidos Aceites",
  vault_access_approved: "Cofre Aprovado",
  contact_rejected: "Pedidos Recusados",
  vault_access_rejected: "Cofre Recusado",
  buyer_vault_request: "Pedido de Cofre",
  buyer_vault_approved: "Cofre Aprovado",
  buyer_vault_rejected: "Cofre Recusado",
  buyer_vault_paid: "Pagamento Cofre",
  vault_upload: "Documento Adicionado",
  vault_delete: "Documento Removido",
  vault_validated: "Documento Validado",
  vault_rejected_doc: "Documento Rejeitado",
  vault_updated: "Documento Atualizado",
  new_contact_request: "Novo Pedido",
  new_vault_access_request: "Pedido de Cofre",
};

interface NotificationsInboxProps {
  userId?: string;
}

export function NotificationsInbox({ userId }: NotificationsInboxProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification, refetch } = useNotifications();
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const handleMarkAllAsRead = async () => {
    setMarkingAllRead(true);
    await markAllAsRead();
    setMarkingAllRead(false);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    const target = getNotificationTarget(notification);
    navigate(target.path);
  };

  const handleBuyerVaultDecision = async (notification: Notification, approve: boolean) => {
    const metadata = notification.metadata || {};
    const buyerId = metadata.buyer_id;
    const propertyId = notification.property_id;

    if (!buyerId || !propertyId) {
      toast({ title: "Erro", description: "Dados insuficientes para processar o pedido.", variant: "destructive" });
      return;
    }

    setProcessingIds(prev => new Set(prev).add(notification.id));

    try {
      // Find the pending request
      const { data: requests, error: fetchError } = await supabase
        .from("vault_buyer_access")
        .select("id")
        .eq("property_id", propertyId)
        .eq("buyer_id", buyerId)
        .eq("status", "pending");

      if (fetchError || !requests || requests.length === 0) {
        toast({ title: "Erro", description: "Pedido não encontrado ou já processado.", variant: "destructive" });
        return;
      }

      const requestId = requests[0].id;
      const newStatus = approve ? "approved" : "rejected";

      const updateData: Record<string, any> = { status: newStatus };
      if (approve) {
        // Set 30-day expiry after payment
        // expires_at will be set when payment is confirmed
      }

      const { error: updateError } = await supabase
        .from("vault_buyer_access")
        .update(updateData)
        .eq("id", requestId);

      if (updateError) throw updateError;

      // Notify the buyer
      const notificationType = approve ? "buyer_vault_approved" : "buyer_vault_rejected";
      const notificationTitle = approve
        ? "Acesso ao cofre aprovado!"
        : "Pedido de acesso recusado";
      const notificationMessage = approve
        ? "O proprietário autorizou o acesso ao cofre digital. Para desbloquear, efetue o pagamento de €10."
        : "O pedido de acesso ao cofre digital foi recusado pelo proprietário.";

      await supabase.from("notifications").insert({
        user_id: buyerId,
        property_id: propertyId,
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        metadata: { request_id: requestId },
      });

      // Mark this notification as read
      await markAsRead(notification.id);

      toast({
        title: approve ? "Acesso autorizado" : "Pedido recusado",
        description: approve
          ? "O comprador será notificado para efetuar o pagamento."
          : "O comprador foi notificado da recusa.",
      });

      refetch();
    } catch (error) {
      console.error("Error processing buyer vault decision:", error);
      toast({ title: "Erro", description: "Não foi possível processar o pedido.", variant: "destructive" });
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(notification.id);
        return next;
      });
    }
  };

  const filteredNotifications = filter === "unread" 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BellOff className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Sem notificações</h3>
          <p className="text-muted-foreground mt-2">
            As notificações sobre os seus imóveis aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Notificações</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAllAsRead}
            disabled={markingAllRead}
          >
            {markingAllRead ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
        <TabsList>
          <TabsTrigger value="all">
            Todas ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Não lidas ({unreadCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notifications list */}
      <Card>
        <ScrollArea className="h-[500px]">
          {filteredNotifications.length === 0 ? (
            <CardContent className="py-8 text-center">
              <CheckCircle className="w-10 h-10 mx-auto text-green-500 mb-3" />
              <p className="text-muted-foreground">Todas as notificações foram lidas!</p>
            </CardContent>
          ) : (
            <div className="divide-y divide-border">
              {filteredNotifications.map((notification) => {
                const isBuyerVaultRequest = notification.type === "buyer_vault_request";
                const isProcessing = processingIds.has(notification.id);

                return (
                  <div
                    key={notification.id}
                    className={`w-full p-4 transition-colors text-left group ${
                      !notification.is_read ? "bg-primary/5 border-l-2 border-l-primary" : ""
                    }`}
                  >
                    <button
                      onClick={() => !isBuyerVaultRequest && handleNotificationClick(notification)}
                      className={`w-full text-left ${isBuyerVaultRequest ? 'cursor-default' : 'hover:bg-muted/50 cursor-pointer'}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          !notification.is_read ? "bg-primary/10" : "bg-muted"
                        }`}>
                          {notificationIcons[notification.type] || <Bell className="h-5 w-5" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className={`font-medium text-foreground ${!notification.is_read ? "font-semibold" : ""}`}>
                              {notification.title}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {notificationTypeLabels[notification.type] || notification.type}
                            </Badge>
                            {!isBuyerVaultRequest && (
                              <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {notification.property_id && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                Imóvel
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), { 
                                addSuffix: true, 
                                locale: pt 
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        {!isBuyerVaultRequest && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                title="Marcar como lida"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Buyer Vault Request: Approve/Reject buttons */}
                    {isBuyerVaultRequest && (
                      <div className="mt-3 ml-14 flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuyerVaultDecision(notification, true);
                          }}
                          disabled={isProcessing}
                          className="gap-1"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ShieldCheck className="h-4 w-4" />
                          )}
                          Permitir Acesso
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuyerVaultDecision(notification, false);
                          }}
                          disabled={isProcessing}
                          className="gap-1"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ShieldX className="h-4 w-4" />
                          )}
                          Negar Acesso
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}
