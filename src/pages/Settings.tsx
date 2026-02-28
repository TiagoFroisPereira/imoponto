import { useState, useEffect } from "react";
import { PaymentsSection } from "@/components/settings/PaymentsSection";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Mail,
  Phone,
  KeyRound,
  LogOut,
  Trash2,
  User,
  ChevronRight,
  Shield,
  MessageSquare,
  Eye,
  CreditCard,
  ArrowLeft
} from "lucide-react";

type SettingsSection = "profile" | "account" | "notifications" | "payments";

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, resetPassword } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();

  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");

  // Profile Form States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [chatEnabled, setChatEnabled] = useState(true);
  const [phoneVisible, setPhoneVisible] = useState(true);
  const [notificationSettings, setNotificationSettings] = useState<Record<string, boolean>>({
    welcome: true,
    property_published: true,
    payment_receipt: true,
    visit_requests: true,
    messages: true,
    professional_replies: true
  });

  // Account Form States
  const [newEmail, setNewEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'account') setActiveSection('account');
    else if (tab === 'profile') setActiveSection('profile');
    else if (tab === 'payments') setActiveSection('payments');
  }, [searchParams]);

  useEffect(() => {
    if (user?.email) {
      setNewEmail(user.email);
    }
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setChatEnabled(profile.chat_enabled ?? true);
      setPhoneVisible(profile.phone_visible ?? true);
      if (profile.notification_settings) {
        setNotificationSettings(profile.notification_settings);
      }
    }
  }, [user, profile]);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 9)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    if (formatted.replace(/\s/g, "").length <= 9) {
      setPhone(formatted);
    }
  };

  const handleUpdateProfile = async () => {
    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length !== 9) {
      toast({
        title: "Erro",
        description: "O número de telefone deve ter 9 dígitos.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    await updateProfile({
      full_name: fullName.trim(),
      phone: cleanPhone,
      chat_enabled: chatEnabled,
      phone_visible: phoneVisible,
      notification_settings: notificationSettings
    });
    setIsUpdating(false);

    toast({
      title: "Perfil atualizado",
      description: "As suas informações foram atualizadas com sucesso.",
    });
  };

  const handleUpdateEmail = async () => {
    if (!newEmail || newEmail === user?.email) return;

    setIsUpdating(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setIsUpdating(false);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o email.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email de confirmação enviado",
        description: "Verifique o seu novo email para confirmar a alteração.",
      });
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;

    setIsUpdating(true);
    const { error } = await resetPassword(user.email);
    setIsUpdating(false);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o email de recuperação.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email enviado",
        description: "Verifique o seu email para redefinir a palavra-passe.",
      });
    }
  };

  const handleSignOutAll = async () => {
    setIsUpdating(true);
    const { error } = await supabase.auth.signOut({ scope: "global" });
    setIsUpdating(false);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível terminar as sessões.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sessões terminadas",
        description: "Todas as sessões foram terminadas.",
      });
      navigate("/");
    }
  };

  const handleDeleteAccount = async () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A eliminação de conta estará disponível em breve. Contacte o suporte para assistência.",
    });
  };

  const menuItems = [
    { id: "profile" as const, label: "Dados Pessoais", icon: User },
    { id: "notifications" as const, label: "Notificações", icon: Mail },
    { id: "account" as const, label: "Segurança e Conta", icon: Shield },
    { id: "payments" as const, label: "Pagamentos", icon: CreditCard },
  ];

  if (!user) return null;

  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
            onClick={() => navigate('/meu-perfil')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Perfil
          </Button>
          <h1 className="text-3xl font-bold">Definições</h1>
          <p className="text-muted-foreground mt-1">Gerir a sua conta e preferências</p>
        </div>

        <div className="grid md:grid-cols-[280px_1fr] gap-8">
          {/* Mobile: horizontal scrollable menu */}
          <div className="md:hidden overflow-x-auto -mx-4 px-4 pb-2">
            <div className="flex gap-2 min-w-max">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${activeSection === item.id ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted text-foreground border-border"}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: sidebar menu */}
          <Card className="h-fit hidden md:block">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                Menu
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="flex flex-col">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center justify-between px-6 py-4 text-left transition-colors hover:bg-muted ${activeSection === item.id ? "bg-muted border-l-2 border-primary" : "border-l-2 border-transparent"
                      }`}
                  >
                    <span className="flex items-center gap-3 font-medium">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Content Area */}
          <div className="space-y-6">

            {/* PROFILE SECTION */}
            {activeSection === "profile" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Dados Pessoais</CardTitle>
                    <CardDescription>Informações públicas e de contacto</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nome Completo</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="fullName"
                            className="pl-9"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="O seu nome completo"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            className="pl-9"
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder="912 345 678"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Preferências de Contacto</CardTitle>
                    <CardDescription>Controle como os compradores podem interagir consigo</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          <Label className="text-base">Chat</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">Permitir que compradores enviem mensagens</p>
                      </div>
                      <Switch checked={chatEnabled} onCheckedChange={setChatEnabled} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-primary" />
                          <Label className="text-base">Mostrar Telefone</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">Exibir o seu número nos anúncios</p>
                      </div>
                      <Switch checked={phoneVisible} onCheckedChange={setPhoneVisible} />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={handleUpdateProfile} disabled={isUpdating}>
                    {isUpdating ? "A guardar..." : "Guardar Alterações"}
                  </Button>
                </div>
              </>
            )}

            {/* NOTIFICATIONS SECTION */}
            {activeSection === "notifications" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Preferências de Email</CardTitle>
                    <CardDescription>Escolha quais notificações deseja receber por correio eletrónico</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Novas Mensagens</Label>
                        <p className="text-sm text-muted-foreground">Sempre que receber um contacto sobre um imóvel</p>
                      </div>
                      <Switch
                        checked={notificationSettings.messages}
                        onCheckedChange={(checked) => setNotificationSettings(s => ({ ...s, messages: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="space-y-0.5">
                        <Label className="text-base">Agendamento de Visitas</Label>
                        <p className="text-sm text-muted-foreground">Alertas de novos pedidos e confirmações de visitas</p>
                      </div>
                      <Switch
                        checked={notificationSettings.visit_requests}
                        onCheckedChange={(checked) => setNotificationSettings(s => ({ ...s, visit_requests: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="space-y-0.5">
                        <Label className="text-base">Pagamentos e Faturas</Label>
                        <p className="text-sm text-muted-foreground">Recibos de subscrições e serviços (recomendado)</p>
                      </div>
                      <Switch
                        checked={notificationSettings.payment_receipt}
                        onCheckedChange={(checked) => setNotificationSettings(s => ({ ...s, payment_receipt: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="space-y-0.5">
                        <Label className="text-base">Anúncios Publicados</Label>
                        <p className="text-sm text-muted-foreground">Confirmação quando o seu imóvel fica online</p>
                      </div>
                      <Switch
                        checked={notificationSettings.property_published}
                        onCheckedChange={(checked) => setNotificationSettings(s => ({ ...s, property_published: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="space-y-0.5">
                        <Label className="text-base">Respostas de Profissionais</Label>
                        <p className="text-sm text-muted-foreground">Quando um advogado ou técnico responde ao seu pedido</p>
                      </div>
                      <Switch
                        checked={notificationSettings.professional_replies}
                        onCheckedChange={(checked) => setNotificationSettings(s => ({ ...s, professional_replies: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="space-y-0.5">
                        <Label className="text-base">Boas-vindas e Dicas</Label>
                        <p className="text-sm text-muted-foreground">Novas funcionalidades e guias para vender melhor</p>
                      </div>
                      <Switch
                        checked={notificationSettings.welcome}
                        onCheckedChange={(checked) => setNotificationSettings(s => ({ ...s, welcome: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={handleUpdateProfile} disabled={isUpdating}>
                    {isUpdating ? "A guardar..." : "Guardar Preferências"}
                  </Button>
                </div>
              </>
            )}

            {/* ACCOUNT SECTION */}
            {activeSection === "account" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Segurança</CardTitle>
                    <CardDescription>Gerir email e palavra-passe</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            className="pl-9"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                          />
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleUpdateEmail}
                          disabled={isUpdating || newEmail === user.email}
                        >
                          Atualizar
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Palavra-passe</Label>
                          <p className="text-sm text-muted-foreground">Receberá um email para redefinir</p>
                        </div>
                        <Button variant="outline" onClick={handleResetPassword} disabled={isUpdating}>
                          <KeyRound className="w-4 h-4 mr-2" />
                          Redefinir Palavra-passe
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
                    <CardDescription>Ações irreversíveis</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium text-destructive">Terminar todas as sessões</p>
                        <p className="text-sm text-destructive/80">Faça logout em todos os dispositivos</p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10" disabled={isUpdating}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Sair de tudo
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Terminar todas as sessões?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação irá terminar a sessão em todos os dispositivos. Terá de iniciar sessão novamente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSignOutAll}>
                              Terminar sessões
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium text-destructive">Eliminar conta</p>
                        <p className="text-sm text-destructive/80">Apagar permanentemente a sua conta e dados</p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser revertida. Todos os seus dados serão permanentemente eliminados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAccount}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar conta
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* PAYMENTS SECTION */}
            {activeSection === "payments" && <PaymentsSection />}

          </div>
        </div>
      </main>
    </div>
  );
}
