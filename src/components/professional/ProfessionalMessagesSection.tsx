import { MessagesInbox } from "@/components/profile/MessagesInbox";
import { MessageSquare, Info } from "lucide-react";

interface ProfessionalMessagesSectionProps {
  userId?: string;
  onRead?: () => void;
}

export function ProfessionalMessagesSection({ userId, onRead }: ProfessionalMessagesSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Mensagens 💬</h1>
      </div>

      {/* Info box explaining chat access rules */}
      <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Comunicação após validação
            </p>
            <p className="text-sm text-muted-foreground">
              O chat só existe quando há uma relação validada: pedido de serviço aceite, 
              acesso autorizado ao cofre digital, ou atribuição a um anúncio.
              Sem aceitação, não existe canal de comunicação.
            </p>
          </div>
        </div>
      </div>

      <MessagesInbox userId={userId} onRead={onRead} />
    </div>
  );
}
