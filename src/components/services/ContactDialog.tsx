import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ProfessionalWithReviews } from "@/hooks/useProfessionals";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professional: ProfessionalWithReviews;
}

export function ContactDialog({
  open,
  onOpenChange,
  professional,
}: ContactDialogProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Por favor, inicie sessão para contactar profissionais.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Mensagem em falta",
        description: "Por favor, escreva uma mensagem.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: contactError } = await supabase
        .from("contact_requests")
        .insert({
          professional_id: professional.id,
          user_id: user.id,
          message: message,
        });

      if (contactError) throw contactError;

      // Notify the professional about the new contact request
      if (professional.user_id) {
        await supabase.from("notifications").insert({
          user_id: professional.user_id,
          type: "new_contact_request",
          title: "Novo pedido de contacto!",
          message: `Recebeu um novo pedido de contacto.`,
          metadata: { requester_id: user.id },
        });
      }

      toast({
        title: "Mensagem enviada",
        description: `A sua mensagem foi enviada a ${professional.name}. Receberá uma resposta em breve.`,
      });
      onOpenChange(false);
      setMessage("");
    } catch (error) {
      console.error("Error submitting contact request:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar o pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contactar {professional.name}</DialogTitle>
          <DialogDescription>
            Envie uma mensagem ao profissional para um primeiro contacto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Descreva o que precisa..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="accent"
              className="flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4 mr-1" />
              Enviar Mensagem
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
