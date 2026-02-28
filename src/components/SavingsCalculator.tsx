import { useState } from "react";
import { Calculator, TrendingDown, Check, Euro } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SavingsCalculator = () => {
  const [saleValue, setSaleValue] = useState<string>("250000");

  const parsedValue = parseFloat(saleValue.replace(/[^\d]/g, "")) || 0;

  // Agency commission: 5% + 23% VAT
  const agencyCommission = parsedValue * 0.05;
  const agencyVAT = agencyCommission * 0.23;
  const totalAgencyCost = agencyCommission + agencyVAT;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setSaleValue(value);
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Calculator className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Simulador de Poupança</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Calcule Quanto Pode Poupar
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Compare os custos de uma agência imobiliária tradicional com a nossa plataforma
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Input Section */}
          <Card className="mb-8 border-2 border-primary/20 bg-card">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <label className="text-lg font-medium text-foreground whitespace-nowrap">
                  Valor de Venda:
                </label>
                <div className="relative flex-1 w-full max-w-md">
                  <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Ex: 250000"
                    value={saleValue}
                    onChange={handleInputChange}
                    onFocus={(e) => e.target.select()}
                    className="pl-12 text-xl h-14 font-semibold"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agency Cost Card */}
          <Card className="mb-6 border-2 border-destructive/30 bg-destructive/5">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-destructive">
                <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5" />
                </div>
                Custo com Agência Imobiliária
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Comissão (5%)</span>
                  <span className="font-medium text-foreground">{formatCurrency(agencyCommission)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">IVA (23%)</span>
                  <span className="font-medium text-foreground">{formatCurrency(agencyVAT)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t-2 border-destructive/30">
                <span className="text-lg font-semibold text-foreground">Total a Pagar</span>
                <span className="text-2xl font-bold text-destructive">{formatCurrency(totalAgencyCost)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Savings Summary */}
          {parsedValue > 0 && totalAgencyCost > 0 && (
            <Card className="border-2 border-accent bg-gradient-to-r from-accent/10 to-primary/10">
              <CardContent className="py-8">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 mb-4">
                    <Check className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-accent">Com a Nossa Plataforma</span>
                  </div>
                  <p className="text-lg text-muted-foreground mb-2">A sua poupança total</p>
                  <p className="text-4xl md:text-5xl font-bold text-accent mb-4">
                    {formatCurrency(totalAgencyCost)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Evite pagar comissões de agência imobiliária
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default SavingsCalculator;
