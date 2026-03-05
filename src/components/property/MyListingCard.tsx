import React from "react";
import { Link } from "react-router-dom";
import {
    MapPin,
    Bed,
    Bath,
    Square,
    Eye,
    MessageSquare,
    Calendar,
    MoreVertical,
    ChevronRight,
    TrendingUp,
    Edit,
    EyeOff,
    Archive,
    FileText,
    Upload,
    Lock,
    Zap,
    ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WizardStepper } from "./wizard/WizardStepper";
import { getWizardStep } from "./wizard/WizardConstants";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { cn } from "@/lib/utils";

interface MyListingCardProps {
    listing: any;
    onCardClick: (listing: any) => void;
    onWizardClick: (listing: any) => void;
    onVaultClick: (listing: any) => void;
    onPublishClick: (id: string) => void;
    onToggleStatus: (id: string, currentStatus: string) => void;
    onDelete: (id: string) => void;
}

export function MyListingCard({
    listing,
    onCardClick,
    onWizardClick,
    onVaultClick,
    onPublishClick,
    onToggleStatus,
    onDelete,
}: MyListingCardProps) {
    const { hasFeature, addons } = usePlanLimits(listing.id);
    const currentStep = listing.wizard_step || 0;
    const stepData = getWizardStep(currentStep);

    const isPrivate = listing.status === "private";
    const isPaused = listing.status === "paused";

    // Contextual CTA mapping based on user request
    const getContextualCTA = () => {
        switch (currentStep) {
            case 0: return "Resolver Burocracia";
            case 1: return "Promover Anúncio";
            case 2: return "Solicitar Apoio Jurídico";
            case 3:
            case 4: return "Agendar Escritura";
            case 5: return "Ver Detalhes Finais";
            default: return stepData.cta || "Continuar";
        }
    };

    // State colors based on user request
    const stepColors = {
        0: "from-slate-500/10 to-transparent border-slate-200 text-slate-600",
        1: "from-blue-500/10 to-transparent border-blue-200 text-blue-600",
        2: "from-purple-500/10 to-transparent border-purple-200 text-purple-600",
        3: "from-indigo-500/10 to-transparent border-indigo-200 text-indigo-600",
        4: "from-indigo-500/10 to-transparent border-indigo-200 text-indigo-600",
        5: "from-green-500/10 to-transparent border-green-200 text-green-600",
    };

    const activeColor = stepColors[currentStep as keyof typeof stepColors] || stepColors[0];

    return (
        <Card
            className={cn(
                "group overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/20 bg-card border-border/50",
                isPaused && "opacity-75 grayscale-[20%]"
            )}
        >
            <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                    {/* Image/Thumbnail Section */}
                    <div
                        className="relative w-full lg:w-64 h-48 lg:h-auto overflow-hidden flex-shrink-0 cursor-pointer"
                        onClick={() => onCardClick(listing)}
                    >
                        {isPrivate ? (
                            <div className="w-full h-full bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Privado</p>
                                    <p className="text-[10px] text-slate-400 mt-1">Visível apenas por si</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <img
                                    src={listing.image_url || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"}
                                    alt={listing.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                    <span className="text-white text-xs font-medium flex items-center gap-1.5">
                                        <Eye className="w-3.5 h-3.5" /> Ver Detalhes
                                    </span>
                                </div>
                            </>
                        )}

                        {/* Status Badge Over Image */}
                        <div className="absolute top-3 left-3">
                            <Badge
                                variant={isPaused ? "secondary" : "default"}
                                className={cn(
                                    "gap-1.5 shadow-sm backdrop-blur-md",
                                    !isPaused && "bg-background/90 text-foreground"
                                )}
                            >
                                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isPaused ? "bg-slate-400" : "bg-green-500")} />
                                {isPaused ? "Pausado" : (isPrivate ? "Rascunho" : "Ativo")}
                            </Badge>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col p-5 lg:p-6 gap-6">
                        {/* Header info */}
                        <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1 flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-foreground leading-tight truncate group-hover:text-primary transition-colors">
                                    {listing.title}
                                </h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {listing.address || listing.location}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <p className="text-xl font-black text-foreground">
                                    {listing.price > 0 ? `€${listing.price.toLocaleString("pt-PT")}` : "Sob Consulta"}
                                </p>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl border-border/50">
                                        <DropdownMenuItem className="rounded-xl gap-2 p-2.5" onClick={() => onWizardClick(listing)}>
                                            <TrendingUp className="w-4 h-4 text-primary" />
                                            <span>Ver Progresso da Venda</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-xl gap-2 p-2.5" onClick={() => onVaultClick(listing)}>
                                            <FileText className="w-4 h-4 text-blue-500" />
                                            <span>Gerir Documentos</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="my-2" />
                                        <DropdownMenuItem className="rounded-xl gap-2 p-2.5" asChild>
                                            <Link to={`/editar-anuncio/${listing.id}`}>
                                                <Edit className="w-4 h-4" />
                                                <span>Editar Dados</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-xl gap-2 p-2.5" onClick={() => onToggleStatus(listing.id, listing.status)}>
                                            {listing.status === "active" ? (
                                                <>
                                                    <EyeOff className="w-4 h-4" />
                                                    <span>Pausar Anúncio</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="w-4 h-4" />
                                                    <span>Ativar Anúncio</span>
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="my-2" />
                                        <DropdownMenuItem
                                            className="rounded-xl gap-2 p-2.5 text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/30"
                                            onClick={() => onDelete(listing.id)}
                                        >
                                            <Archive className="w-4 h-4" />
                                            <span>Arquivar Imóvel</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Wizard Section - Central Element */}
                        <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 space-y-6 relative overflow-hidden group/wizard transition-all duration-300 hover:border-primary/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-500 group-hover/wizard:rotate-12",
                                        currentStep === 5 ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"
                                    )}>
                                        <stepData.icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Progresso da Venda</h4>
                                        <p className="text-sm font-bold text-foreground">{stepData.label}</p>
                                    </div>
                                </div>

                                {/* Compact Stats Inside Wizard Box */}
                                <div className="hidden sm:flex items-center gap-4 py-1.5 px-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-border/40">
                                    <div className="flex items-center gap-1.5">
                                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                                        <span className="text-xs font-bold">{listing.views_count}</span>
                                    </div>
                                    <div className="w-[1px] h-3 bg-border" />
                                    <div className="flex items-center gap-1.5">
                                        <MessageSquare className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-xs font-bold">{listing.inquiries_count}</span>
                                    </div>
                                    <div className="w-[1px] h-3 bg-border" />
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-purple-500" />
                                        <span className="text-xs font-bold">{listing.visits_count || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <WizardStepper currentStep={currentStep} className="px-1" />

                            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                                <Button
                                    className="w-full sm:flex-1 h-11 rounded-2xl font-bold gap-2 group/btn shadow-lg shadow-primary/20 transition-all duration-300 active:scale-95"
                                    onClick={() => onWizardClick(listing)}
                                >
                                    {getContextualCTA()}
                                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                                </Button>

                                {/* Nudges/Addons */}
                                {!hasFeature('vault') && (
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-auto h-11 px-4 rounded-2xl border-dashed border-slate-300 hover:border-primary/50 hover:bg-slate-100 dark:hover:bg-slate-800 gap-2 text-slate-500 hover:text-primary transition-all duration-300"
                                        onClick={() => onVaultClick(listing)}
                                    >
                                        <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                                            <Lock className="w-3 h-3" />
                                        </div>
                                        <span className="text-xs font-bold">Ativar Cofre Premium</span>
                                    </Button>
                                )}

                                {hasFeature('vault') && !addons.includes('priority_results') && (
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-auto h-11 px-4 rounded-2xl border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 gap-2 text-blue-600 transition-all duration-300"
                                        onClick={() => onPublishClick(listing.id)}
                                    >
                                        <div className="p-1 rounded-lg bg-blue-500 text-white">
                                            <Zap className="w-3 h-3" />
                                        </div>
                                        <span className="text-xs font-bold">Destacar Anúncio</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Bottom Meta Data */}
                        <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm text-muted-foreground border-t border-border/40 pt-4 mt-auto">
                            <div className="flex items-center gap-1.5">
                                <Bed className="w-3.5 h-3.5" />
                                <span className="font-medium">{listing.bedrooms} <span className="hidden sm:inline">Quartos</span></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Bath className="w-3.5 h-3.5" />
                                <span className="font-medium">{listing.bathrooms} <span className="hidden sm:inline">WC</span></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Square className="w-3.5 h-3.5" />
                                <span className="font-medium">{listing.area} m²</span>
                            </div>

                            {isPrivate && (
                                <div className="ml-auto">
                                    <Badge variant="outline" className="text-[10px] font-bold border-dashed border-slate-300">
                                        Apenas Documentação
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
