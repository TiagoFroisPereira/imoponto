import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Upload,
    Loader2,
    Info
} from "lucide-react";
import { DOCUMENT_GUIDES, DOCUMENT_INFO } from "@/data/documentCategories";

interface DocumentGuideModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: string | null;
    onUpload?: () => void;
    isUploading?: boolean;
}

export function DocumentGuideModal({
    open,
    onOpenChange,
    category,
    onUpload,
    isUploading = false
}: DocumentGuideModalProps) {
    const [guideStep, setGuideStep] = useState(0);

    if (!category) return null;

    const currentGuide = DOCUMENT_GUIDES[category];
    const currentInfo = DOCUMENT_INFO[category];

    const handleOpenChange = (newOpen: boolean) => {
        onOpenChange(newOpen);
        if (!newOpen) {
            setGuideStep(0);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg">
                {currentGuide ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-lg">{currentGuide.title}</DialogTitle>
                            <DialogDescription>
                                Passo {guideStep + 1} de {currentGuide.steps.length}
                            </DialogDescription>
                        </DialogHeader>

                        {/* Progress bar */}
                        <div className="w-full bg-muted rounded-full h-2">
                            <div
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${((guideStep + 1) / currentGuide.steps.length) * 100}%` }}
                            />
                        </div>

                        {/* Step content */}
                        <div className="space-y-4 py-4">
                            <h4 className="font-semibold text-foreground">
                                {currentGuide.steps[guideStep].title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                {currentGuide.steps[guideStep].description}
                            </p>

                            {currentGuide.steps[guideStep].link && (
                                <Button variant="outline" size="sm" asChild>
                                    <a
                                        href={currentGuide.steps[guideStep].link!.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        {currentGuide.steps[guideStep].link!.label}
                                    </a>
                                </Button>
                            )}

                            {currentGuide.steps[guideStep].imageUrl && (
                                <img
                                    src={currentGuide.steps[guideStep].imageUrl}
                                    alt={currentGuide.steps[guideStep].title}
                                    className="rounded-lg border border-border"
                                />
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setGuideStep(prev => Math.max(0, prev - 1))}
                                disabled={guideStep === 0}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Anterior
                            </Button>

                            {guideStep === currentGuide.steps.length - 1 ? (
                                onUpload && (
                                    <Button
                                        size="sm"
                                        onClick={onUpload}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                A carregar...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 mr-2" />
                                                Fazer upload do documento
                                            </>
                                        )}
                                    </Button>
                                )
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={() => setGuideStep(prev => Math.min(currentGuide.steps.length - 1, prev + 1))}
                                >
                                    Próximo
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            )}
                        </div>
                    </>
                ) : currentInfo ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Info className="w-5 h-5 text-primary" />
                                Como obter este documento
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Descrição</h4>
                                <p className="text-sm text-muted-foreground">{currentInfo.description}</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Onde obter</h4>
                                <p className="text-sm text-muted-foreground">{currentInfo.whereToGet}</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Informação adicional</h4>
                                <p className="text-sm text-muted-foreground">{currentInfo.additionalInfo}</p>
                            </div>

                            {currentInfo.link && (
                                <Button variant="outline" size="sm" asChild className="mt-2">
                                    <a
                                        href={currentInfo.link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        {currentInfo.link.label}
                                    </a>
                                </Button>
                            )}
                        </div>

                        {onUpload && (
                            <div className="flex justify-end pt-4 border-t border-border">
                                <Button
                                    size="sm"
                                    onClick={onUpload}
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            A carregar...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Fazer upload
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-8 text-center text-muted-foreground">
                        Nenhuma informação disponível para esta categoria.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
