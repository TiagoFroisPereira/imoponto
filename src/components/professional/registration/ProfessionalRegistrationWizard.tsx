import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, CheckCircle, Loader2 } from "lucide-react";
import { ProfessionalCategoryStep, requiresInsurance, getCategoryMapping } from "./ProfessionalCategoryStep";
import { ProfessionalDeclarationsStep } from "./ProfessionalDeclarationsStep";
import { ProfessionalTermsStep } from "./ProfessionalTermsStep";
import { CreditIntermediaryDeclarationsStep, areAllCreditDeclarationsAccepted } from "./CreditIntermediaryDeclarationsStep";
import type { ServiceCategory } from "@/hooks/useProfessionals";

const TERMS_VERSION = "1.0";

interface ProfessionalRegistrationWizardProps {
  onSuccess: () => void;
}

export function ProfessionalRegistrationWizard({ onSuccess }: ProfessionalRegistrationWizardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Step 1: Category
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Step 2: Declarations
  const [insuranceAccepted, setInsuranceAccepted] = useState(false);
  const [autonomy1Accepted, setAutonomy1Accepted] = useState(false);
  const [autonomy2Accepted, setAutonomy2Accepted] = useState(false);
  
  // Step 2b (conditional): Credit Intermediary Declarations
  const [creditDeclarations, setCreditDeclarations] = useState<Record<string, boolean>>({});
  
  // Step 3: Terms
  const [termsAccepted, setTermsAccepted] = useState(false);

  const needsInsurance = requiresInsurance(selectedCategory);
  const isCreditIntermediary = selectedCategory === "intermediario_credito";
  
  // Build dynamic steps list
  const getSteps = () => {
    const steps = [
      { key: "category", title: "Categoria Profissional" },
      { key: "declarations", title: "Declarações Obrigatórias" },
    ];
    if (isCreditIntermediary) {
      steps.push({ key: "credit", title: "Declarações — Intermediário de Crédito" });
    }
    steps.push({ key: "terms", title: "Termos e Condições" });
    return steps;
  };

  const steps = getSteps();
  const totalSteps = steps.length;
  const currentStepKey = steps[step - 1]?.key;
  const progress = (step / totalSteps) * 100;

  const handleCreditDeclarationChange = (id: string, checked: boolean) => {
    setCreditDeclarations(prev => ({ ...prev, [id]: checked }));
  };

  const canProceed = () => {
    switch (currentStepKey) {
      case "category":
        return selectedCategory !== "";
      case "declarations":
        return autonomy1Accepted && autonomy2Accepted && (!needsInsurance || insuranceAccepted);
      case "credit":
        return areAllCreditDeclarationsAccepted(creditDeclarations);
      case "terms":
        return termsAccepted;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Reset credit declarations when category changes away from intermediario_credito
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    if (value !== "intermediario_credito") {
      setCreditDeclarations({});
    }
    // Reset step to 1 if changing category while on later steps
    if (step > 1) {
      setStep(1);
      setInsuranceAccepted(false);
      setAutonomy1Accepted(false);
      setAutonomy2Accepted(false);
      setTermsAccepted(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Sessão necessária",
        description: "Precisa de estar autenticado para se registar como profissional.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsLoading(true);

    try {
      const { category, serviceType } = getCategoryMapping(selectedCategory);

      // Create professional profile
      const { data: professional, error: profError } = await supabase
        .from("professionals")
        .insert({
          user_id: user.id,
          name: user.email?.split("@")[0] || "Profissional",
          email: user.email || "",
          category: category as ServiceCategory,
          service_type: serviceType,
          price_from: 0,
          is_active: true,
          is_verified: false,
          profile_completed: false,
        })
        .select("id")
        .single();

      if (profError) {
        console.error("Error creating professional:", profError);
        throw profError;
      }

      // Log legal acceptance (internal audit log)
      const legalData: Record<string, any> = {
        user_id: user.id,
        professional_id: professional.id,
        category_selected: selectedCategory,
        insurance_declaration_accepted: needsInsurance ? insuranceAccepted : false,
        autonomy_declaration_1_accepted: autonomy1Accepted,
        autonomy_declaration_2_accepted: autonomy2Accepted,
        terms_accepted: termsAccepted,
        terms_version: TERMS_VERSION,
        user_agent: navigator.userAgent,
        accepted_at: new Date().toISOString(),
      };

      // Add credit intermediary specific declarations
      if (isCreditIntermediary) {
        legalData.credit_reg_banco_portugal = creditDeclarations.credit_reg_banco_portugal || false;
        legalData.credit_reg_active = creditDeclarations.credit_reg_active || false;
        legalData.credit_scope_authorized = creditDeclarations.credit_scope_authorized || false;
        legalData.credit_insurance_rc = creditDeclarations.credit_insurance_rc || false;
        legalData.credit_autonomy = creditDeclarations.credit_autonomy || false;
        legalData.credit_dl_compliance = creditDeclarations.credit_dl_compliance || false;
      }

      const { error: logError } = await (supabase
        .from("professional_legal_acceptances") as any)
        .insert(legalData);

      if (logError) {
        console.error("Error logging legal acceptance:", logError);
      }

      toast({
        title: "Registo submetido!",
        description: "O seu perfil de profissional foi criado. Complete o seu perfil para ser visível.",
      });

      onSuccess();
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Erro no registo",
        description: "Não foi possível concluir o registo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStepKey) {
      case "category":
        return (
          <ProfessionalCategoryStep
            value={selectedCategory}
            onChange={handleCategoryChange}
          />
        );
      case "declarations":
        return (
          <ProfessionalDeclarationsStep
            selectedCategory={selectedCategory}
            requiresInsurance={needsInsurance}
            insuranceAccepted={insuranceAccepted}
            autonomy1Accepted={autonomy1Accepted}
            autonomy2Accepted={autonomy2Accepted}
            onInsuranceChange={setInsuranceAccepted}
            onAutonomy1Change={setAutonomy1Accepted}
            onAutonomy2Change={setAutonomy2Accepted}
          />
        );
      case "credit":
        return (
          <CreditIntermediaryDeclarationsStep
            acceptedDeclarations={creditDeclarations}
            onDeclarationChange={handleCreditDeclarationChange}
          />
        );
      case "terms":
        return (
          <ProfessionalTermsStep
            termsAccepted={termsAccepted}
            onTermsChange={setTermsAccepted}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="border-border/50 shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Registo Profissional</CardTitle>
          <span className="text-sm text-muted-foreground">
            Passo {step} de {totalSteps}
          </span>
        </div>
        <CardDescription>{steps[step - 1]?.title}</CardDescription>
        <Progress value={progress} className="h-2 mt-4" />
      </CardHeader>
      <CardContent className="space-y-6">
        {renderStep()}

        <div className="flex justify-between pt-4 border-t border-border/50">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || isLoading}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {step < totalSteps ? (
            <Button
              variant="accent"
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Seguinte
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="accent"
              onClick={handleSubmit}
              disabled={!canProceed() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A processar...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Concluir Registo
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
