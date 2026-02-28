import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Shield, UserCheck } from "lucide-react";
import { getCategoryLabel } from "./ProfessionalCategoryStep";

interface ProfessionalDeclarationsStepProps {
  selectedCategory: string;
  requiresInsurance: boolean;
  insuranceAccepted: boolean;
  autonomy1Accepted: boolean;
  autonomy2Accepted: boolean;
  onInsuranceChange: (checked: boolean) => void;
  onAutonomy1Change: (checked: boolean) => void;
  onAutonomy2Change: (checked: boolean) => void;
}

export function ProfessionalDeclarationsStep({
  selectedCategory,
  requiresInsurance,
  insuranceAccepted,
  autonomy1Accepted,
  autonomy2Accepted,
  onInsuranceChange,
  onAutonomy1Change,
  onAutonomy2Change,
}: ProfessionalDeclarationsStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Declarações Obrigatórias
        </h3>
        <p className="text-sm text-muted-foreground">
          Categoria selecionada: <strong className="text-foreground">{getCategoryLabel(selectedCategory)}</strong>
        </p>
      </div>

      {/* Insurance Declaration - Only for specific categories */}
      {requiresInsurance && (
        <div className="p-4 border border-accent/30 bg-accent/5 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            <span className="font-medium text-foreground">
              Declaração de Seguro de Responsabilidade Civil
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            A sua categoria profissional exige legalmente um seguro de responsabilidade civil válido.
          </p>
          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="insurance"
              checked={insuranceAccepted}
              onCheckedChange={(checked) => onInsuranceChange(checked === true)}
            />
            <label
              htmlFor="insurance"
              className="text-sm leading-relaxed cursor-pointer"
            >
              Declaro que possuo seguro de responsabilidade civil profissional válido, 
              conforme exigido pela legislação e/ou entidade reguladora aplicável à minha atividade.
            </label>
          </div>
          <p className="text-xs text-muted-foreground italic">
            A Imoponto não solicita, gere ou valida o seguro. A responsabilidade é exclusivamente do profissional.
          </p>
        </div>
      )}

      {/* Autonomy Declarations */}
      <div className="p-4 border border-border/50 bg-muted/30 rounded-lg space-y-4">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary" />
          <span className="font-medium text-foreground">
            Declaração de Autonomia Profissional
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="autonomy1"
              checked={autonomy1Accepted}
              onCheckedChange={(checked) => onAutonomy1Change(checked === true)}
            />
            <label
              htmlFor="autonomy1"
              className="text-sm leading-relaxed cursor-pointer"
            >
              Declaro que exerço a minha atividade profissional de forma totalmente autónoma, 
              definindo honorários, prazos, métodos de trabalho e condições contratuais sem 
              qualquer intervenção, controlo ou orientação da Imoponto.
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="autonomy2"
              checked={autonomy2Accepted}
              onCheckedChange={(checked) => onAutonomy2Change(checked === true)}
            />
            <label
              htmlFor="autonomy2"
              className="text-sm leading-relaxed cursor-pointer"
            >
              Reconheço que a Imoponto não presta serviços profissionais, não intermedeia 
              negócios e não interfere na execução dos serviços contratados entre as partes.
            </label>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-destructive">
              Aviso Legal
            </p>
            <p className="text-sm text-destructive/90">
              A prestação de informações falsas, enganosas ou não verificáveis poderá resultar 
              na remoção imediata do perfil, suspensão da conta e eventual atuação legal nos 
              termos da lei aplicável.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
