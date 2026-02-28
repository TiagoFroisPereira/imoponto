import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { StarRating } from "@/components/services/StarRating";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  Star,
  Loader2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface ProfessionalReviewsSectionProps {
  professionalId: string;
}

const ratingLabels: Record<number, string> = {
  0: "Não recomendo",
  1: "Muito fraco",
  2: "Fraco",
  3: "Razoável",
  4: "Bom",
  5: "Recomendo",
};

export function ProfessionalReviewsSection({ professionalId }: ProfessionalReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [professionalId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("professional_reviews")
        .select("id, rating, comment, created_at")
        .eq("professional_id", professionalId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
        return;
      }

      setReviews(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1, 0].map(rating => {
    const count = reviews.filter(r => r.rating === rating).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { rating, count, percentage };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Avaliações</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Avaliações obrigatórias após prestação de serviço. 
        Os comentários são públicos, permanentes e apenas de leitura.
      </p>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="py-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-foreground mb-2">
                {averageRating > 0 ? averageRating.toFixed(1) : "-"}
              </div>
              <StarRating rating={averageRating} size="lg" showValue={false} />
              <p className="text-sm text-muted-foreground mt-2">
                {reviews.length} {reviews.length === 1 ? "avaliação" : "avaliações"}
              </p>
              
              {averageRating > 0 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  {averageRating >= 4 ? (
                    <>
                      <ThumbsUp className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">
                        Recomendado
                      </span>
                    </>
                  ) : averageRating <= 2 ? (
                    <>
                      <ThumbsDown className="w-5 h-5 text-destructive" />
                      <span className="text-sm text-destructive font-medium">
                        Não recomendado
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground font-medium">
                      Avaliação mista
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Rating Scale Reference */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3 font-medium">Escala:</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>0</span>
                  <span className="text-muted-foreground">Não recomendo</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>5</span>
                  <span className="text-muted-foreground">Recomendo</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Distribuição de Avaliações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-6">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-500" />
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="text-sm text-muted-foreground w-8 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Comentários
            <Badge variant="secondary">{reviews.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Ainda não tem avaliações.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                As avaliações aparecerão aqui após concluir serviços.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4 pr-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <StarRating rating={review.rating} size="sm" />
                        <Badge variant="outline" className="text-xs">
                          {ratingLabels[review.rating] || `${review.rating}/5`}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(review.created_at), "d 'de' MMMM 'de' yyyy", { locale: pt })}
                      </span>
                    </div>
                    {review.comment ? (
                      <p className="text-sm text-muted-foreground">
                        "{review.comment}"
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground/60 italic">
                        Sem comentário
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
