import { useNavigate } from "react-router-dom";
import { Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import VaultConsentDialog from "../VaultConsentDialog";

interface VaultPaywallProps {
  showPaywall: boolean;
  needsConsent: boolean;
  propertyId: string;
  consentDialogOpen: boolean;
  setConsentDialogOpen: (open: boolean) => void;
}

export function VaultPaywall({
  showPaywall,
  needsConsent,
  propertyId,
  consentDialogOpen,
  setConsentDialogOpen,
}: VaultPaywallProps) {
  const navigate = useNavigate();

  if (!showPaywall && !needsConsent) return null;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-background/20 backdrop-blur-[2px] animate-in fade-in duration-500">
      {showPaywall ? (
        <div className="flex flex-col items-center justify-center text-center max-w-md p-8 bg-background border rounded-2xl shadow-xl animate-in zoom-in-95 duration-300">
          <div className="p-4 rounded-full bg-primary/10 mb-4 text-primary">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Cofre Digital Bloqueado</h3>
          <p className="text-muted-foreground mb-6">
            O Cofre Digital permite organizar e partilhar a documentação do seu imóvel com segurança total.
            Pode desbloquear esta funcionalidade para este imóvel ou aderir a um plano profissional.
          </p>
          <div className="flex flex-col gap-3 w-full">
            <Button onClick={() => navigate(`/checkout?type=addon&id=vault&propertyId=${propertyId}`)}>
              <Zap className="w-4 h-4 mr-2" />
              Desbloquear Funcionalidade (35€)
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/planos'}>
              Ver Planos Profissionais
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center max-w-md p-8 bg-background border rounded-2xl shadow-xl animate-in zoom-in-95 duration-300">
          <div className="p-4 rounded-full bg-primary/10 mb-4 text-primary">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Ativar Cofre Digital</h3>
          <p className="text-muted-foreground mb-6">
            Antes de utilizar o Cofre Digital, é necessário ler e aceitar os termos e avisos importantes.
          </p>
          <Button onClick={() => setConsentDialogOpen(true)} className="w-full">
            <Lock className="w-4 h-4 mr-2" />
            Ativar Cofre Digital
          </Button>
          <VaultConsentDialog
            propertyId={propertyId}
            open={consentDialogOpen}
            onOpenChange={setConsentDialogOpen}
          />
        </div>
      )}
    </div>
  );
}
