import { MessageSquare, Calendar, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PropertyContactCardProps {
  price: number;
  propertyId: string;
  yearBuilt?: number | null;
  isAuthenticated: boolean;
  hasAvailableSlots: boolean;
  sellerHasVisitScheduling?: boolean;
  onSendMessage: () => void;
  onBookVisit: () => void;
  onRequestVisitSlot: () => void;
  onAuthRequired: () => void;
}

const formatPrice = (price: number) => `€ ${price.toLocaleString("pt-PT")}`;

export function PropertyContactCard({
  price,
  propertyId,
  yearBuilt,
  isAuthenticated,
  hasAvailableSlots,
  sellerHasVisitScheduling = true,
  onSendMessage,
  onBookVisit,
  onRequestVisitSlot,
  onAuthRequired,
}: PropertyContactCardProps) {
  const visitDisabled = !sellerHasVisitScheduling;

  return (
    <div className="sticky top-24 bg-card rounded-2xl border border-border p-6 space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Preço</p>
        <p className="text-3xl font-bold text-primary">{formatPrice(price)}</p>
      </div>

      <div className="space-y-3">
        <Button
          className="w-full"
          size="lg"
          onClick={() => {
            if (!isAuthenticated) {
              onAuthRequired();
              return;
            }
            onSendMessage();
          }}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Enviar Mensagem
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  disabled={visitDisabled}
                  onClick={() => {
                    if (visitDisabled) return;
                    if (!isAuthenticated) {
                      onAuthRequired();
                      return;
                    }
                    if (hasAvailableSlots) {
                      onRequestVisitSlot();
                    } else {
                      onBookVisit();
                    }
                  }}
                >
                  {visitDisabled ? (
                    <Lock className="w-4 h-4 mr-2" />
                  ) : (
                    <Calendar className="w-4 h-4 mr-2" />
                  )}
                  Marcar Visita
                </Button>
              </div>
            </TooltipTrigger>
            {visitDisabled && (
              <TooltipContent>
                <p>O vendedor não tem agenda de visitas ativa</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {yearBuilt && (
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">Ano de construção</p>
          <p className="font-medium text-foreground">{yearBuilt}</p>
        </div>
      )}

      <div className="pt-4 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          Referência: #{propertyId.slice(0, 8).toUpperCase()}
        </p>
      </div>
    </div>
  );
}
