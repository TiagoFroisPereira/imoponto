import { useState } from "react";
import {
  Calculator,
  TrendingDown,
  Check,
  Euro,
  Sparkles,
  ArrowRight,
  Share2,
  Mail,
  Plane,
  Car,
  Home,
  Hammer
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setSaleValue(value);
  };

  const lifestyleBenefits = [
    { label: "Férias de luxo para a família", cost: 5000, icon: Plane },
    { label: "Remodelação da cozinha", cost: 15000, icon: Hammer },
    { label: "Entrada para um novo carro", cost: 10000, icon: Car },
    { label: "Amortização da hipoteca", cost: 20000, icon: Home },
  ];

  return (
    <section className="py-12 bg-muted/10 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-sm">
            <Calculator className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-primary tracking-wide uppercase">Simulador de Lucro Real</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground mb-4 md:mb-6 tracking-tight px-2">
            Quanto <span className="text-accent underline decoration-accent/30 underline-offset-4 md:underline-offset-8">dinheiro extra</span> quer no seu bolso?
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            As agências cobram <span className="font-bold text-foreground">5% + IVA</span>. Compare e veja a diferença em segundos.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 md:gap-10 items-start max-w-6xl mx-auto">
          {/* Left Side: Input & Agency Cost */}
          <div className="lg:col-span-5 space-y-6 md:space-y-8">
            <Card className="border-2 md:border-4 border-primary/10 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardContent className="pt-6 md:pt-8 px-4 md:px-6">
                <div className="space-y-4">
                  <label className="text-base md:text-xl font-black text-foreground block">
                    Valor esperado de venda:
                  </label>
                  <div className="relative">
                    <Euro className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-5 h-5 md:w-7 md:h-7 text-accent" />
                    <Input
                      type="text"
                      placeholder="Ex: 250000"
                      value={saleValue}
                      onChange={handleInputChange}
                      onFocus={(e) => e.target.select()}
                      className="pl-10 md:pl-16 text-xl md:text-3xl h-14 md:h-20 font-black border-2 focus-visible:ring-accent/20 bg-background border-border/50"
                    />
                  </div>
                  <p className="text-[10px] md:text-sm text-muted-foreground italic">
                    Insira o valor pelo qual pretende vender o seu imóvel
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-destructive/20 bg-destructive/5 shadow-lg">
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="flex items-center gap-3 text-destructive/80 text-sm md:text-lg uppercase tracking-wider font-bold">
                  <TrendingDown className="w-4 h-4 md:w-5 md:h-5" />
                  Custos de Agência Estimados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex justify-between items-center py-2 md:py-3 border-b border-destructive/10">
                  <span className="text-sm md:text-muted-foreground font-medium">Comissão (5%)</span>
                  <span className="text-sm md:text-base font-bold text-foreground">{formatCurrency(agencyCommission)}</span>
                </div>
                <div className="flex justify-between items-center py-2 md:py-3 border-b border-destructive/10">
                  <span className="text-sm md:text-muted-foreground font-medium">IVA (23%)</span>
                  <span className="text-sm md:text-base font-bold text-foreground">{formatCurrency(agencyVAT)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 md:pt-4">
                  <span className="text-base md:text-lg font-black text-foreground">Perda Total:</span>
                  <span className="text-xl md:text-3xl font-black text-destructive">{formatCurrency(totalAgencyCost)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side: The Star (Savings) */}
          <div className="lg:col-span-7 h-full">
            {parsedValue > 0 && totalAgencyCost > 0 ? (
              <Card className="relative h-full border-2 md:border-4 border-accent shadow-[0_0_50px_-12px_rgba(249,115,22,0.4)] bg-gradient-to-br from-accent/5 to-primary/5 overflow-hidden group">
                {/* Decorative particles/glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-[80px] group-hover:bg-accent/30 transition-all duration-700" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />

                <CardContent className="py-6 px-4 md:py-12 md:px-12 flex flex-col h-full text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-10">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-accent text-white mb-2 md:mb-4 shadow-lg shadow-accent/20">
                        <Sparkles className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Lucro Adicional</span>
                      </div>
                      <p className="text-base md:text-xl text-blue-900/40 font-medium">Com a ImoPonto, poupa:</p>
                      <p className="text-3xl sm:text-5xl md:text-8xl font-black text-accent tracking-tighter my-1 md:my-2 drop-shadow-sm break-words">
                        {formatCurrency(totalAgencyCost)}
                      </p>
                    </div>

                    <div className="flex flex-row md:flex-col gap-2 md:gap-3 justify-center">
                      <Button variant="outline" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-full border-accent/20 hover:bg-accent/10 transition-colors">
                        <Share2 className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-full border-accent/20 hover:bg-accent/10 transition-colors">
                        <Mail className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
                    <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                      O que poderia fazer com este valor?
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                      {lifestyleBenefits.filter(b => b.cost <= totalAgencyCost).map((benefit, i) => (
                        <div key={i} className="flex items-center gap-3 md:gap-4 p-2.5 md:p-4 rounded-xl md:rounded-2xl bg-white/50 border border-accent/10 backdrop-blur-sm hover:border-accent/30 transition-colors">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <benefit.icon className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                          </div>
                          <span className="text-[11px] md:text-sm font-bold text-foreground leading-tight text-left">{benefit.label}</span>
                        </div>
                      ))}
                      {totalAgencyCost < 5000 && (
                        <p className="text-[10px] md:text-sm text-muted-foreground italic col-span-1 sm:col-span-2">
                          Poupe para o que mais importa para si.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto pt-6 md:pt-8 border-t border-accent/10">
                    <Button
                      variant="accent"
                      className="w-full py-6 md:py-8 text-lg md:text-xl font-black rounded-xl md:rounded-2xl shadow-xl shadow-accent/20 hover:shadow-accent/40 group/btn h-auto px-6 md:px-10 overflow-hidden relative"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 md:gap-3">
                        Vender Agora & Manter o Lucro
                        <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover/btn:translate-x-2 transition-transform" />
                      </span>
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="h-full min-h-[300px] md:min-h-[400px] flex items-center justify-center border-2 md:border-4 border-dashed border-border rounded-2xl md:rounded-3xl opacity-50 p-6 text-center">
                <p className="text-lg md:text-xl font-bold text-muted-foreground">Insira um valor para ver a sua poupança</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SavingsCalculator;
