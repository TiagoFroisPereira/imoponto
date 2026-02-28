import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Edit,
  ExternalLink,
  MapPin,
  Clock,
  Mail,
  Phone,
  Shield,
  Briefcase,
  Info,
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
  years_experience: number | null;
  is_verified: boolean;
  is_active: boolean;
  profile_completed: boolean;
  created_at: string;
  user_id: string;
}

interface ProfessionalProfileSectionProps {
  professional: Professional;
  onUpdate: () => void;
}

const categoryLabels: Record<string, string> = {
  juridico: "Jurídico",
  financeiro: "Financeiro",
  tecnico: "Técnico",
  marketing: "Marketing",
};

export function ProfessionalProfileSection({ professional, onUpdate }: ProfessionalProfileSectionProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusToggle = async (active: boolean) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("professionals")
        .update({ is_active: active })
        .eq("id", professional.id);

      if (error) throw error;

      toast({
        title: active ? "Perfil ativado" : "Perfil desativado",
        description: active 
          ? "O seu perfil está agora visível no marketplace." 
          : "O seu perfil está agora oculto no marketplace."
      });
      
      onUpdate();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o estado do perfil.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/completar-perfil-profissional")}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar Perfil
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate(`/profissional/${professional.id}`)}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Público
          </Button>
        </div>
      </div>

      {/* Status Toggle */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Estado do Perfil</Label>
              <p className="text-sm text-muted-foreground">
                {professional.is_active 
                  ? "O seu perfil está visível no marketplace de serviços." 
                  : "O seu perfil está oculto. Ative para receber pedidos."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {professional.is_active ? "Ativo" : "Inativo"}
              </span>
              <Switch
                checked={professional.is_active}
                onCheckedChange={handleStatusToggle}
                disabled={isUpdating || !professional.profile_completed}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <Avatar className="w-24 h-24 border-2 border-accent/20">
              <AvatarImage src={professional.avatar_url || undefined} />
              <AvatarFallback className="text-2xl bg-accent/10 text-accent">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <h2 className="text-xl font-bold text-foreground">
                  {professional.name}
                </h2>
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

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
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

              {professional.bio && (
                <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
                  {professional.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {professional.years_experience && professional.years_experience > 0 && (
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
          </div>

          <Separator className="my-6" />

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email de contacto</p>
                <p className="text-sm font-medium">{professional.email}</p>
              </div>
            </div>
            {professional.phone && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="text-sm font-medium">{professional.phone}</p>
                </div>
              </div>
            )}
            {professional.address && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Morada profissional</p>
                  <p className="text-sm font-medium">{professional.address}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legal Notice */}
      <Alert>
        <Info className="w-4 h-4" />
        <AlertDescription className="text-xs text-muted-foreground">
          A Imoponto não presta serviços profissionais nem se responsabiliza pela atuação deste profissional. 
          A contratação é feita diretamente entre as partes.
        </AlertDescription>
      </Alert>
    </div>
  );
}
