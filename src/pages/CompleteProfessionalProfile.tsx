import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Briefcase,
  MapPin,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  Clock,
  Building,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  ProfessionalFinalDeclarations,
  areAllDeclarationsAccepted,
} from "@/components/professional/registration/ProfessionalFinalDeclarations";

interface ProfessionalProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  category: string;
  service_type: string;
  specialization: string | null;
  location: string | null;
  geographic_area: string | null;
  address: string | null;
  years_experience: number | null;
  bio: string | null;
  profile_completed: boolean;
}

const CompleteProfessionalProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    geographic_area: "",
    address: "",
    years_experience: "",
    bio: "",
  });

  // Step 2: Legal declarations
  const [acceptedDeclarations, setAcceptedDeclarations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchProfessionalProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfessionalProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("professionals")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !data) {
      // No professional profile found - redirect to registration wizard
      navigate("/tornar-profissional");
      return;
    }

    // If profile is already complete, redirect
    if (data.profile_completed) {
      navigate("/meu-perfil");
      return;
    }

    setProfile(data);
    setFormData({
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      location: data.location || "",
      geographic_area: data.geographic_area || "",
      address: data.address || "",
      years_experience: data.years_experience?.toString() || "",
      bio: data.bio || "",
    });
    setIsLoading(false);
  };

  const handleDeclarationChange = (id: string, checked: boolean) => {
    setAcceptedDeclarations((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const validateStep1 = (): boolean => {
    if (!formData.name.trim()) {
      toast({ title: "Erro", description: "O nome profissional é obrigatório.", variant: "destructive" });
      return false;
    }
    if (!formData.email.trim()) {
      toast({ title: "Erro", description: "O email de contacto é obrigatório.", variant: "destructive" });
      return false;
    }
    if (!formData.phone.trim()) {
      toast({ title: "Erro", description: "O contacto telefónico é obrigatório.", variant: "destructive" });
      return false;
    }
    if (!formData.geographic_area.trim()) {
      toast({ title: "Erro", description: "A área geográfica de atuação é obrigatória.", variant: "destructive" });
      return false;
    }
    if (!formData.address.trim()) {
      toast({ title: "Erro", description: "A morada profissional é obrigatória.", variant: "destructive" });
      return false;
    }
    if (!formData.years_experience.trim()) {
      toast({ title: "Erro", description: "Os anos de experiência são obrigatórios.", variant: "destructive" });
      return false;
    }
    if (!formData.bio.trim()) {
      toast({ title: "Erro", description: "O texto de apresentação é obrigatório.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!profile || !user) return;

    if (!areAllDeclarationsAccepted(acceptedDeclarations)) {
      toast({
        title: "Declarações pendentes",
        description: "Deve aceitar todas as declarações obrigatórias para ativar o seu perfil.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Update professional profile
      const { error: profileError } = await supabase
        .from("professionals")
        .update({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          location: formData.location.trim() || null,
          geographic_area: formData.geographic_area.trim(),
          address: formData.address.trim(),
          years_experience: parseInt(formData.years_experience) || 0,
          bio: formData.bio.trim(),
          profile_completed: true,
          is_active: true,
        })
        .eq("id", profile.id);

      if (profileError) throw profileError;

      // Log the final declarations acceptance
      const { error: logError } = await supabase
        .from("professional_legal_acceptances")
        .insert({
          user_id: user.id,
          professional_id: profile.id,
          category_selected: profile.service_type,
          autonomy_declaration_1_accepted: true,
          autonomy_declaration_2_accepted: true,
          terms_version: "1.0-final",
          user_agent: navigator.userAgent,
          accepted_at: new Date().toISOString(),
        });

      if (logError) {
        console.error("Error logging final declarations:", logError);
        // Don't fail the submission if logging fails
      }

      toast({
        title: "Perfil ativado com sucesso!",
        description: "O seu perfil profissional está agora ativo e visível no marketplace.",
      });

      navigate("/painel-profissional");
    } catch (error) {
      console.error("Error completing profile:", error);
      toast({
        title: "Erro",
        description: "Não foi possível ativar o perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col bg-background">
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </main>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const progress = (step / 2) * 100;

  return (
    <div className="flex flex-col bg-background">

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Complete o Seu Perfil Profissional
            </h1>
            <p className="text-lg text-muted-foreground">
              {step === 1
                ? "Preencha todos os campos obrigatórios."
                : "Confirme as declarações legais para ativar o seu perfil."}
            </p>
          </div>

          {/* Info Banner */}
          <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/20 rounded-lg mb-8">
            <AlertCircle className="w-5 h-5 text-accent mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Perfil pendente de ativação</p>
              <p className="text-muted-foreground mt-1">
                O seu perfil só ficará visível após preencher todos os campos e aceitar as declarações obrigatórias.
              </p>
            </div>
          </div>

          <Card className="border-border/50 shadow-elegant">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                    {profile.category === "juridico"
                      ? "Jurídico"
                      : profile.category === "financeiro"
                      ? "Financeiro"
                      : profile.category === "tecnico"
                      ? "Técnico"
                      : "Marketing"}
                  </span>
                  <span>•</span>
                  <span>{profile.service_type}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Passo {step} de 2
                </span>
              </div>
              <CardTitle>
                {step === 1 ? "Informações do Profissional" : "Declarações Legais"}
              </CardTitle>
              <CardDescription>
                {step === 1
                  ? "Todos os campos marcados com * são obrigatórios."
                  : "Confirme todas as declarações para ativar o seu perfil."}
              </CardDescription>
              <Progress value={progress} className="h-2 mt-4" />
            </CardHeader>
            <CardContent>
              {step === 1 ? (
                <div className="space-y-6">
                  {/* Nome Profissional */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Profissional / Nome Comercial *</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="O seu nome profissional ou nome comercial"
                        className="pl-10"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email de Contacto *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="contacto@exemplo.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Telefone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Contacto Telefónico *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+351 912 345 678"
                        className="pl-10"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Morada */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Morada Profissional *</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        placeholder="Rua, número, código postal, cidade"
                        className="pl-10"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Área Geográfica e Anos de Experiência */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="geographic_area">Área Geográfica de Atuação *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="geographic_area"
                          placeholder="Ex: Grande Lisboa, Porto"
                          className="pl-10"
                          value={formData.geographic_area}
                          onChange={(e) => setFormData({ ...formData, geographic_area: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Anos de Experiência *</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="experience"
                          type="number"
                          min="0"
                          placeholder="Ex: 5"
                          className="pl-10"
                          value={formData.years_experience}
                          onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Localização (opcional) */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Localização Principal (opcional)</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="Ex: Lisboa"
                        className="pl-10"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Texto de Apresentação *</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="bio"
                        placeholder="Descreva a sua experiência, serviços oferecidos e o que o distingue..."
                        className="pl-10 min-h-[120px]"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Este texto será visível no seu perfil público.
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-border/50">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate("/")}
                    >
                      Completar Mais Tarde
                    </Button>
                    <Button
                      type="button"
                      className="flex-1"
                      variant="accent"
                      onClick={handleNextStep}
                    >
                      Seguinte
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <ProfessionalFinalDeclarations
                    acceptedDeclarations={acceptedDeclarations}
                    onDeclarationChange={handleDeclarationChange}
                  />

                  <div className="flex gap-4 pt-4 border-t border-border/50">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      disabled={isSaving}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Anterior
                    </Button>
                    <Button
                      type="button"
                      className="flex-1"
                      variant="accent"
                      onClick={handleSubmit}
                      disabled={!areAllDeclarationsAccepted(acceptedDeclarations) || isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          A ativar...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Ativar Perfil
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      
    </div>
  );
};

export default CompleteProfessionalProfile;
