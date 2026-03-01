import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, User, Eye, EyeOff, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ProfessionalLegalModal } from "./ProfessionalLegalModal";
import { WaitlistForm } from "./WaitlistForm";
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

interface RegisterFormProps {
    registrationEnabled: boolean;
    onSuccess?: () => void;
}

export const RegisterForm = ({ registrationEnabled, onSuccess }: RegisterFormProps) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Professional registration state
    const [isProfessional, setIsProfessional] = useState(false);
    const [professionalArea, setProfessionalArea] = useState<ServiceCategory | "">("");
    const [specialization, setSpecialization] = useState("");
    const [showLegalModal, setShowLegalModal] = useState(false);
    const [legalAccepted, setLegalAccepted] = useState(false);

    const { toast } = useToast();
    const navigate = useNavigate();
    const { signUp } = useAuth();

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!registrationEnabled) {
            toast({
                title: "Registo desativado",
                description: "De momento o registo está fechado. Por favor, use a lista de espera.",
                variant: "destructive",
            });
            return;
        }

        if (password !== confirmPassword) {
            toast({
                title: "Erro",
                description: "As passwords não coincidem.",
                variant: "destructive",
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: "Erro",
                description: "A password deve ter pelo menos 6 caracteres.",
                variant: "destructive",
            });
            return;
        }

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

        const { data, error } = await signUp(email, password, name);

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

        if (isProfessional && data.user) {
            const { error: profError } = await supabase.from("professionals").insert({
                user_id: data.user.id,
                name: name,
                email: email,
                category: professionalArea as ServiceCategory,
                service_type: specialization,
                specialization: specialization,
                price_from: 0,
                is_active: false,
                is_verified: false,
                profile_completed: false,
            });

            if (profError) {
                console.error("Error creating professional profile:", profError);
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

    if (!registrationEnabled) {
        return <WaitlistForm />;
    }

    return (
        <>
            <ProfessionalLegalModal
                open={showLegalModal}
                onAccept={handleLegalAccept}
                onDecline={handleLegalDecline}
            />

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="register-name">Nome Completo</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="register-name"
                            type="text"
                            placeholder="João Silva"
                            className="pl-10"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
        </>
    );
};
