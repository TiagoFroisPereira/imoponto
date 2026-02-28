import { useState } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, User, Mail, Phone, Loader2 } from "lucide-react";
import type { TimeSlot } from "./VisitScheduler";

interface BookVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyTitle: string;
  sellerId: string;
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
}

export function BookVisitDialog({
  open,
  onOpenChange,
  propertyId,
  propertyTitle,
  sellerId,
  selectedDate,
  selectedSlot,
}: BookVisitDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If no specific slot is selected, we proceed as a general inquiry
    // if (!selectedDate || !selectedSlot) {
    //   toast({
    //     title: "Erro",
    //     description: "Por favor selecione uma data e horário.",
    //     variant: "destructive"
    //   });
    //   return;
    // }

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Autenticação necessária",
          description: "Por favor faça login para agendar uma visita.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      let bookingId: string | undefined;

      // Only create booking if specific slot is selected
      if (selectedDate && selectedSlot) {
        // Format date for storage
        const formattedDate = format(selectedDate, "yyyy-MM-dd");

        // Create visit booking
        const { data: booking, error: bookingError } = await supabase
          .from('visit_bookings')
          .insert({
            property_id: propertyId,
            seller_id: sellerId,
            visitor_id: user.id,
            visitor_name: name,
            visitor_email: email,
            visitor_phone: phone,
            scheduled_date: formattedDate,
            scheduled_time: selectedSlot.time,
            notes: message || null,
            status: 'pending'
          })
          .select()
          .single();

        if (bookingError) {
          console.error('Error creating booking:', bookingError);
          throw bookingError;
        }
        bookingId = booking.id;
      }

      // Send standard scheduling message to seller
      const standardMessage = selectedDate && selectedSlot
        ? `Olá, tenho interesse no imóvel "${propertyTitle}" anunciado na Imoponto e gostaria de agendar uma visita para o dia ${format(selectedDate, "d 'de' MMMM", { locale: pt })} às ${selectedSlot.time}. Fico a aguardar disponibilidade. Obrigado(a).`
        : `Olá, tenho interesse no imóvel "${propertyTitle}" e gostaria de agendar uma visita. Por favor entre em contacto para combinarmos um horário. Obrigado(a).`;

      // Check if conversation exists, otherwise create it
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('property_id', propertyId)
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
        .single();

      let conversationId: string;

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            property_id: propertyId,
            buyer_id: user.id,
            seller_id: sellerId,
            property_title: propertyTitle
          })
          .select()
          .single();

        if (convError) {
          console.error('Error creating conversation:', convError);
        } else {
          conversationId = newConv.id;
        }
      }

      // Send the scheduling message
      if (conversationId!) {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: standardMessage,
          message_type: 'scheduling',
          is_archived: false
        });

        // Update conversation last_message_at
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversationId);
      }

      // Create in-app notification for the seller
      await supabase
        .from('notifications')
        .insert({
          user_id: sellerId,
          property_id: propertyId,
          type: 'visit_booking',
          title: selectedDate && selectedSlot ? 'Nova visita agendada!' : 'Solicitação de visita',
          message: selectedDate && selectedSlot
            ? `${name} agendou uma visita para "${propertyTitle}" no dia ${format(selectedDate, "d 'de' MMMM", { locale: pt })} às ${selectedSlot.time}.`
            : `${name} solicitou um agendamento de visita para "${propertyTitle}".`,
          metadata: {
            visitor_name: name,
            visitor_phone: phone,
            visitor_email: email,
            booking_id: bookingId
          }
        });

      if (selectedDate && selectedSlot) {
        toast({
          title: "Visita agendada com sucesso!",
          description: `A sua visita está marcada para ${format(selectedDate, "d 'de' MMMM", { locale: pt })} às ${selectedSlot.time}. O vendedor será notificado.`,
        });
      } else {
        toast({
          title: "Solicitação enviada!",
          description: "O vendedor irá receber a sua solicitação de agendamento.",
        });
      }

      onOpenChange(false);

      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro ao agendar visita",
        description: "Não foi possível agendar a visita. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {selectedDate && selectedSlot ? "Confirmar Visita" : "Solicitar Agendamento"}
          </DialogTitle>
          <DialogDescription>
            {selectedDate && selectedSlot
              ? "Preencha os seus dados para confirmar a visita ao imóvel"
              : "Entre em contacto para agendar uma visita a este imóvel"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selected date/time info */}
          {selectedDate && selectedSlot && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="font-medium text-foreground mb-2">{propertyTitle}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: pt })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {selectedSlot.time}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="O seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+351 912 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="message">Mensagem (opcional)</Label>
              <div className="relative mt-1">
                <Textarea
                  id="message"
                  placeholder="Alguma questão ou observação..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {selectedDate && selectedSlot ? "A agendar..." : "A enviar..."}
                </>
              ) : (
                selectedDate && selectedSlot ? "Confirmar Visita" : "Enviar Solicitação"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BookVisitDialog;
