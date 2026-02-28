import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { distritos, getAllConcelhos, getConcelhosForDistrito, getDistritoNames } from "@/data/portugalLocations";
import { getConcelhoPriceData, formatPricePT, type ConcelhoPriceResult } from "@/data/concelhoPrices";

interface ConcelhoSelectorProps {
  selectedDistrito: string;
  selectedConcelho: string;
  onDistritoChange: (distrito: string) => void;
  onConcelhoChange: (concelho: string) => void;
  area?: number;
  price?: number;
}

export function ConcelhoSelector({
  selectedDistrito,
  selectedConcelho,
  onDistritoChange,
  onConcelhoChange,
  area = 0,
  price = 0,
}: ConcelhoSelectorProps) {
  const distritoNames = getDistritoNames();
  const concelhos = selectedDistrito ? getConcelhosForDistrito(selectedDistrito) : [];
  
  const priceData = useMemo(() => {
    if (!selectedConcelho) return null;
    return getConcelhoPriceData(selectedConcelho, selectedDistrito);
  }, [selectedConcelho, selectedDistrito]);

  const analysis = useMemo(() => {
    if (!priceData || !area || area <= 0) return null;

    const { data } = priceData;
    const pricePerSqm = price > 0 ? Math.round(price / area) : 0;
    
    let position: "below" | "average" | "above" = "average";
    let percentage = 0;
    
    if (pricePerSqm > 0) {
      if (pricePerSqm < data.avg * 0.85) {
        position = "below";
        percentage = Math.round(((data.avg - pricePerSqm) / data.avg) * 100);
      } else if (pricePerSqm > data.avg * 1.15) {
        position = "above";
        percentage = Math.round(((pricePerSqm - data.avg) / data.avg) * 100);
      }
    }

    const suggestedPrice = Math.round(data.avg * area);
    const suggestedMin = Math.round(data.min * area);
    const suggestedMax = Math.round(data.max * area);

    return {
      pricePerSqm,
      position,
      percentage,
      suggestedPrice,
      suggestedMin,
      suggestedMax,
    };
  }, [priceData, area, price]);

  const handleDistritoChange = (value: string) => {
    onDistritoChange(value);
    onConcelhoChange(""); // Reset concelho when distrito changes
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="distrito">Distrito</Label>
          <Select value={selectedDistrito} onValueChange={handleDistritoChange}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Selecione o distrito" />
            </SelectTrigger>
            <SelectContent>
              {distritoNames.map((distrito) => (
                <SelectItem key={distrito} value={distrito}>
                  {distrito}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="concelho">Concelho</Label>
          <Select 
            value={selectedConcelho} 
            onValueChange={onConcelhoChange}
            disabled={!selectedDistrito}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder={selectedDistrito ? "Selecione o concelho" : "Selecione primeiro o distrito"} />
            </SelectTrigger>
            <SelectContent>
              {concelhos.map((concelho) => (
                <SelectItem key={concelho.name} value={concelho.name}>
                  {concelho.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price per m² Info for selected Concelho */}
      {selectedConcelho && priceData && (
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Preço por m² em {priceData.sourceName}
                  {priceData.source === 'distrito' && (
                    <span className="text-xs text-muted-foreground ml-2">(média do distrito)</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    Mínimo: {formatPricePT(priceData.data.min)}/m²
                  </Badge>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                    Média: {formatPricePT(priceData.data.avg)}/m²
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Máximo: {formatPricePT(priceData.data.max)}/m²
                  </Badge>
                </div>
                {priceData.source === 'distrito' && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Dados específicos para {selectedConcelho} não disponíveis. A usar média do distrito.
                  </p>
                )}
              </div>

              {/* Suggested prices when area is provided */}
              {analysis && area > 0 && (
                <div className="pt-3 border-t border-primary/10">
                  <p className="text-xs text-muted-foreground mb-2">
                    Para {area} m² sugerimos:
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Mínimo</p>
                      <p className="text-sm font-semibold text-foreground">{formatPricePT(analysis.suggestedMin)}</p>
                    </div>
                    <div className="text-center px-3 py-1 bg-primary/10 rounded">
                      <p className="text-xs text-primary">Médio</p>
                      <p className="text-sm font-bold text-primary">{formatPricePT(analysis.suggestedPrice)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Máximo</p>
                      <p className="text-sm font-semibold text-foreground">{formatPricePT(analysis.suggestedMax)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Price analysis when price is provided */}
              {analysis && price > 0 && analysis.pricePerSqm > 0 && (
                <div className="pt-3 border-t border-primary/10">
                  <div className="flex items-center gap-2">
                    {analysis.position === "below" && (
                      <>
                        <TrendingDown className="w-4 h-4 text-green-600" />
                        <p className="text-xs text-green-600 font-medium">
                          O seu preço ({formatPricePT(analysis.pricePerSqm)}/m²) está {analysis.percentage}% abaixo da média
                        </p>
                      </>
                    )}
                    {analysis.position === "average" && (
                      <>
                        <Minus className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-blue-600 font-medium">
                          O seu preço ({formatPricePT(analysis.pricePerSqm)}/m²) está dentro da média
                        </p>
                      </>
                    )}
                    {analysis.position === "above" && (
                      <>
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        <p className="text-xs text-orange-600 font-medium">
                          O seu preço ({formatPricePT(analysis.pricePerSqm)}/m²) está {analysis.percentage}% acima da média
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Helper text when no concelho is selected */}
      {selectedDistrito && !selectedConcelho && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="w-4 h-4" />
          <span>Selecione o concelho para ver os preços praticados na zona</span>
        </div>
      )}
    </div>
  );
}
