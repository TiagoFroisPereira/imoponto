import { Banknote, MessageCircle, Puzzle } from "lucide-react";

const benefits = [
  {
    icon: Banknote,
    title: "Zero comissões",
    description: "Fique com 100% do valor da venda.",
  },
  {
    icon: MessageCircle,
    title: "Contacto direto",
    description: "Fale diretamente com compradores interessados.",
  },
  {
    icon: Puzzle,
    title: "Serviços a pedido",
    description: "Contrate profissionais apenas quando precisar.",
  },
];

const DifferentiationSection = () => {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Porque vender sem imobiliária?
          </h2>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DifferentiationSection;
