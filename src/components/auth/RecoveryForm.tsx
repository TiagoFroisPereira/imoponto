import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface RecoveryFormProps {
    onBack: () => void;
}

export const RecoveryForm = ({ onBack }: RecoveryFormProps) => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { error } = await resetPassword(email);

        setIsLoading(false);

        if (error) {
            toast({
                title: "Erro",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Email enviado",
                description: "Verifique a sua caixa de email para instruções de recuperação.",
            });
            onBack();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="recovery-email">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="recovery-email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "A enviar..." : "Enviar Instruções"}
            </Button>

            <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={onBack}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Login
            </Button>
        </form>
    );
};
