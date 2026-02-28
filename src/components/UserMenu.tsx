import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Briefcase, LogOut, Heart, KeyRound, Settings, BuildingIcon, Building2Icon, MessageCircleIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
export function UserMenu() {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [isProfessional, setIsProfessional] = useState(false);
  const [hasAds, setHasAds] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkStatus = async () => {
      // Check professional status
      const { data: professionalData } = await supabase
        .from("professionals")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      setIsProfessional(!!professionalData);

      // Check if user has ads (properties)
      const { count } = await supabase
        .from("properties")
        .select("id", { count: 'exact', head: true })
        .eq("user_id", user.id);

      setHasAds((count || 0) > 0);
    };

    checkStatus();
  }, [user]);

  const handleSignOut = async () => {
    const {
      error
    } = await signOut();
    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao terminar sessão.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sessão terminada",
        description: "Até breve!"
      });
      navigate("/");
    }
  };


  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const displayName = user?.user_metadata?.full_name || user?.email || "Utilizador";

  // Menu Content Rendering Logic
  const renderMenuContent = () => {
    // MENU 3 — LOGIN PROFISSIONAL
    if (isProfessional) {
      return (
        <>
          <DropdownMenuItem asChild>
            <Link to="/painel-profissional" className="cursor-pointer">
              <Briefcase className="mr-2 h-4 w-4" />
              Painel Profissional
            </Link>
          </DropdownMenuItem>
        </>
      );
    }

    // MENU 2 — UTILIZADOR COM ANÚNCIO
    if (hasAds) {
      return (
        <>
          <DropdownMenuItem asChild>
            <Link to="/favoritos" className="cursor-pointer">
              <Heart className="mr-2 h-4 w-4" />
              Favoritos
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/meus-imoveis" className="cursor-pointer">
              <Building2Icon className="mr-2 h-4 w-4" />
              Meus Imóveis
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/mensagens" className="cursor-pointer">
              <MessageCircleIcon className="mr-2 h-4 w-4" />
              Mensagens
            </Link>
          </DropdownMenuItem>
        </>
      );
    }

    // MENU 1 — REGISTO NORMAL
    return (
      <>
        <DropdownMenuItem asChild>
          <Link to="/favoritos" className="cursor-pointer">
            <Heart className="mr-2 h-4 w-4" />
            Favoritos
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/mensagens" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Mensagens
          </Link>
        </DropdownMenuItem>
      </>
    );
  };

  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="relative h-9 w-9 rounded-full">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-accent text-accent-foreground">
            {user?.email ? getInitials(user.email) : <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56" align="end" forceMount>
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{displayName}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {user?.email}
          </p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />

      {renderMenuContent()}

      <DropdownMenuItem asChild>
        <Link to="/meu-perfil" className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          Meu Perfil
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link to="/definicoes" className="cursor-pointer">
          <Settings className="w-4 h-4 mr-2" />
          Definições
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Terminar Sessão
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}