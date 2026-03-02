import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Users, Building2, Briefcase, TrendingUp, MailPlus } from "lucide-react";
import { Loader2 } from "lucide-react";
import { ProfessionalsFilter } from "@/components/admin/dashboard/ProfessionalsFilter";
import { RevenueSection } from "@/components/admin/dashboard/RevenueSection";
import { VisitsSection } from "@/components/admin/dashboard/VisitsSection";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const now = new Date();
      const today = now.toISOString().split("T")[0];

      const [profiles, properties, professionals, waitlist] = await Promise.all([
        supabase.from("profiles").select("id, created_at", { count: "exact" }),
        supabase.from("properties").select("id, created_at, status", { count: "exact" }),
        supabase.from("professionals").select("id", { count: "exact" }),
        supabase.from("waitlist_subscribers" as any).select("id, created_at", { count: "exact" }),
      ]);

      const totalUsers = profiles.count || 0;
      const newUsersToday = (profiles.data || []).filter(
        (p) => p.created_at.startsWith(today)
      ).length;

      const activeListings = (properties.data || []).filter(
        (p) => p.status === "active"
      ).length;
      const listingsToday = (properties.data || []).filter(
        (p) => p.created_at.startsWith(today)
      ).length;

      const totalProfessionals = professionals.count || 0;

      const totalWaitlist = waitlist.count || 0;
      const waitlistToday = ((waitlist.data as any[]) || []).filter(
        (w: any) => w.created_at?.startsWith(today)
      ).length;

      return { totalUsers, newUsersToday, activeListings, listingsToday, totalProfessionals, totalWaitlist, waitlistToday };
    },
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total Utilizadores" value={stats?.totalUsers ?? 0} icon={Users} description={`+${stats?.newUsersToday ?? 0} hoje`} />
        <StatsCard title="Anúncios Ativos" value={stats?.activeListings ?? 0} icon={Building2} description={`+${stats?.listingsToday ?? 0} hoje`} />
        <StatsCard title="Profissionais" value={stats?.totalProfessionals ?? 0} icon={Briefcase} />
        <StatsCard title="Lista de Espera" value={stats?.totalWaitlist ?? 0} icon={MailPlus} description={`+${stats?.waitlistToday ?? 0} hoje`} />
        <StatsCard title="Receita Mensal" value="€0" icon={TrendingUp} description="Integração Stripe pendente" />
      </div>

      {/* Analytics sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfessionalsFilter />
        <RevenueSection />
      </div>

      <VisitsSection />
    </div>
  );
}
