import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  MapPin,
  Bed,
  Bath,
  Square,
  MoreVertical,
  Building2,
  FileText,
  Upload,
  Archive,
  FolderOpen,
  ArrowLeft,
  TrendingUp,
  ChevronRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProperties } from "@/hooks/useProperties";
import { Skeleton } from "@/components/ui/skeleton";
import PropertyVault from "@/components/property/vault/PropertyVault";
import { WizardProgress } from "@/components/property/wizard/WizardProgress";
import { PropertyWizard } from "@/components/property/wizard/PropertyWizard";
import { getWizardStep } from "@/components/property/wizard/WizardConstants";

interface MyListingsProps {
  userId?: string;
}

type PropertyStatus = 'active' | 'paused' | 'private' | 'pending';

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
    default:
      return {
        label: 'Pendente',
        variant: 'outline' as const,
        icon: FileText,
        color: 'text-muted-foreground'
      };
  }
};

export function MyListings({ userId }: MyListingsProps) {
  const { properties, loading, deleteProperty, toggleStatus, refetch } = useProperties();
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [wizardProperty, setWizardProperty] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const isPrivateProperty = (status: string) => status === 'private';
  const isPublishedProperty = (status: string) => status === 'active' || status === 'paused';

  const handleCardClick = (listing: any, e: React.MouseEvent) => {
    // For private properties, open vault in-place
    if (isPrivateProperty(listing.status)) {
      setSelectedProperty({
        id: listing.id,
        title: listing.title
      });
    } else {
      navigate(`/imovel/${listing.id}`);
    }
  };

  const handlePublishClick = (e: React.MouseEvent, propertyId: string) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/publicar-imovel/${propertyId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="w-48 h-32 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // If a property is selected for documents, show its vault
  if (selectedProperty) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedProperty(null)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar a Imóveis
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{selectedProperty.title}</h2>
            <p className="text-sm text-muted-foreground">Gestão de Documentação</p>
          </div>
        </div>

        <PropertyVault
          propertyId={selectedProperty.id}
          propertyTitle={selectedProperty.title}
        />
      </div>
    );
  }

  // If a property is selected for wizard, show it inline
  if (wizardProperty) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
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
    );
  }

  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
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
    );
  }

  const privateProperties = properties.filter(p => isPrivateProperty(p.status));
  const publishedProperties = properties.filter(p => isPublishedProperty(p.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Meus Imóveis</h2>
          <p className="text-sm text-muted-foreground">
            {properties.length} imóve{properties.length !== 1 ? "is" : "l"}
            {publishedProperties.length > 0 && ` • ${publishedProperties.length} publicado${publishedProperties.length !== 1 ? "s" : ""}`}
            {privateProperties.length > 0 && ` • ${privateProperties.length} privado${privateProperties.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button asChild>
          <Link to="/publicar">
            <Plus className="w-4 h-4 mr-2" />
            Novo Imóvel
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {properties.map((listing) => {
          const statusConfig = getStatusConfig(listing.status as PropertyStatus);
          const StatusIcon = statusConfig.icon;
          const isPrivate = isPrivateProperty(listing.status);

          return (
            <Card
              key={listing.id}
              onClick={(e) => handleCardClick(listing, e)}
              className={`transition-all hover:shadow-md hover:border-primary/30 cursor-pointer ${listing.status === "paused" ? "opacity-60" : ""
                }`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                    {isPrivate ? (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <div className="text-center">
                          <FolderOpen className="w-8 h-8 mx-auto text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Documentação</span>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={listing.image_url || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={statusConfig.variant}
                            className={statusConfig.color}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>

                          <WizardProgress
                            currentStep={listing.wizard_step}
                            className="ml-2"
                          />
                        </div>
                        <h3 className="font-semibold text-foreground text-lg">
                          {listing.title}
                        </h3>
                        {listing.address && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
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
                              setWizardProperty({
                                id: listing.id,
                                title: listing.title
                              });
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
                                  setSelectedProperty({
                                    id: listing.id,
                                    title: listing.title
                                  });
                                }}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Gerir Documentação
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handlePublishClick(e, listing.id)}>
                                <Upload className="w-4 h-4 mr-2" />
                                Publicar Anúncio
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); deleteProperty(listing.id); }}
                                className="text-red-600"
                              >
                                <Archive className="w-4 h-4 mr-2" />
                                Arquivar Imóvel
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
                                    Pausar Anúncio
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Ativar Anúncio
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProperty({
                                    id: listing.id,
                                    title: listing.title
                                  });
                                }}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Gerir Documentação
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); deleteProperty(listing.id); }}
                                className="text-red-600"
                              >
                                <Archive className="w-4 h-4 mr-2" />
                                Arquivar Imóvel
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {(listing.bedrooms > 0 || listing.bathrooms > 0 || listing.area > 0) && (
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        {listing.bedrooms > 0 && (
                          <span className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            {listing.bedrooms} quartos
                          </span>
                        )}
                        {listing.bathrooms > 0 && (
                          <span className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            {listing.bathrooms} wc
                          </span>
                        )}
                        {listing.area > 0 && (
                          <span className="flex items-center gap-1">
                            <Square className="w-4 h-4" />
                            {listing.area}m²
                          </span>
                        )}
                      </div>
                    )}

                    {statusConfig.label !== 'Arquivado' && (
                      (() => {
                        const currentStep = listing.wizard_step || 0;
                        const isFlowA = listing.status === 'private' || listing.status === 'pending';
                        const stepData = getWizardStep(currentStep);

                        const ctaText = (isFlowA && currentStep === 0)
                          ? "Avançar para Propostas"
                          : (stepData.cta || "Continuar");
                        return (
                          <div
                            className="mt-4 p-3 rounded-lg border bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group relative overflow-hidden"
                            onClick={(e) => {
                              e.stopPropagation();
                              setWizardProperty({
                                id: listing.id,
                                title: listing.title
                              });
                            }}
                          >
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${stepData.color.replace('text-', 'bg-')}`} />

                            <div className="flex items-center gap-3 pl-2">
                              <div className={`p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm ${stepData.color}`}>
                                <stepData.icon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Fase Atual</p>
                                <p className="font-semibold text-sm">{stepData.label}</p>
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="ml-auto text-xs hover:bg-white/50 dark:hover:bg-slate-800/50"
                            >
                              {ctaText}
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        );
                      })()
                    )}

                    <div className="flex items-center justify-between mt-4">
                      {listing.price > 0 ? (
                        <p className="text-xl font-bold text-primary">
                          €{listing.price.toLocaleString("pt-PT")}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Preço não definido
                        </p>
                      )}

                      {isPrivate ? (
                        <Button
                          size="sm"
                          onClick={(e) => handlePublishClick(e, listing.id)}
                          className="gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Publicar Anúncio
                        </Button>
                      ) : (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {listing.views_count} visualizações
                          </span>
                          <span className="flex items-center gap-1">
                            <Badge variant="outline">{listing.inquiries_count} contactos</Badge>
                          </span>
                        </div>
                      )}
                    </div>

                    {isPrivate && (
                      <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Este imóvel está privado e é usado apenas para gestão de documentação
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}