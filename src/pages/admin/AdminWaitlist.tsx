import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, MailPlus } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const interestLabels: Record<string, string> = {
  buyer: "Comprador",
  seller: "Vendedor",
  professional: "Prestador",
};

export default function AdminWaitlist() {
  const [search, setSearch] = useState("");

  const { data: subscribers, isLoading } = useQuery({
    queryKey: ["admin-waitlist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waitlist_subscribers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = (subscribers || []).filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MailPlus className="w-6 h-6 text-primary" />
          Lista de Espera
        </h1>
        <Badge variant="secondary" className="w-fit">
          {filtered.length} subscritores
        </Badge>
      </div>

      <Input
        placeholder="Pesquisar por email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Interesses</TableHead>
              <TableHead className="hidden md:table-cell">Fonte</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(s.interests || []).map((interest: string) => (
                      <Badge key={interest} variant="outline" className="text-xs">
                        {interestLabels[interest] || interest}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {s.source || "—"}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {format(new Date(s.created_at), "dd MMM yyyy", { locale: pt })}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nenhum subscritor encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
