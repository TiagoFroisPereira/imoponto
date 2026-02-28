import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, FileText, Users, LogIn, LogOut, PiggyBank, User, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserMenu } from "@/components/UserMenu";
import { NotificationBell } from "@/components/NotificationBell";
import { useToast } from "@/hooks/use-toast";
import { useProfessionalStatus } from "@/hooks/useProfessionalStatus";
import { useAuthModal } from "@/contexts/AuthModalContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const { data: professionalStatus } = useProfessionalStatus();

  // Check if professional needs to complete profile
  useEffect(() => {
    if (!user || loading || !professionalStatus) return;

    // Don't redirect if already on the complete profile page
    if (location.pathname === "/completar-perfil-profissional") return;

    if (professionalStatus.isProfessional && professionalStatus.profile_completed === false) {
      toast({
        title: "Perfil incompleto",
        description: "Complete o seu perfil profissional para ativar a sua conta.",
      });
      navigate("/completar-perfil-profissional");
    }
  }, [user, loading, location.pathname, professionalStatus]);

  const navLinks = [
    { label: "Imóveis", href: "/imoveis", icon: Search },
    { label: "Serviços", href: "/servicos", icon: Users },
  ];

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao terminar sessão.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sessão terminada",
        description: "Até breve!",
      });
      navigate("/");
    }
  };

  const NavLink = ({ link, className, onClick }: { link: typeof navLinks[0], className?: string, onClick?: () => void }) => (
    <Link
      to={link.href}
      className={`flex items-center gap-2 text-sm font-semibold transition-all duration-200 ${className}`}
      onClick={onClick}
    >
      <link.icon className="w-4 h-4" />
      <span>{link.label}</span>
    </Link>
  );

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-border/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 md:h-28">
          {/* Left side - Logo + First Nav Item */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 overflow-hidden">
              <img src="/logo.png" alt="ImoPonto" className="h-40 md:h-64 w-auto object-contain transition-transform hover:scale-105 -my-4 md:-my-16" />
            </Link>

            {/* First nav item (Imóveis) - Desktop only */}
            {navLinks[0] && (
              <nav className="hidden md:flex">
                <NavLink
                  link={navLinks[0]}
                  className="text-foreground hover:text-primary text-base px-3 py-2 rounded-md hover:bg-slate-50 transition-colors"
                />
              </nav>
            )}
          </div>

          {/* Center - CTA Button (desktop only) */}
          <div className="hidden md:flex">
            <Button
              variant="accent"
              size="lg"
              asChild
              className="font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link to={user ? "/publicar" : "/sem-comissoes#publicar"}>
                Quero vender a minha casa
              </Link>
            </Button>
          </div>

          {/* Right side - Second Nav Item + Action Area */}
          <div className="flex items-center gap-6">
            {/* Second nav item (Serviços) - Desktop only */}
            {navLinks[1] && (
              <nav className="hidden md:flex">
                <NavLink
                  link={navLinks[1]}
                  className="text-foreground hover:text-primary text-base px-3 py-2 rounded-md hover:bg-slate-50 transition-colors"
                />
              </nav>
            )}

            {/* Action Area (Desktop) */}
            <div className="hidden md:flex items-center gap-4">
              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-3">
                      <NotificationBell />
                      <UserMenu />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSignOut}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => openAuthModal()}>
                      <LogIn className="w-4 h-4 mr-2" />
                      Entrar
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Mobile Right Side */}
            <div className="flex md:hidden items-center gap-2">
              {!loading && user && (
                <div className="flex items-center gap-2">
                  <NotificationBell />
                  <UserMenu />
                </div>
              )}
              <button
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-border/50 animate-fade-in bg-background/95 backdrop-blur-md">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  link={link}
                  className="px-4 py-3 text-base text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl"
                  onClick={() => setIsMenuOpen(false)}
                />
              ))}

              <div className="pt-4 mt-2 border-t border-border/50 flex flex-col gap-3 px-4">
                {!loading && !user && (
                  <Button variant="outline" className="w-full justify-start py-6" onClick={() => { setIsMenuOpen(false); openAuthModal(); }}>
                    <LogIn className="w-5 h-5 mr-3" />
                    Entrar
                  </Button>
                )}

                <Button variant="accent" className="w-full py-6 font-semibold" asChild>
                  <Link to={user ? "/publicar" : "/sem-comissoes#publicar"} onClick={() => setIsMenuOpen(false)}>
                    Quero vender a minha casa
                  </Link>
                </Button>

                {user && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:bg-destructive/10 py-6"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleSignOut();
                    }}
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Terminar Sessão
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
