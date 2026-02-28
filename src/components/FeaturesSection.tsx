import { Shield, Wallet, FileCheck, Users, Clock, Lock } from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Zero Comissões",
    description: "Venda o seu imóvel sem pagar comissões a imobiliárias. Economize milhares de euros.",
  },
  {
    icon: Lock,
    title: "Cofre Digital",
    description: "Guarde todos os documentos do imóvel em segurança e partilhe apenas com quem autorizar.",
  },
  {
    icon: Users,
    title: "Marketplace de Serviços",
    description: "Acesso direto a advogados, notários, certificação energética e mais profissionais.",
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Documentos encriptados e processo transparente do início ao fim.",
  },
  {
    icon: FileCheck,
    title: "Documentação Completa",
    description: "Verifique se o imóvel tem toda a documentação em ordem antes de comprar.",
  },
  {
    icon: Clock,
    title: "Processo Simplificado",
    description: "Da publicação à escritura, tudo numa única plataforma intuitiva.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Porquê a ImoPonto?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            A Forma Mais Inteligente de Comprar e Vender
          </h2>
          <p className="text-muted-foreground text-lg">
            Eliminámos os intermediários desnecessários para lhe oferecer uma experiência transparente e económica.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 md:p-8 rounded-2xl bg-card border border-border hover:border-accent/30 shadow-soft hover:shadow-medium transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent-gradient group-hover:shadow-accent transition-all duration-300">
                <feature.icon className="w-7 h-7 text-accent group-hover:text-accent-foreground transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
