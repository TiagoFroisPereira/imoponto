import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, Loader2, Lock } from "lucide-react";

import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAuth } from "@/hooks/useAuth";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategorySection } from "@/components/services/CategorySection";
import {
  useProfessionalsWithReviews,
  categoryLabels,
  type ServiceCategory,
} from "@/hooks/useProfessionals";

const categories: ServiceCategory[] = ["juridico", "financeiro", "tecnico", "marketing"];

const Services = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const { user, loading: authLoading } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Read category from URL on mount
  useEffect(() => {
    const categoryParam = searchParams.get("categoria") as ServiceCategory | null;
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const { data: professionals, isLoading, error } = useProfessionalsWithReviews();

  const filteredProfessionals = professionals?.filter((prof) => {
    const matchesSearch =
      searchQuery === "" ||
      prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.service_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === null || prof.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const groupedProfessionals = categories.reduce(
    (acc, category) => {
      acc[category] =
        filteredProfessionals?.filter((p) => p.category === category) || [];
      return acc;
    },
    {} as Record<ServiceCategory, typeof filteredProfessionals>
  );

  return (
    <div className="flex flex-col bg-background">

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              Marketplace de Serviços
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Profissionais Verificados
            </h1>
          </div>



          {!authLoading && !user ? (
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center bg-card border border-border rounded-3xl overflow-hidden shadow-xl p-8 md:p-12 mb-12">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center">
                    <Lock className="w-8 h-8 text-accent" />
                  </div>
                  <h2 className="text-3xl font-bold font-heading">Ecossistema de Confiança</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Aceda à rede exclusiva de profissionais verificados da ImoPonto.
                    Compare orçamentos, veja avaliações reais e escolha o parceiro ideal para o seu processo.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Advogados e Notários especializados",
                      "Intermediários de Crédito vinculados",
                      "Técnicos de certificação energética"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="lg"
                    variant="accent"
                    className="w-full sm:w-auto px-10 h-14 text-lg font-semibold shadow-lg shadow-accent/20"
                    onClick={() => setIsAuthOpen(true)}
                  >
                    Entrar / Criar Conta
                  </Button>
                </div>
                <div className="relative hidden md:block">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 blur-3xl opacity-50" />
                  <div className="relative bg-muted/30 border border-white/10 rounded-2xl p-6 backdrop-blur-sm -rotate-2 scale-95 opacity-80 select-none grayscale pointer-events-none">
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-background/50 border border-border/50">
                          <div className="w-12 h-12 rounded-lg bg-muted animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                            <div className="h-3 w-32 bg-muted/60 rounded animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Search and Filters */}
              <div className="max-w-4xl mx-auto mb-12">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar por nome, serviço ou localização..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={selectedCategory === null ? "accent" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      Todos
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "accent" : "outline"}
                        size="sm"
                        onClick={() =>
                          setSelectedCategory(
                            selectedCategory === category ? null : category
                          )
                        }
                      >
                        {categoryLabels[category]}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Active filters */}
                {(searchQuery || selectedCategory) && (
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-sm text-muted-foreground">Filtros:</span>
                    {searchQuery && (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setSearchQuery("")}
                      >
                        "{searchQuery}" ✕
                      </Badge>
                    )}
                    {selectedCategory && (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory(null)}
                      >
                        {categoryLabels[selectedCategory]} ✕
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-20">
                  <p className="text-destructive">
                    Erro ao carregar profissionais. Tente novamente.
                  </p>
                </div>
              )}

              {/* Results */}
              {!isLoading && !error && (
                <>
                  {filteredProfessionals?.length === 0 ? (
                    <div className="text-center py-20">
                      <p className="text-muted-foreground">
                        Nenhum profissional encontrado com os filtros selecionados.
                      </p>
                    </div>
                  ) : selectedCategory ? (
                    <CategorySection
                      category={selectedCategory}
                      professionals={groupedProfessionals[selectedCategory] || []}
                    />
                  ) : (
                    categories.map((category) => (
                      <CategorySection
                        key={category}
                        category={category}
                        professionals={groupedProfessionals[category] || []}
                      />
                    ))
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main >

      
      <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </div >
  );
};

export default Services;
