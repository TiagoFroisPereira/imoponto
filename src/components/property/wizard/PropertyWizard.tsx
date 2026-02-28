import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ChevronRight, ChevronLeft, Circle, Lock, Eye } from "lucide-react";
import { WIZARD_STEPS, getWizardStep, getMaxSteps } from "./WizardConstants";

import { useProperties } from "@/hooks/useProperties";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PropertyVault from "../vault/PropertyVault";
import { ProposalsManager } from "./ProposalsManager";
import { getCategoryLabel } from "@/data/documentCategories";
import { FileText as FileIcon, XCircle, CheckCircle } from "lucide-react";
import { usePropertyProposals } from "@/hooks/usePropertyProposals";
import { CPCVManager } from "./CPCVManager";
import { EscrituraManager } from "./EscrituraManager";
import { PostEscrituraManager } from "./PostEscrituraManager";
import { ListingProposalsManager } from "./ListingProposalsManager";
import { DocumentStatusItem } from "./DocumentStatusItem";

interface PropertyWizardProps {
    propertyId: string;
    currentStep?: number;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    propertyTitle: string;
    onUpdate?: () => void;
    status: string;
    isInline?: boolean;
    propertyPrice?: number;
}

export function PropertyWizard({
    propertyId,
    currentStep = 0,
    open = false,
    onOpenChange,
    propertyTitle,
    onUpdate,
    status,
    isInline = false,
    propertyPrice
}: PropertyWizardProps) {
    const { updateProperty } = useProperties();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [activeIntegrationId, setActiveIntegrationId] = useState<string | null>(null);
    const [navigatedStep, setNavigatedStep] = useState<number | null>(null);
    const contentTopRef = useRef<HTMLDivElement>(null);

    // Fetch documents to check status
    const { data: documents = [] } = useQuery({
        queryKey: ['vault-documents', propertyId],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data } = await supabase
                .from('vault_documents')
                .select('category, status')
                .eq('property_id', propertyId);

            return data || [];
        }
    });

    // Use proposals hook for step validation
    const { canAdvanceWizard: canAdvanceProposals, hasAcceptedProposal } = usePropertyProposals(propertyId);

    const handleFinalizeProcess = async () => {
        setLoading(true);
        try {
            // First update the property status
            const statusSuccess = await updateProperty(propertyId, { status: 'sold' });
            if (statusSuccess) {
                // Then advance the wizard to the final step
                await handleProgressUpdate(5);
            }
        } catch (error) {
            console.error("Error finalizing process:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProposalAccepted = () => {
        handleProgressUpdate(2); // CPCV is now step 2
    };

    const checkStepRequirements = (stepId: number) => {
        const step = WIZARD_STEPS[stepId];
        if (!step?.requiredDocuments) return { met: true, missingDocs: [] };

        const missingDocs = step.requiredDocuments.filter(
            reqDoc => !documents.some(d => d.category === reqDoc)
        );

        return {
            met: missingDocs.length === 0,
            missingDocs
        };
    };

    // Requirements status check
    const { met: requirementsMet } = checkStepRequirements(currentStep);

    const INTEGRATION_COMPONENTS: Record<string, React.ReactNode> = {
        'vault': <PropertyVault propertyId={propertyId} propertyTitle={propertyTitle} />,
        'listing-proposals': <ListingProposalsManager
            propertyId={propertyId}
            propertyTitle={propertyTitle}
            status={status}
            propertyPrice={propertyPrice}
            onProposalAccepted={handleProposalAccepted}
            onUpdateStatus={onUpdate || (() => { })}
        />,
        'cpcv': <CPCVManager
            propertyId={propertyId}
            onOpenVault={() => setActiveIntegrationId('vault')}
        />,
        'escritura': <EscrituraManager
            propertyId={propertyId}
            onOpenVault={() => setActiveIntegrationId('vault')}
        />,
        'post-escritura': <PostEscrituraManager
            propertyId={propertyId}
            onOpenVault={() => setActiveIntegrationId('vault')}
            onComplete={handleFinalizeProcess}
        />
    };

    const flow = (status === 'private' || status === 'pending') ? 'A' : 'B';

    // The actual step the user is viewing
    const activeStep = navigatedStep !== null ? navigatedStep : currentStep;

    // Scroll to top when active step changes
    useEffect(() => {
        if (contentTopRef.current) {
            contentTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [activeStep]);


    const totalSteps = getMaxSteps();

    // Flow A skips step 1 in progression
    const getRelevantSteps = () => Object.values(WIZARD_STEPS);
    const relevantSteps = getRelevantSteps();
    const currentStepData = getWizardStep(activeStep);


    const handleProgressUpdate = async (newStep: number) => {
        if (newStep < 0 || newStep >= totalSteps + 1) return;

        setLoading(true);
        try {
            const success = await updateProperty(propertyId, { wizard_step: newStep });
            if (success) {
                setNavigatedStep(null); // Return to following progress
                onUpdate?.();
                toast({
                    title: "Progresso atualizado",
                    description: `Avançou para: ${getWizardStep(newStep).label}`
                });
            }
        } catch (error) {
            console.error("Error updating wizard step:", error);
            toast({
                title: "Erro",
                description: "Não foi possível atualizar o progresso",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCTAClick = () => {
        // If viewing an old step, just move view forward
        if (navigatedStep !== null && navigatedStep < currentStep) {
            const nextNavStep = navigatedStep + 1;
            if (nextNavStep === currentStep) {
                setNavigatedStep(null);
            } else {
                setNavigatedStep(nextNavStep);
            }
            return;
        }

        // Requirements check for Flow A
        if (flow === 'A' && !requirementsMet) {
            const { missingDocs } = checkStepRequirements(currentStep);
            toast({
                title: "Documentação em falta",
                description: `Carregue os documentos: ${missingDocs.map(getCategoryLabel).join(', ')}`,
                variant: "destructive"
            });
            return;
        }

        // Check proposals requirement for step 1
        // Relaxed: if they have ANY accepted proposal, let them pass
        if (currentStep === 1 && !hasAcceptedProposal) {
            toast({
                title: "Ação bloqueada",
                description: "Aceite uma proposta para avançar para a fase de contrato.",
                variant: "destructive"
            });
            return;
        }

        let nextStep = currentStep + 1;
        handleProgressUpdate(nextStep);
    };

    const handleBackClick = () => {
        // If we are at the "current" active progress and moving back, update the DB
        if (navigatedStep === null) {
            if (currentStep > 0) {
                handleProgressUpdate(currentStep - 1);
            }
            return;
        }

        // If we were viewing current progress via navigatedStep, return to follow progress
        if (navigatedStep === currentStep) {
            setNavigatedStep(null);
            if (currentStep > 0) {
                handleProgressUpdate(currentStep - 1);
            }
            return;
        }

        // Otherwise, just move the view back
        if (navigatedStep > 0) {
            setNavigatedStep(navigatedStep - 1);
        } else if (navigatedStep === 0) {
            // If at step 0 and it's current progress, we can't go back further
            // But if it's historical view, we stay there or do nothing
        }
    };

    const handleIntegrationClick = (config: any) => {
        if (config.actionType === 'navigate') {
            const url = config.targetUrl.replace('{propertyId}', propertyId);
            onOpenChange?.(false);
            navigate(url);
        } else if (config.actionType === 'modal') {
            setActiveIntegrationId(config.componentId);
        }
    };

    const WizardContent = (
        <div className={cn(
            "flex flex-col p-0 gap-0 overflow-hidden bg-background relative",
            isInline ? "w-full min-h-[600px] border rounded-xl" : "max-w-4xl h-[80vh]"
        )}>
            <div className="p-4 md:p-6 border-b flex items-center justify-between gap-4">
                {isInline ? (
                    <div className="flex flex-col gap-1 text-left flex-1 min-w-0">
                        <h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold truncate">
                            O seu guia de venda
                        </h2>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">
                            Siga os passos para vender o seu imóvel.
                        </p>
                    </div>
                ) : (
                    <DialogHeader className="text-left flex-1 min-w-0">
                        <DialogTitle className="flex items-center gap-2 text-lg md:text-xl font-semibold truncate">
                            Venda: {propertyTitle}
                        </DialogTitle>
                        <DialogDescription className="text-xs md:text-sm text-muted-foreground truncate">
                            Acompanhe o progresso da sua venda.
                        </DialogDescription>
                    </DialogHeader>
                )}
            </div>

            {/* Mobile Stepper (Hidden on Desktop) */}
            <div className="flex md:hidden items-center justify-between px-4 py-3 bg-muted/20 border-b overflow-x-auto no-scrollbar">
                {relevantSteps.map((step) => {
                    const isCurrentActual = step.id === currentStep;
                    const isViewing = step.id === activeStep;
                    const isCompleted = step.id < currentStep;

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                "flex flex-col items-center gap-1 flex-shrink-0 px-2 min-w-[60px]",
                                isViewing ? "opacity-100" : "opacity-40"
                            )}
                            onClick={() => setNavigatedStep(step.id)}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] border",
                                isViewing ? "bg-primary text-primary-foreground border-primary" :
                                    isCompleted ? "bg-primary/20 text-primary border-primary/20" : "border-muted-foreground"
                            )}>
                                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                            </div>
                            <span className="text-[10px] font-medium truncate max-w-[50px]">{step.label}</span>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-1 overflow-hidden min-h-0">
                {/* Sidebar Steps (Desktop Only) */}
                <div className="w-64 border-r bg-muted/30 overflow-y-auto p-4 space-y-2 hidden md:block">
                    {relevantSteps.map((step) => {
                        const isCurrentActual = step.id === currentStep;
                        const isViewing = step.id === activeStep;
                        const isCompleted = step.id < currentStep;

                        const isLocked = flow === 'A' && step.id > currentStep;

                        return (
                            <button
                                key={step.id}
                                onClick={() => setNavigatedStep(step.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm transition-colors",
                                    isViewing ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted",
                                    isLocked && "opacity-50"
                                )}
                            >
                                <div className={cn(
                                    "flex items-center justify-center w-6 h-6 rounded-full border",
                                    isViewing ? "border-primary bg-primary text-primary-foreground" :
                                        isCompleted ? "border-primary text-primary" : "border-muted-foreground text-muted-foreground"
                                )}>
                                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> :
                                        isViewing ? <span className="text-xs">{step.id}</span> :
                                            <Circle className="w-3 h-3" />}
                                </div>
                                <div className="flex-1">
                                    <span className={cn(isViewing && "text-primary", isCurrentActual && "font-bold underlineDecoration decoration-primary")}>
                                        {step.label}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Main Content */}
                <ScrollArea className="flex-1 p-4 md:p-6">
                    <div ref={contentTopRef} className="h-0 w-0" /> {/* Scroll anchor */}
                    <div className="mx-auto space-y-6 md:space-y-8">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
                            <div className={cn(
                                "w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center bg-muted shrink-0",
                                currentStepData.color.replace('text-', 'bg-') + '/20'
                            )}>
                                <currentStepData.icon className={cn("w-6 h-6 md:w-8 md:h-8", currentStepData.color)} />
                            </div>
                            <div className="max-w-[500px]">
                                <h2 className="text-xl md:text-2xl font-bold leading-tight">{currentStepData.label}</h2>
                                <p className="text-muted-foreground mt-1 text-sm md:text-base leading-relaxed">{currentStepData.description}</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Detailed Description */}
                        <div className="bg-card border rounded-lg p-4 md:p-6">
                            <div className="flex items-center justify-between mb-2 md:mb-3 text-left">
                                <h3 className="font-semibold text-base md:text-lg">Objetivo</h3>
                                {flow === 'B' && activeStep < currentStep && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Concluído</Badge>
                                )}
                            </div>
                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left">
                                {currentStepData.longDescription}
                            </p>
                        </div>

                        {/* Generic Integration Section */}
                        {currentStepData.integration && currentStepData.integration.actionType === 'inline' && currentStepData.integration.componentId && (
                            <div className="border rounded-lg bg-card text-left">
                                <div className="p-3 md:p-4 border-b bg-muted/30">
                                    <h3 className="font-semibold text-sm md:text-base">{currentStepData.integration.title}</h3>
                                    <p className="text-xs md:text-sm text-muted-foreground">{currentStepData.integration.description}</p>
                                </div>
                                <div className="p-3 md:p-4">
                                    {INTEGRATION_COMPONENTS[currentStepData.integration.componentId]}
                                </div>
                            </div>
                        )}

                        {currentStepData.integration && currentStepData.integration.actionType !== 'inline' && (
                            <div className={cn(
                                "border rounded-lg p-4 md:p-6 flex flex-col items-center gap-3 md:gap-4 text-center",
                                currentStepData.integration.actionType === 'navigate'
                                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800"
                                    : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                            )}>
                                <div className="space-y-1">
                                    <h3 className={cn(
                                        "font-semibold text-sm md:text-base",
                                        currentStepData.integration.actionType === 'navigate'
                                            ? "text-blue-900 dark:text-blue-100"
                                            : "text-slate-900 dark:text-slate-100"
                                    )}>
                                        {currentStepData.integration.title}
                                    </h3>
                                    <p className={cn(
                                        "text-xs md:text-sm",
                                        currentStepData.integration.actionType === 'navigate'
                                            ? "text-blue-700 dark:text-blue-300"
                                            : "text-slate-600 dark:text-slate-400"
                                    )}>
                                        {currentStepData.integration.description}
                                    </p>
                                </div>
                                <Button
                                    className={cn(
                                        "w-full sm:w-auto",
                                        currentStepData.integration.actionType === 'navigate'
                                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                                            : "variant-outline"
                                    )}
                                    variant={currentStepData.integration.actionType === 'navigate' ? 'default' : 'outline'}
                                    onClick={() => handleIntegrationClick(currentStepData.integration)}
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    {currentStepData.integration.buttonLabel}
                                </Button>
                            </div>
                        )}

                        {/* Documents Status */}
                        {currentStepData.requiredDocuments && (
                            <div className="bg-slate-50 dark:bg-slate-900 border rounded-lg p-4 md:p-6 text-left">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 text-left">
                                    <h3 className="font-medium text-sm md:text-base flex items-center gap-2">
                                        <FileIcon className="w-4 h-4 text-slate-500" />
                                        Documentação Necessária
                                    </h3>
                                    <Button variant="outline" size="sm" className="text-xs" onClick={() => handleIntegrationClick({ actionType: 'modal', componentId: 'vault' })}>
                                        Gerir Cofre Digital
                                    </Button>
                                </div>
                                <div className="space-y-2 md:space-y-3">
                                    {currentStepData.requiredDocuments.map((reqDoc) => {
                                        const doc = documents.find(d => d.category === reqDoc);
                                        const status = doc
                                            ? (doc.status === 'validated' ? 'validated' : 'uploaded')
                                            : 'missing';

                                        return (
                                            <DocumentStatusItem
                                                key={reqDoc}
                                                category={reqDoc}
                                                status={status}
                                                onOpenVault={() => handleIntegrationClick({ actionType: 'modal', componentId: 'vault' })}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Tips */}
                        {currentStepData.tips && (
                            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-lg p-4 md:p-6 text-left">
                                <h3 className="font-medium text-sm md:text-base flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2 md:mb-3">
                                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-bold">i</div>
                                    Dicas Úteis
                                </h3>
                                <ul className="space-y-1.5 md:space-y-2">
                                    {currentStepData.tips.map((tip, index) => (
                                        <li key={index} className="text-xs md:text-sm text-blue-600 dark:text-blue-300">
                                            • {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Persistent Fixed Footer Navigation */}
            <div className="border-t bg-white/95 backdrop-blur-md p-3 md:p-4 z-50">
                <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
                    {/* Alerts positioned above the controls */}
                    <div className="w-full flex justify-center">
                        {flow === 'B' && activeStep === currentStep && (
                            <div className="text-[10px] md:text-xs text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 flex items-center justify-center gap-1.5 shadow-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                <span className="font-medium">Fluxo operacional disponível</span>
                            </div>
                        )}

                        {flow === 'A' && activeStep === currentStep && !requirementsMet && (
                            <div className="text-[10px] md:text-xs text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-100 flex items-center justify-center gap-1.5 shadow-sm">
                                <XCircle className="w-3.5 h-3.5 text-red-500" />
                                <span className="font-medium">Bloqueado — Documentação pendente</span>
                            </div>
                        )}
                    </div>

                    <div className="w-full flex items-center gap-2 md:gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleBackClick}
                            disabled={(navigatedStep === null && currentStep === 0) || (navigatedStep === 0) || loading}
                            className="rounded-xl h-10 w-10 md:h-12 md:w-12 border-slate-200 hover:bg-slate-50 transition-all shrink-0"
                        >
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-slate-600" />
                        </Button>

                        <div className="flex-1 flex flex-col items-center px-2 hidden sm:flex border-x border-slate-100">
                            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black leading-tight">Passo {activeStep + 1}/{totalSteps + 1}</span>
                            <span className="text-sm font-bold truncate max-w-[200px] text-slate-800 leading-tight">{currentStepData.label}</span>
                        </div>

                        <Button
                            variant="default"
                            size="default"
                            onClick={handleCTAClick}
                            disabled={activeStep > currentStep || activeStep >= totalSteps || loading}
                            className="flex-1 sm:flex-none h-10 md:h-12 px-6 md:px-12 rounded-xl shadow-lg shadow-primary/20 font-bold whitespace-nowrap bg-primary hover:bg-primary/90 transition-all text-sm md:text-base"
                        >
                            <span className="mr-2">
                                {activeStep < currentStep
                                    ? "Ver Seguinte"
                                    : (currentStep === 0
                                        ? "Gerir Anúncio"
                                        : (currentStep === 1
                                            ? "Ir para CPCV"
                                            : (currentStepData.cta || "Continuar")
                                        )
                                    )
                                }
                            </span>
                            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (isInline) {
        return (
            <>
                {WizardContent}
                {/* Nested Integration Modal for Inline mode */}
                <Dialog open={!!activeIntegrationId} onOpenChange={(open) => !open && setActiveIntegrationId(null)}>
                    <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {currentStepData.integration?.title || "Integração"}
                            </DialogTitle>
                        </DialogHeader>
                        {activeIntegrationId && INTEGRATION_COMPONENTS[activeIntegrationId]}
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                {WizardContent}
            </DialogContent>

            {/* Nested Integration Modal */}
            <Dialog open={!!activeIntegrationId} onOpenChange={(open) => !open && setActiveIntegrationId(null)}>
                <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {currentStepData.integration?.title || "Integração"}
                        </DialogTitle>
                    </DialogHeader>
                    {activeIntegrationId && INTEGRATION_COMPONENTS[activeIntegrationId]}
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}
