import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle, Trash2 } from "lucide-react";
import { useAdminLogs } from "@/hooks/useAdminLogs";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminProfessionals() {
  const [verifyId, setVerifyId] = useState<string | null>(null);
  const [deleteProf, setDeleteProf] = useState<{ id: string; name: string } | null>(null);
  const { logAction } = useAdminLogs();
  const queryClient = useQueryClient();

  const { data: professionals, isLoading } = useQuery({
    queryKey: ["admin-professionals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professionals")
        .select("id, name, category, is_verified, is_active, location, service_type")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleVerify = async () => {
    if (!verifyId) return;
    await supabase.from("professionals").update({ is_verified: true }).eq("id", verifyId);
    await logAction("verify_professional", undefined, verifyId);
    toast({ title: "Profissional verificado" });
    queryClient.invalidateQueries({ queryKey: ["admin-professionals"] });
    setVerifyId(null);
  };

  const handleDelete = async () => {
    if (!deleteProf) return;
    const { error } = await supabase.from("professionals").delete().eq("id", deleteProf.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    await logAction("delete_professional", undefined, deleteProf.id);
    toast({ title: "Profissional eliminado com sucesso" });
    queryClient.invalidateQueries({ queryKey: ["admin-professionals"] });
    setDeleteProf(null);
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Profissionais</h1>
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="hidden md:table-cell">Localização</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(professionals || []).map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell className="hidden md:table-cell">{p.location || "—"}</TableCell>
                <TableCell>
                  {p.is_verified ? (
                    <Badge variant="default">Verificado</Badge>
                  ) : (
                    <Badge variant="secondary">Pendente</Badge>
                  )}
                </TableCell>
                <TableCell className="flex gap-1">
                  {!p.is_verified && (
                    <Button variant="ghost" size="sm" onClick={() => setVerifyId(p.id)}>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setDeleteProf({ id: p.id, name: p.name })}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(professionals || []).length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum profissional encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!verifyId} onOpenChange={() => setVerifyId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Verificar Profissional</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Confirma que pretende verificar este profissional? Um badge verde será visível no frontend.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyId(null)}>Cancelar</Button>
            <Button onClick={handleVerify}>Verificar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteProf} onOpenChange={() => setDeleteProf(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Profissional</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que pretende eliminar <strong>{deleteProf?.name}</strong>? Esta ação é irreversível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
