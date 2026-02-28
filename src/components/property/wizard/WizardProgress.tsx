import { Badge } from "@/components/ui/badge";
import { getWizardStep, getMaxSteps } from "./WizardConstants";
import { cn } from "@/lib/utils";

interface WizardProgressProps {
    currentStep?: number;
    className?: string;
    compact?: boolean;
}

export function WizardProgress({ currentStep = 0, className, compact = false }: WizardProgressProps) {
    const step = getWizardStep(currentStep);
    const totalSteps = getMaxSteps();

    // Safe normalization of step number for display
    const displayStep = Math.min(Math.max(0, currentStep), totalSteps);

    if (compact) {
        return (
            <div className={cn("flex items-center gap-2 text-xs font-medium", className)}>
                <span className={cn(step.color)}>
                    Passo {displayStep} / {totalSteps}
                </span>
            </div>
        );
    }

    return (
        <div className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-secondary/50 text-secondary-foreground border border-border/50 max-w-full flex-wrap", className)}>
            <span className={cn("mr-1", step.color)}>
                Passo {displayStep}/{totalSteps}
            </span>
            <span className="text-muted-foreground/50 mx-1">—</span>
            <span className="text-muted-foreground truncate">{step.label}</span>
        </div>
    );
}
