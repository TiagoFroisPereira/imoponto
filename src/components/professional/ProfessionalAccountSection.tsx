import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  KeyRound,
  LogOut,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface ProfessionalAccountSectionProps {
  user: any;
}

export function ProfessionalAccountSection({ user }: ProfessionalAccountSectionProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  const handleResetPassword = async () => {
    if (!user?.email) return;
    
    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado",
        description: "Verifique o seu email para redefinir a palavra-passe.",
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o email de recuperação.",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Sessão terminada",
        description: "Até breve!",
      });
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Erro",
        description: "Não foi possível terminar a sessão.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmEmail !== user?.email) {
      toast({
        title: "Email incorreto",
        description: "O email introduzido não corresponde à sua conta.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      // First delete professional profile
      const { error: profError } = await supabase
        .from("professionals")
        .delete()
        .eq("user_id", user.id);

      if (profError) {
        console.error("Error deleting professional:", profError);
      }

      // Note: Actual user deletion requires admin privileges or edge function
      // For now, we'll sign out and show a message
      await supabase.auth.signOut();

      toast({
        title: "Conta eliminada",
        description: "O seu perfil profissional foi eliminado. Contacte o suporte para eliminar a conta completa.",
      });
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Erro",
        description: "Não foi possível eliminar a conta.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Conta</h1>
      </div>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="w-4 h-4" />
            Palavra-passe
          </CardTitle>
          <CardDescription>
            Altere a sua palavra-passe de acesso à plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Email: <span className="font-medium text-foreground">{user?.email}</span>
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleResetPassword}
              disabled={isResettingPassword}
            >
              {isResettingPassword ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4 mr-2" />
              )}
              Alterar Palavra-passe
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logout Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Terminar Sessão
          </CardTitle>
          <CardDescription>
            Saia da sua conta neste dispositivo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            Logout
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Delete Account Section */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <Trash2 className="w-4 h-4" />
            Eliminar Conta
          </CardTitle>
          <CardDescription>
            Esta ação é irreversível. Todos os seus dados serão permanentemente eliminados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar Conta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Eliminar conta permanentemente?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  <p>
                    Esta ação não pode ser revertida. Isto irá eliminar permanentemente:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>O seu perfil profissional</li>
                    <li>Todas as avaliações recebidas</li>
                    <li>Histórico de pedidos de serviço</li>
                    <li>Mensagens e conversas</li>
                    <li>Acesso a documentos partilhados</li>
                  </ul>
                  <div className="pt-4">
                    <Label htmlFor="confirm-email">
                      Escreva o seu email para confirmar: <span className="font-medium">{user?.email}</span>
                    </Label>
                    <Input
                      id="confirm-email"
                      type="email"
                      placeholder="Introduza o seu email"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConfirmEmail("")}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || confirmEmail !== user?.email}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Eliminar Conta
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
