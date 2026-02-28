import { Scale, CreditCard, Wrench, Camera } from "lucide-react";
import { ProfessionalCard } from "./ProfessionalCard";
import type { ServiceCategory, ProfessionalWithReviews } from "@/hooks/useProfessionals";
import { categoryLabels, categoryDescriptions } from "@/hooks/useProfessionals";

const categoryIcons: Record<ServiceCategory, React.ElementType> = {
  juridico: Scale,
  financeiro: CreditCard,
  tecnico: Wrench,
  marketing: Camera,
};

interface CategorySectionProps {
  category: ServiceCategory;
  professionals: ProfessionalWithReviews[];
}

export function CategorySection({ category, professionals }: CategorySectionProps) {
  const Icon = categoryIcons[category];

  if (professionals.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {categoryLabels[category]}
          </h2>
          <p className="text-sm text-muted-foreground">
            {categoryDescriptions[category]}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {professionals.map((professional) => (
          <ProfessionalCard key={professional.id} professional={professional} />
        ))}
      </div>
    </section>
  );
}
