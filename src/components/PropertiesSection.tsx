import { Link } from "react-router-dom";
import PropertyCard from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { usePublicProperties } from "@/hooks/usePublicProperties";
import type { DocumentationLevel } from "./PropertyCard";

const PropertiesSection = () => {
  const { properties, loading } = usePublicProperties({ limit: 6 });

  // Check if property was created in last 7 days
  const isNew = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  const formatPrice = (price: number) => {
    return `€${price.toLocaleString('pt-PT')}`;
  };

  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              Imóveis em Destaque
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Descubra o Seu Próximo Lar
            </h2>
          </div>
          <Link to="/pesquisar">
            <Button variant="outline" size="lg" className="group w-fit">
              Ver Todos os Imóveis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!loading && properties.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-4">
              Ainda não existem imóveis publicados.
            </p>
            <Link to="/criar-anuncio">
              <Button>Publicar Primeiro Imóvel</Button>
            </Link>
          </div>
        )}

        {/* Properties Grid */}
        {!loading && properties.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {properties.map((property, index) => (
              <div
                key={property.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
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
      </div>
    </section>
  );
};

export default PropertiesSection;
