import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Building2,
  CheckCircle,
  XCircle,
  CalendarX,
  CalendarCheck,
  Bell,
} from "lucide-react";
import { format, formatDistanceToNow, startOfDay } from "date-fns";
import { pt } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

interface MyVisitsAgendaProps {
  userId?: string;
}

interface VisitorBooking {
  id: string;
  property_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  notes: string | null;
  created_at: string;
}

export function MyVisitsAgenda({ userId }: MyVisitsAgendaProps) {
  const [bookings, setBookings] = useState<VisitorBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    const fetchBookings = async () => {
      try {
        const { data, error } = await supabase
          .from("visit_bookings")
          .select("id, property_id, scheduled_date, scheduled_time, status, notes, created_at")
          .eq("visitor_id", userId)
          .order("scheduled_date", { ascending: true });

        if (error) {
          console.error("Error fetching visitor bookings:", error);
          return;
        }
        setBookings(data || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    // Realtime subscription
    const channel = supabase
      .channel("my-visits")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "visit_bookings",
          filter: `visitor_id=eq.${userId}`,
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const today = startOfDay(new Date());
  const pendingBookings = bookings.filter(b => b.status === "pending");
  const confirmedBookings = bookings.filter(
    b => b.status === "confirmed" && new Date(b.scheduled_date) >= today
  );
  const pastBookings = bookings.filter(
    b => b.status === "cancelled" || (b.status !== "pending" && new Date(b.scheduled_date) < today)
  );

  if (bookings.length === 0) {
    return (
      <div className="py-12 text-center">
        <CalendarX className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Sem visitas agendadas</h3>
        <p className="text-muted-foreground mt-2">
          As visitas que agendar aparecerão aqui.
        </p>
      </div>
    );
  }

  const BookingCard = ({ booking, type }: { booking: VisitorBooking; type: "pending" | "confirmed" | "past" }) => {
    const isPending = type === "pending";
    const isConfirmed = type === "confirmed";

    return (
      <div
        className={`
          relative flex items-start gap-3 p-3 sm:p-4 rounded-lg border transition-all cursor-pointer
          ${isPending ? "bg-amber-500/5 border-amber-500/20 border-l-4 border-l-amber-500" : ""}
          ${isConfirmed ? "bg-green-500/5 border-green-500/20 border-l-4 border-l-green-500" : ""}
          ${type === "past" ? "bg-muted/30 border-muted opacity-80" : ""}
        `}
        onClick={() => navigate(`/imovel/${booking.property_id}`)}
      >
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          ${isPending ? "bg-amber-500/10" : ""}
          ${isConfirmed ? "bg-green-500/10" : ""}
          ${type === "past" ? "bg-muted" : ""}
        `}>
          {isPending && <Bell className="w-5 h-5 text-amber-600" />}
          {isConfirmed && <CalendarCheck className="w-5 h-5 text-green-600" />}
          {type === "past" && <Calendar className="w-5 h-5 text-muted-foreground" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isPending && (
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                <Clock className="w-3 h-3 mr-1" />
                Aguarda confirmação
              </Badge>
            )}
            {isConfirmed && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                <CheckCircle className="w-3 h-3 mr-1" />
                Confirmada
              </Badge>
            )}
            {type === "past" && booking.status === "cancelled" && (
              <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                <XCircle className="w-3 h-3 mr-1" />
                Cancelada
              </Badge>
            )}
            {type === "past" && booking.status !== "cancelled" && (
              <Badge variant="secondary">Passada</Badge>
            )}
          </div>

          <div className="mt-2 space-y-1.5">
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{format(new Date(booking.scheduled_date), "d 'de' MMMM 'de' yyyy", { locale: pt })} às {booking.scheduled_time.slice(0, 5)}</span>
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Ver imóvel →</span>
            </p>
          </div>

          {booking.notes && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              {booking.notes}
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true, locale: pt })}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Pending */}
      {pendingBookings.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-600" />
            Aguardam Confirmação
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
              {pendingBookings.length}
            </Badge>
          </h3>
          <ScrollArea className="h-auto max-h-[400px]">
            <div className="space-y-3">
              {pendingBookings.map(b => (
                <BookingCard key={b.id} booking={b} type="pending" />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Confirmed */}
      {confirmedBookings.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-green-600" />
            Visitas Confirmadas
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
              {confirmedBookings.length}
            </Badge>
          </h3>
          <ScrollArea className="h-auto max-h-[400px]">
            <div className="space-y-3">
              {confirmedBookings.map(b => (
                <BookingCard key={b.id} booking={b} type="confirmed" />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Past */}
      {pastBookings.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Histórico
            <Badge variant="secondary">{pastBookings.length}</Badge>
          </h3>
          <ScrollArea className="h-auto max-h-[300px]">
            <div className="space-y-3">
              {pastBookings.map(b => (
                <BookingCard key={b.id} booking={b} type="past" />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
