import { useState } from "react";
import { Mail, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const emailSchema = z.string().trim().email("Email inválido").max(255);

const interestOptions = [
  { id: "comprador", label: "Comprador" },
  { id: "vendedor", label: "Vendedor" },
  { id: "prestador", label: "Prestador de Serviços" },
] as const;

export const WaitlistForm = () => {
  const [email, setEmail] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast({
        title: "Email inválido",
        description: parsed.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (selectedInterests.length === 0) {
      toast({
        title: "Selecione pelo menos uma opção",
        description: "Indique-nos o seu interesse para podermos personalizar a sua experiência.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const templateData = {
        email: parsed.data,
        interest_types: selectedInterests,
        source: "auth_waitlist",
      };

      // Admin notification
      const { error: adminError } = await supabase.from("email_queue").insert({
        recipient_email: "info@imoponto.pt",
        template_key: "waitlist_signup",
        template_data: templateData,
        status: "pending",
      });

      if (adminError) throw adminError;

      // User confirmation
      const { error: userError } = await supabase.from("email_queue").insert({
        recipient_email: parsed.data,
        template_key: "waitlist_confirmation",
        template_data: templateData,
        status: "pending",
      });

      if (userError) throw userError;

      setIsSubmitted(true);
      toast({
        title: "Inscrição registada! 🎉",
        description: "Será dos primeiros a saber quando abrirmos as portas.",
      });
    } catch (error) {
      console.error("Erro ao registar na lista de espera:", error);
      toast({
        title: "Erro ao registar",
        description: "Não foi possível registar o seu interesse. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Está na lista! 🎉</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Obrigado pelo interesse. Entraremos em contacto assim que o ImoPonto estiver disponível para si.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Seja dos primeiros a usar o ImoPonto
        </h3>
        <p className="text-sm text-muted-foreground">
          Estamos quase a abrir portas. Deixe o seu email e seja notificado em primeira mão — com acesso antecipado e vantagens exclusivas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tenho interesse como:</Label>
          <div className="space-y-2">
            {interestOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={selectedInterests.includes(option.id)}
                  onCheckedChange={() => toggleInterest(option.id)}
                />
                <span className="text-sm font-medium text-foreground">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="waitlist-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="waitlist-email"
              type="email"
              placeholder="seu@email.com"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              A registar...
            </>
          ) : (
            "Quero ser dos primeiros"
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Ao submeter, concorda com a nossa{" "}
          <a href="/politica-privacidade" className="text-primary hover:underline">
            Política de Privacidade
          </a>.
        </p>
      </form>
    </div>
  );
};
