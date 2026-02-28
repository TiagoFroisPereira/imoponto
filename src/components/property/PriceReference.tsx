import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMemo } from "react";

// Preços médios por m² em Portugal por distrito (valores aproximados de 2024)
// Fonte: Dados de referência do mercado imobiliário português
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
  // Regiões Autónomas
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

interface PriceReferenceProps {
  city: string;
  area: number;
  price: number;
  propertyType?: string;
}

export function PriceReference({ city, area, price, propertyType }: PriceReferenceProps) {
  const analysis = useMemo(() => {
    if (!city || !area || area <= 0) return null;

    // Tentar encontrar o distrito pela cidade
    let district = cityToDistrict[city];
    
    // Se não encontrar, tentar encontrar por nome do distrito
    if (!district && districtPrices[city]) {
      district = city;
    }

    // Procurar por match parcial
    if (!district) {
      const cityLower = city.toLowerCase();
      for (const [key, value] of Object.entries(cityToDistrict)) {
        if (key.toLowerCase().includes(cityLower) || cityLower.includes(key.toLowerCase())) {
          district = value;
          break;
        }
      }
    }

    // Procurar diretamente nos distritos
    if (!district) {
      for (const districtName of Object.keys(districtPrices)) {
        if (districtName.toLowerCase().includes(city.toLowerCase()) || 
            city.toLowerCase().includes(districtName.toLowerCase())) {
          district = districtName;
          break;
        }
      }
    }

    if (!district || !districtPrices[district]) return null;

    const priceData = districtPrices[district];
    const pricePerSqm = price > 0 ? Math.round(price / area) : 0;
    
    // Calcular a posição relativa do preço
    let position: "below" | "average" | "above" = "average";
    let percentage = 0;
    
    if (pricePerSqm > 0) {
      if (pricePerSqm < priceData.avg * 0.85) {
        position = "below";
        percentage = Math.round(((priceData.avg - pricePerSqm) / priceData.avg) * 100);
      } else if (pricePerSqm > priceData.avg * 1.15) {
        position = "above";
        percentage = Math.round(((pricePerSqm - priceData.avg) / priceData.avg) * 100);
      }
    }

    // Calcular preço sugerido
    const suggestedPrice = Math.round(priceData.avg * area);
    const suggestedMin = Math.round(priceData.min * area);
    const suggestedMax = Math.round(priceData.max * area);

    return {
      district,
      priceData,
      pricePerSqm,
      position,
      percentage,
      suggestedPrice,
      suggestedMin,
      suggestedMax,
    };
  }, [city, area, price]);

  if (!analysis) {
    if (city && area > 0) {
      return (
        <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                Introduza a cidade para ver referências de preço por m² na zona.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              Referência de preço: {analysis.district}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Preço médio na zona: <span className="font-semibold">{formatPrice(analysis.priceData.avg)}/m²</span>
              <span className="mx-2">•</span>
              Intervalo: {formatPrice(analysis.priceData.min)} - {formatPrice(analysis.priceData.max)}/m²
            </p>
          </div>

          {/* Sugestão de preço baseado na área */}
          <div className="pt-2 border-t border-primary/10">
            <p className="text-xs text-muted-foreground mb-2">
              Para {area} m² sugerimos:
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Mínimo</p>
                <p className="text-sm font-semibold text-foreground">{formatPrice(analysis.suggestedMin)}</p>
              </div>
              <div className="text-center px-3 py-1 bg-primary/10 rounded">
                <p className="text-xs text-primary">Médio</p>
                <p className="text-sm font-bold text-primary">{formatPrice(analysis.suggestedPrice)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Máximo</p>
                <p className="text-sm font-semibold text-foreground">{formatPrice(analysis.suggestedMax)}</p>
              </div>
            </div>
          </div>

          {/* Análise do preço atual */}
          {price > 0 && analysis.pricePerSqm > 0 && (
            <div className="pt-2 border-t border-primary/10">
              <div className="flex items-center gap-2">
                {analysis.position === "below" && (
                  <>
                    <TrendingDown className="w-4 h-4 text-green-600" />
                    <p className="text-xs text-green-600 font-medium">
                      O seu preço ({formatPrice(analysis.pricePerSqm)}/m²) está {analysis.percentage}% abaixo da média
                    </p>
                  </>
                )}
                {analysis.position === "average" && (
                  <>
                    <Minus className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-blue-600 font-medium">
                      O seu preço ({formatPrice(analysis.pricePerSqm)}/m²) está dentro da média
                    </p>
                  </>
                )}
                {analysis.position === "above" && (
                  <>
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                    <p className="text-xs text-orange-600 font-medium">
                      O seu preço ({formatPrice(analysis.pricePerSqm)}/m²) está {analysis.percentage}% acima da média
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
