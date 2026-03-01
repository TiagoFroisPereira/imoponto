import { ArrowRight, CheckCircle2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-hero-gradient overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 pt-12 pb-16 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 mb-8 animate-fade-up">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-accent">
              100% Gratuito para Particulares
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-up animation-delay-100 leading-tight">
            Venda o seu imóvel
            <span className="block mt-2 text-gradient">sem pagar comissões</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-xl mx-auto animate-fade-up animation-delay-200">
            Sem imobiliárias. Sem intermediários.
            <span className="font-semibold text-primary-foreground"> Você no controlo total da venda.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up animation-delay-300">
            <Button
              asChild
              variant="accent"
              size="lg"
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Link to="/sem-comissoes#publicar">
                Vender imóvel gratuitamente
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="lg"
              className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/sem-comissoes">
                <Play className="w-4 h-4 mr-2" />
                Como funciona
              </Link>
            </Button>
          </div>

          {/* Social Proof - Metrics */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 mt-16 pt-10 border-t border-primary-foreground/10 animate-fade-up animation-delay-400">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent">€0</div>
              <div className="text-sm text-primary-foreground/60 mt-1">em comissões</div>
            </div>
            <div className="w-px bg-primary-foreground/20 hidden md:block" />
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground">15.000+</div>
              <div className="text-sm text-primary-foreground/60 mt-1">anúncios publicados</div>
            </div>
            <div className="w-px bg-primary-foreground/20 hidden md:block" />
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground">100%</div>
              <div className="text-sm text-primary-foreground/60 mt-1">particular a particular</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
