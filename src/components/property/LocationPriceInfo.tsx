import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMemo } from "react";

// Preços médios por m² em Portugal por distrito (valores aproximados de 2024)
const districtPrices: Record<string, { avg: number; min: number; max: number }> = {
  "Aveiro": { avg: 1450, min: 900, max: 2200 },
  "Beja": { avg: 750, min: 450, max: 1100 },
  "Braga": { avg: 1400, min: 850, max: 2100 },
  "Bragança": { avg: 650, min: 400, max: 950 },
  "Castelo Branco": { avg: 700, min: 450, max: 1000 },
  "Coimbra": { avg: 1300, min: 800, max: 1900 },
  "Évora": { avg: 1100, min: 700, max: 1600 },
  "Faro": { avg: 2800, min: 1500, max: 4500 },
  "Guarda": { avg: 600, min: 380, max: 900 },
  "Leiria": { avg: 1200, min: 750, max: 1800 },
  "Lisboa": { avg: 4200, min: 2500, max: 7000 },
  "Portalegre": { avg: 650, min: 400, max: 950 },
  "Porto": { avg: 2800, min: 1600, max: 4200 },
  "Santarém": { avg: 950, min: 600, max: 1400 },
  "Setúbal": { avg: 2200, min: 1300, max: 3500 },
  "Viana do Castelo": { avg: 1200, min: 750, max: 1800 },
  "Vila Real": { avg: 750, min: 480, max: 1100 },
  "Viseu": { avg: 850, min: 550, max: 1250 },
  "Açores": { avg: 1100, min: 700, max: 1600 },
  "Madeira": { avg: 1800, min: 1100, max: 2800 },
};

// Mapeamento de cidades/concelhos para distritos
const cityToDistrict: Record<string, string> = {
  // Lisboa
  "Lisboa": "Lisboa",
  "Amadora": "Lisboa",
  "Cascais": "Lisboa",
  "Loures": "Lisboa",
  "Odivelas": "Lisboa",
  "Oeiras": "Lisboa",
  "Sintra": "Lisboa",
  // Porto
  "Porto": "Porto",
  "Matosinhos": "Porto",
  "Maia": "Porto",
  "Vila Nova de Gaia": "Porto",
  "Gondomar": "Porto",
  // Faro (Algarve)
  "Faro": "Faro",
  "Albufeira": "Faro",
  "Lagos": "Faro",
  "Portimão": "Faro",
  "Loulé": "Faro",
  "Tavira": "Faro",
  // Setúbal
  "Setúbal": "Setúbal",
  "Almada": "Setúbal",
  "Seixal": "Setúbal",
  "Barreiro": "Setúbal",
  // Outros
  "Coimbra": "Coimbra",
  "Braga": "Braga",
  "Guimarães": "Braga",
  "Aveiro": "Aveiro",
  "Leiria": "Leiria",
  "Évora": "Évora",
  "Funchal": "Madeira",
  "Ponta Delgada": "Açores",
};

interface LocationPriceInfoProps {
  location: string;
  price: number;
  area: number;
}

export function LocationPriceInfo({ location, price, area }: LocationPriceInfoProps) {
  const analysis = useMemo(() => {
    if (!location || !area || area <= 0 || !price || price <= 0) return null;

    // Tentar encontrar o distrito pela cidade
    let district = cityToDistrict[location];
    
    // Se não encontrar, tentar encontrar por nome do distrito
    if (!district && districtPrices[location]) {
      district = location;
    }

    // Procurar por match parcial
    if (!district) {
      const locationLower = location.toLowerCase();
      for (const [key, value] of Object.entries(cityToDistrict)) {
        if (key.toLowerCase().includes(locationLower) || locationLower.includes(key.toLowerCase())) {
          district = value;
          break;
        }
      }
    }

    // Procurar diretamente nos distritos
    if (!district) {
      for (const districtName of Object.keys(districtPrices)) {
        if (districtName.toLowerCase().includes(location.toLowerCase()) || 
            location.toLowerCase().includes(districtName.toLowerCase())) {
          district = districtName;
          break;
        }
      }
    }

    if (!district || !districtPrices[district]) return null;

    const priceData = districtPrices[district];
    const pricePerSqm = Math.round(price / area);
    
    // Calcular a posição relativa do preço
    let position: "below" | "average" | "above" = "average";
    let percentage = 0;
    
    if (pricePerSqm < priceData.avg * 0.85) {
      position = "below";
      percentage = Math.round(((priceData.avg - pricePerSqm) / priceData.avg) * 100);
    } else if (pricePerSqm > priceData.avg * 1.15) {
      position = "above";
      percentage = Math.round(((pricePerSqm - priceData.avg) / priceData.avg) * 100);
    }

    return {
      district,
      avgPrice: priceData.avg,
      pricePerSqm,
      position,
      percentage,
    };
  }, [location, price, area]);

  if (!analysis) return null;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      <Badge variant="outline" className="text-xs font-normal">
        Média {analysis.district}: {formatPrice(analysis.avgPrice)}/m²
      </Badge>
      <Badge variant="outline" className="text-xs font-normal">
        Este imóvel: {formatPrice(analysis.pricePerSqm)}/m²
      </Badge>
      {analysis.position === "below" && (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
          <TrendingDown className="w-3 h-3 mr-1" />
          {analysis.percentage}% abaixo da média
        </Badge>
      )}
      {analysis.position === "average" && (
        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
          <Minus className="w-3 h-3 mr-1" />
          Na média
        </Badge>
      )}
      {analysis.position === "above" && (
        <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs">
          <TrendingUp className="w-3 h-3 mr-1" />
          {analysis.percentage}% acima da média
        </Badge>
      )}
    </div>
  );
}
