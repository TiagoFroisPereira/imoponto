import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, AlertTriangle } from "lucide-react";

interface Declaration {
  id: string;
  text: string;
}

const declarations: Declaration[] = [
  {
    id: "independente",
    text: "Declaro que atuo como profissional independente, não existindo qualquer vínculo laboral, societário ou de representação com a Imoponto.",
  },
  {
    id: "habilitado",
    text: "Declaro que sou legalmente habilitado para exercer a atividade profissional selecionada, encontrando-me devidamente registado na entidade reguladora competente (quando aplicável).",
  },
  {
    id: "informacoes",
    text: "Declaro que todas as informações fornecidas no meu perfil são verdadeiras, atuais e completas.",
  },
  {
    id: "responsabilidade",
    text: "Declaro que assumo total e exclusiva responsabilidade pelos serviços que presto, incluindo atos praticados, pareceres emitidos, documentos analisados ou certificados produzidos.",
  },
  {
    id: "imoponto_nao_valida",
    text: "Declaro que compreendo que a Imoponto não valida, não supervisiona e não responde pela qualidade, legalidade ou resultado dos serviços por mim prestados.",
  },
  {
    id: "legislacao",
    text: "Declaro que cumprirei toda a legislação aplicável à minha atividade profissional, bem como as normas da respetiva ordem, entidade reguladora ou autoridade competente.",
  },
  {
    id: "relacao_autonoma",
    text: "Declaro que compreendo que qualquer relação contratual estabelecida com utilizadores da plataforma é autónoma e não envolve a Imoponto.",
  },
  {
    id: "termos",
    text: "Aceito integralmente os Termos de Prestação de Serviços Profissionais e os Termos e Condições da Plataforma Imoponto.",
  },
];

interface ProfessionalFinalDeclarationsProps {
  acceptedDeclarations: Record<string, boolean>;
  onDeclarationChange: (id: string, checked: boolean) => void;
}

export function ProfessionalFinalDeclarations({
  acceptedDeclarations,
  onDeclarationChange,
}: ProfessionalFinalDeclarationsProps) {
  const allAccepted = declarations.every((d) => acceptedDeclarations[d.id] === true);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Declarações Legais Obrigatórias
          </h3>
          <p className="text-sm text-muted-foreground">
            Confirme todas as declarações para ativar o seu perfil
          </p>
        </div>
      </div>

      <ScrollArea className="h-[350px] border border-border/50 rounded-lg p-4">
        <div className="space-y-4 pr-4">
          {declarations.map((declaration, index) => (
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
          <div className="space-y-1">
            <p className="text-sm font-medium text-destructive">Aviso Legal</p>
            <p className="text-sm text-destructive/90">
              A prestação de informações falsas, enganosas ou não verificáveis poderá
              resultar na remoção imediata do perfil, suspensão da conta e eventual
              atuação legal nos termos da lei aplicável.
            </p>
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div
        className={`p-3 rounded-lg text-sm font-medium text-center ${
          allAccepted
            ? "bg-accent/10 text-accent border border-accent/20"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {allAccepted
          ? "✓ Todas as declarações aceites"
          : `${Object.values(acceptedDeclarations).filter(Boolean).length} de ${declarations.length} declarações aceites`}
      </div>
    </div>
  );
}

export function areAllDeclarationsAccepted(
  acceptedDeclarations: Record<string, boolean>
): boolean {
  return declarations.every((d) => acceptedDeclarations[d.id] === true);
}

export function getDeclarationIds(): string[] {
  return declarations.map((d) => d.id);
}
