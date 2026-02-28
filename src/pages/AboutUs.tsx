import {
  Home, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Sparkles,
  Users,
  FileText,
  MapPin,
  BarChart3,
  Shield
} from "lucide-react";

const AboutUs = () => {
  return (
    <div className="bg-background">
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-accent-gradient flex items-center justify-center mx-auto mb-6">
              <Home className="w-8 h-8 text-accent-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Sobre a ImoPonto
            </h1>
            <p className="text-muted-foreground">
              Clareza em cada passo. Autonomia em cada decisão.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-12">
            {/* Introduction */}
            <section className="space-y-4">
              <p className="text-lg text-muted-foreground leading-relaxed">
                A <strong className="text-foreground">ImoPonto</strong> é uma plataforma tecnológica criada para simplificar 
                o processo de compra e venda de imóveis, sem intermediação, sem conflitos de interesse e sem dependência 
                de modelos tradicionais.
              </p>
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
                <p className="text-foreground font-medium mb-2">
                  A ImoPonto <strong>não é uma imobiliária</strong>.
                </p>
                <p className="text-muted-foreground">
                  Não faz mediação, não acompanha negociações, não representa partes e não presta aconselhamento 
                  jurídico, financeiro ou técnico.
                </p>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                O nosso papel é fornecer <strong className="text-foreground">infraestrutura digital</strong>, organização 
                e acesso a serviços essenciais, permitindo que utilizadores e profissionais atuem de forma autónoma, 
                transparente e informada.
              </p>
            </section>

            {/* Mission */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">A Nossa Missão</h2>
              </div>
              <div className="pl-13 space-y-4 text-muted-foreground">
                <p>
                  A missão da ImoPonto é <strong className="text-foreground">devolver controlo e clareza</strong> a 
                  quem compra ou vende um imóvel.
                </p>
                <p>Queremos que cada utilizador saiba:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "O que fazer",
                    "Quando fazer",
                    "Que documentação reunir",
                    "A que profissionais recorrer"
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p>
                  Tudo num único espaço, sem pressão comercial, sem comissões e sem interferência nas decisões.
                </p>
              </div>
            </section>

            {/* What We Do */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">O Que Fazemos</h2>
              </div>
              <div className="pl-13">
                <p className="text-muted-foreground mb-4">A ImoPonto disponibiliza:</p>
                <div className="grid gap-4">
                  {[
                    {
                      icon: Users,
                      title: "Marketplace de profissionais independentes",
                      description: "Advogados, notários, intermediários de crédito e técnicos de certificação energética"
                    },
                    {
                      icon: Shield,
                      title: "Cofre Digital",
                      description: "Organização e partilha controlada de documentação do imóvel"
                    },
                    {
                      icon: FileText,
                      title: "Guiões passo a passo",
                      description: "Apoio completo ao processo de compra e venda"
                    },
                    {
                      icon: BarChart3,
                      title: "Alertas informativos",
                      description: "Valores médios por metro quadrado, com base em dados agregados"
                    },
                    {
                      icon: MapPin,
                      title: "Plataforma neutra",
                      description: "Sem remuneração variável e sem interesse na conclusão do negócio"
                    }
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4 bg-muted/30 rounded-xl p-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* What We Don't Do */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">O Que Não Fazemos</h2>
              </div>
              <div className="pl-13 space-y-4">
                <p className="text-muted-foreground">
                  Para garantir total transparência, a ImoPonto não:
                </p>
                <ul className="space-y-2">
                  {[
                    "Intermedeia negócios imobiliários",
                    "Negocia preços ou condições",
                    "Representa compradores ou vendedores",
                    "Recebe comissões sobre transações",
                    "Valida documentos ou decisões",
                    "Substitui profissionais legalmente habilitados"
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-muted-foreground">
                      <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 mt-4">
                  A responsabilidade das decisões é sempre do utilizador.
                </p>
              </div>
            </section>

            {/* Vision */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">A Nossa Visão</h2>
              </div>
              <div className="pl-13 space-y-4 text-muted-foreground">
                <p>
                  Acreditamos num setor imobiliário mais simples, informado e acessível.
                </p>
                <p>Um setor onde a tecnologia serve para:</p>
                <div className="flex flex-wrap gap-3">
                  {["Organizar", "Esclarecer", "Conectar"].map((item) => (
                    <span 
                      key={item} 
                      className="px-4 py-2 bg-primary/10 text-primary rounded-full font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <p>E não para condicionar escolhas ou criar dependências.</p>
                <p className="text-foreground font-medium">
                  A ImoPonto posiciona-se como um <strong>ponto de ligação</strong>, não como um intermediário.
                </p>
              </div>
            </section>

            {/* Summary */}
            <section className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 border border-primary/10">
              <h2 className="text-xl font-semibold text-foreground mb-6 text-center">Em Resumo</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  "Plataforma tecnológica independente",
                  "Marketplace neutro de serviços",
                  "Ferramenta de apoio, não de decisão",
                  "Sem intermediação e sem comissões"
                ].map((item) => (
                  <div key={item} className="text-center p-4 bg-background/50 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
              <div className="text-center space-y-1">
                <p className="text-foreground font-semibold">Clareza em cada passo.</p>
                <p className="text-foreground font-semibold">Autonomia em cada decisão.</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutUs;
