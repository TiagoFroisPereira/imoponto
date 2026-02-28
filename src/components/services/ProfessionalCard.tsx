import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, BadgeCheck, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ContactDialog } from "./ContactDialog";
import { StarRating } from "./StarRating";
import type { ProfessionalWithReviews } from "@/hooks/useProfessionals";

interface ProfessionalCardProps {
  professional: ProfessionalWithReviews;
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const [showContact, setShowContact] = useState(false);
  const navigate = useNavigate();

  const initials = professional.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleViewProfile = () => {
    navigate(`/profissional/${professional.id}`);
  };

  return (
    <>
      <Card 
        className="group overflow-hidden hover:shadow-medium transition-all duration-300 border-border hover:border-accent/30 cursor-pointer"
        onClick={handleViewProfile}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 border-2 border-accent/20">
              <AvatarImage src={professional.avatar_url || undefined} />
              <AvatarFallback className="bg-accent/10 text-accent text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">
                  {professional.name}
                </h3>
                {professional.is_verified && (
                  <BadgeCheck className="w-4 h-4 text-accent flex-shrink-0" />
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                {professional.service_type}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={professional.averageRating} size="sm" />
                <span className="text-xs text-muted-foreground">
                  ({professional.totalReviews})
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {professional.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{professional.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{professional.years_experience} anos exp.</span>
                </div>
              </div>
            </div>
          </div>

          {professional.bio && (
            <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
              {professional.bio}
            </p>
          )}

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                handleViewProfile();
              }}
            >
              <Eye className="w-4 h-4 mr-1" />
              Ver Perfil
            </Button>
            <Button
              variant="accent"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                setShowContact(true);
              }}
            >
              Contactar
            </Button>
          </div>
        </CardContent>
      </Card>

      <ContactDialog
        open={showContact}
        onOpenChange={setShowContact}
        professional={professional}
      />
    </>
  );
}
