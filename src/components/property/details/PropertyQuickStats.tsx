import { Bed, Bath, Maximize, Building, Zap, Car, Trees } from "lucide-react";

interface PropertyQuickStatsProps {
  bedrooms: number;
  bathrooms: number;
  area: number;
  floor?: string | null;
  energyCertification?: string | null;
  parking?: number | null;
  hasGarden?: boolean | null;
}

export function PropertyQuickStats({
  bedrooms,
  bathrooms,
  area,
  floor,
  energyCertification,
  parking,
  hasGarden,
}: PropertyQuickStatsProps) {
  return (
    <div className="flex flex-wrap gap-6 py-4 border-y border-border">
      <div className="flex items-center gap-2">
        <Bed className="w-5 h-5 text-muted-foreground" />
        <span className="text-foreground">{bedrooms} Quartos</span>
      </div>
      <div className="flex items-center gap-2">
        <Bath className="w-5 h-5 text-muted-foreground" />
        <span className="text-foreground">{bathrooms} WC</span>
      </div>
      <div className="flex items-center gap-2">
        <Maximize className="w-5 h-5 text-muted-foreground" />
        <span className="text-foreground">{area} m²</span>
      </div>
      {floor && (
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-muted-foreground" />
          <span className="text-foreground">
            {floor === "0" ? "R/C" : `${floor}º Andar`}
          </span>
        </div>
      )}
      {energyCertification && (
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-muted-foreground" />
          <span className="text-foreground">Classe {energyCertification}</span>
        </div>
      )}
      {parking != null && parking > 0 && (
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-muted-foreground" />
          <span className="text-foreground">{parking} Lugares</span>
        </div>
      )}
      {hasGarden && (
        <div className="flex items-center gap-2">
          <Trees className="w-5 h-5 text-muted-foreground" />
          <span className="text-foreground">Jardim</span>
        </div>
      )}
    </div>
  );
}
