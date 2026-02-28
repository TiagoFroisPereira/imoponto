import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scale, AlertTriangle } from "lucide-react";

interface ProfessionalTermsStepProps {
  termsAccepted: boolean;
  onTermsChange: (checked: boolean) => void;
}

export function ProfessionalTermsStep({
  termsAccepted,
  onTermsChange,
}: ProfessionalTermsStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
          <Scale className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Termos de Prestação de Serviços Profissionais
          </h3>
          <p className="text-sm text-muted-foreground">
            Leia atentamente antes de aceitar
          </p>
        </div>
      </div>

      <ScrollArea className="h-[280px] border border-border/50 rounded-lg p-4">
        <div className="space-y-4 text-sm text-muted-foreground pr-4">
          <p className="text-foreground font-medium">
            Ao prosseguir com o registo na plataforma Imoponto, declara compreender e aceitar que:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <p>
                A <strong className="text-foreground">Imoponto é uma plataforma tecnológica</strong> que não presta 
                serviços profissionais, não supervisiona, não valida e não interfere na prestação dos serviços 
                por si oferecidos.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <p>
                Os serviços disponibilizados através da plataforma são prestados exclusivamente por si, 
                enquanto <strong className="text-foreground">profissional independente</strong>, estabelecendo-se 
                qualquer relação contratual diretamente entre si e o utilizador final.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <p>
                A <strong className="text-foreground">Imoponto não é parte</strong> em qualquer contrato de 
                prestação de serviços, não assume responsabilidade pelos atos praticados, pareceres emitidos, 
                documentos analisados ou resultados obtidos.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
              <p>
                A aceitação destes termos é <strong className="text-foreground">condição obrigatória</strong> para 
                a criação e manutenção do perfil profissional na plataforma.
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-4 mt-4">
            <p className="font-medium text-foreground mb-3">Exclusividade de Zona</p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
                <p>
                  Para efeitos de exclusividade, considera-se "zona" a <strong className="text-foreground">freguesia 
                  administrativa</strong> definida pela Imoponto.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">6</span>
                <p>
                  A Imoponto reserva-se o direito de, por critérios técnicos e de densidade de procura, 
                  <strong className="text-foreground"> agrupar ou subdividir zonas</strong> exclusivamente para 
                  efeitos de visibilidade dentro da plataforma.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">7</span>
                <p>
                  A exclusividade <strong className="text-foreground">não confere qualquer direito territorial</strong> fora 
                  da plataforma, nem garante volume mínimo de contactos.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-destructive font-medium">
                A prestação de informações falsas, enganosas ou não verificáveis poderá resultar 
                na remoção imediata do perfil, suspensão da conta e eventual atuação legal nos 
                termos da lei aplicável.
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
        <Checkbox
          id="accept-terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => onTermsChange(checked === true)}
        />
        <label
          htmlFor="accept-terms"
          className="text-sm font-medium leading-relaxed cursor-pointer"
        >
          Li, compreendi e aceito integralmente os Termos de Prestação de Serviços Profissionais. 
          Declaro que todas as informações que irei prestar são verdadeiras e que atuo de forma 
          legal, ética e transparente.
        </label>
      </div>
    </div>
  );
}
