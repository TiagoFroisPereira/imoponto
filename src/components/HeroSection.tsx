import { ArrowRight, CheckCircle2, Search, Home as HomeIcon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient">
      {/* Professional Tech Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.2),transparent_70%)]" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#1e3a8a 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/80 to-[#020617]" />
      </div>

      {/* Modern Blue Glow Elements */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 md:w-[40rem] md:h-[40rem] bg-blue-600/10 rounded-full blur-[100px] md:blur-[150px] animate-pulse" />
        <div className="absolute bottom-20 -left-24 w-64 h-64 md:w-[40rem] md:h-[40rem] bg-indigo-500/10 rounded-full blur-[100px] md:blur-[150px] animate-pulse" />
      </div>

      <div className="container mx-auto px-4 relative z-20 pt-10 md:pt-0">
        <div className="max-w-4xl mx-auto text-center">
          {/* Enhanced Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-accent/10 border border-accent/20 mb-6 md:mb-8 animate-fade-in backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
            <span className="text-[10px] md:text-sm font-bold text-accent uppercase tracking-wider">
              Ecossistema Imobiliário Transparente
            </span>
          </div>

          {/* Premium Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-black text-white mb-6 md:mb-8 leading-[1.1] tracking-tighter px-2">
            O imobiliário agora é
            <span className="block mt-1 md:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-400">
              ao seu controlo.
            </span>
          </h1>

          {/* Refined Subheadline */}
          <p className="text-sm sm:text-base md:text-2xl text-blue-100/90 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed font-medium px-4">
            Compre, venda e contrate profissionais sem intermediários.
            <span className="block md:inline font-bold text-white"> Segurança total, comissões zero e transparência absoluta.</span>
          </p>

          {/* Premium CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center px-4">
            <Button
              asChild
              variant="accent"
              size="xl"
              className="text-base md:text-xl px-8 md:px-12 h-14 md:h-20 shadow-2xl shadow-accent/30 hover:shadow-accent/40 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto font-black"
            >
              <Link to="/sem-comissoes" className="flex items-center">
                <HomeIcon className="w-5 h-5 mr-2 md:mr-3" />
                Vender sem Comissões
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="xl"
              className="text-base md:text-xl px-8 md:px-12 h-14 md:h-20 hover:bg-white/5 transition-all duration-300 w-full sm:w-auto border-2 border-white/10 font-bold backdrop-blur-sm"
            >
              <Link to="/imoveis" className="flex items-center">
                <Search className="w-5 h-5 mr-2 md:mr-3" />
                <span>Explorar Imóveis</span>
              </Link>
            </Button>
          </div>

          <div className="mt-6 md:mt-8 px-4">
            <Link to="/servicos" className="text-blue-200/60 hover:text-accent transition-colors text-[11px] md:text-sm font-medium flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
              <span className="text-blue-200/80">Precisa de ajuda profissional? <span className="text-accent underline md:no-underline">Conheça o nosso Marketplace →</span></span>
            </Link>
          </div>

          {/* Modernized Social Proof - Optimized for all screens */}
          <div className="grid grid-cols-2 md:flex md:justify-center items-center gap-6 md:gap-16 mt-6 pt-6 border-t border-white/10 mx-4">
            <div className="text-center md:text-left">
              <div className="text-2xl md:text-5xl font-black text-accent tracking-tighter">€0</div>
              <div className="text-[9px] md:text-sm font-bold text-blue-200/60 uppercase mt-1 tracking-widest leading-none">comissões</div>
            </div>

            <div className="w-px h-12 bg-white/10 hidden md:block" />

            <div className="text-center md:text-left">
              <div className="text-2xl md:text-5xl font-black text-white tracking-tighter">15k+</div>
              <div className="text-[9px] md:text-sm font-bold text-blue-200/60 uppercase mt-1 tracking-widest leading-none">anúncios</div>
            </div>

            <div className="w-px h-12 bg-white/10 hidden md:block" />

            <div className="text-center md:text-left col-span-2 md:col-span-1 border-t border-white/5 pt-4 md:border-t-0 md:pt-0">
              <div className="text-2xl md:text-5xl font-black text-white tracking-tighter">+200</div>
              <div className="text-[9px] md:text-sm font-bold text-blue-200/60 uppercase mt-1 tracking-widest leading-none">profissionais especialistas</div>
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
