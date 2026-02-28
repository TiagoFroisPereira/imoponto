import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNotifications, type Notification, getNotificationTarget } from "@/hooks/useNotifications";
import { useMessaging } from "@/hooks/useMessaging";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Bell,
  Heart,
  Eye,
  Share2,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  Check,
  Trash2,
  Loader2,
  UserPlus,
  ExternalLink,
  Star,
  ShieldCheck,
  ShieldX,
  CreditCard,
} from "lucide-react";

const notificationIcons: Record<Notification['type'], React.ReactNode> = {
  favorite: <Heart className="h-4 w-4 text-rose-500" />,
  view: <Eye className="h-4 w-4 text-blue-500" />,
  share: <Share2 className="h-4 w-4 text-green-500" />,
  visit_booking: <Calendar className="h-4 w-4 text-orange-500" />,
  message: <MessageSquare className="h-4 w-4 text-purple-500" />,
  visit_confirmed: <CheckCircle className="h-4 w-4 text-green-500" />,
  visit_cancelled: <XCircle className="h-4 w-4 text-red-500" />,
  professional_added: <UserPlus className="h-4 w-4 text-indigo-500" />,
  review_request: <Star className="h-4 w-4 text-yellow-500" />,
  contact_accepted: <CheckCircle className="h-4 w-4 text-green-500" />,
  vault_access_approved: <CheckCircle className="h-4 w-4 text-green-500" />,
  contact_rejected: <XCircle className="h-4 w-4 text-red-500" />,
  vault_access_rejected: <XCircle className="h-4 w-4 text-red-500" />,
  buyer_vault_request: <Eye className="h-4 w-4 text-amber-500" />,
  buyer_vault_approved: <CheckCircle className="h-4 w-4 text-green-500" />,
  buyer_vault_rejected: <XCircle className="h-4 w-4 text-red-500" />,
  buyer_vault_paid: <CreditCard className="h-4 w-4 text-emerald-500" />,
  vault_upload: <Eye className="h-4 w-4 text-blue-500" />,
  vault_delete: <Trash2 className="h-4 w-4 text-red-500" />,
  vault_validated: <CheckCircle className="h-4 w-4 text-green-500" />,
  vault_rejected_doc: <XCircle className="h-4 w-4 text-red-500" />,
  vault_updated: <Eye className="h-4 w-4 text-blue-500" />,
  new_contact_request: <UserPlus className="h-4 w-4 text-blue-500" />,
  new_vault_access_request: <Eye className="h-4 w-4 text-amber-500" />,
};

export function NotificationBell() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification, refetch } = useNotifications();
  const { totalUnread: messagesUnread } = useMessaging();
  const [open, setOpen] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const totalBadgeCount = Math.max(0, unreadCount) + Math.max(0, messagesUnread);

  const handleMarkAllAsRead = async () => {
    setMarkingAllRead(true);
    await markAllAsRead();
    setMarkingAllRead(false);
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Don't navigate for buyer_vault_request — handle inline
    if (notification.type === "buyer_vault_request") return;

    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    setOpen(false);
    const target = getNotificationTarget(notification);
    navigate(target.path);
  };

  const handleMessagesClick = () => {
    setOpen(false);
    navigate('/mensagens');
  };

  const handleDeleteClick = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const handleBuyerVaultDecision = async (e: React.MouseEvent, notification: Notification, approve: boolean) => {
    e.stopPropagation();
    const metadata = notification.metadata || {};
    const buyerId = metadata.buyer_id;
    const propertyId = notification.property_id;

    if (!buyerId || !propertyId) {
      toast({ title: "Erro", description: "Dados insuficientes para processar.", variant: "destructive" });
      return;
    }

    setProcessingIds(prev => new Set(prev).add(notification.id));

    try {
      const { data: requests } = await supabase
        .from("vault_buyer_access")
        .select("id")
        .eq("property_id", propertyId)
        .eq("buyer_id", buyerId)
        .eq("status", "pending");

      if (!requests || requests.length === 0) {
        toast({ title: "Erro", description: "Pedido não encontrado ou já processado.", variant: "destructive" });
        return;
      }

      const requestId = requests[0].id;
      const newStatus = approve ? "approved" : "rejected";

      const { error } = await supabase
        .from("vault_buyer_access")
        .update({ status: newStatus })
        .eq("id", requestId);

      if (error) throw error;

      // Notify buyer
      const notificationType = approve ? "buyer_vault_approved" : "buyer_vault_rejected";
      const notificationTitle = approve ? "Acesso ao cofre aprovado!" : "Pedido de acesso recusado";
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalBadgeCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalBadgeCount > 9 ? '9+' : totalBadgeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground">Notificações</h4>
            {messagesUnread > 0 && (
              <Badge variant="secondary" className="text-xs">
                {messagesUnread} msg
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={handleMarkAllAsRead}
              disabled={markingAllRead}
            >
              {markingAllRead ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Check className="h-3 w-3 mr-1" />
              )}
              Marcar como lidas
            </Button>
          )}
        </div>

        <ScrollArea className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-20">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 && messagesUnread === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sem notificações</p>
            </div>
          ) : (
            <div className="divide-y">
              {messagesUnread > 0 && (
                <button
                  onClick={handleMessagesClick}
                  className="w-full p-3 hover:bg-muted/50 transition-colors cursor-pointer bg-primary/5 text-left"
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <MessageSquare className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {messagesUnread} mensagen{messagesUnread > 1 ? 's' : ''} não lida{messagesUnread > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        Clique para ver as suas mensagens
                        <ExternalLink className="h-3 w-3" />
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                  </div>
                </button>
              )}

              {notifications.map((notification) => {
                const isBuyerVaultRequest = notification.type === "buyer_vault_request";
                const isProcessing = processingIds.has(notification.id);

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick(notification)}
                    className={`w-full p-3 transition-colors text-left group ${
                      isBuyerVaultRequest ? 'cursor-default' : 'hover:bg-muted/50 cursor-pointer'
                    } ${!notification.is_read ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {notificationIcons[notification.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notification.is_read ? 'font-medium' : ''}`}>
                            {notification.title}
                          </p>
                          {!isBuyerVaultRequest && (
                            <button
                              type="button"
                              className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100 inline-flex items-center justify-center rounded-md hover:bg-muted"
                              onClick={(e) => handleDeleteClick(e, notification.id)}
                            >
                              <Trash2 className="h-3 w-3 text-muted-foreground" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: pt
                          })}
                        </p>

                        {/* Inline approve/reject for buyer vault requests */}
                        {isBuyerVaultRequest && (
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              size="sm"
                              className="h-7 text-xs gap-1"
                              onClick={(e) => handleBuyerVaultDecision(e, notification, true)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <ShieldCheck className="h-3 w-3" />
                              )}
                              Permitir
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 text-xs gap-1"
                              onClick={(e) => handleBuyerVaultDecision(e, notification, false)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <ShieldX className="h-3 w-3" />
                              )}
                              Negar
                            </Button>
                          </div>
                        )}
                      </div>
                      {!notification.is_read && !isBuyerVaultRequest && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={handleMessagesClick}
          >
            Ver todas as mensagens
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
