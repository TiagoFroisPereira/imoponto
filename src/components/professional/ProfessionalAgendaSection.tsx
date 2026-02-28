import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isSameDay, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  useProfessionalEvents,
  eventTypeLabels,
  eventTypeColors,
  confirmationLabels,
  type ProfessionalEvent,
  type ConfirmationStatus,
} from "@/hooks/useProfessionalEvents";
import { CreateEventDialog } from "./CreateEventDialog";
import { useAuth } from "@/hooks/useAuth";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Building2,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  MapPin,
  Users,
  Trash2,
} from "lucide-react";

interface ProfessionalAgendaSectionProps {
  professionalId: string;
  professionalCategory?: string;
}

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

export function ProfessionalAgendaSection({ professionalId, professionalCategory }: ProfessionalAgendaSectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    events,
    loading,
    createEvent,
    updateConfirmation,
    updateEventStatus,
    deleteEvent,
  } = useProfessionalEvents();

  const eventsForSelectedDate = events.filter(
    (event) => selectedDate && isSameDay(parseISO(event.event_date), selectedDate)
  );

  const datesWithEvents = events.map((event) => parseISO(event.event_date));

  const handleConfirmation = async (eventId: string, status: ConfirmationStatus) => {
    const success = await updateConfirmation(eventId, status);
    if (success) {
      toast({
        title: status === "confirmed" ? "Presença confirmada ✅" : "Presença recusada",
        description: status === "confirmed"
          ? "O organizador será notificado."
          : "O organizador será notificado da sua recusa.",
      });
    }
  };

  const handleDelete = async (eventId: string) => {
    const success = await deleteEvent(eventId);
    if (success) {
      toast({ title: "Evento eliminado" });
    }
  };

  const handleStatusChange = async (eventId: string, status: "completed" | "cancelled") => {
    const success = await updateEventStatus(eventId, status);
    if (success) {
      toast({ title: status === "completed" ? "Evento concluído ✅" : "Evento cancelado" });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Agenda 📅</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Gestão de reuniões, CPCV, escrituras e acompanhamento de processos. Partilhada com os intervenientes.
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Evento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
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

            {/* Upcoming events summary */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-2">Próximos eventos</p>
              <div className="space-y-1">
                {events
                  .filter((e) => e.status === "scheduled" && new Date(e.event_date) >= new Date())
                  .slice(0, 5)
                  .map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setSelectedDate(parseISO(e.event_date))}
                      className="w-full text-left text-xs p-1.5 rounded hover:bg-muted/50 flex items-center gap-2"
                    >
                      <Badge variant="outline" className={`text-[10px] px-1 py-0 ${eventTypeColors[e.event_type]}`}>
                        {eventTypeLabels[e.event_type].substring(0, 3)}
                      </Badge>
                      <span className="truncate flex-1">{e.title}</span>
                      <span className="text-muted-foreground">{format(parseISO(e.event_date), "dd/MM")}</span>
                    </button>
                  ))}
                {events.filter((e) => e.status === "scheduled" && new Date(e.event_date) >= new Date()).length === 0 && (
                  <p className="text-xs text-muted-foreground">Sem eventos futuros</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
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
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Sem eventos para esta data.</p>
                <Button variant="outline" size="sm" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Criar evento
                </Button>
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
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="outline" className={eventTypeColors[event.event_type]}>
                                {eventTypeLabels[event.event_type]}
                              </Badge>
                              <Badge variant="outline" className={status.className}>
                                {status.label}
                              </Badge>
                              {isCreator && (
                                <Badge variant="outline" className="text-xs">Organizador</Badge>
                              )}
                            </div>
                            <h3 className="font-semibold">{event.title}</h3>
                          </div>

                          {isCreator && event.status === "scheduled" && (
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                title="Concluir"
                                onClick={() => handleStatusChange(event.id, "completed")}
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                title="Cancelar"
                                onClick={() => handleStatusChange(event.id, "cancelled")}
                              >
                                <XCircle className="w-4 h-4 text-destructive" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                title="Eliminar"
                                onClick={() => handleDelete(event.id)}
                              >
                                <Trash2 className="w-4 h-4 text-muted-foreground" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Details */}
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
                          {!isCreator && event.creator_name && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <User className="w-4 h-4" />
                              <span>Organizado por {event.creator_name}</span>
                            </div>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-sm text-muted-foreground italic">{event.description}</p>
                        )}

                        {/* Participants */}
                        {event.participants && event.participants.length > 0 && (
                          <div className="pt-2 border-t">
                            <div className="flex items-center gap-1 mb-2">
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
                                    {p.role === "organizer" ? " (org)" : ""}
                                    {p.role !== "organizer" && ` · ${conf.label}`}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Confirmation Actions */}
                        {needsConfirmation && event.status === "scheduled" && (
                          <div className="pt-2 border-t flex gap-2">
                            <Button
                              size="sm"
                              className="gap-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleConfirmation(event.id, "confirmed")}
                            >
                              <CheckCircle className="w-3 h-3" />
                              Confirmar presença
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

                        {/* Show my confirmation status if already responded */}
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

      <CreateEventDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={createEvent}
        professionalCategory={professionalCategory}
      />
    </div>
  );
}
