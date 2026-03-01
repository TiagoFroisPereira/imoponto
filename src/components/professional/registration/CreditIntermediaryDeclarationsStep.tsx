import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreditCard, AlertTriangle } from "lucide-react";

interface CreditDeclaration {
  id: string;
  text: string;
}

const creditDeclarations: CreditDeclaration[] = [
  {
    id: "credit_reg_banco_portugal",
    text: "Declaro que me encontro devidamente registado no Banco de Portugal como Intermediário de Crédito.",
  },
  {
    id: "credit_reg_active",
    text: "Declaro que o meu registo se encontra ativo e válido.",
  },
  {
    id: "credit_scope_authorized",
    text: "Declaro que atuo dentro do âmbito autorizado pelo meu registo.",
  },
  {
    id: "credit_insurance_rc",
    text: "Declaro que possuo seguro de responsabilidade civil profissional válido, conforme exigido legalmente.",
  },
  {
    id: "credit_autonomy",
    text: "Declaro que organizo a minha atividade profissional de forma autónoma, definindo honorários, prazos e condições sem qualquer intervenção da Imoponto.",
  },
  {
    id: "credit_dl_compliance",
    text: "Declaro que cumpro integralmente o Decreto-Lei n.º 81-C/2017 e demais legislação aplicável.",
  },
];

interface CreditIntermediaryDeclarationsStepProps {
  acceptedDeclarations: Record<string, boolean>;
  onDeclarationChange: (id: string, checked: boolean) => void;
}

export function CreditIntermediaryDeclarationsStep({
  acceptedDeclarations,
  onDeclarationChange,
}: CreditIntermediaryDeclarationsStepProps) {
  const allAccepted = creditDeclarations.every(
    (d) => acceptedDeclarations[d.id] === true
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Declarações Específicas — Intermediário de Crédito
          </h3>
          <p className="text-sm text-muted-foreground">
            Conforme Decreto-Lei n.º 81-C/2017, regulado pelo Banco de Portugal
          </p>
        </div>
      </div>

      <div className="p-3 bg-muted/30 rounded-lg border border-border/50 text-sm text-muted-foreground">
        <p>
          A atividade de intermediação de crédito em Portugal encontra-se regulada pelo{" "}
          <strong className="text-foreground">Decreto-Lei n.º 81-C/2017</strong> e
          supervisionada pelo <strong className="text-foreground">Banco de Portugal</strong>.
          A Imoponto não exerce atividade de intermediação de crédito.
        </p>
      </div>

      <ScrollArea className="h-[280px] border border-border/50 rounded-lg p-4">
        <div className="space-y-4 pr-4">
          {creditDeclarations.map((declaration, index) => (
            <div
              key={declaration.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
            >
              <Checkbox
                id={declaration.id}
                checked={acceptedDeclarations[declaration.id] === true}
                onCheckedChange={(checked) =>
                  onDeclarationChange(declaration.id, checked === true)
                }
                className="mt-0.5"
              />
              <label
                htmlFor={declaration.id}
                className="text-sm leading-relaxed cursor-pointer flex-1"
              >
                <span className="text-muted-foreground mr-2">{index + 1}.</span>
                {declaration.text}
              </label>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Warning */}
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive/90">
            A prestação de declarações falsas implica remoção imediata da plataforma.
          </p>
        </div>
      </div>

      {/* Status */}
      <div
        className={`p-3 rounded-lg text-sm font-medium text-center ${
          allAccepted
            ? "bg-accent/10 text-accent border border-accent/20"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {allAccepted
          ? "✓ Todas as declarações aceites"
          : `${Object.values(acceptedDeclarations).filter(Boolean).length} de ${creditDeclarations.length} declarações aceites`}
      </div>
    </div>
  );
}

export function areAllCreditDeclarationsAccepted(
  acceptedDeclarations: Record<string, boolean>
): boolean {
  return creditDeclarations.every((d) => acceptedDeclarations[d.id] === true);
}

export function getCreditDeclarationIds(): string[] {
  return creditDeclarations.map((d) => d.id);
}
