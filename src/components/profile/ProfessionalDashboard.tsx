import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StarRating } from "@/components/services/StarRating";
import { MyContactRequests } from "./MyContactRequests";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import {
  Briefcase,
  Star,
  Users,
  MessageSquare,
  TrendingUp,
  Eye,
  Edit,
  ExternalLink,
  Loader2,
  MapPin,
  Clock,
  Mail,
  Phone,
  Shield,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

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
  years_experience: number;
  is_verified: boolean;
  is_active: boolean;
  profile_completed: boolean;
  created_at: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface ProfessionalDashboardProps {
  userId?: string;
}

const categoryLabels: Record<string, string> = {
  juridico: "Jurídico",
  financeiro: "Financeiro",
  tecnico: "Técnico",
  marketing: "Marketing",
};

export function ProfessionalDashboard({ userId }: ProfessionalDashboardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [contactsCount, setContactsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("overview");

  useEffect(() => {
    if (userId) {
      fetchProfessionalData();
    }
  }, [userId]);

  const fetchProfessionalData = async () => {
    if (!userId) return;

    try {
      // Fetch professional profile
      const { data: profData, error: profError } = await supabase
        .from("professionals")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profError || !profData) {
        setLoading(false);
        return;
      }

      setProfessional(profData);

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from("professional_reviews")
        .select("id, rating, comment, created_at")
        .eq("professional_id", profData.id)
        .order("created_at", { ascending: false });

      setReviews(reviewsData || []);

      // Fetch contacts count
      const { count } = await supabase
        .from("contact_requests")
        .select("*", { count: "exact", head: true })
        .eq("professional_id", profData.id);

      setContactsCount(count || 0);
    } catch (error) {
      console.error("Error fetching professional data:", error);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!professional) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground">
            Não é profissional registado
          </h3>
          <p className="text-muted-foreground mt-2 mb-4">
            Registe-se como profissional para aparecer no nosso marketplace de serviços.
          </p>
          <Button onClick={() => navigate("/tornar-profissional")}>
            <User className="w-4 h-4 mr-2" />
            Tornar-me Profissional
          </Button>
        </CardContent>
      </Card>
    );
  }

  const initials = professional.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Painel Profissional</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/completar-perfil-profissional")}
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar Perfil
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/profissional/${professional.id}`)}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Ver Público
          </Button>
        </div>
      </div>

      {/* Profile Status Alert */}
      {!professional.profile_completed && (
        <Card className="border-amber-500/50 bg-amber-500/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium text-amber-800">Perfil incompleto</p>
                <p className="text-sm text-amber-700">
                  Complete o seu perfil para aparecer no marketplace de serviços.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-500 text-amber-700 hover:bg-amber-100"
                onClick={() => navigate("/completar-perfil-profissional")}
              >
                Completar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Avaliação Média"
          value={averageRating > 0 ? averageRating.toFixed(1) : "-"}
          description={`${reviews.length} avaliações`}
          icon={Star}
        />
        <StatsCard
          title="Contactos"
          value={contactsCount}
          description="Total recebidos"
          icon={MessageSquare}
        />
        <StatsCard
          title="Avaliações"
          value={reviews.length}
          description="Total recebidas"
          icon={Users}
        />
        <StatsCard
          title="Estado"
          value={professional.is_active ? "Ativo" : "Inativo"}
          description={professional.profile_completed ? "Perfil completo" : "Incompleto"}
          icon={professional.is_active ? CheckCircle : AlertCircle}
        />
      </div>

      {/* Profile Card */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <Avatar className="w-20 h-20 border-2 border-accent/20">
              <AvatarImage src={professional.avatar_url || undefined} />
              <AvatarFallback className="text-xl bg-accent/10 text-accent">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-foreground">
                  {professional.name}
                </h3>
                {professional.is_verified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Shield className="w-3 h-3 mr-1" />
                    Verificado
                  </Badge>
                )}
                <Badge variant={professional.is_active ? "default" : "secondary"}>
                  {professional.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {categoryLabels[professional.category] || professional.category}
                </span>
                <span>•</span>
                <span>{professional.service_type}</span>
                {professional.specialization && (
                  <>
                    <span>•</span>
                    <span>{professional.specialization}</span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {professional.years_experience > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {professional.years_experience} anos de experiência
                  </span>
                )}
                {professional.geographic_area && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {professional.geographic_area}
                  </span>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
              <StarRating rating={averageRating} size="lg" showValue />
              <span className="text-sm text-muted-foreground mt-1">
                {reviews.length} {reviews.length === 1 ? "avaliação" : "avaliações"}
              </span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{professional.email}</span>
            </div>
            {professional.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{professional.phone}</span>
              </div>
            )}
            {professional.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{professional.address}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Avaliações</TabsTrigger>
          <TabsTrigger value="requests">Pedidos de Serviço</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Avaliações Recebidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Ainda não tem avaliações.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    As avaliações aparecerão aqui após concluir serviços.
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-4 pr-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-border pb-4 last:border-0"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <MyContactRequests />
        </TabsContent>
      </Tabs>
    </div>
  );
}
