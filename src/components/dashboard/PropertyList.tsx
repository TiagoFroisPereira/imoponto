import { Link, useNavigate } from "react-router-dom";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProperties } from "@/hooks/useProperties";
import { Skeleton } from "@/components/ui/skeleton";
import { MyListingCard } from "@/components/property/MyListingCard";

export function PropertyList() {
  const { properties, loading, deleteProperty, toggleStatus } = useProperties();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="bg-card border border-border/50 rounded-2xl p-12 text-center">
        <Building2 className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Sem imóveis</h3>
        <p className="text-muted-foreground mt-2 mb-6">
          Ainda não criou nenhum anúncio de imóvel.
        </p>
        <Button asChild className="rounded-xl">
          <Link to="/criar-anuncio">
            <Plus className="w-4 h-4 mr-2" />
            Criar Anúncio
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {properties.map((property) => (
        <MyListingCard
          key={property.id}
          listing={property}
          onCardClick={(listing) => navigate(`/imovel/${listing.id}`)}
          onWizardClick={(listing) => navigate(`/imovel/${listing.id}/gestao`)}
          onVaultClick={(listing) => navigate(`/imovel/${listing.id}/documentos`)}
          onPublishClick={(id) => navigate(`/publicar-imovel/${id}`)}
          onToggleStatus={toggleStatus}
          onDelete={deleteProperty}
        />
      ))}
    </div>
  );
}
