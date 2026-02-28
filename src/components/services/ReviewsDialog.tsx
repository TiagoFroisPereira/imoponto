import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StarRating } from "./StarRating";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { ProfessionalWithReviews } from "@/hooks/useProfessionals";

interface ReviewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professional: ProfessionalWithReviews;
}

export function ReviewsDialog({
  open,
  onOpenChange,
  professional,
}: ReviewsDialogProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Por favor, inicie sessão para deixar uma avaliação.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (rating === 0) {
      toast({
        title: "Avaliação em falta",
        description: "Por favor, selecione uma classificação de estrelas.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("professional_reviews").upsert(
        {
          professional_id: professional.id,
          user_id: user.id,
          rating,
          comment: comment.trim() || null,
        },
        {
          onConflict: "professional_id,user_id",
        }
      );

      if (error) throw error;

      toast({
        title: "Avaliação enviada",
        description: "Obrigado pela sua avaliação!",
      });

      setRating(0);
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["professionals-with-reviews"] });
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar a avaliação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Avaliações de {professional.name}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={professional.averageRating} size="md" showValue />
              <span className="text-sm">
                ({professional.totalReviews}{" "}
                {professional.totalReviews === 1 ? "avaliação" : "avaliações"})
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Add Review Form */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <Label className="font-medium">Deixar uma avaliação</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Classificação:
                </span>
                <StarRating
                  rating={rating}
                  size="lg"
                  interactive
                  onRatingChange={setRating}
                />
              </div>
              <Textarea
                placeholder="Escreva um comentário (opcional)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <Button
                variant="accent"
                size="sm"
                onClick={handleSubmitReview}
                disabled={isSubmitting || rating === 0}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-1" />
                Enviar Avaliação
              </Button>
            </div>
          </div>

          <Separator />

          {/* Reviews List */}
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-4 pr-4">
              {professional.reviews.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Este profissional ainda não tem avaliações.
                </p>
              ) : (
                professional.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex gap-3 p-3 rounded-lg bg-card border border-border"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-muted">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-foreground">{review.comment}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
