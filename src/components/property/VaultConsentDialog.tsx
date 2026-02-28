import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, AlertTriangle, Lock, FileCheck, Users, FileText } from "lucide-react";
import { useVaultConsent } from "@/hooks/useVaultConsent";

interface VaultConsentDialogProps {
  propertyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConsentAccepted?: () => void;
}

const VaultConsentDialog = ({
  propertyId,
  open,
  onOpenChange,
  onConsentAccepted,
}: VaultConsentDialogProps) => {
  const { acceptConsent, isAccepting } = useVaultConsent(propertyId);

  const [declarations, setDeclarations] = useState({
    responsibility: false,
    noValidation: false,
    professionalValidation: false,
    accessResponsibility: false,
    termsAccepted: false,
  });

  const allChecked = Object.values(declarations).every(Boolean);

  const handleCheckboxChange = (key: keyof typeof declarations) => {
    setDeclarations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAccept = () => {
    acceptConsent(
      {
        declaration_responsibility_accepted: declarations.responsibility,
        declaration_no_validation_accepted: declarations.noValidation,
        declaration_professional_validation_accepted: declarations.professionalValidation,
        declaration_access_responsibility_accepted: declarations.accessResponsibility,
        declaration_terms_accepted: declarations.termsAccepted,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          onConsentAccepted?.();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Cofre Digital — Avisos Importantes</DialogTitle>
              <DialogDescription>
                Leia atentamente antes de prosseguir
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Introduction */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              O Cofre Digital da ImoPonto é uma ferramenta tecnológica destinada ao armazenamento, 
              organização e partilha controlada de documentos relacionados com um imóvel.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Antes de prosseguir, é importante compreender que:
            </p>
          </div>

          {/* Warnings */}
          <div className="space-y-3">
            {[
              "A ImoPonto não analisa, não valida nem interpreta documentos",
              "A ImoPonto não garante a validade legal ou técnica de qualquer ficheiro",
              "Qualquer validação ou análise depende exclusivamente de profissionais independentes",
              "O controlo de acessos e partilhas é da inteira responsabilidade do utilizador",
            ].map((warning, index) => (
              <div
                key={index}
                className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-200">{warning}</p>
              </div>
            ))}
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              A utilização do Cofre Digital não substitui entidades oficiais nem serviços 
              profissionais legalmente habilitados.
            </p>
          </div>

          {/* Declarations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Todas as declarações devem ser aceites para ativar o Cofre Digital
              </span>
            </div>

            <div className="space-y-4 border rounded-xl p-4 bg-background">
              {/* Declaration 1 */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="responsibility"
                  checked={declarations.responsibility}
                  onCheckedChange={() => handleCheckboxChange("responsibility")}
                  className="mt-1"
                />
                <Label
                  htmlFor="responsibility"
                  className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                >
                  <FileCheck className="w-4 h-4 inline mr-2 text-primary" />
                  Declaro que sou responsável pelos documentos que carrego no Cofre Digital 
                  e que possuo legitimidade para os armazenar e partilhar.
                </Label>
              </div>

              {/* Declaration 2 */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="noValidation"
                  checked={declarations.noValidation}
                  onCheckedChange={() => handleCheckboxChange("noValidation")}
                  className="mt-1"
                />
                <Label
                  htmlFor="noValidation"
                  className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                >
                  <Shield className="w-4 h-4 inline mr-2 text-primary" />
                  Declaro que compreendo que a ImoPonto não valida, não certifica e não 
                  garante a conformidade legal ou técnica dos documentos.
                </Label>
              </div>

              {/* Declaration 3 */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="professionalValidation"
                  checked={declarations.professionalValidation}
                  onCheckedChange={() => handleCheckboxChange("professionalValidation")}
                  className="mt-1"
                />
                <Label
                  htmlFor="professionalValidation"
                  className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                >
                  <Users className="w-4 h-4 inline mr-2 text-primary" />
                  Declaro que compreendo que qualquer validação documental é efetuada 
                  exclusivamente por profissionais independentes, sem intervenção da ImoPonto.
                </Label>
              </div>

              {/* Declaration 4 */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="accessResponsibility"
                  checked={declarations.accessResponsibility}
                  onCheckedChange={() => handleCheckboxChange("accessResponsibility")}
                  className="mt-1"
                />
                <Label
                  htmlFor="accessResponsibility"
                  className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                >
                  <Lock className="w-4 h-4 inline mr-2 text-primary" />
                  Declaro que assumo total responsabilidade pelos acessos concedidos 
                  a terceiros ao meu Cofre Digital.
                </Label>
              </div>

              {/* Declaration 5 - Terms */}
              <div className="flex items-start gap-3 pt-2 border-t">
                <Checkbox
                  id="termsAccepted"
                  checked={declarations.termsAccepted}
                  onCheckedChange={() => handleCheckboxChange("termsAccepted")}
                  className="mt-1"
                />
                <Label
                  htmlFor="termsAccepted"
                  className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                >
                  <FileText className="w-4 h-4 inline mr-2 text-primary" />
                  Declaro que li e aceito os{" "}
                  <a
                    href="/termos-servico#cofre-digital"
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    Termos e Condições do Cofre Digital
                  </a>{" "}
                  da ImoPonto.
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAccepting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!allChecked || isAccepting}
            className="gap-2"
          >
            <Lock className="w-4 h-4" />
            {isAccepting ? "A ativar..." : "Ativar Cofre Digital"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VaultConsentDialog;
