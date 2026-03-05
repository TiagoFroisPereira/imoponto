import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Building2,
  ArrowLeft,
} from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { Skeleton } from "@/components/ui/skeleton";
import PropertyVault from "@/components/property/vault/PropertyVault";
import { PropertyWizard } from "@/components/property/wizard/PropertyWizard";
import { MyListingCard } from "@/components/property/MyListingCard";

interface MyListingsProps {
  userId?: string;
}

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

  const handleCardClick = (listing: any) => {
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

  const handlePublishClick = (propertyId: string) => {
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

      <div className="grid gap-6">
        {properties.map((listing) => (
          <MyListingCard
            key={listing.id}
            listing={listing}
            onCardClick={handleCardClick}
            onWizardClick={(listing) => setWizardProperty({ id: listing.id, title: listing.title })}
            onVaultClick={(listing) => setSelectedProperty({ id: listing.id, title: listing.title })}
            onPublishClick={(id) => handlePublishClick(id)}
            onToggleStatus={toggleStatus}
            onDelete={deleteProperty}
          />
        ))}
      </div>
    </div>
  );
}