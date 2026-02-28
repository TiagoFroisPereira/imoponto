import { Link } from "react-router-dom";
import { Heart, MapPin, Bed, Bath, Maximize, CheckCircle, AlertCircle, XCircle, ShieldCheck } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type DocumentationLevel = "none" | "incomplete" | "complete" | "validated";

interface PropertyCardProps {
  id?: string | number;
  image: string;
  title: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  documentationLevel?: DocumentationLevel;
  hasDocuments?: boolean; // Keep for backward compatibility
  isNew?: boolean;
  isVerified?: boolean;
}

const documentationConfig: Record<DocumentationLevel, {
  icon: typeof CheckCircle;
  bgColor: string;
  textColor: string;
  label: string;
  description: string;
}> = {
  none: {
    icon: XCircle,
    bgColor: "bg-red-500/90",
    textColor: "text-white",
    label: "Sem Docs",
    description: "Inexistência de documentação",
  },
  incomplete: {
    icon: AlertCircle,
    bgColor: "bg-yellow-500/90",
    textColor: "text-white",
    label: "Docs Incompletos",
    description: "Insuficientes para Escritura ou CPCV",
  },
  complete: {
    icon: CheckCircle,
    bgColor: "bg-blue-500/90",
    textColor: "text-white",
    label: "Docs Completos",
    description: "Totalidade de documentos mas não validados",
  },
  validated: {
    icon: ShieldCheck,
    bgColor: "bg-green-500/90",
    textColor: "text-white",
    label: "Docs Válidos",
    description: "Validados para Escritura ou CPCV",
  },
};

const allStatusInfo = [
  { level: 'none' as DocumentationLevel, icon: XCircle, color: 'text-red-500', label: 'Sem Documentos', description: 'Inexistência de documentação' },
  { level: 'incomplete' as DocumentationLevel, icon: AlertCircle, color: 'text-yellow-500', label: 'Documentos Incompletos', description: 'Insuficientes para Escritura ou CPCV' },
  { level: 'complete' as DocumentationLevel, icon: CheckCircle, color: 'text-blue-500', label: 'Documentos Completos', description: 'Totalidade de documentos mas não validados' },
  { level: 'validated' as DocumentationLevel, icon: ShieldCheck, color: 'text-green-500', label: 'Documentos Válidos', description: 'Validados para Escritura ou CPCV' },
];

const PropertyCard = ({
  id,
  image,
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  area,
  documentationLevel,
  hasDocuments = false,
  isNew = false,
  isVerified = false,
}: PropertyCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();

  // Determine documentation level: use explicit prop or derive from hasDocuments
  // Map any unknown levels to valid config keys
  const mapDocLevel = (level: string | undefined): DocumentationLevel => {
    if (level === 'validated' || level === 'valid') return 'validated';
    if (level === 'complete' || level === 'full') return 'complete';
    if (level === 'incomplete' || level === 'partial') return 'incomplete';
    if (level === 'none' || !level) return hasDocuments ? 'complete' : 'none';
    return 'none';
  };

  const docLevel = mapDocLevel(documentationLevel);
  const docConfig = documentationConfig[docLevel];
  const DocIcon = docConfig.icon;

  const propertyId = id?.toString() || '';
  const isPropertyFavorite = propertyId ? isFavorite(propertyId) : false;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (propertyId) {
      await toggleFavorite(propertyId);
    }
  };

  const cardContent = (
    <article className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-accent/30 shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {isNew && (
            <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
              Novo
            </span>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={`px-3 py-1 rounded-full ${docConfig.bgColor} ${docConfig.textColor} text-xs font-medium flex items-center gap-1 backdrop-blur-sm cursor-help`}>
                  <DocIcon className="w-3 h-3" />
                  {docConfig.label}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="w-72 p-3">
                <p className="text-xs font-semibold mb-2 text-foreground">Estados de Documentação:</p>
                <div className="space-y-2">
                  {allStatusInfo.map((status) => {
                    const StatusIcon = status.icon;
                    const isActive = status.level === docLevel;
                    return (
                      <div
                        key={status.level}
                        className={`flex items-start gap-2 p-1.5 rounded ${isActive ? 'bg-muted' : ''}`}
                      >
                        <StatusIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${status.color}`} />
                        <div>
                          <p className={`text-xs font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {status.label}
                          </p>
                          <p className="text-xs text-muted-foreground">{status.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {isVerified && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="px-3 py-1 rounded-full bg-blue-500/90 text-white text-xs font-medium flex items-center gap-1 backdrop-blur-sm shadow-sm cursor-help">
                    <ShieldCheck className="w-3 h-3" />
                    Verificado
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Vendedor Verificado - Premium Pro</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Favorite Button */}
        <button
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
          onClick={handleFavoriteClick}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${isPropertyFavorite
              ? 'text-red-500 fill-red-500'
              : 'text-muted-foreground hover:text-red-500'
              }`}
          />
        </button>

        {/* Price Tag */}
        <div className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-card/90 backdrop-blur-sm">
          <span className="text-xl font-bold text-foreground">{price}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-accent transition-colors">
          {title}
        </h3>

        <div className="flex items-center gap-1 text-muted-foreground mb-4">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{location}</span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Bed className="w-4 h-4" />
            <span className="text-sm">{bedrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Bath className="w-4 h-4" />
            <span className="text-sm">{bathrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Maximize className="w-4 h-4" />
            <span className="text-sm">{area} m²</span>
          </div>
        </div>
      </div>
    </article>
  );

  // If we have an id, wrap in Link
  if (id) {
    return (
      <Link to={`/imovel/${id}`} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default PropertyCard;
