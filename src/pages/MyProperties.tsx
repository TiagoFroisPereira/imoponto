import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProperties } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Eye,
    EyeOff,
    FolderOpen,
    FileText,
    Plus,
    ArrowLeft,
    MapPin,
    Bed,
    Bath,
    Square,
    Upload,
    MoreVertical,
    TrendingUp,
    Edit,
    Archive,
    MessageSquare,
    Calendar,
    ChevronRight
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WizardProgress } from "@/components/property/wizard/WizardProgress";
import { getWizardStep } from "@/components/property/wizard/WizardConstants";

import { PropertyWizard } from "@/components/property/wizard/PropertyWizard";

type PropertyStatus = 'active' | 'paused' | 'private' | 'pending' | 'rascunho';

const getStatusConfig = (status: PropertyStatus) => {
    switch (status) {
        case 'active':
            return {
                label: 'Publicado',
                variant: 'default' as const,
                icon: Eye,
                color: 'text-green-600'
            };
        case 'private':
            return {
                label: 'Privado',
                variant: 'secondary' as const,
                icon: FolderOpen,
                color: 'text-amber-600'
            };
        case 'paused':
            return {
                label: 'Pausado',
                variant: 'secondary' as const,
                icon: EyeOff,
                color: 'text-muted-foreground'
            };
        case 'rascunho':
            return {
                label: 'Rascunho',
                variant: 'outline' as const,
                icon: FileText,
                color: 'text-amber-600'
            };
        default:
            return {
                label: 'Pendente',
                variant: 'outline' as const,
                icon: FileText,
                color: 'text-muted-foreground'
            };
    }
};

export default function MyProperties() {
    const { properties, loading, deleteProperty, toggleStatus, refetch } = useProperties();
    const navigate = useNavigate();


    const [wizardProperty, setWizardProperty] = useState<{
        id: string;
        title: string;
    } | null>(null);

    const isPrivateProperty = (status: string) => status === 'private';

    const handleCardClick = (listing: any, e: React.MouseEvent) => {
        if (listing.status !== 'private') {
            navigate(`/imovel/${listing.id}`);
            return;
        }

        setWizardProperty({
            id: listing.id,
            title: listing.title
        });
    };

    const handlePublishClick = (e: React.MouseEvent, propertyId: string) => {
        e.stopPropagation();
        e.preventDefault();
        navigate(`/publicar-imovel/${propertyId}`);
    };

    if (loading) {
        return (
            <div className="bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="grid gap-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-48 w-full rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }


    // If a property is selected for wizard, show it inline
    if (wizardProperty) {
        return (
            <div className="bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setWizardProperty(null)}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar a Imóveis
                        </Button>
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">{wizardProperty.title}</h2>
                            <p className="text-sm text-muted-foreground">Progresso da Venda</p>
                        </div>
                    </div>

                    <PropertyWizard
                        propertyId={wizardProperty.id}
                        propertyTitle={wizardProperty.title}
                        currentStep={properties.find(p => p.id === wizardProperty.id)?.wizard_step || 0}
                        onUpdate={refetch}
                        status={properties.find(p => p.id === wizardProperty.id)?.status || 'pending'}
                        isInline={true}
                        propertyPrice={properties.find(p => p.id === wizardProperty.id)?.price}
                    />
                </div>
            </div>
        );
    }

    const publishedCount = properties.filter(p => p.status === 'active' || p.status === 'paused').length;
    const privateCount = properties.filter(p => p.status === 'private').length;

    return (
        <div className="bg-background">

            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/meu-perfil">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar ao Perfil
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Meus Imóveis</h1>
                        <p className="text-muted-foreground">
                            {properties.length} imóveis • {publishedCount} publicados • {privateCount} privados
                        </p>
                    </div>
                    <Button asChild>
                        <Link to="/publicar">
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Imóvel
                        </Link>
                    </Button>
                </div>

                {properties.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-foreground">Sem imóveis</h3>
                            <p className="text-muted-foreground mt-2 mb-4">
                                Ainda não adicionou nenhum imóvel.
                            </p>
                            <Button asChild>
                                <Link to="/publicar">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Novo Imóvel
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {properties.map((listing) => {
                            const statusConfig = getStatusConfig(listing.status as PropertyStatus);
                            const StatusIcon = statusConfig.icon;
                            const isPrivate = isPrivateProperty(listing.status);

                            // Formatting Mini KPIs
                            const views = listing.views_count || 0;
                            const inquiries = listing.inquiries_count || 0;
                            const visits = listing.visits_count || 0;

                            return (
                                <Card
                                    key={listing.id}
                                    onClick={(e) => handleCardClick(listing, e)}
                                    className={`transition-all hover:shadow-md hover:border-primary/30 cursor-pointer group ${listing.status === "paused" ? "opacity-60" : ""}`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex flex-col md:flex-row gap-6">

                                            {/* Image / Thumbnail */}
                                            <div className="w-full md:w-56 h-40 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                                                {isPrivate ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                                                        <FolderOpen className="w-8 h-8 mb-2" />
                                                        <span className="text-xs">Privado</span>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={listing.image_url || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"}
                                                        alt={listing.title}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-between">

                                                {/* Header: Status + Title + Actions */}
                                                <div>
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant={statusConfig.variant} className={statusConfig.color}>
                                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                                    {statusConfig.label}
                                                                </Badge>
                                                                <WizardProgress currentStep={listing.wizard_step} />
                                                            </div>
                                                            <h3 className="font-bold text-lg text-foreground truncate pr-4">
                                                                {listing.title}
                                                            </h3>
                                                            {listing.address && (
                                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {listing.address}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate(`/imovel/${listing.id}/gestao`);
                                                                    }}
                                                                >
                                                                    <TrendingUp className="w-4 h-4 mr-2" />
                                                                    Ver progresso da venda
                                                                </DropdownMenuItem>

                                                                <DropdownMenuSeparator />

                                                                {isPrivate ? (
                                                                    <>
                                                                        <DropdownMenuItem asChild>
                                                                            <Link to={`/editar-anuncio/${listing.id}`} onClick={(e) => e.stopPropagation()}>
                                                                                <Edit className="w-4 h-4 mr-2" />
                                                                                Editar Imóvel
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                navigate(`/imovel/${listing.id}/documentos`);
                                                                            }}
                                                                        >
                                                                            <FileText className="w-4 h-4 mr-2" />
                                                                            Gerir Documentação
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={(e) => handlePublishClick(e, listing.id)}>
                                                                            <Upload className="w-4 h-4 mr-2" />
                                                                            Publicar Anúncio
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <DropdownMenuItem asChild>
                                                                            <Link to={`/imovel/${listing.id}`} onClick={(e) => e.stopPropagation()}>
                                                                                <Eye className="w-4 h-4 mr-2" />
                                                                                Ver Anúncio
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem asChild>
                                                                            <Link to={`/editar-anuncio/${listing.id}`} onClick={(e) => e.stopPropagation()}>
                                                                                <Edit className="w-4 h-4 mr-2" />
                                                                                Editar Anúncio
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleStatus(listing.id, listing.status); }}>
                                                                            {listing.status === "active" ? (
                                                                                <>
                                                                                    <EyeOff className="w-4 h-4 mr-2" />
                                                                                    Pausar
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Eye className="w-4 h-4 mr-2" />
                                                                                    Ativar
                                                                                </>
                                                                            )}
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                navigate(`/imovel/${listing.id}/documentos`);
                                                                            }}
                                                                        >
                                                                            <FileText className="w-4 h-4 mr-2" />
                                                                            Gerir Documentação
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={(e) => { e.stopPropagation(); deleteProperty(listing.id); }}
                                                                    className="text-red-600"
                                                                >
                                                                    <Archive className="w-4 h-4 mr-2" />
                                                                    Arquivar
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    {/* Specs line */}
                                                    {(listing.bedrooms > 0 || listing.bathrooms > 0 || listing.area > 0) && (
                                                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                            {listing.bedrooms > 0 && <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {listing.bedrooms}</span>}
                                                            {listing.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {listing.bathrooms}</span>}
                                                            {listing.area > 0 && <span className="flex items-center gap-1"><Square className="w-4 h-4" /> {listing.area}m²</span>}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Footer: Mini KPIs + CTA */}
                                                <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-border/50">

                                                    {/* Mini KPIs */}
                                                    {(!isPrivate || listing.visits_count > 0) && (
                                                        <div className="flex items-center gap-6 w-full sm:w-auto">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Visualizações</span>
                                                                <div className="flex items-center gap-1.5 font-medium">
                                                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                                                    {views}
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Propostas</span>
                                                                <div className="flex items-center gap-1.5 font-medium">
                                                                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                                                                    {inquiries}
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Visitas</span>
                                                                <div className="flex items-center gap-1.5 font-medium">
                                                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                                                    {visits}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {isPrivate && (listing.visits_count || 0) === 0 && (
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <FileText className="w-3 h-3" />
                                                            Imóvel privado
                                                        </p>
                                                    )}

                                                    {/* CTA */}
                                                    {(() => {
                                                        const currentStep = listing.wizard_step || 0;
                                                        const isFlowA = listing.status === 'private' || listing.status === 'pending';
                                                        const stepData = getWizardStep(currentStep);

                                                        // Override for Private properties
                                                        if (listing.status === 'private') {
                                                            return (
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                                                                    onClick={(e) => handlePublishClick(e, listing.id)}
                                                                >
                                                                    Publicar
                                                                    <Upload className="w-4 h-4 ml-2" />
                                                                </Button>
                                                            );
                                                        }

                                                        const ctaText = (isFlowA && currentStep === 0) ? "Avançar" : (stepData.cta || "Gerir");

                                                        return (
                                                            <Button
                                                                size="sm"
                                                                className={stepData.color.replace('text-', 'bg-') + " text-white border-0 hover:opacity-90"}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/imovel/${listing.id}/gestao`);
                                                                }}
                                                            >
                                                                {ctaText}
                                                                <ChevronRight className="w-4 h-4 ml-1" />
                                                            </Button>
                                                        );
                                                    })()}

                                                </div>

                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
