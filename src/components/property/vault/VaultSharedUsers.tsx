import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, X, Shield, Loader2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SharedUser {
  id: string;
  name: string;
  type: "professional" | "buyer";
  category?: string;
}

interface VaultSharedUsersProps {
  propertyId: string;
  isOwner: boolean;
}

const categoryLabels: Record<string, string> = {
  juridico: "Jurídico",
  financeiro: "Financeiro",
  tecnico: "Técnico",
  marketing: "Marketing",
};

export function VaultSharedUsers({ propertyId, isOwner }: VaultSharedUsersProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [revokeTarget, setRevokeTarget] = useState<SharedUser | null>(null);

  const { data: sharedUsers = [], isLoading } = useQuery({
    queryKey: ["vault-shared-users", propertyId],
    queryFn: async () => {
      const result: SharedUser[] = [];

      // Fetch professionals with granted access
      const { data: profRequests } = await supabase
        .from("vault_access_requests")
        .select("professional_id")
        .eq("property_id", propertyId)
        .eq("status", "granted");

      if (profRequests && profRequests.length > 0) {
        const uniqueProfIds = [...new Set(profRequests.map((r) => r.professional_id))];
        const { data: professionals } = await supabase
          .from("professionals")
          .select("id, name, category")
          .in("id", uniqueProfIds);

        if (professionals) {
          for (const prof of professionals) {
            result.push({
              id: prof.id,
              name: prof.name,
              type: "professional",
              category: prof.category,
            });
          }
        }
      }

      // Fetch buyers with paid access
      const { data: buyerRequests } = await supabase
        .from("vault_buyer_access")
        .select("id, buyer_id")
        .eq("property_id", propertyId)
        .eq("status", "paid");

      if (buyerRequests && buyerRequests.length > 0) {
        const buyerIds = [...new Set(buyerRequests.map((r) => r.buyer_id))];
        // Try to get profile names; RLS may restrict access so we handle gracefully
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", buyerIds);

        const profileMap = new Map(
          (profiles || []).map((p) => [p.id, p])
        );

        for (const buyerId of buyerIds) {
          const profile = profileMap.get(buyerId);
          result.push({
            id: buyerId,
            name: profile?.full_name || profile?.email || "Comprador",
            type: "buyer",
          });
        }
      }

      return result;
    },
    refetchInterval: 15000, // Auto-refresh every 15 seconds
    refetchOnWindowFocus: true,
  });

  const revokeMutation = useMutation({
    mutationFn: async (user: SharedUser) => {
      if (user.type === "professional") {
        const { error } = await supabase
          .from("vault_access_requests")
          .update({ status: "revoked" })
          .eq("property_id", propertyId)
          .eq("professional_id", user.id)
          .eq("status", "granted");
        if (error) throw error;

        // Deactivate relationship
        await supabase
          .from("professional_relationships")
          .update({ is_active: false })
          .eq("professional_id", user.id)
          .eq("property_id", propertyId)
          .eq("relationship_type", "vault_access");
      } else {
        const { error } = await supabase
          .from("vault_buyer_access")
          .update({ status: "revoked" })
          .eq("property_id", propertyId)
          .eq("buyer_id", user.id)
          .eq("status", "paid");
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault-shared-users", propertyId] });
      toast({
        title: "Acesso revogado",
        description: `O acesso de ${revokeTarget?.name} foi removido do cofre.`,
      });
      setRevokeTarget(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível revogar o acesso.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || sharedUsers.length === 0) return null;

  return (
    <>
      <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">
            Cofre partilhado com
          </h4>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {sharedUsers.length}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {sharedUsers.map((user) => (
            <div
              key={`${user.type}-${user.id}`}
              className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm"
            >
              {user.type === "professional" ? (
                <Shield className="w-3 h-3 text-primary flex-shrink-0" />
              ) : (
                <User className="w-3 h-3 text-primary flex-shrink-0" />
              )}
              <span className="font-medium text-foreground">{user.name}</span>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0"
              >
                {user.type === "professional"
                  ? categoryLabels[user.category || ""] || "Profissional"
                  : "Comprador"}
              </Badge>
              {isOwner && (
                <button
                  onClick={() => setRevokeTarget(user)}
                  className="ml-1 rounded-full p-0.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  title="Revogar acesso"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar acesso ao cofre</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que pretende remover o acesso de{" "}
              <strong>{revokeTarget?.name}</strong> ao cofre digital deste imóvel?
              {revokeTarget?.type === "professional"
                ? " O profissional deixará de poder visualizar e validar documentos."
                : " O comprador deixará de poder visualizar os documentos."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => revokeTarget && revokeMutation.mutate(revokeTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={revokeMutation.isPending}
            >
              {revokeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A revogar...
                </>
              ) : (
                "Revogar acesso"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
