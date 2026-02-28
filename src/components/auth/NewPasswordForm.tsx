import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const NewPasswordForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleNewPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmNewPassword) {
            toast({
                title: "Erro",
                description: "As passwords não coincidem.",
                variant: "destructive",
            });
            return;
        }

        if (newPassword.length < 6) {
            toast({
                title: "Erro",
                description: "A password deve ter pelo menos 6 caracteres.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        const { error } = await supabase.auth.updateUser({ password: newPassword });

        setIsLoading(false);

        if (error) {
            toast({
                title: "Erro",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Password alterada",
                description: "A sua password foi alterada com sucesso.",
            });
            navigate("/");
        }
    };

    return (
        <form onSubmit={handleNewPassword} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="new-password">Nova Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirmar Nova Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="confirm-new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                    />
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "A guardar..." : "Guardar Nova Password"}
            </Button>

            <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/auth")}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Login
            </Button>
        </form>
    );
};
