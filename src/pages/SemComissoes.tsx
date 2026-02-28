import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SavingsCalculator from "@/components/SavingsCalculator";
import {
  CheckCircle,
  ArrowRight,
  Home,
  Users,
  Shield,
  PiggyBank,
  Handshake,
  FileSignature,
  CheckCheck,
  Calendar,
  Sparkles,
  ClipboardList,
  Target,
} from "lucide-react";
import ListingOptionsSection from "@/components/property/ListingOptionsSection";

const steps = [
  {
    number: "01",
    title: "Criação e Preparação",
    description: "Crie o seu imóvel e organize a documentação no Cofre Digital. Pode optar por publicar o anúncio ou gerir a venda de forma privada.",
    icon: ClipboardList,
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500",
  },
  {
    number: "02",
    title: "Visitas e Contactos",
    description: "Fale diretamente com compradores e organize visitas através do seu Centro de Controlo personalizado.",
    icon: Calendar,
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500",
  },
  {
    number: "03",
    title: "Propostas e Negociação",
    description: "Receba, compare e aceite propostas de compra de forma organizada e transparente na nossa plataforma.",
    icon: Handshake,
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-500",
  },
  {
    number: "04",
    title: "Formalização Jurídica",
    description: "Garantimos o apoio necessário para a criação do CPCV e preparação da Escritura com profissionais verificados.",
    icon: FileSignature,
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
  },
  {
    number: "05",
    title: "Venda Concluída",
    description: "Finalize o negócio, entregue as chaves e celebre a poupança total de comissões imobiliárias.",
    icon: CheckCheck,
    color: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-600",
  },
];

const benefits = [
  {
    title: "Poupança real",
    description: "Evite comissões de 5% + IVA que as agências cobram. Num imóvel de €300.000, são €18.450 de poupança.",
    icon: PiggyBank,
  },
  {
    title: "Controlo total",
    description: "Você decide quem visita o seu imóvel, quando e como. Sem pressões de intermediários.",
    icon: Home,
  },
  {
    title: "Profissionais verificados",
    description: "Acesso a advogados, engenheiros e outros profissionais certificados quando precisar.",
    icon: Shield,
  },
  {
    title: "Suporte dedicado",
    description: "A nossa equipa está disponível para ajudar em cada etapa do processo.",
    icon: Users,
  },
];

const comparisonPoints = [
  { label: "Comissão de Venda", agency: "5% a 6% + IVA", imoponto: "0% (Zero)" },
  { label: "Controlo das Visitas", agency: "Agente Decide", imoponto: "Você Decide" },
  { label: "Documentação", agency: "Tratada por Terceiros", imoponto: "Cofre Digital Seguro" },
  { label: "Custo Fixo", agency: "Milhares de Euros", imoponto: "Baixo Custo / Grátis" },
  { label: "Transparência", agency: "Intermediários", imoponto: "Contacto Direto" },
];

export default function SemComissoes() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash === "#publicar") {
      const element = document.getElementById("publicar");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [hash]);

  const handleStartListing = () => {
    const element = document.getElementById("publicar");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToProcess = () => {
    const element = document.getElementById("processo");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-background text-foreground">

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">A revolução entre particulares em Portugal</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight tracking-tight">
              Venda a sua casa{" "}
              <span className="text-accent relative inline-block group">
                pelo valor real
                <div className="absolute -bottom-2 left-0 w-full h-2 bg-accent/30 rounded-full overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-accent translate-x-[-100%] animate-shimmer" />
                </div>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Mantenha o valor total da sua venda. Elimine os intermediários e poupe dezenas de milhares em comissões com ferramentas profissionais e seguras.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button variant="accent" size="xl" onClick={handleStartListing} className="text-lg px-10 h-16 shadow-xl shadow-accent/20">
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="xl" onClick={scrollToProcess} className="text-lg px-10 h-16">
                Como Funciona
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Savings Calculator Integration */}
      <div id="calculator" className="py-8 md:py-16">
        <SavingsCalculator />
      </div>

      {/* Comparison Table Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Target className="w-3 h-3" />
              <span>Transparência Máxima</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">ImoPonto vs. Agência Tradicional</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Veja porque milhares de proprietários escolhem tomar o controlo da sua venda.
            </p>
          </div>

          <div className="max-w-4xl mx-auto overflow-hidden rounded-3xl border border-border shadow-2xl bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="p-3 md:p-8 font-bold text-sm md:text-lg">Vantagens</th>
                    <th className="p-3 md:p-8 font-bold text-xs md:text-lg text-destructive text-center">Agência (5% + IVA)</th>
                    <th className="p-3 md:p-8 font-bold text-xs md:text-lg text-accent text-center">ImoPonto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {comparisonPoints.map((point, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 md:p-8 text-xs md:text-base font-semibold">{point.label}</td>
                      <td className="p-3 md:p-8 text-xs md:text-base text-destructive/70 text-center">{point.agency}</td>
                      <td className="p-3 md:p-8 text-xs md:text-base text-accent font-bold text-center bg-accent/5">{point.imoponto}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-8 bg-accent/5 text-center border-t border-border">
              <p className="text-accent font-bold text-xl md:text-2xl">
                ImoPonto: Mais Dinheiro no Seu Bolso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Vantagens de Vender Com a ImoPonto
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Fornecemos as ferramentas, você mantém o lucro e o controlo total.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-border/50 bg-card hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <CardContent className="pt-8 p-8">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                    <benefit.icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Improved Steps Section */}
      <section id="processo" className="py-20 md:py-32 bg-muted/10 overflow-hidden relative">
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block">Processo Simples</span>
            <h2 className="text-4xl md:text-6xl font-extrabold mb-8">Como funciona?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Um caminho claro e guiado desde a preparação até à conclusão do negócio.
            </p>
          </div>

          <div className="max-w-5xl mx-auto relative">
            <div className="absolute left-[2.5rem] md:left-1/2 top-10 bottom-10 w-px bg-border hidden md:block" />

            <div className="grid gap-12">
              {steps.map((step, index) => (
                <div key={index} className="relative group p-8 md:p-12 rounded-[2rem] border border-border/50 bg-card hover:border-accent/30 hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500">
                  <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 leading-normal">
                    <div className="relative flex-shrink-0">
                      <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center rotate-3 group-hover:rotate-0 transition-all duration-500 shadow-lg`}>
                        <step.icon className={`w-10 h-10 ${step.iconColor}`} />
                      </div>
                      <div className="absolute -top-3 -right-3 w-10 h-10 rounded-2xl bg-background border border-border flex items-center justify-center text-lg font-black shadow-xl">
                        {step.number}
                      </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
                        <h3 className="text-3xl font-black text-foreground">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    <div className="hidden lg:flex flex-shrink-0 items-center justify-center w-16 h-16 rounded-full border border-border group-hover:border-accent/30 group-hover:bg-accent/5 transition-all duration-500">
                      <ArrowRight className={`w-8 h-8 text-muted/30 group-hover:${step.iconColor} group-hover:translate-x-1 transition-all`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ListingOptionsSection id="publicar" />
      
    </div>
  );
}
