import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import type { DocumentationLevel } from "@/components/PropertyCard";
import type { PublicProperty } from "@/hooks/usePublicProperties";
import type { SearchFiltersState } from "@/hooks/useSearchFilters";
import SearchResultsHeader from "./SearchResultsHeader";

interface SearchResultsProps {
  properties: PublicProperty[];
  loading: boolean;
  filters: SearchFiltersState;
  setSortBy: (v: string) => void;
  viewMode: "grid" | "list";
}

const SearchResults = ({ properties, loading, filters, setSortBy, viewMode }: SearchResultsProps) => {
  const filteredProperties = useMemo(() => {
    let result = properties;

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(query) || p.location.toLowerCase().includes(query) || p.address.toLowerCase().includes(query));
    }

    if (filters.selectedDistrito && filters.selectedDistrito !== "all") {
      const distLower = filters.selectedDistrito.toLowerCase();
      result = result.filter(p => p.location.toLowerCase().includes(distLower) || p.address.toLowerCase().includes(distLower));
    }

    if (filters.selectedConcelho && filters.selectedConcelho !== "all") {
      const concLower = filters.selectedConcelho.toLowerCase();
      result = result.filter(p => p.location.toLowerCase().includes(concLower) || p.address.toLowerCase().includes(concLower));
    }

    if (filters.selectedTypes.length > 0) {
      result = result.filter(p => filters.selectedTypes.includes(p.property_type));
    }

    if (filters.selectedConditions.length > 0) {
      result = result.filter(p => p.condition && filters.selectedConditions.includes(p.condition));
    }

    result = result.filter(p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);
    result = result.filter(p => p.area >= filters.areaRange[0] && p.area <= filters.areaRange[1]);

    if (filters.bedrooms && filters.bedrooms !== "all") {
      const min = parseInt(filters.bedrooms);
      result = result.filter(p => p.bedrooms >= min);
    }

    if (filters.bathrooms && filters.bathrooms !== "all") {
      const min = parseInt(filters.bathrooms);
      result = result.filter(p => p.bathrooms >= min);
    }

    if (filters.energyCert && filters.energyCert !== "all") {
      result = result.filter(p => p.energy_certification === filters.energyCert);
    }

    if (filters.yearFrom) {
      const from = parseInt(filters.yearFrom);
      result = result.filter(p => p.year_built && p.year_built >= from);
    }
    if (filters.yearTo) {
      const to = parseInt(filters.yearTo);
      result = result.filter(p => p.year_built && p.year_built <= to);
    }

    if (filters.floorNumber) {
      const floorLower = filters.floorNumber.toLowerCase();
      result = result.filter(p => p.floor && p.floor.toLowerCase().includes(floorLower));
    }

    if (filters.hasGarage) result = result.filter(p => p.has_garage);
    if (filters.hasGarden) result = result.filter(p => p.has_garden);
    if (filters.hasPool) result = result.filter(p => p.has_pool);
    if (filters.hasElevator) result = result.filter(p => p.has_elevator);
    if (filters.hasAC) result = result.filter(p => p.has_ac);
    if (filters.hasCentralHeating) result = result.filter(p => p.has_central_heating);
    if (filters.petsAllowed) result = result.filter(p => p.pets_allowed);

    switch (filters.sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "area-desc":
        result = [...result].sort((a, b) => b.area - a.area);
        break;
      case "recent":
      default:
        result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [properties, filters]);

  const formatPrice = (price: number) => `€ ${price.toLocaleString("pt-PT")}`;
  const isNew = (createdAt: string) => {
    const diffDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  return (
    <main className="flex-1 min-w-0">
      <SearchResultsHeader count={filteredProperties.length} loading={loading} sortBy={filters.sortBy} setSortBy={setSortBy} />

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && filteredProperties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg mb-4">Nenhum imóvel encontrado com os filtros selecionados.</p>
          <Link to="/criar-anuncio">
            <Button>Publicar Imóvel</Button>
          </Link>
        </div>
      ) : !loading && (
        <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
          {filteredProperties.map(property => (
            <div key={property.id} onClick={() => sessionStorage.setItem("fromImoveis", "true")}>
              <PropertyCard
                id={property.id}
                image={property.image_url || property.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
                title={property.title}
                location={property.location}
                price={formatPrice(property.price)}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                area={property.area}
                documentationLevel={property.documentation_level as DocumentationLevel}
                isNew={isNew(property.created_at)}
              />
            </div>
          ))}
        </div>
      )}

      {!loading && filteredProperties.length > 0 && (
        <div className="flex justify-center mt-8 gap-2">
          <Button variant="outline" disabled>Anterior</Button>
          <Button variant="default">1</Button>
          <Button variant="outline">Próximo</Button>
        </div>
      )}
    </main>
  );
};

export default SearchResults;
