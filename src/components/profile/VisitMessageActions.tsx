import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface VisitMessageActionsProps {
  propertyId: string;
  buyerId: string;
  currentUserId: string;
  sellerId: string;
}

interface BookingInfo {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  visitor_id: string;
  visitor_name: string;
}

export function VisitMessageActions({
  propertyId,
  buyerId,
  currentUserId,
  sellerId,
}: VisitMessageActionsProps) {
  const [bookings, setBookings] = useState<BookingInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const isSeller = currentUserId === sellerId;

  useEffect(() => {
    fetchBookings();
  }, [propertyId, buyerId]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("visit_bookings")
        .select("id, scheduled_date, scheduled_time, status, visitor_id, visitor_name")
        .eq("property_id", propertyId)
        .eq("visitor_id", buyerId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching bookings:", error);
        return;
      }

      setBookings(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: "confirmed" | "cancelled") => {
    setUpdating(bookingId);
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      const { error } = await supabase
        .from("visit_bookings")
        .update({ status })
        .eq("id", bookingId);

      if (error) throw error;

      // Update local state
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));

      // Create notification for the visitor
      const notificationType = status === "confirmed" ? "visit_confirmed" : "visit_cancelled";
      const notificationTitle = status === "confirmed" ? "Visita confirmada! ✅" : "Visita cancelada ❌";
      const notificationMessage = status === "confirmed"
        ? `A sua visita agendada para ${format(new Date(booking.scheduled_date), "d 'de' MMMM", { locale: pt })} às ${booking.scheduled_time.slice(0, 5)} foi confirmada.`
        : `A sua visita agendada para ${format(new Date(booking.scheduled_date), "d 'de' MMMM", { locale: pt })} às ${booking.scheduled_time.slice(0, 5)} foi cancelada.`;

      await supabase
        .from("notifications")
        .insert({
          user_id: booking.visitor_id,
          property_id: propertyId,
          type: notificationType,
          title: notificationTitle,
          message: notificationMessage,
          metadata: {
            booking_id: bookingId,
            scheduled_date: booking.scheduled_date,
            scheduled_time: booking.scheduled_time,
          },
        });

      toast({
        title: status === "confirmed" ? "Visita confirmada" : "Visita cancelada",
        description: "O visitante será notificado",
      });
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a visita",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  if (loading || bookings.length === 0) return null;

  // Show only the most recent pending booking, or the latest booking status
  const pendingBooking = bookings.find(b => b.status === "pending");
  const latestBooking = pendingBooking || bookings[0];

  if (!latestBooking) return null;

  return (
    <div className="mt-2 p-2 rounded-md bg-background/50 border border-border/50">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Calendar className="w-3 h-3" />
        <span>
          {format(new Date(latestBooking.scheduled_date), "d 'de' MMMM", { locale: pt })}
        </span>
        <Clock className="w-3 h-3 ml-1" />
        <span>{latestBooking.scheduled_time.slice(0, 5)}</span>
      </div>

      {latestBooking.status === "pending" && isSeller ? (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="h-7 text-xs bg-green-600 hover:bg-green-700"
            onClick={() => updateBookingStatus(latestBooking.id, "confirmed")}
            disabled={updating === latestBooking.id}
          >
            {updating === latestBooking.id ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <CheckCircle className="w-3 h-3 mr-1" />
            )}
            Confirmar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs border-red-500/30 text-red-600 hover:bg-red-500/10"
            onClick={() => updateBookingStatus(latestBooking.id, "cancelled")}
            disabled={updating === latestBooking.id}
          >
            <XCircle className="w-3 h-3 mr-1" />
            Recusar
          </Button>
        </div>
      ) : (
        <Badge
          variant={latestBooking.status === "confirmed" ? "default" : latestBooking.status === "cancelled" ? "destructive" : "secondary"}
          className="text-xs"
        >
          {latestBooking.status === "confirmed" && <CheckCircle className="w-3 h-3 mr-1" />}
          {latestBooking.status === "cancelled" && <XCircle className="w-3 h-3 mr-1" />}
          {latestBooking.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
          {latestBooking.status === "confirmed" ? "Confirmada" : latestBooking.status === "cancelled" ? "Cancelada" : "Pendente"}
        </Badge>
      )}
    </div>
  );
}
