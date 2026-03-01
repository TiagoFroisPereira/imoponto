import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { RecoveryForm } from "./RecoveryForm";

interface AuthFormProps {
    defaultTab?: "login" | "register";
    onSuccess?: () => void;
    showTitle?: boolean;
}

type AuthView = "login" | "register" | "recovery";

export const AuthForm = ({ defaultTab = "login", onSuccess, showTitle = false }: AuthFormProps) => {
    const [view, setView] = useState<AuthView>(defaultTab);

    // Check if registration is enabled
    const { data: registrationEnabled = true, isLoading: isLoadingSettings } = useQuery({
        queryKey: ["admin-settings", "registration_enabled"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("admin_settings")
                .select("value")
                .eq("key", "registration_enabled")
                .maybeSingle();

            if (error) {
                console.error("Error fetching registration setting:", error);
                return true;
            }
            if (!data) return true;

            const val = data.value;
            // Handle both boolean and string "true"/"false" from JSONB
            return val === true || val === "true";
        },
        staleTime: 60 * 1000, // 1 minute
    });

    const getTitle = () => {
        if (view === "recovery") return "Recuperar Password";
        if (view === "register") return registrationEnabled ? "Criar Conta" : "Lista de Espera";
        return "Bem-vindo";
    };

    const getSubtitle = () => {
        if (view === "recovery") return "Insira o seu email para receber instruções de recuperação";
        if (view === "register") {
            return registrationEnabled
                ? "Registe-se para começar a usar o ImoPonto"
                : "Saiba quando abrirmos as portas";
        }
        return "Aceda à sua conta";
    };

    return (
        <div className="w-full">
            {showTitle && (
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold font-heading mb-2">{getTitle()}</h2>
                    <p className="text-sm text-muted-foreground">
                        {getSubtitle()}
                    </p>
                </div>
            )}

            <div className="space-y-6">
                {view === "login" && (
                    <LoginForm
                        onSuccess={onSuccess}
                        onForgotPassword={() => setView("recovery")}
                    />
                )}

                {view === "register" && (
                    <RegisterForm
                        registrationEnabled={registrationEnabled && !isLoadingSettings}
                        onSuccess={onSuccess}
                    />
                )}

                {view === "recovery" && (
                    <RecoveryForm
                        onBack={() => setView("login")}
                    />
                )}

                {/* Footer Navigation */}
                <div className="pt-4 border-t border-border mt-6 text-center text-sm space-y-3">
                    {view === "login" && (
                        <p className="text-muted-foreground">
                            Ainda não tem conta?{" "}
                            <button
                                onClick={() => setView("register")}
                                className="text-primary font-medium hover:underline"
                            >
                                {registrationEnabled ? "Registe-se aqui" : "Adira à lista de espera"}
                            </button>
                        </p>
                    )}

                    {view === "register" && (
                        <p className="text-muted-foreground">
                            Já tem uma conta?{" "}
                            <button
                                onClick={() => setView("login")}
                                className="text-primary font-medium hover:underline"
                            >
                                Entrar
                            </button>
                        </p>
                    )}

                    {view === "recovery" && (
                        <p className="text-muted-foreground">
                            Lembrou-se da sua password?{" "}
                            <button
                                onClick={() => setView("login")}
                                className="text-primary font-medium hover:underline"
                            >
                                Voltar ao login
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
