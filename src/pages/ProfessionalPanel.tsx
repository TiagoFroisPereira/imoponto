import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  User, 
  Bell, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Star, 
  Settings,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useProfessionalNotifications } from "@/hooks/useProfessionalNotifications";

// Professional Panel Sections
import { ProfessionalProfileSection } from "@/components/professional/ProfessionalProfileSection";
import { ProfessionalServiceRequestsSection } from "@/components/professional/ProfessionalServiceRequestsSection";
import { ProfessionalMessagesSection } from "@/components/professional/ProfessionalMessagesSection";
import { ProfessionalAgendaSection } from "@/components/professional/ProfessionalAgendaSection";
import { ProfessionalDocumentsSection } from "@/components/professional/ProfessionalDocumentsSection";
import { ProfessionalReviewsSection } from "@/components/professional/ProfessionalReviewsSection";
import { ProfessionalAccountSection } from "@/components/professional/ProfessionalAccountSection";

interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  category: string;
  service_type: string;
  price_from: number;
  location: string | null;
  address: string | null;
  geographic_area: string | null;
  specialization: string | null;
  years_experience: number | null;
  is_verified: boolean;
  is_active: boolean;
  profile_completed: boolean;
  created_at: string;
  user_id: string;
}

interface MenuItemConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  emoji?: string;
}

export default function ProfessionalPanel() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get('section') || 'profile';
  
  const [user, setUser] = useState<any>(null);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Real-time notification counts
  const { 
    counts, 
    fetchCounts, 
    resetServiceRequestsCount, 
    resetMessagesCount 
  } = useProfessionalNotifications(professional?.id, user?.id);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }
      
      setUser(user);

      // Check if user is a professional
      const { data: profData, error: profError } = await supabase
        .from("professionals")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profError) {
        console.error("Error fetching professional:", profError);
        navigate("/meu-perfil");
        return;
      }

      if (!profData) {
        navigate("/tornar-profissional");
        return;
      }

      setProfessional(profData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (sectionId: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('section', sectionId);
    setSearchParams(newParams);
    
    // Reset notification count when opening section and refetch data
    if (sectionId === 'requests') {
      resetServiceRequestsCount();
    } else if (sectionId === 'messages') {
      resetMessagesCount();
    }
  };

  const menuItems: MenuItemConfig[] = [
    { id: 'profile', label: 'Meu Perfil', icon: User },
    { id: 'requests', label: 'Pedidos de Serviço', icon: Bell, badge: counts.serviceRequests, emoji: '🔔' },
    { id: 'messages', label: 'Mensagens', icon: MessageSquare, badge: counts.unreadMessages, emoji: '💬' },
    { id: 'agenda', label: 'Agenda', icon: Calendar, emoji: '📅' },
    { id: 'documents', label: 'Documentação', icon: FileText, emoji: '📁' },
    { id: 'reviews', label: 'Avaliações', icon: Star },
    { id: 'account', label: 'Conta', icon: Settings },
  ];

  // If profile is incomplete, only show profile section
  const availableMenuItems = professional?.profile_completed 
    ? menuItems 
    : menuItems.filter(item => item.id === 'profile');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Não é profissional registado</h3>
              <p className="text-muted-foreground mt-2 mb-4">
                Registe-se como profissional para aceder a este painel.
              </p>
              <Button onClick={() => navigate("/tornar-profissional")}>
                Tornar-me Profissional
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfessionalProfileSection professional={professional} onUpdate={checkAuthAndLoadData} />;
      case 'requests':
        return <ProfessionalServiceRequestsSection professionalId={professional.id} onCountChange={fetchCounts} />;
      case 'messages':
        return <ProfessionalMessagesSection userId={user?.id} onRead={fetchCounts} />;
      case 'agenda':
        return <ProfessionalAgendaSection professionalId={professional.id} professionalCategory={professional.category} />;
      case 'documents':
        return <ProfessionalDocumentsSection professionalId={professional.id} />;
      case 'reviews':
        return <ProfessionalReviewsSection professionalId={professional.id} />;
      case 'account':
        return <ProfessionalAccountSection user={user} />;
      default:
        return <ProfessionalProfileSection professional={professional} onUpdate={checkAuthAndLoadData} />;
    }
  };

  return (
    <div className="bg-background">

      <div className="container mx-auto px-4 py-6">
        {/* Profile incomplete warning */}
        {!professional.profile_completed && (
          <Card className="mb-6 border-amber-500/50 bg-amber-500/10">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div className="flex-1">
                  <p className="font-medium text-amber-800">Perfil incompleto</p>
                  <p className="text-sm text-amber-700">
                    Complete o seu perfil para aceder a todas as funcionalidades.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Menu - horizontal scroll on mobile, vertical on desktop */}
          <aside className="lg:w-64 shrink-0">
            {/* Mobile: horizontal scrollable tabs */}
            <div className="lg:hidden overflow-x-auto pb-2 -mx-4 px-4">
              <div className="flex gap-2 min-w-max">
                {availableMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSectionChange(item.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
                        isActive 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-card hover:bg-muted text-foreground border-border"
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {item.label}
                      {item.badge && item.badge > 0 && (
                        <Badge 
                          variant={isActive ? "secondary" : "destructive"} 
                          className="h-5 min-w-5 flex items-center justify-center text-xs"
                        >
                          {item.badge > 99 ? '99+' : item.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop: vertical sidebar */}
            <Card className="sticky top-4 hidden lg:block">
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {availableMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSectionChange(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span className="flex-1 text-sm font-medium">
                          {item.label}
                        </span>
                        {item.emoji && (
                          <span className="text-sm">{item.emoji}</span>
                        )}
                        {item.badge && item.badge > 0 && (
                          <Badge 
                            variant={isActive ? "secondary" : "destructive"} 
                            className="h-5 min-w-5 flex items-center justify-center text-xs"
                          >
                            {item.badge > 99 ? '99+' : item.badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {renderSection()}
          </main>
        </div>
      </div>
    </div>
  );
}
