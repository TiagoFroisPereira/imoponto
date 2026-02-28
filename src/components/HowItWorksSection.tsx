import { PlusCircle, LayoutDashboard, Handshake, PiggyBank, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: PlusCircle,
    title: "Crie o Imóvel",
    description: "Registe o imóvel e prepare os documentos, com ou sem publicação.",
    color: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: LayoutDashboard,
    title: "Gerencie",
    description: "Controle visitas e receba contactos.",
    color: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    icon: Handshake,
    title: "Negocie",
    description: "Analise propostas e aceite a melhor.",
    color: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: PiggyBank,
    title: "Poupe",
    description: "Feche o negócio sem comissões.",
    color: "bg-green-500/10",
    iconColor: "text-green-600",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Como funciona
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {steps.map((step, index) => (
              <div key={step.title} className="group text-center relative p-6 rounded-2xl hover:bg-muted/50 transition-all duration-300">
                {/* Step number */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background border border-border text-muted-foreground text-xs font-bold flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-20 h-20 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className={`w-10 h-10 ${step.iconColor}`} />
                </div>

                <h3 className="font-bold text-foreground text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed px-4">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button asChild variant="outline" size="sm">
              <Link to="/sem-comissoes">
                Ver como vender
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
