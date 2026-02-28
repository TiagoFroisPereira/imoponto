import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMessaging } from "@/hooks/useMessaging";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Send, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyTitle: string;
  sellerId: string;
}

export function SendMessageDialog({
  open,
  onOpenChange,
  propertyId,
  propertyTitle,
  sellerId,
}: SendMessageDialogProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const { toast } = useToast();
  const { createConversationAndSendMessage } = useMessaging();

  // Check if user has a complete profile when dialog opens
  useEffect(() => {
    const checkProfile = async () => {
      if (!open) return;
      
      setCheckingProfile(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setProfileComplete(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        // Check if profile has a valid name (not empty, not just whitespace)
        const hasValidName = profile?.full_name && profile.full_name.trim().length > 0;
        setProfileComplete(!!hasValidName);
      } catch (error) {
        console.error('Error checking profile:', error);
        setProfileComplete(false);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkProfile();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast({
        title: "Mensagem vazia",
        description: "Por favor escreva uma mensagem",
        variant: "destructive",
      });
      return;
    }

    // Re-check profile before sending
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Precisa iniciar sessão para enviar mensagens",
        variant: "destructive",
      });
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (!profile?.full_name || profile.full_name.trim().length === 0) {
      toast({
        title: "Perfil incompleto",
        description: "Complete o seu perfil com o seu nome antes de enviar mensagens",
        variant: "destructive",
      });
      setProfileComplete(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createConversationAndSendMessage(
        propertyId,
        sellerId,
        message.trim(),
        propertyTitle,
        'buyer_to_seller'
      );

      if (result) {
        // Create notification for seller
        await supabase.from('notifications').insert({
          user_id: sellerId,
          property_id: propertyId,
          type: 'message',
          title: 'Nova mensagem!',
          message: `Recebeu uma nova mensagem sobre "${propertyTitle}"`,
          metadata: {
            sender_id: user.id,
            preview: message.trim().substring(0, 100)
          }
        });

        toast({
          title: "Mensagem enviada!",
          description: "O vendedor irá receber a sua mensagem",
        });

        setMessage("");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Enviar Mensagem
          </DialogTitle>
          <DialogDescription>
            Envie uma mensagem ao vendedor sobre o imóvel "{propertyTitle}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {checkingProfile ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : profileComplete === false ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Para enviar mensagens, precisa primeiro completar o seu perfil com o seu nome.
                Aceda ao menu "O Meu Perfil" para atualizar os seus dados.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Escreva a sua mensagem ao vendedor..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !message.trim() || profileComplete === false || checkingProfile}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  A enviar...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}