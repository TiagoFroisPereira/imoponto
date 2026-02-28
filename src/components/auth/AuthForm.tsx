import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, User, Eye, EyeOff, Briefcase, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ProfessionalLegalModal } from "@/components/auth/ProfessionalLegalModal";
import type { ServiceCategory } from "@/hooks/useProfessionals";

const professionalAreas: { value: ServiceCategory; label: string }[] = [
    { value: "juridico", label: "Jurídico" },
    { value: "financeiro", label: "Financeiro" },
    { value: "tecnico", label: "Técnico" },
    { value: "marketing", label: "Marketing" },
];

const specializationsByArea: Record<ServiceCategory, string[]> = {
    juridico: ["Advogado Imobiliário", "Notário", "Solicitador"],
    financeiro: ["Intermediário de Crédito", "Consultor Financeiro", "Contabilista"],
    tecnico: ["Certificação Energética", "Avaliador Imobiliário", "Perito", "Engenheiro Civil", "Arquiteto"],
    marketing: ["Fotógrafo Profissional", "Videomaker", "Home Staging", "Marketing Digital"],
};

interface AuthFormProps {
    defaultTab?: "login" | "register";
    onSuccess?: () => void;
    showTitle?: boolean;
}

export const AuthForm = ({ defaultTab = "login", onSuccess, showTitle = false }: AuthFormProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<string>(defaultTab);
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { signIn, signUp, resetPassword } = useAuth();

    // Login form state
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Register form state
    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

    // Professional registration state
    const [isProfessional, setIsProfessional] = useState(false);
    const [professionalArea, setProfessionalArea] = useState<ServiceCategory | "">("");
    const [specialization, setSpecialization] = useState("");
    const [showLegalModal, setShowLegalModal] = useState(false);
    const [legalAccepted, setLegalAccepted] = useState(false);

    // Recovery form state
    const [recoveryEmail, setRecoveryEmail] = useState("");
    const [showRecovery, setShowRecovery] = useState(false);

    // Handle professional checkbox change
    const handleProfessionalChange = (checked: boolean) => {
        if (checked) {
            setShowLegalModal(true);
        } else {
            setIsProfessional(false);
            setLegalAccepted(false);
            setProfessionalArea("");
            setSpecialization("");
        }
    };

    const handleLegalAccept = () => {
        setLegalAccepted(true);
        setIsProfessional(true);
        setShowLegalModal(false);
    };

    const handleLegalDecline = () => {
        setShowLegalModal(false);
        setIsProfessional(false);
        setLegalAccepted(false);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { error } = await signIn(loginEmail, loginPassword);

        setIsLoading(false);

        if (error) {
            toast({
                title: "Erro ao entrar",
                description: error.message === "Invalid login credentials"
                    ? "Email ou password incorretos."
                    : error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Bem-vindo!",
                description: "Sessão iniciada com sucesso.",
            });
            if (onSuccess) {
                onSuccess();
            } else {
                // Check if there's a redirect destination
                const from = (location.state as any)?.from?.pathname || "/";
                navigate(from, { replace: true });
            }
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (registerPassword !== registerConfirmPassword) {
            toast({
                title: "Erro",
                description: "As passwords não coincidem.",
                variant: "destructive",
            });
            return;
        }

        if (registerPassword.length < 6) {
            toast({
                title: "Erro",
                description: "A password deve ter pelo menos 6 caracteres.",
                variant: "destructive",
            });
            return;
        }

        // Validate professional fields
        if (isProfessional) {
            if (!legalAccepted) {
                toast({
                    title: "Erro",
                    description: "Deve aceitar os termos legais para se registar como profissional.",
                    variant: "destructive",
                });
                return;
            }

            if (!professionalArea) {
                toast({
                    title: "Erro",
                    description: "Selecione a sua área profissional.",
                    variant: "destructive",
                });
                return;
            }

            if (!specialization) {
                toast({
                    title: "Erro",
                    description: "Selecione a sua especialização.",
                    variant: "destructive",
                });
                return;
            }
        }

        setIsLoading(true);

        // Sign up with professional metadata
        const { data, error } = await signUp(registerEmail, registerPassword, registerName);

        if (error) {
            setIsLoading(false);
            if (error.message.includes("already registered")) {
                toast({
                    title: "Email já registado",
                    description: "Este email já está registado. Tente entrar ou recuperar a password.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Erro ao criar conta",
                    description: error.message,
                    variant: "destructive",
                });
            }
            return;
        }

        // If professional, create professional profile with incomplete status
        if (isProfessional && data.user) {
            const { error: profError } = await supabase.from("professionals").insert({
                user_id: data.user.id,
                name: registerName,
                email: registerEmail,
                category: professionalArea as ServiceCategory,
                service_type: specialization,
                specialization: specialization,
                price_from: 0,
                is_active: false, // Will be activated after profile completion
                is_verified: false,
                profile_completed: false,
            });

            if (profError) {
                console.error("Error creating professional profile:", profError);
                // Don't block registration, but notify
                toast({
                    title: "Aviso",
                    description: "Conta criada mas houve um erro ao criar o perfil profissional. Entre em contacto connosco.",
                    variant: "destructive",
                });
            }
        }

        setIsLoading(false);

        toast({
            title: "Conta criada!",
            description: isProfessional
                ? "Bem-vindo ao ImoPonto. Complete o seu perfil profissional para ativar a sua conta."
                : "Bem-vindo ao ImoPonto.",
        });

        if (isProfessional) {
            navigate("/completar-perfil-profissional");
        } else if (onSuccess) {
            onSuccess();
        } else {
            navigate("/");
        }
    };

    const handleRecovery = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { error } = await resetPassword(recoveryEmail);

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
            setShowRecovery(false);
        }
    };

    if (showRecovery) {
        return (
            <div className="space-y-4">
                {showTitle && (
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold font-heading">Recuperar Password</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Insira o seu email para receber instruções de recuperação
                        </p>
                    </div>
                )}
                <form onSubmit={handleRecovery} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="recovery-email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="recovery-email"
                                type="email"
                                placeholder="seu@email.com"
                                className="pl-10"
                                value={recoveryEmail}
                                onChange={(e) => setRecoveryEmail(e.target.value)}
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
                        onClick={() => setShowRecovery(false)}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar ao Login
                    </Button>
                </form>
            </div>
        );
    }

    return (
        <>
            <ProfessionalLegalModal
                open={showLegalModal}
                onAccept={handleLegalAccept}
                onDecline={handleLegalDecline}
            />

            <div className="w-full">
                {showTitle && (
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold font-heading">Bem-vindo</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Aceda à sua conta ou crie uma nova
                        </p>
                    </div>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="login">Entrar</TabsTrigger>
                        <TabsTrigger value="register">Registar</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="login-email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        className="pl-10"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="login-password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="login-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pl-10 pr-10"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
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

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowRecovery(true)}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Esqueceu a password?
                                </button>
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "A entrar..." : "Entrar"}
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="register">
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="register-name">Nome Completo</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="register-name"
                                        type="text"
                                        placeholder="João Silva"
                                        className="pl-10"
                                        value={registerName}
                                        onChange={(e) => setRegisterName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="register-email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="register-email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        className="pl-10"
                                        value={registerEmail}
                                        onChange={(e) => setRegisterEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="register-password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="register-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pl-10 pr-10"
                                        value={registerPassword}
                                        onChange={(e) => setRegisterPassword(e.target.value)}
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
                                <Label htmlFor="register-confirm-password">Confirmar Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="register-confirm-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pl-10"
                                        value={registerConfirmPassword}
                                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            {/* Professional Registration Section */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-start gap-3 p-4 border border-border rounded-lg bg-muted/30">
                                    <Checkbox
                                        id="is-professional"
                                        checked={isProfessional}
                                        onCheckedChange={handleProfessionalChange}
                                    />
                                    <div className="flex-1">
                                        <label
                                            htmlFor="is-professional"
                                            className="text-sm font-medium cursor-pointer flex items-center gap-2"
                                        >
                                            <Briefcase className="h-4 w-4 text-accent" />
                                            Sou Profissional
                                        </label>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Registe-se como profissional para aparecer no marketplace de serviços.
                                        </p>
                                    </div>
                                </div>

                                {isProfessional && legalAccepted && (
                                    <div className="space-y-4 p-4 border border-accent/30 rounded-lg bg-accent/5">
                                        <div className="flex items-center gap-2 text-sm text-accent font-medium">
                                            <Briefcase className="h-4 w-4" />
                                            Dados Profissionais
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Área Profissional *</Label>
                                            <Select
                                                value={professionalArea}
                                                onValueChange={(value: ServiceCategory) => {
                                                    setProfessionalArea(value);
                                                    setSpecialization("");
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a área" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {professionalAreas.map((area) => (
                                                        <SelectItem key={area.value} value={area.value}>
                                                            {area.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Especialização *</Label>
                                            <Select
                                                value={specialization}
                                                onValueChange={setSpecialization}
                                                disabled={!professionalArea}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a especialização" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {professionalArea &&
                                                        specializationsByArea[professionalArea].map((spec) => (
                                                            <SelectItem key={spec} value={spec}>
                                                                {spec}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    required
                                    className="mt-1 rounded border-border"
                                />
                                <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
                                    Aceito os{" "}
                                    <Link to="/termos" className="text-primary hover:underline">
                                        Termos de Serviço
                                    </Link>{" "}
                                    e a{" "}
                                    <Link to="/privacidade" className="text-primary hover:underline">
                                        Política de Privacidade
                                    </Link>
                                </Label>
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "A criar conta..." : "Criar Conta"}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
};
