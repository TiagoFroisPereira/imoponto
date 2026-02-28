import { Link } from "react-router-dom";
import { Eye, Edit, Trash2, MoreVertical, Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProperties } from "@/hooks/useProperties";
import { Skeleton } from "@/components/ui/skeleton";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  active: { label: "Ativo", variant: "default" },
  pending: { label: "Pendente", variant: "secondary" },
  paused: { label: "Pausado", variant: "secondary" },
  sold: { label: "Vendido", variant: "outline" },
};

export function PropertyList() {
  const { properties, loading, deleteProperty, toggleStatus } = useProperties();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border/50 rounded-xl p-4 flex gap-4">
            <Skeleton className="w-32 h-24 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-12 text-center">
        <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Sem imóveis</h3>
        <p className="text-muted-foreground mt-2 mb-4">
          Ainda não criou nenhum anúncio de imóvel.
        </p>
        <Button asChild>
          <Link to="/criar-anuncio">
            <Plus className="w-4 h-4 mr-2" />
            Criar Anúncio
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <Link
          key={property.id}
          to={`/imovel/${property.id}`}
          className={`block bg-card border border-border/50 rounded-xl p-4 hover:shadow-elegant hover:border-primary/30 transition-all cursor-pointer ${
            property.status === 'paused' ? 'opacity-60' : ''
          }`}
        >
          <div className="flex gap-4">
          <img
            src={property.image_url || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=200&fit=crop"}
            alt={property.title}
            className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground truncate">{property.title}</h3>
                <p className="text-sm text-muted-foreground">{property.location}</p>
              </div>
              <Badge variant={statusLabels[property.status]?.variant || "secondary"}>
                {statusLabels[property.status]?.label || property.status}
              </Badge>
            </div>
            <div className="flex items-center gap-6 mt-3">
              <p className="text-lg font-bold text-primary">
                €{property.price.toLocaleString("pt-PT")}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {property.views_count} visualizações
                </span>
                <span>{property.inquiries_count} contactos</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/editar-anuncio/${property.id}`}>
                <Edit className="w-4 h-4" />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/imovel/${property.id}`}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Anúncio
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/editar-anuncio/${property.id}`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleStatus(property.id, property.status)}>
                  {property.status === 'active' ? 'Pausar' : 'Ativar'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => deleteProperty(property.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
