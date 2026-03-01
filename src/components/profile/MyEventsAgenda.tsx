import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  useProfessionalEvents,
  eventTypeLabels,
  eventTypeColors,
  confirmationLabels,
  type ProfessionalEvent,
  type ConfirmationStatus,
} from "@/hooks/useProfessionalEvents";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Building2,
  CheckCircle,
  XCircle,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";

const statusConfig = {
  scheduled: { label: "Agendado", className: "bg-primary/10 text-primary border-primary/30" },
  completed: { label: "Concluído", className: "bg-green-500/10 text-green-700 border-green-500/30" },
  cancelled: { label: "Cancelado", className: "bg-red-500/10 text-red-700 border-red-500/30" },
};

const confirmationConfig: Record<ConfirmationStatus, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-amber-500/10 text-amber-700" },
  confirmed: { label: "Confirmado", className: "bg-green-500/10 text-green-700" },
  declined: { label: "Recusado", className: "bg-red-500/10 text-red-700" },
};

interface MyEventsAgendaProps {
  userId?: string;
}

export function MyEventsAgenda({ userId }: MyEventsAgendaProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  const { user } = useAuth();
  const { events, loading, updateConfirmation } = useProfessionalEvents();

  const eventsForSelectedDate = events.filter(
    (event) => selectedDate && isSameDay(parseISO(event.event_date), selectedDate)
  );

  const datesWithEvents = events.map((event) => parseISO(event.event_date));

  const handleConfirmation = async (eventId: string, status: ConfirmationStatus) => {
    try {
      await updateConfirmation(eventId, status);
      toast({
        title: status === "confirmed" ? "Presença confirmada ✅" : "Presença recusada",
      });
    } catch (e) {
      console.error("Error updating confirmation:", e);
    }
  };

  const getMyParticipation = (event: ProfessionalEvent) => {
    return event.participants?.find((p) => p.user_id === user?.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">Sem eventos agendados.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Os eventos criados por profissionais ou outros utilizadores aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardContent className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={pt}
            modifiers={{ hasEvent: datesWithEvents }}
            modifiersStyles={{
              hasEvent: {
                backgroundColor: "hsl(var(--primary) / 0.1)",
                color: "hsl(var(--primary))",
                fontWeight: "bold",
              },
            }}
            className="rounded-md"
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">
            {selectedDate
              ? format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt })
              : "Selecione uma data"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventsForSelectedDate.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Sem eventos para esta data.</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {eventsForSelectedDate.map((event) => {
                  const status = statusConfig[event.status];
                  const myParticipation = getMyParticipation(event);
                  const isCreator = event.created_by === user?.id;
                  const needsConfirmation =
                    myParticipation && !isCreator && myParticipation.confirmation_status === "pending";

                  return (
                    <div key={event.id} className="p-4 border border-border rounded-lg space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={eventTypeColors[event.event_type]}>
                          {eventTypeLabels[event.event_type]}
                        </Badge>
                        <Badge variant="outline" className={status.className}>
                          {status.label}
                        </Badge>
                      </div>

                      <h3 className="font-semibold">{event.title}</h3>

                      <div className="space-y-1 text-sm">
                        {event.event_time && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{event.event_time}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.property_title && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="w-4 h-4" />
                            <span>{event.property_title}</span>
                          </div>
                        )}
                        {event.creator_name && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="w-4 h-4" />
                            <span>Organizado por {event.creator_name}</span>
                          </div>
                        )}
                      </div>

                      {event.participants && event.participants.length > 0 && (
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-1 mb-1">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-medium">
                              Participantes ({event.participants.length})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {event.participants.map((p) => {
                              const conf = confirmationConfig[p.confirmation_status];
                              return (
                                <Badge key={p.id} variant="outline" className={`text-xs ${conf.className}`}>
                                  {p.user_name}
                                  {p.role !== "organizer" && ` · ${conf.label}`}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {needsConfirmation && event.status === "scheduled" && (
                        <div className="pt-2 border-t flex gap-2">
                          <Button
                            size="sm"
                            className="gap-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleConfirmation(event.id, "confirmed")}
                          >
                            <CheckCircle className="w-3 h-3" />
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-destructive"
                            onClick={() => handleConfirmation(event.id, "declined")}
                          >
                            <XCircle className="w-3 h-3" />
                            Recusar
                          </Button>
                        </div>
                      )}

                      {myParticipation && !isCreator && myParticipation.confirmation_status !== "pending" && event.status === "scheduled" && (
                        <div className="pt-2 border-t">
                          <Badge variant="outline" className={confirmationConfig[myParticipation.confirmation_status].className}>
                            A sua resposta: {confirmationLabels[myParticipation.confirmation_status]}
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
