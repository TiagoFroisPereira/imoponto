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
import ComparisonTable from "@/components/ComparisonTable";

const steps = [
  {
    number: "01",
    title: "Criação e Preparação",
    description: "Crie o seu anúncio e organize a documentação no Cofre Digital. Pode optar por publicar o anúncio ou gerir a venda de forma privada.",
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
    description: "Escolha na lista de serviços o profissional pretendido para redigir o CPCV e/ou Escritura.",
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
    description: "A nossa plataforma está disponível para ajudar em cada etapa do processo.",
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
      <section className="pt-20 pb-12 md:pt-40 md:pb-32 overflow-hidden relative min-h-[70vh] md:min-h-[85vh] flex items-center">
        {/* Modern Background Elements */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000"
            alt="Portuguese Luxury Villa"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </div>

        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-64 h-64 md:w-[30rem] md:h-[30rem] bg-accent/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-64 h-64 md:w-[30rem] md:h-[30rem] bg-primary/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 md:px-6 py-2 rounded-full bg-accent/10 text-accent mb-6 md:mb-10 border border-accent/20 animate-fade-in backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] md:text-sm font-semibold tracking-wide uppercase">A revolução imobiliária em Portugal</span>
            </div>

            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black mb-6 md:mb-10 leading-[1.2] md:leading-[1.1] tracking-tight text-foreground">
              Venda a sua casa{" "}
              <span className="text-accent relative inline-block">
                pelo valor real
                <div className="absolute -bottom-2 md:-bottom-3 left-0 w-full h-1.5 md:h-3 bg-accent/20 rounded-full overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-accent/40 translate-x-[-100%] animate-shimmer" />
                </div>
              </span>
            </h1>

            <p className="text-lg md:text-2xl text-muted-foreground mb-8 md:mb-14 max-w-3xl mx-auto leading-relaxed font-medium">
              Porquê pagar <span className="text-foreground font-bold">€15.000 ou mais</span> em comissões? Mantenha o lucro total da venda com ferramentas profissionais e <span className="text-accent font-bold">sem intermediários</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
              <Button
                variant="accent"
                size="xl"
                onClick={handleStartListing}
                className="text-lg md:text-xl px-8 md:px-12 h-16 md:h-20 shadow-2xl shadow-accent/30 hover:shadow-accent/40 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto font-black"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 ml-3" />
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={scrollToProcess}
                className="text-lg md:text-xl px-8 md:px-12 h-16 md:h-20 hover:bg-accent/5 transition-all duration-300 w-full sm:w-auto border-2 border-border/50 font-bold"
              >
                Como Funciona
              </Button>
            </div>

            <div className="mt-10 md:mt-16 flex flex-wrap justify-center gap-6 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                <span className="text-xs md:text-base font-semibold">100% Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <PiggyBank className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                <span className="text-xs md:text-base font-semibold">0% Comissões</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                <span className="text-xs md:text-base font-semibold">Controlo Total</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Savings Calculator Integration */}
      <div id="calculator" className="py-8 md:py-16">
        <SavingsCalculator />
      </div>

      <ComparisonTable />

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
              <Card key={index} className="border-border/50 bg-card hover:shadow-[0_32px_64px_-16px_rgba(249,115,22,0.15)] hover:-translate-y-3 transition-all duration-500 overflow-hidden group">
                <CardContent className="pt-10 p-8 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full -mr-12 -mt-12 group-hover:bg-accent/10 transition-colors" />
                  <div className="w-16 h-16 rounded-2xl bg-accent text-white flex items-center justify-center mb-8 shadow-xl shadow-accent/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <benefit.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-foreground mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
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
