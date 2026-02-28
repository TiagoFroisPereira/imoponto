import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Loader2, Save, Plus } from "lucide-react";

interface FormNavigationProps {
  step: number;
  mode: 'create' | 'edit' | 'publish';
  isSubmitting: boolean;
  acceptedPrivacy: boolean;
  setAcceptedPrivacy: (v: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

const FormNavigation = ({ step, mode, isSubmitting, acceptedPrivacy, setAcceptedPrivacy, onPrev, onNext, onSubmit }: FormNavigationProps) => {
  return (
    <div className="flex items-center justify-between mt-8">
      <Button variant="ghost" onClick={onPrev} disabled={step === 1}><ChevronLeft className="mr-2 h-4 w-4" /> Anterior</Button>
      <div className="flex gap-3">
        {step < 5 ? (
          <Button onClick={onNext}>Próximo <ChevronRight className="ml-2 h-4 w-4" /></Button>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {mode !== 'edit' && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border max-w-md">
                <div className="flex items-start space-x-2">
                  <Checkbox id="privacy" checked={acceptedPrivacy} onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)} />
                  <label htmlFor="privacy" className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Aceito a <Link to="/privacidade" className="text-primary hover:underline">política de privacidade</Link> e o tratamento dos meus dados.
                  </label>
                </div>
              </div>
            )}
            <Button size="lg" className="w-full sm:w-auto px-12 py-6 text-lg font-bold" onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {mode === 'edit' ? 'A guardar...' : 'A publicar...'}</>
              ) : (
                mode === 'edit' ? <><Save className="mr-2 h-5 w-5" /> Guardar Alterações</> : <><Plus className="mr-2 h-5 w-5" /> Publicar Anúncio</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormNavigation;
