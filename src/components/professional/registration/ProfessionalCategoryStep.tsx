import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Scale, Landmark, CreditCard, Zap, Camera, Building2 } from "lucide-react";

interface ProfessionalCategoryStepProps {
  value: string;
  onChange: (value: string) => void;
}

const categories = [
  {
    id: "advogado",
    label: "Advogado",
    icon: Scale,
    requiresInsurance: true,
  },
  {
    id: "notario",
    label: "Notário",
    icon: Landmark,
    requiresInsurance: false,
  },
  {
    id: "solicitador",
    label: "Solicitador",
    icon: Landmark,
    requiresInsurance: false,
  },
  {
    id: "intermediario_credito",
    label: "Intermediário de Crédito",
    icon: CreditCard,
    requiresInsurance: true,
  },
  {
    id: "consultor_financeiro",
    label: "Consultor Financeiro",
    icon: CreditCard,
    requiresInsurance: false,
  },
  {
    id: "contabilista",
    label: "Contabilista",
    icon: CreditCard,
    requiresInsurance: false,
  },
  {
    id: "certificacao_energetica",
    label: "Técnico de Certificação Energética",
    icon: Zap,
    requiresInsurance: true,
  },
  {
    id: "avaliador",
    label: "Avaliador Imobiliário",
    icon: Building2,
    requiresInsurance: false,
  },
  {
    id: "engenheiro",
    label: "Engenheiro Civil",
    icon: Building2,
    requiresInsurance: false,
  },
  {
    id: "arquiteto",
    label: "Arquiteto",
    icon: Building2,
    requiresInsurance: false,
  },
  {
    id: "fotografo",
    label: "Fotógrafo Profissional",
    icon: Camera,
    requiresInsurance: false,
  },
  {
    id: "videomaker",
    label: "Videomaker",
    icon: Camera,
    requiresInsurance: false,
  },
  {
    id: "home_staging",
    label: "Home Staging",
    icon: Camera,
    requiresInsurance: false,
  },
  {
    id: "marketing_digital",
    label: "Marketing Digital",
    icon: Camera,
    requiresInsurance: false,
  },
];

export function ProfessionalCategoryStep({ value, onChange }: ProfessionalCategoryStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Confirmo que a minha atividade principal na plataforma será exercida na seguinte categoria profissional:
        </h3>
        <p className="text-sm text-muted-foreground">
          A seleção é obrigatória e ficará associada ao seu perfil profissional.
        </p>
      </div>

      <RadioGroup value={value} onValueChange={onChange} className="grid gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.id} className="flex items-center space-x-3">
              <RadioGroupItem value={category.id} id={category.id} />
              <Label
                htmlFor={category.id}
                className="flex items-center gap-3 cursor-pointer flex-1 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium">{category.label}</span>
                {category.requiresInsurance && (
                  <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full ml-auto">
                    Seguro RC obrigatório
                  </span>
                )}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}

export function getCategoryLabel(id: string): string {
  return categories.find((c) => c.id === id)?.label || id;
}

export function requiresInsurance(categoryId: string): boolean {
  return categories.find((c) => c.id === categoryId)?.requiresInsurance || false;
}

export function getCategoryMapping(categoryId: string): { category: string; serviceType: string } {
  const mappings: Record<string, { category: string; serviceType: string }> = {
    advogado: { category: "juridico", serviceType: "Advogado Imobiliário" },
    notario: { category: "juridico", serviceType: "Notário" },
    solicitador: { category: "juridico", serviceType: "Solicitador" },
    intermediario_credito: { category: "financeiro", serviceType: "Intermediário de Crédito" },
    consultor_financeiro: { category: "financeiro", serviceType: "Consultor Financeiro" },
    contabilista: { category: "financeiro", serviceType: "Contabilista" },
    certificacao_energetica: { category: "tecnico", serviceType: "Certificação Energética" },
    avaliador: { category: "tecnico", serviceType: "Avaliador Imobiliário" },
    engenheiro: { category: "tecnico", serviceType: "Engenheiro Civil" },
    arquiteto: { category: "tecnico", serviceType: "Arquiteto" },
    fotografo: { category: "marketing", serviceType: "Fotógrafo Profissional" },
    videomaker: { category: "marketing", serviceType: "Videomaker" },
    home_staging: { category: "marketing", serviceType: "Home Staging" },
    marketing_digital: { category: "marketing", serviceType: "Marketing Digital" },
  };
  return mappings[categoryId] || { category: "tecnico", serviceType: categoryId };
}
