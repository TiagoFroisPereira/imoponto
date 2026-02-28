import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, Info } from "lucide-react";
import PropertyVault from "@/components/property/vault/PropertyVault";

interface StepVaultProps {
  propertyId?: string;
  propertyTitle: string;
  mode: 'create' | 'edit' | 'publish';
  hasVaultFeature: boolean;
  onSaveDraft: () => void;
  openPlanModal: (title: string, desc: string) => void;
}

const StepVault = ({ propertyId, propertyTitle, mode, hasVaultFeature, onSaveDraft, openPlanModal }: StepVaultProps) => {
  return (
    <Card className="relative overflow-hidden">
      {!hasVaultFeature && (
        <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
          <div className="p-4 rounded-full bg-primary/10 mb-4 text-primary">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Cofre Digital</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            O Cofre Digital é uma funcionalidade exclusiva dos planos Destaque e Premium Pro.
            Armazene documentos de forma segura e facilite o processo de venda.
          </p>
          <Button onClick={() => openPlanModal("Cofre Digital", "O Cofre Digital permite armazenar com segurança toda a documentação do imóvel. Faça upgrade para aceder a esta funcionalidade.")}>
            Fazer Upgrade
          </Button>
        </div>
      )}
      <CardHeader>
        <CardTitle>Cofre Digital</CardTitle>
        <CardDescription>Organize a documentação do seu imóvel com segurança</CardDescription>
      </CardHeader>
      <CardContent className={!hasVaultFeature ? "opacity-20 pointer-events-none select-none blur-[1px]" : ""}>
        {(mode === 'edit' || (mode === 'publish' && propertyId)) && propertyId ? (
          <PropertyVault propertyId={propertyId} propertyTitle={propertyTitle} />
        ) : (
          <div className="p-10 text-center border rounded-xl bg-muted/20">
            <Info className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Guarde o rascunho primeiro para poder adicionar documentos ao cofre digital.</p>
            <Button variant="outline" onClick={onSaveDraft} className="mt-4">Guardar Rascunho</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StepVault;
