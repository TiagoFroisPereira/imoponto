import { useState } from "react";
import { Mail, Phone, MapPin, MessageSquare, Send, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
    fullName: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    subject: z.string().min(5, "O assunto deve ter pelo menos 5 caracteres"),
    message: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function Contact() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
    });

    const onSubmit = async (data: ContactFormValues) => {
        setIsSubmitting(true);
        try {
            // 1. Notificação para o suporte (Admin)
            const { error: adminError } = await supabase
                .from("email_queue")
                .insert({
                    recipient_email: "info@imoponto.pt",
                    template_key: "contact_form",
                    template_data: data,
                    status: "pending"
                });

            if (adminError) throw adminError;

            // 2. Confirmação para o utilizador
            const { error: userError } = await supabase
                .from("email_queue")
                .insert({
                    recipient_email: data.email,
                    template_key: "contact_confirmation",
                    template_data: data,
                    status: "pending"
                });

            if (userError) throw userError;

            toast({
                title: "Mensagem enviada com sucesso!",
                description: "Receberá uma confirmação no seu email em breve.",
            });
            reset();
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            toast({
                title: "Erro ao enviar",
                description: "Não foi possível enviar a sua mensagem. Tente novamente mais tarde.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col bg-background">

            <main className="flex-1 pt-32 pb-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
                                Estamos aqui para ajudar
                            </span>
                            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6 tracking-tight animate-fade-in animation-delay-100">
                                Entre em <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Contacto</span>
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in animation-delay-200">
                                Tem dúvidas sobre como vender o seu imóvel sem comissões? A nossa equipa está pronta para o apoiar.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-12">
                            {/* Contact Information */}
                            <div className="space-y-6 lg:col-span-1 animate-fade-in animation-delay-300">
                                <Card className="border-none shadow-xl bg-primary text-primary-foreground overflow-hidden">
                                    <CardContent className="p-8">
                                        <h3 className="text-2xl font-bold mb-8">Informações</h3>

                                        <div className="space-y-6">
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                                    <Mail className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-primary-foreground/60 text-sm">Email</p>
                                                    <p className="font-semibold text-lg">info@imoponto.pt</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                                    <Phone className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-primary-foreground/60 text-sm">Telefone</p>
                                                    <p className="font-semibold text-lg">+351 210 000 000</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                                    <MapPin className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-primary-foreground/60 text-sm">Sede</p>
                                                    <p className="font-semibold text-lg">Lisboa, Portugal</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-12 pt-12 border-t border-white/10">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                                                <p className="text-sm font-medium">Equipa online - Resposta habitual em 1 hora</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 rounded-2xl bg-muted/50 border border-border flex flex-col items-center text-center">
                                        <MessageSquare className="w-6 h-6 text-primary mb-3" />
                                        <span className="text-sm font-semibold">Chat Online</span>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-muted/50 border border-border flex flex-col items-center text-center">
                                        <Globe className="w-6 h-6 text-primary mb-3" />
                                        <span className="text-sm font-semibold">Centro Ajuda</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="lg:col-span-2 animate-fade-in animation-delay-400">
                                <Card className="border-none shadow-2xl bg-card">
                                    <CardContent className="p-8 md:p-12">
                                        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                                            <div className="grid md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-sm font-semibold text-foreground ml-1">Nome Completo</label>
                                                    <Input
                                                        {...register("fullName")}
                                                        placeholder="Seu nome"
                                                        className={`h-14 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl ${errors.fullName ? "ring-2 ring-destructive" : ""}`}
                                                    />
                                                    {errors.fullName && <p className="text-xs text-destructive ml-1">{errors.fullName.message}</p>}
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-sm font-semibold text-foreground ml-1">Email</label>
                                                    <Input
                                                        {...register("email")}
                                                        type="email"
                                                        placeholder="seu@email.com"
                                                        className={`h-14 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl ${errors.email ? "ring-2 ring-destructive" : ""}`}
                                                    />
                                                    {errors.email && <p className="text-xs text-destructive ml-1">{errors.email.message}</p>}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-sm font-semibold text-foreground ml-1">Assunto</label>
                                                <Input
                                                    {...register("subject")}
                                                    placeholder="Como podemos ajudar?"
                                                    className={`h-14 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl ${errors.subject ? "ring-2 ring-destructive" : ""}`}
                                                />
                                                {errors.subject && <p className="text-xs text-destructive ml-1">{errors.subject.message}</p>}
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-sm font-semibold text-foreground ml-1">Mensagem</label>
                                                <Textarea
                                                    {...register("message")}
                                                    placeholder="Fale-nos um pouco sobre o que precisa..."
                                                    className={`min-h-[160px] bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl resize-none p-4 ${errors.message ? "ring-2 ring-destructive" : ""}`}
                                                />
                                                {errors.message && <p className="text-xs text-destructive ml-1">{errors.message.message}</p>}
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                        Enviando...
                                                    </>
                                                ) : (
                                                    <>
                                                        Enviar Mensagem
                                                        <Send className="w-5 h-5 ml-2" />
                                                    </>
                                                )}
                                            </Button>

                                            <p className="text-xs text-center text-muted-foreground px-4">
                                                Ao enviar, concorda com a nossa <a href="/politica-privacidade" className="text-primary hover:underline">Política de Privacidade</a> e <a href="/termos-servico" className="text-primary hover:underline">Termos de Serviço</a>.
                                            </p>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
