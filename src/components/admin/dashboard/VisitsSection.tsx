import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarCheck, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const periodOptions: Record<string, string> = {
  day: "Dia",
  week: "Semana",
  month: "Mês",
  year: "Ano",
};

function getDateRange(period: string) {
  const now = new Date();
  let from: string;
  switch (period) {
    case "day":
      from = now.toISOString().split("T")[0];
      break;
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      from = d.toISOString().split("T")[0];
      break;
    }
    case "month": {
      from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      break;
    }
    case "year": {
      from = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
      break;
    }
    default:
      from = now.toISOString().split("T")[0];
  }
  return from;
}

export function VisitsSection() {
  const [period, setPeriod] = useState("month");

  const fromDate = useMemo(() => getDateRange(period), [period]);

  const { data: visits, isLoading } = useQuery({
    queryKey: ["admin-visits", fromDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visit_bookings")
        .select("id, scheduled_date, scheduled_time, status")
        .gte("scheduled_date", fromDate);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });

  // Peak hours chart data
  const hourData = useMemo(() => {
    if (!visits?.length) return [];
    const buckets: Record<number, number> = {};
    for (const v of visits) {
      const hour = parseInt(v.scheduled_time?.split(":")[0] || "0", 10);
      buckets[hour] = (buckets[hour] || 0) + 1;
    }
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, "0")}h`,
      visitas: buckets[i] || 0,
    })).filter((d) => d.visitas > 0 || (d.hour >= "08h" && d.hour <= "20h"));
  }, [visits]);

  const totalVisits = visits?.length || 0;
  const confirmed = visits?.filter((v) => v.status === "confirmed").length || 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-primary" />
            Visitas
          </CardTitle>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(periodOptions).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{totalVisits}</p>
                <p className="text-xs text-muted-foreground">Total visitas</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{confirmed}</p>
                <p className="text-xs text-muted-foreground">Confirmadas</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Horários de maior fluxo</p>
              {hourData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={hourData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="hour" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, fontSize: 13 }}
                      labelFormatter={(l) => `Horário: ${l}`}
                    />
                    <Bar dataKey="visitas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Sem dados de visitas para este período
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
