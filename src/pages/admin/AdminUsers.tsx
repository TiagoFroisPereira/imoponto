import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search, Eye, Trash2 } from "lucide-react";
import { useAdminLogs } from "@/hooks/useAdminLogs";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  plan: string;
  plan_type: string | null;
  created_at: string;
  updated_at: string;
  subscription_status: string | null;
};

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    type: "suspend7" | "suspend30" | "block" | "reactivate";
    user: UserProfile;
  } | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [blockConfirm, setBlockConfirm] = useState(false);
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null);
  const { logAction } = useAdminLogs();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  const filtered = (users || []).filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.full_name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    );
  });

  const handleAction = async () => {
    if (!actionDialog) return;
    const { type, user } = actionDialog;

    let newStatus = "";
    let actionType = "";

    if (type === "suspend7") {
      newStatus = "suspended_7d";
      actionType = "suspend_7_days";
    } else if (type === "suspend30") {
      newStatus = "suspended_30d";
      actionType = "suspend_30_days";
    } else if (type === "block") {
      newStatus = "blocked";
      actionType = "block_permanent";
    } else if (type === "reactivate") {
      newStatus = "active";
      actionType = "reactivate";
    }

    const { error } = await supabase
      .from("profiles")
      .update({ subscription_status: newStatus })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }

    await logAction(actionType, user.id, undefined, {
      reason: suspendReason || undefined,
    });

    if (type === "block") {
      await supabase
        .from("properties")
        .update({ status: "removed" })
        .eq("user_id", user.id);
      await logAction("remove_all_listings", user.id);
    }

    toast({ title: "Ação executada com sucesso" });
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    setActionDialog(null);
    setSelectedUser(null);
    setSuspendReason("");
    setBlockConfirm(false);
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    const { error } = await supabase.from("profiles").delete().eq("id", deleteUser.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    await logAction("delete_user", deleteUser.id);
    toast({ title: "Utilizador eliminado com sucesso" });
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    setDeleteUser(null);
    setSelectedUser(null);
  };

  const getStatusBadge = (status: string | null) => {
    if (!status || status === "active") return <Badge variant="default">Ativo</Badge>;
    if (status?.startsWith("suspended")) return <Badge variant="secondary">Suspenso</Badge>;
    if (status === "blocked") return <Badge variant="destructive">Bloqueado</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Utilizadores</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Registo</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name || "—"}</TableCell>
                <TableCell>{user.email || "—"}</TableCell>
                <TableCell>{user.plan || "free"}</TableCell>
                <TableCell>{getStatusBadge(user.subscription_status)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(user.created_at), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum utilizador encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedUser?.full_name || "Utilizador"}</DialogTitle>
            <DialogDescription>{selectedUser?.email}</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Plano</p>
                  <p className="font-medium">{selectedUser.plan}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Estado</p>
                  {getStatusBadge(selectedUser.subscription_status)}
                </div>
                <div>
                  <p className="text-muted-foreground">Registo</p>
                  <p className="font-medium">{format(new Date(selectedUser.created_at), "dd/MM/yyyy")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Última atualização</p>
                  <p className="font-medium">{format(new Date(selectedUser.updated_at), "dd/MM/yyyy")}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActionDialog({ type: "suspend7", user: selectedUser })}
                >
                  Suspender 7 dias
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActionDialog({ type: "suspend30", user: selectedUser })}
                >
                  Suspender 30 dias
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setActionDialog({ type: "block", user: selectedUser })}
                >
                  Bloquear
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setActionDialog({ type: "reactivate", user: selectedUser })}
                >
                  Reativar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteUser(selectedUser)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => { setActionDialog(null); setSuspendReason(""); setBlockConfirm(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.type === "block"
                ? "Bloquear Definitivamente"
                : actionDialog?.type === "reactivate"
                ? "Reativar Conta"
                : "Suspender Conta"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {actionDialog?.type === "block"
                ? "Esta ação é irreversível. Todos os anúncios serão removidos."
                : `Utilizador: ${actionDialog?.user.full_name || actionDialog?.user.email}`}
            </p>

            {(actionDialog?.type === "suspend7" || actionDialog?.type === "suspend30") && (
              <Select value={suspendReason} onValueChange={setSuspendReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="fraude">Fraude</SelectItem>
                  <SelectItem value="conteudo_inapropriado">Conteúdo inapropriado</SelectItem>
                  <SelectItem value="violacao_termos">Violação dos termos</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            )}

            {actionDialog?.type === "block" && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={blockConfirm}
                  onCheckedChange={(c) => setBlockConfirm(c === true)}
                />
                <span className="text-sm">Confirmo que esta ação é irreversível</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancelar
            </Button>
            <Button
              variant={actionDialog?.type === "block" ? "destructive" : "default"}
              onClick={handleAction}
              disabled={
                (actionDialog?.type === "block" && !blockConfirm) ||
                ((actionDialog?.type === "suspend7" || actionDialog?.type === "suspend30") && !suspendReason)
              }
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete User Confirmation */}
      <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Utilizador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que pretende eliminar o utilizador <strong>{deleteUser?.full_name || deleteUser?.email}</strong>? Esta ação é irreversível e todos os dados associados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
