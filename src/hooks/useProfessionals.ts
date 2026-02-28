import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ServiceCategory = "juridico" | "financeiro" | "tecnico" | "marketing";

// Public professional info (no sensitive contact details)
export interface ProfessionalPublic {
  id: string;
  user_id: string | null;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  category: ServiceCategory;
  service_type: string;
  price_from: number;
  location: string | null;
  specialization: string | null;
  years_experience: number;
  is_verified: boolean;
  is_active: boolean;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Full professional info (includes contact details - only for authorized access)
export interface Professional extends ProfessionalPublic {
  email: string;
  phone: string | null;
  address: string | null;
  geographic_area: string | null;
}

export interface ProfessionalReview {
  id: string;
  professional_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ProfessionalWithReviews extends ProfessionalPublic {
  reviews: ProfessionalReview[];
  averageRating: number;
  totalReviews: number;
  // Contact info - available for backwards compatibility, but may be empty/null
  // when accessed via public view. Use contactInfo from RPC for secure access.
  email?: string;
  phone?: string | null;
  address?: string | null;
  geographic_area?: string | null;
  contactInfo?: {
    email: string;
    phone: string | null;
  };
}

export const categoryLabels: Record<ServiceCategory, string> = {
  juridico: "Jurídico",
  financeiro: "Financeiro",
  tecnico: "Técnico",
  marketing: "Marketing",
};

export const categoryDescriptions: Record<ServiceCategory, string> = {
  juridico: "Advogados e notários para todos os processos legais",
  financeiro: "Intermediação de crédito e consultoria financeira",
  tecnico: "Certificação energética e avaliação imobiliária",
  marketing: "Fotografia profissional e marketing imobiliário",
};

// Use the public view for listings (no sensitive contact info)
export function useProfessionals(category?: ServiceCategory) {
  return useQuery({
    queryKey: ["professionals", category],
    queryFn: async () => {
      let query = supabase
        .from("professionals_public")
        .select("*")
        .order("is_verified", { ascending: false })
        .order("years_experience", { ascending: false });

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ProfessionalPublic[];
    },
  });
}

export function useProfessionalReviews(professionalId: string) {
  return useQuery({
    queryKey: ["professional-reviews", professionalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professional_reviews")
        .select("*")
        .eq("professional_id", professionalId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProfessionalReview[];
    },
    enabled: !!professionalId,
  });
}

// Fetch professional contact info via secure RPC (only if user has contact request)
export function useProfessionalContactInfo(professionalId: string) {
  return useQuery({
    queryKey: ["professional-contact", professionalId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_professional_contact", {
        prof_id: professionalId,
      });

      if (error) throw error;
      
      // Returns empty object if no access, or {email, phone} if access granted
      return data as { email?: string; phone?: string } | null;
    },
    enabled: !!professionalId,
  });
}

// Use the public view for listings with reviews
export function useProfessionalsWithReviews(category?: ServiceCategory) {
  return useQuery({
    queryKey: ["professionals-with-reviews", category],
    queryFn: async () => {
      let query = supabase
        .from("professionals_public")
        .select("*")
        .order("is_verified", { ascending: false })
        .order("years_experience", { ascending: false });

      if (category) {
        query = query.eq("category", category);
      }

      const { data: professionals, error: profError } = await query;

      if (profError) throw profError;

      const { data: reviews, error: reviewsError } = await supabase
        .from("professional_reviews")
        .select("*");

      if (reviewsError) throw reviewsError;

      const professionalsWithReviews: ProfessionalWithReviews[] = (
        professionals as ProfessionalPublic[]
      ).map((prof) => {
        const profReviews = (reviews as ProfessionalReview[]).filter(
          (r) => r.professional_id === prof.id
        );
        const totalReviews = profReviews.length;
        const averageRating =
          totalReviews > 0
            ? profReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;

        return {
          ...prof,
          reviews: profReviews,
          averageRating,
          totalReviews,
        };
      });

      return professionalsWithReviews;
    },
  });
}
