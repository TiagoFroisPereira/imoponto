import { useState } from "react";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { pt } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Clock,
  Plus,
  X,
  Check,
  Info
} from "lucide-react";

export interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
}

export interface AvailableDay {
  date: Date;
  slots: TimeSlot[];
}

interface VisitSchedulerProps {
  availableDays: AvailableDay[];
  onAvailabilityChange: (days: AvailableDay[]) => void;
  mode: "edit" | "view" | "create";
  onBookSlot?: (date: Date, slot: TimeSlot) => void;
}

const defaultTimeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30"
];

export function VisitScheduler({
  availableDays,
  onAvailabilityChange,
  mode,
  onBookSlot
}: VisitSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  const getAvailabilityForDate = (date: Date): AvailableDay | undefined => {
    return availableDays.find(day => isSameDay(day.date, date));
  };

  const hasAvailability = (date: Date): boolean => {
    const day = getAvailabilityForDate(date);
    return day ? day.slots.some(slot => slot.isAvailable) : false;
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setShowTimeSlots(true);
    }
  };

  const handleAddDay = () => {
    if (!selectedDate) return;

    const existingDay = getAvailabilityForDate(selectedDate);
    if (existingDay) {
      // Day already exists, show time slots
      setShowTimeSlots(true);
      return;
    }

    // Add new day with all time slots UNAVAILABLE by default - seller must select which ones to enable
    const newDay: AvailableDay = {
      date: startOfDay(selectedDate),
      slots: defaultTimeSlots.map(time => ({
        id: `${selectedDate.toISOString()}-${time}`,
        time,
        isAvailable: false
      }))
    };

    onAvailabilityChange([...availableDays, newDay].sort((a, b) => a.date.getTime() - b.date.getTime()));
    setShowTimeSlots(true);
  };

  const handleRemoveDay = (date: Date) => {
    onAvailabilityChange(availableDays.filter(day => !isSameDay(day.date, date)));
    if (selectedDate && isSameDay(selectedDate, date)) {
      setShowTimeSlots(false);
    }
  };

  const handleToggleSlot = (date: Date, slotId: string) => {
    onAvailabilityChange(
      availableDays.map(day => {
        if (isSameDay(day.date, date)) {
          return {
            ...day,
            slots: day.slots.map(slot =>
              slot.id === slotId
                ? { ...slot, isAvailable: !slot.isAvailable }
                : slot
            )
          };
        }
        return day;
      })
    );
  };

  const handleBookSlot = (date: Date, slot: TimeSlot) => {
    if (onBookSlot && slot.isAvailable) {
      onBookSlot(date, slot);
    }
  };

  const selectedDayData = selectedDate ? getAvailabilityForDate(selectedDate) : undefined;

  // Custom day content to show availability indicators
  const modifiers = {
    available: availableDays.filter(d => hasAvailability(d.date)).map(d => d.date),
    scheduled: availableDays.map(d => d.date)
  };

  const modifiersStyles = {
    available: {
      backgroundColor: "hsl(var(--primary) / 0.1)",
      color: "hsl(var(--primary))",
      fontWeight: "600"
    },
    scheduled: {
      border: "2px solid hsl(var(--primary))"
    }
  };

  console.log('VisitScheduler mode:', mode, 'availableDays:', availableDays);

  if (mode === "view") {
    // Filter days that have at least one available slot AND aren't in the past
    const now = new Date();
    const daysWithAvailability = availableDays.map(day => {
      // Create a filtered list of slots for this day
      const futureAvailableSlots = day.slots.filter(slot => {
        if (!slot.isAvailable) return false;

        // Parse slot time
        const [hours, minutes] = slot.time.split(':').map(Number);
        const slotDate = new Date(day.date);
        slotDate.setHours(hours, minutes, 0, 0);

        // Keep if slot is in the future
        return slotDate > now;
      });

      return {
        ...day,
        slots: futureAvailableSlots
      };
    }).filter(day => day.slots.length > 0);

    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Agendar Visita
          </h3>
          <p className="text-sm text-muted-foreground">
            Escolha um dos horários disponíveis para visitar o imóvel
          </p>
        </div>

        <div className="space-y-4">
          {daysWithAvailability.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>O vendedor ainda não definiu horários disponíveis.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {daysWithAvailability.map(day => {
                const availableSlots = day.slots.filter(slot => slot.isAvailable);
                return (
                  <div key={day.date.toISOString()} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <h4 className="font-medium text-foreground capitalize">
                        {format(day.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt })}
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableSlots.map(slot => (
                        <Button
                          key={slot.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleBookSlot(day.date, slot)}
                          className="hover:bg-primary hover:text-primary-foreground"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Disponibilidade para Visitas
        </CardTitle>
        <CardDescription>
          Defina os dias e horários em que está disponível para receber visitas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-2 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground mb-1">
              Como funciona?
            </p>
            <p className="text-muted-foreground">
              Selecione um dia no calendário e adicione-o à sua agenda.
              Depois pode escolher quais horários ficam disponíveis para visitas.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="space-y-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => {
                const today = startOfDay(new Date());
                return date < today;
              }}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              locale={pt}
              className="rounded-lg border p-3 pointer-events-auto mx-auto sm:mx-0 w-fit shrink-0"
            />

            {selectedDate && !getAvailabilityForDate(selectedDate) && (
              <Button
                onClick={handleAddDay}
                className="w-full"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar {format(selectedDate, "d 'de' MMMM", { locale: pt })}
              </Button>
            )}
          </div>

          {/* Time Slots */}
          <div className="space-y-4">
            {showTimeSlots && selectedDate && selectedDayData ? (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">
                    {format(selectedDate, "EEEE, d 'de' MMMM", { locale: pt })}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemoveDay(selectedDate)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remover dia
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  Clique nos horários para ativar/desativar disponibilidade:
                </p>

                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2">
                  {selectedDayData.slots.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => handleToggleSlot(selectedDate, slot.id)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                        slot.isAvailable
                          ? "bg-primary/10 border-primary text-primary hover:bg-primary/20"
                          : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {slot.isAvailable && <Check className="h-3 w-3 inline mr-1" />}
                      {slot.time}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary/10 border border-primary" />
                    <span>Disponível</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-muted border border-border" />
                    <span>Indisponível</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Selecione um dia no calendário para definir os horários disponíveis</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary of scheduled days */}
        {availableDays.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Dias com disponibilidade ({availableDays.length})</h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {availableDays.map(day => {
                const availableSlots = day.slots.filter(s => s.isAvailable).length;
                return (
                  <Badge
                    key={day.date.toISOString()}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 text-[10px] sm:text-xs py-1 px-2"
                    onClick={() => {
                      setSelectedDate(day.date);
                      setShowTimeSlots(true);
                    }}
                  >
                    {format(day.date, "d MMM", { locale: pt })}
                    <span className="ml-1 text-muted-foreground">
                      ({availableSlots})
                    </span>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default VisitScheduler;
