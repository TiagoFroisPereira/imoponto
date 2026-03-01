import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, MapPin, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const categoryLabels: Record<string, string> = {
  juridico: "Jurídico",
  financeiro: "Financeiro",
  tecnico: "Técnico",
  marketing: "Marketing",
};

export function ProfessionalsFilter() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-professionals-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professionals")
        .select("id, category, location, is_active, is_verified");
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });

  const professionals = data || [];

  // Unique locations
  const locations = [...new Set(professionals.map((p) => p.location).filter(Boolean))] as string[];

  // Apply filters
  const filtered = professionals.filter((p) => {
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (locationFilter !== "all" && p.location !== locationFilter) return false;
    return true;
  });

  // Count by category
  const categoryCounts = professionals.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          Profissionais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label} ({categoryCounts[key] || 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Localização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as localizações</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Badge key={key} variant="secondary" className="text-xs">
              {label}: {categoryCounts[key] || 0}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{filtered.length}</p>
            <p className="text-xs text-muted-foreground">Total filtrado</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-foreground">
              {filtered.filter((p) => p.is_verified).length}
            </p>
            <p className="text-xs text-muted-foreground">Verificados</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-foreground">
              {filtered.filter((p) => p.is_active).length}
            </p>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
