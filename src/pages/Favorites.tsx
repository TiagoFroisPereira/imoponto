import { useEffect, useState, useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Loader2, ArrowLeft, Grid3X3, List, ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image_url: string | null;
  images: string[] | null;
  documentation_level: string;
}

export default function Favorites() {
  const { user, loading: authLoading } = useAuth();
  const { getFavoritePropertyIds, loading: favoritesLoading } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('recent');

  useEffect(() => {
    const fetchFavoriteProperties = async () => {
      const favoriteIds = getFavoritePropertyIds();
      
      if (favoriteIds.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('properties')
        .select('id, title, location, price, bedrooms, bathrooms, area, image_url, images, documentation_level')
        .in('id', favoriteIds)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching favorite properties:', error);
      } else {
        setProperties(data || []);
      }
      setLoading(false);
    };

    if (!favoritesLoading) {
      fetchFavoriteProperties();
    }
  }, [getFavoritePropertyIds, favoritesLoading]);

  // Get unique locations for filter
  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(properties.map(p => p.location).filter(loc => loc && loc.trim() !== ''))];
    return uniqueLocations.sort();
  }, [properties]);

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    let result = [...properties];

    // Apply location filter
    if (locationFilter !== 'all') {
      result = result.filter(p => p.location === locationFilter);
    }

    // Apply sorting
    switch (sortOrder) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'recent':
      default:
        // Keep original order (most recent favorites)
        break;
    }

    return result;
  }, [properties, locationFilter, sortOrder]);

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const formatPrice = (price: number) => {
    return `€ ${price.toLocaleString('pt-PT')}`;
  };

  const getPropertyImage = (property: Property) => {
    if (property.images && property.images.length > 0) {
      return property.images[0];
    }
    return property.image_url || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800";
  };

  const isLoading = authLoading || favoritesLoading || loading;

  return (
    <div className="bg-background">

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <h1 className="text-3xl font-bold text-foreground">Os Meus Favoritos</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Sem favoritos
            </h2>
            <p className="text-muted-foreground mb-6">
              Ainda não adicionou nenhum imóvel aos favoritos.
            </p>
            <Button asChild>
              <Link to="/imoveis">Explorar Imóveis</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Filters and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
              <p className="text-muted-foreground">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'imóvel' : 'imóveis'} 
                {locationFilter !== 'all' && ` em ${locationFilter}`}
              </p>

              <div className="flex flex-wrap gap-3 items-center">
                {/* Location Filter */}
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Localização" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as localizações</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort Order */}
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-[160px]">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Mais recentes</SelectItem>
                    <SelectItem value="price-asc">Preço: menor</SelectItem>
                    <SelectItem value="price-desc">Preço: maior</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {filteredProperties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nenhum imóvel encontrado com os filtros selecionados.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setLocationFilter('all')}
                  className="mt-4"
                >
                  Limpar filtros
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    id={property.id}
                    image={getPropertyImage(property)}
                    title={property.title}
                    location={property.location}
                    price={formatPrice(property.price)}
                    bedrooms={property.bedrooms}
                    bathrooms={property.bathrooms}
                    area={property.area}
                    documentationLevel={property.documentation_level as any}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredProperties.map((property) => (
                  <Link 
                    key={property.id} 
                    to={`/imovel/${property.id}`}
                    className="flex gap-4 p-4 bg-card border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <img 
                      src={getPropertyImage(property)} 
                      alt={property.title}
                      className="w-24 sm:w-48 h-24 sm:h-32 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{property.title}</h3>
                      <p className="text-muted-foreground text-sm">{property.location}</p>
                      <p className="text-primary font-bold mt-2">{formatPrice(property.price)}</p>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{property.bedrooms} quartos</span>
                        <span>{property.bathrooms} WC</span>
                        <span>{property.area} m²</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
