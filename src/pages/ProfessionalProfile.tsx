import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/services/StarRating";
import { ContactDialog } from "@/components/services/ContactDialog";
import { ReviewsDialog } from "@/components/services/ReviewsDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  MapPin, 
  Clock, 
  Mail, 
  Phone, 
  MessageSquare, 
  Loader2,
  User,
  Briefcase,
  Shield,
  ArrowLeft,
  Star,
  AlertCircle,
  Lock
} from "lucide-react";
import type { ServiceCategory, ProfessionalWithReviews, ProfessionalReview } from "@/hooks/useProfessionals";

const categoryLabels: Record<ServiceCategory, string> = {
  juridico: "Jurídico",
  financeiro: "Financeiro",
  tecnico: "Técnico",
  marketing: "Marketing",
};

const ProfessionalProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [professional, setProfessional] = useState<ProfessionalWithReviews | null>(null);
  const [contactInfo, setContactInfo] = useState<{ email?: string; phone?: string } | null>(null);
  const [hasContactAccess, setHasContactAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [reviewsDialogOpen, setReviewsDialogOpen] = useState(false);

  // Check if should open review modal from URL param
  useEffect(() => {
    if (searchParams.get('openReview') === 'true' && professional) {
      setReviewsDialogOpen(true);
    }
  }, [searchParams, professional]);

  useEffect(() => {
    if (id) {
      fetchProfessional();
      fetchContactAccess();
    }
  }, [id, user]);

  const fetchProfessional = async () => {
    if (!id) return;

    // Fetch professional from public view (no sensitive contact info)
    const { data: profData, error: profError } = await supabase
      .from("professionals_public")
      .select("*")
      .eq("id", id)
      .single();

    if (profError || !profData) {
      setIsLoading(false);
      return;
    }

    // Fetch reviews
    const { data: reviewsData } = await supabase
      .from("professional_reviews")
      .select("*")
      .eq("professional_id", id)
      .order("created_at", { ascending: false });

    const reviews = (reviewsData || []) as ProfessionalReview[];
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    setProfessional({
      ...profData,
      reviews,
      averageRating,
      totalReviews,
    } as ProfessionalWithReviews);
    setIsLoading(false);
  };

  // Fetch contact info via secure RPC (only returns data if user has contact request)
  const fetchContactAccess = async () => {
    if (!id || !user) {
      setHasContactAccess(false);
      setContactInfo(null);
      return;
    }

    try {
      const { data, error } = await supabase.rpc("get_professional_contact", {
        prof_id: id,
      });

      if (!error && data && typeof data === 'object' && !Array.isArray(data)) {
        const contactData = data as Record<string, unknown>;
        if (contactData.email || contactData.phone) {
          setContactInfo({ email: contactData.email as string, phone: contactData.phone as string | undefined });
          setHasContactAccess(true);
        } else {
          setHasContactAccess(false);
          setContactInfo(null);
        }
      } else {
        setHasContactAccess(false);
        setContactInfo(null);
      }
    } catch (err) {
      console.error("Error fetching contact info:", err);
      setHasContactAccess(false);
      setContactInfo(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col bg-background">
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </main>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="flex flex-col bg-background">
        <main className="flex-1 pt-24 pb-16">
          <div className="container mx-auto px-4 text-center py-20">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Profissional não encontrado
            </h1>
            <p className="text-muted-foreground mb-8">
              O perfil que procura não existe ou não está disponível.
            </p>
            <Button onClick={() => navigate("/servicos")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ver Marketplace
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const initials = professional.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col bg-background">
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-6"
            onClick={() => navigate("/servicos")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Marketplace
          </Button>

          {/* Profile Header */}
          <Card className="border-border/50 shadow-elegant mb-8">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-accent/20">
                  <AvatarImage src={professional.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl md:text-3xl bg-accent/10 text-accent">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                      <User className="w-3 h-3 mr-1" />
                      Profissional Independente
                    </Badge>
                    {professional.is_verified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                        <Shield className="w-3 h-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    {professional.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {categoryLabels[professional.category as ServiceCategory]}
                    </span>
                    <span>•</span>
                    <span>{professional.service_type}</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-3">
                    <StarRating rating={professional.averageRating} showValue size="md" />
                    <span className="text-sm text-muted-foreground">
                      ({professional.totalReviews} {professional.totalReviews === 1 ? "avaliação" : "avaliações"})
                    </span>
                  </div>
                </div>

                {/* Contact Button */}
                <div className="md:self-center">
                  <Button 
                    variant="accent" 
                    size="lg"
                    onClick={() => setContactDialogOpen(true)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* About */}
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Sobre
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {professional.bio || "Sem descrição disponível."}
                  </p>
                </CardContent>
              </Card>

              {/* Reviews Section */}
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-foreground">
                      Avaliações
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <StarRating rating={professional.averageRating} size="sm" />
                        <span className="font-medium">
                          {professional.averageRating.toFixed(1)}
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setReviewsDialogOpen(true)}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Avaliar
                      </Button>
                    </div>
                  </div>

                  {/* Rating Scale Explanation */}
                  <div className="bg-muted/50 rounded-lg p-4 mb-6">
                    <p className="text-sm font-medium text-foreground mb-2">
                      Escala de Avaliação
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <span>⭐ 0 = Não recomendo</span>
                      <span>⭐⭐ 2 = Razoável</span>
                      <span>⭐⭐⭐ 3 = Bom</span>
                      <span>⭐⭐⭐⭐ 4 = Muito Bom</span>
                      <span>⭐⭐⭐⭐⭐ 5 = Recomendo</span>
                    </div>
                  </div>

                  {/* Reviews List */}
                  {professional.reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        Este profissional ainda não tem avaliações.
                      </p>
                      <Button 
                        variant="link" 
                        className="mt-2"
                        onClick={() => setReviewsDialogOpen(true)}
                      >
                        Seja o primeiro a avaliar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {professional.reviews.slice(0, 5).map((review) => (
                        <div key={review.id} className="border-b border-border pb-4 last:border-0">
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
                      {professional.reviews.length > 5 && (
                        <Button 
                          variant="link" 
                          className="w-full"
                          onClick={() => setReviewsDialogOpen(true)}
                        >
                          Ver todas as {professional.totalReviews} avaliações
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Contactos</h3>
                  
                  <div className="space-y-4">
                    {hasContactAccess && contactInfo ? (
                      <>
                        {contactInfo.email && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                              <Mail className="w-4 h-4 text-accent" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Email</p>
                              <a 
                                href={`mailto:${contactInfo.email}`}
                                className="text-sm text-foreground hover:text-accent transition-colors"
                              >
                                {contactInfo.email}
                              </a>
                            </div>
                          </div>
                        )}

                        {contactInfo.phone && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                              <Phone className="w-4 h-4 text-accent" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Telefone</p>
                              <a 
                                href={`tel:${contactInfo.phone}`}
                                className="text-sm text-foreground hover:text-accent transition-colors"
                              >
                                {contactInfo.phone}
                              </a>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Lock className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Contactos protegidos</p>
                          <p className="text-xs text-muted-foreground">
                            Envie uma mensagem para aceder aos contactos diretos.
                          </p>
                        </div>
                      </div>
                    )}

                    <Separator />

                    <Button 
                      variant="accent" 
                      className="w-full"
                      onClick={() => setContactDialogOpen(true)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Enviar mensagem via Imoponto
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Informações</h3>
                  
                  <div className="space-y-3">
                    {professional.years_experience !== null && professional.years_experience > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {professional.years_experience} {professional.years_experience === 1 ? "ano" : "anos"} de experiência
                        </span>
                      </div>
                    )}
                    
                    {(professional as any).geographic_area && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Área: {(professional as any).geographic_area}
                        </span>
                      </div>
                    )}

                    {professional.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {professional.location}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Legal Footer */}
          <div className="mt-12 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground text-center">
              A Imoponto não presta serviços profissionais nem se responsabiliza pela atuação deste profissional. 
              A contratação é feita diretamente entre as partes.
            </p>
          </div>
        </div>
      </main>

      

      {/* Contact Dialog */}
      <ContactDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        professional={professional}
      />

      {/* Reviews Dialog */}
      <ReviewsDialog
        open={reviewsDialogOpen}
        onOpenChange={setReviewsDialogOpen}
        professional={professional}
      />
    </div>
  );
};

export default ProfessionalProfile;
