import { Logs } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WizardProgress } from "@/components/property/wizard/WizardProgress";

interface PropertyOwnerBannerProps {
  wizardStep: number;
  onManageProcess: () => void;
}

export function PropertyOwnerBanner({ wizardStep, onManageProcess }: PropertyOwnerBannerProps) {
  return (
    <div className="mb-8 bg-card border border-primary/20 rounded-xl p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-full">
          <Logs className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Gestão de Venda</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">Estado atual:</span>
            <WizardProgress currentStep={wizardStep} />
          </div>
        </div>
      </div>
      <Button onClick={onManageProcess} className="w-full sm:w-auto">Gerir Processo</Button>
    </div>
  );
}
