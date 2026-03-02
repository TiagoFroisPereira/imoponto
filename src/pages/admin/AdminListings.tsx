import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, CheckCircle, XCircle } from "lucide-react";
import { useAdminLogs } from "@/hooks/useAdminLogs";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminListings() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const { logAction } = useAdminLogs();
  const queryClient = useQueryClient();

  const { data: listings, isLoading } = useQuery({
    queryKey: ["admin-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, location, status, created_at, user_id, price")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = (listings || []).filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleApprove = async (id: string) => {
    await supabase.from("properties").update({ status: "active" }).eq("id", id);
    await logAction("approve_listing", undefined, id);
    toast({ title: "Anúncio aprovado" });
    queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
  };

  const handleReject = async () => {
    if (!rejectDialog || !rejectReason) return;
    await supabase.from("properties").update({ status: "rejected" }).eq("id", rejectDialog);
    await logAction("reject_listing", undefined, rejectDialog, { reason: rejectReason });
    toast({ title: "Anúncio rejeitado" });
    queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
    setRejectDialog(null);
    setRejectReason("");
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      active: { variant: "default", label: "Ativo" },
      pending: { variant: "secondary", label: "Pendente" },
      rejected: { variant: "destructive", label: "Rejeitado" },
      removed: { variant: "outline", label: "Removido" },
    };
    const m = map[s] || { variant: "outline" as const, label: s };
    return <Badge variant={m.variant}>{m.label}</Badge>;
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Anúncios</h1>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 sm:max-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="rejected">Rejeitados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead className="hidden md:table-cell">Localização</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium max-w-[150px] truncate">{l.title}</TableCell>
                <TableCell className="hidden md:table-cell">{l.location}</TableCell>
                <TableCell>€{l.price?.toLocaleString()}</TableCell>
                <TableCell>{statusBadge(l.status)}</TableCell>
                <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{format(new Date(l.created_at), "dd/MM/yyyy")}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {l.status === "pending" && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleApprove(l.id)}>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setRejectDialog(l.id)}>
                          <XCircle className="w-4 h-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum anúncio encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!rejectDialog} onOpenChange={() => { setRejectDialog(null); setRejectReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Anúncio</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Motivo da rejeição (obrigatório)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
