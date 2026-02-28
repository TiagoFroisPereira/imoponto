import { Link } from "react-router-dom";
import { Scale, FileSignature, Zap, CreditCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Scale,
    title: "Advogado Imobiliário",
    description: "Assessoria jurídica completa para compra e venda.",
    category: "juridico",
  },
  {
    icon: FileSignature,
    title: "Notário",
    description: "Escrituras e autenticação de documentos.",
    category: "juridico",
  },
  {
    icon: Zap,
    title: "Certificação Energética",
    description: "Certificado obrigatório para venda ou arrendamento.",
    category: "tecnico",
  },
  {
    icon: CreditCard,
    title: "Intermediação de Crédito",
    description: "Encontramos a melhor taxa de financiamento.",
    category: "financeiro",
  },
];

const ServicesSection = () => {
  return (
    <section id="servicos" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Marketplace de Serviços
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tudo o Que Precisa, Num Só Lugar
          </h2>
          <p className="text-muted-foreground text-lg">
            Contrate profissionais verificados diretamente na plataforma. Sem complicações, com total transparência.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              key={service.title}
              to={`/servicos?categoria=${service.category}`}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-accent/30 shadow-soft hover:shadow-medium transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-gradient group-hover:shadow-accent transition-all duration-300">
                  <service.icon className="w-6 h-6 text-accent group-hover:text-accent-foreground transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </div>
              </div>
              <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-muted-foreground/30 group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="accent" size="lg" asChild>
            <Link to="/servicos">
              Ver Todos os Serviços
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
