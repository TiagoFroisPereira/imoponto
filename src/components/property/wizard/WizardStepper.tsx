import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface WizardStepperProps {
    currentStep: number;
    className?: string;
}

const PHASES = [
    { id: 0, label: "Preparação", steps: [0] },
    { id: 1, label: "Anúncio", steps: [1] },
    { id: 2, label: "CPCV", steps: [2] },
    { id: 3, label: "Escritura", steps: [3, 4] },
    { id: 4, label: "Vendido", steps: [5] },
];

export function WizardStepper({ currentStep, className }: WizardStepperProps) {
    const getPhaseStatus = (phaseSteps: number[]) => {
        if (phaseSteps.includes(currentStep)) return "current";
        if (Math.max(...phaseSteps) < currentStep) return "completed";
        return "upcoming";
    };

    const colors = {
        0: "bg-slate-500",
        1: "bg-blue-500",
        2: "bg-purple-500",
        3: "bg-indigo-500",
        4: "bg-green-500",
    };

    const borderColors = {
        0: "border-slate-500",
        1: "border-blue-500",
        2: "border-purple-500",
        3: "border-indigo-500",
        4: "border-green-500",
    };

    const textColors = {
        0: "text-slate-500",
        1: "text-blue-500",
        2: "text-purple-500",
        3: "text-indigo-500",
        4: "text-green-500",
    };

    const ringColors = {
        0: "ring-slate-100 dark:ring-slate-900/50",
        1: "ring-blue-100 dark:ring-blue-900/50",
        2: "ring-purple-100 dark:ring-purple-900/50",
        3: "ring-indigo-100 dark:ring-indigo-900/50",
        4: "ring-green-100 dark:ring-green-900/50",
    };

    const phaseIndex = PHASES.findIndex(p => p.steps.includes(currentStep));
    const normalizedIndex = phaseIndex === -1 ? 0 : phaseIndex;

    return (
        <div className={cn("w-full py-4", className)}>
            <div className="relative flex justify-between items-center px-2">
                {/* Background Line */}
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 dark:bg-slate-800" />

                {/* Progress Line */}
                <div
                    className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-primary transition-all duration-500"
                    style={{
                        width: `calc(${(normalizedIndex / (PHASES.length - 1)) * 100}% - 12px)`
                    }}
                />

                {PHASES.map((phase) => {
                    const status = getPhaseStatus(phase.steps);
                    const isCompleted = status === "completed";
                    const isCurrent = status === "current";

                    return (
                        <div key={phase.id} className="relative flex flex-col items-center">
                            <div
                                className={cn(
                                    "w-5 h-5 rounded-full border-2 transition-all duration-300 z-10 flex items-center justify-center bg-background",
                                    isCompleted ? cn(colors[phase.id as keyof typeof colors], borderColors[phase.id as keyof typeof borderColors]) :
                                        isCurrent ? cn("ring-4 ring-offset-2", borderColors[phase.id as keyof typeof borderColors], ringColors[phase.id as keyof typeof ringColors]) :
                                            "border-slate-200 dark:border-slate-800"
                                )}
                            >
                                {isCompleted && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                                {isCurrent && <div className={cn("w-2 h-2 rounded-full", colors[phase.id as keyof typeof colors])} />}
                            </div>

                            <span className={cn(
                                "absolute -bottom-6 text-[10px] font-bold uppercase tracking-tighter transition-colors duration-300",
                                isCurrent ? textColors[phase.id as keyof typeof textColors] : "text-slate-400 dark:text-slate-600"
                            )}>
                                {phase.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
