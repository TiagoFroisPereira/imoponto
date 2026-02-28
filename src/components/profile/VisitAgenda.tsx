import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  CalendarX,
  Bell,
  CalendarCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow, startOfDay } from "date-fns";
import { pt } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VisitAgendaProps {
  userId?: string;
  filter?: 'pending' | 'confirmed' | 'all';
  propertyId?: string;
}

interface VisitBooking {
  id: string;
  property_id: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_email: string | null;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  notes: string | null;
  created_at: string;
}

export function VisitAgenda({ userId, filter = 'all', propertyId }: VisitAgendaProps) {
  const [bookings, setBookings] = useState<VisitBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBookings = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      let query = supabase
        .from("visit_bookings")
        .select("*")
        .eq("seller_id", userId);

      if (propertyId) {
        query = query.eq("property_id", propertyId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [userId, propertyId]);

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      const { error } = await supabase
        .from("visit_bookings")
        .update({ status })
        .eq("id", bookingId);

      if (error) throw error;

      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status } : b
      ));

      // Create notification for the visitor
      const { data: visitor } = await supabase
        .from("visit_bookings")
        .select("visitor_id")
        .eq("id", bookingId)
        .single();

      if (visitor?.visitor_id) {
        const notificationType = status === "confirmed" ? "visit_confirmed" : "visit_cancelled";
        const notificationTitle = status === "confirmed" ? "Visita confirmada!" : "Visita cancelada";
        const notificationMessage = status === "confirmed"
          ? `A sua visita agendada para ${format(new Date(booking.scheduled_date), "d 'de' MMMM", { locale: pt })} às ${booking.scheduled_time.slice(0, 5)} foi confirmada.`
          : `A sua visita agendada para ${format(new Date(booking.scheduled_date), "d 'de' MMMM", { locale: pt })} às ${booking.scheduled_time.slice(0, 5)} foi cancelada.`;

        await supabase
          .from("notifications")
          .insert({
            user_id: visitor.visitor_id,
            property_id: booking.property_id,
            type: notificationType,
            title: notificationTitle,
            message: notificationMessage,
            metadata: {
              booking_id: bookingId,
              scheduled_date: booking.scheduled_date,
              scheduled_time: booking.scheduled_time
            }
          });
      }

      toast({
        title: status === "confirmed" ? "Visita confirmada" : "Visita cancelada",
        description: status === "confirmed"
          ? "O visitante será notificado"
          : "O visitante será notificado do cancelamento"
      });
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a visita",
        variant: "destructive"
      });
    }
  };

  // Separate bookings by status
  const pendingBookings = bookings.filter(b => b.status === "pending");
  const confirmedBookings = bookings.filter(b => b.status === "confirmed" && new Date(b.scheduled_date) >= startOfDay(new Date()));
  const cancelledOrPastBookings = bookings.filter(b =>
    b.status === "cancelled" || (b.status !== "pending" && new Date(b.scheduled_date) < startOfDay(new Date()))
  );

  // Apply filter
  const showPending = filter === 'all' || filter === 'pending';
  const showConfirmed = filter === 'all' || filter === 'confirmed';
  const showHistory = filter === 'all';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Empty state for filtered views
  if (filter === 'pending' && pendingBookings.length === 0) {
    return (
      <div className="py-12 text-center">
        <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Sem pedidos pendentes</h3>
        <p className="text-muted-foreground mt-2">
          Novos pedidos de visita aparecerão aqui.
        </p>
      </div>
    );
  }

  if (filter === 'confirmed' && confirmedBookings.length === 0) {
    return (
      <div className="py-12 text-center">
        <CalendarCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Sem visitas confirmadas</h3>
        <p className="text-muted-foreground mt-2">
          As visitas confirmadas aparecerão aqui.
        </p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="py-12 text-center">
        <CalendarX className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Sem visitas agendadas</h3>
        <p className="text-muted-foreground mt-2">
          As marcações de visita aparecerão aqui.
        </p>
      </div>
    );
  }

  const NotificationItem = ({
    booking,
    type
  }: {
    booking: VisitBooking;
    type: 'pending' | 'confirmed' | 'past';
  }) => {
    const isPending = type === 'pending';
    const isConfirmed = type === 'confirmed';

    return (
      <div
        className={`
          relative flex items-start gap-3 p-3 sm:p-4 rounded-lg border transition-all
          ${isPending ? 'bg-amber-500/5 border-amber-500/20 border-l-4 border-l-amber-500' : ''}
          ${isConfirmed ? 'bg-green-500/5 border-green-500/20 border-r-4 border-r-green-500' : ''}
          ${type === 'past' ? 'bg-muted/30 border-muted opacity-80' : ''}
        `}
      >
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          ${isPending ? 'bg-amber-500/10' : ''}
          ${isConfirmed ? 'bg-green-500/10' : ''}
          ${type === 'past' ? 'bg-muted' : ''}
        `}>
          {isPending && <Bell className="w-5 h-5 text-amber-600" />}
          {isConfirmed && <CalendarCheck className="w-5 h-5 text-green-600" />}
          {type === 'past' && <Calendar className="w-5 h-5 text-muted-foreground" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isPending && (
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                <Clock className="w-3 h-3 mr-1" />
                Pedido de visita
              </Badge>
            )}
            {isConfirmed && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                <CheckCircle className="w-3 h-3 mr-1" />
                Confirmada
              </Badge>
            )}
            {type === 'past' && booking.status === 'cancelled' && (
              <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                <XCircle className="w-3 h-3 mr-1" />
                Cancelada
              </Badge>
            )}
            {type === 'past' && booking.status !== 'cancelled' && (
              <Badge variant="secondary">Passada</Badge>
            )}
          </div>

          <p className="font-medium text-foreground text-sm">
            {isPending ? 'Novo pedido de visita' : 'Visita agendada'}
          </p>

          <div className="mt-2 space-y-1.5">
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{format(new Date(booking.scheduled_date), "d 'de' MMMM", { locale: pt })} às {booking.scheduled_time.slice(0, 5)}</span>
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{booking.visitor_name}</span>
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{booking.visitor_phone}</span>
            </p>
            {booking.visitor_email && (
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{booking.visitor_email}</span>
              </p>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true, locale: pt })}
          </p>

          {/* Action buttons for pending */}
          {isPending && (
            <div className="flex flex-col xs:flex-row gap-2 mt-4">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 w-full xs:w-auto"
                onClick={() => updateBookingStatus(booking.id, "confirmed")}
              >
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Confirmar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-red-500/30 text-red-600 hover:bg-red-500/10 w-full xs:w-auto"
                onClick={() => updateBookingStatus(booking.id, "cancelled")}
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Recusar
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Pending Requests - Left border amber */}
      {showPending && pendingBookings.length > 0 && (
        <div>
          {filter === 'all' && (
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-600" />
              Pedidos de Visita
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                {pendingBookings.length}
              </Badge>
            </h2>
          )}
          <ScrollArea className="h-auto max-h-[60vh] sm:max-h-[500px]">
            <div className="space-y-3 sm:pr-4">
              {pendingBookings.map((booking) => (
                <NotificationItem key={booking.id} booking={booking} type="pending" />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Confirmed Visits - Right border green */}
      {showConfirmed && confirmedBookings.length > 0 && (
        <div>
          {filter === 'all' && (
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-green-600" />
              Visitas Confirmadas
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                {confirmedBookings.length}
              </Badge>
            </h2>
          )}
          <ScrollArea className="h-auto max-h-[60vh] sm:max-h-[500px]">
            <div className="space-y-3 sm:pr-4">
              {confirmedBookings.map((booking) => (
                <NotificationItem key={booking.id} booking={booking} type="confirmed" />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Past/Cancelled Visits */}
      {showHistory && cancelledOrPastBookings.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Histórico
            <Badge variant="secondary">{cancelledOrPastBookings.length}</Badge>
          </h2>
          <ScrollArea className="h-auto max-h-[40vh] sm:max-h-[300px]">
            <div className="space-y-3 sm:pr-4">
              {cancelledOrPastBookings.map((booking) => (
                <NotificationItem key={booking.id} booking={booking} type="past" />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Empty state for all view */}
      {filter === 'all' && pendingBookings.length === 0 && confirmedBookings.length === 0 && (
        <div className="py-8 text-center border rounded-lg bg-muted/20">
          <CalendarCheck className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Sem visitas pendentes ou confirmadas</p>
        </div>
      )}
    </div>
  );
}
