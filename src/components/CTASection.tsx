import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 md:py-32 bg-primary relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-accent-gradient opacity-10" />
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-white/10 rounded-full blur-3xl opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white mb-8 border border-white/20">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Junte-se a milhares de proprietários</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-8 leading-tight tracking-tight">
            Venda o seu imóvel <br className="hidden md:block" />
            <span className="text-accent underline decoration-accent/30 underline-offset-8 italic">pelo valor real</span>
          </h2>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-12 max-w-2xl mx-auto font-medium">
            Retenha 100% da sua venda. Elimine comissões e tome o controlo total do processo.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              variant="accent"
              size="xl"
              className="text-xl px-12 h-20 shadow-2xl shadow-black/20 hover:scale-105 transition-all"
              asChild
            >
              <Link to="/sem-comissoes#publicar">
                Publicar Grátis
                <ArrowRight className="w-6 h-6 ml-2" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="xl"
              className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-white/10 text-xl px-10 h-20"
              asChild
            >
              <Link to="/sem-comissoes">
                Como Funciona
              </Link>
            </Button>
          </div>

          {/* Trust text */}
          <p className="text-primary-foreground/50 mt-10 text-sm">
            Sem compromissos. Sem pressões. Apenas resultados.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
