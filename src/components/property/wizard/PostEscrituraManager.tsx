import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    CheckCircle,
    XCircle,
    FileText,
    Users,
    Info,
    Search,
    Loader2,
    MapPin,
    Clock,
    Mail,
    Phone,
    MessageSquare,
    Briefcase,
    Shield,
    BadgeCheck,
    CheckCheck,
    Archive,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getCategoryLabel } from "@/data/documentCategories";
import { useProfessionalsWithReviews, type ProfessionalWithReviews, type ServiceCategory } from "@/hooks/useProfessionals";
import { ContactDialog } from "@/components/services/ContactDialog";
import { StarRating } from "@/components/services/StarRating";
import { DocumentStatusItem } from "./DocumentStatusItem";
import { cn } from "@/lib/utils";

interface PostEscrituraManagerProps {
    propertyId: string;
    onOpenVault?: () => void;
    onComplete?: () => void;
}

const POST_ESCRITURA_INFO = {
    title: "A Vida Pós-Escritura",
    description: "Parabéns pela venda! Esta fase final serve para garantir que todas as obrigações administrativas são cumpridas e que a documentação fica devidamente arquivada para memória futura e conformidade legal.",
    tips: [
        "Cancele contratos de utilidades (água, luz, gás, internet) para evitar faturação indevida.",
        "Notifique o condomínio sobre a alteração de propriedade.",
        "Guarda a cópia da escritura por pelo menos 10 anos para efeitos fiscais.",
    ]
};

const POST_ESCRITURA_CHECKLIST = [
    { id: "escritura_copy", label: "Cópia da Escritura", category: "outros" },
    { id: "registo_comprovativo", label: "Comprovativo de Registo do Imóvel", category: "outros" },
    { id: "distrate", label: "Distrate de Hipoteca (se aplicável)", category: "outros" },
    { id: "arquivo_final", label: "Arquivo Final da Documentação", category: "outros" },
];

const categoryLabels: Record<ServiceCategory, string> = {
    juridico: "Jurídico",
    financeiro: "Financeiro",
    tecnico: "Técnico",
    marketing: "Marketing",
};

export function PostEscrituraManager({ propertyId, onOpenVault, onComplete }: PostEscrituraManagerProps) {
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalWithReviews | null>(null);
    const [contactDialogOpen, setContactDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch documents to check status
    const { data: documents = [] } = useQuery({
        queryKey: ["vault-documents", propertyId],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data } = await supabase
                .from("vault_documents")
                .select("category, status")
                .eq("property_id", propertyId);

            return data || [];
        },
    });

    // Fetch professionals for post-sale support
    const { data: professionals = [], isLoading: loadingProfessionals } =
        useProfessionalsWithReviews(searchModalOpen ? "juridico" : undefined);

    // Check document status (simplified for post-escritura)
    const getDocumentStatus = (label: string): "validated" | "uploaded" | "missing" => {
        // In a real scenario, we might have specific categories for these.
        // For now, we'll check if any 'outros' or relevant category document exists.
        // This is a placeholder logic as requested by principles "Organization documental without legal intermediation"
        return "missing"; // Default to missing for the new checklist
    };

    const filteredProfessionals = professionals.filter((prof) => {
        const searchLower = searchQuery.toLowerCase();
        return prof.name.toLowerCase().includes(searchLower) ||
            prof.service_type.toLowerCase().includes(searchLower);
    });

    const handleViewProfile = (professional: ProfessionalWithReviews) => {
        setSelectedProfessional(professional);
        setSearchModalOpen(false);
        setProfileModalOpen(true);
    };

    const handleContact = (professional: ProfessionalWithReviews) => {
        setSelectedProfessional(professional);
        setContactDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Educational Card */}
            <Card className="bg-emerald-50 border-emerald-100">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-700">
                        <CheckCheck className="w-5 h-5" />
                        <h3 className="font-semibold">{POST_ESCRITURA_INFO.title}</h3>
                    </div>
                    <p className="text-sm text-emerald-800 leading-relaxed">
                        {POST_ESCRITURA_INFO.description}
                    </p>
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-emerald-700">Responsabilidades do Vendedor:</p>
                        <ul className="space-y-1">
                            {POST_ESCRITURA_INFO.tips.map((tip, idx) => (
                                <li key={idx} className="text-xs text-emerald-800 flex items-start gap-2">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Post-Escritura Checklist */}
            <div className="border rounded-lg bg-card overflow-hidden">
                <div className="p-4 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                        <Archive className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-base">Checklist Pós-Escritura</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Garanta que o processo fica devidamente encerrado
                    </p>
                </div>

                <div className="p-4 space-y-3">
                    {POST_ESCRITURA_CHECKLIST.map((item) => (
                        <DocumentStatusItem
                            key={item.id}
                            label={item.label}
                            category={item.category}
                            status={getDocumentStatus(item.label)}
                        />
                    ))}

                    <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={onOpenVault}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Arquivar no Cofre Digital
                    </Button>
                </div>
            </div>

            {/* Services Section */}
            <div className="border rounded-lg bg-card">
                <div className="p-4 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-base">Apoio Administrativo</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Profissionais para ajudar na regularização e arquivo
                    </p>
                </div>

                <div className="p-4">
                    <Alert className="mb-4 border-blue-100 bg-blue-50/50">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800 text-xs">
                            Pode necessitar de apoio para regularizar registos pendentes ou gerir a
                            transição de serviços. O contacto é sempre iniciado por si.
                        </AlertDescription>
                    </Alert>

                    <Button
                        variant="default"
                        className="w-full"
                        onClick={() => setSearchModalOpen(true)}
                    >
                        <Search className="w-4 h-4 mr-2" />
                        Procurar Apoio Pós-Venda
                    </Button>
                </div>
            </div>

            {/* Final Action */}
            <div className="pt-4">
                <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-semibold"
                    onClick={onComplete}
                >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Concluir e Finalizar Processo
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-2">
                    Ao finalizar, o imóvel será marcado como "Vendido" e o histórico será arquivado.
                </p>
            </div>

            {/* Search Modal */}
            <Dialog open={searchModalOpen} onOpenChange={setSearchModalOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Apoio Administrativo e Jurídico</DialogTitle>
                        <DialogDescription>
                            Encontre ajuda para tarefas pós-venda e regularização
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Ex: Regularização, Solicitador, Administrativo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <ScrollArea className="h-[400px] pr-4">
                            {loadingProfessionals ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : filteredProfessionals.length > 0 ? (
                                <div className="space-y-3">
                                    {filteredProfessionals.map((professional) => {
                                        const initials = professional.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                                        return (
                                            <Card key={professional.id} className="hover:shadow-md transition-shadow">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start gap-4">
                                                        <Avatar className="w-12 h-12 border-2 border-accent/20">
                                                            <AvatarImage src={professional.avatar_url || undefined} />
                                                            <AvatarFallback className="bg-accent/10 text-accent">{initials}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-semibold truncate">{professional.name}</h4>
                                                                {professional.is_verified && <BadgeCheck className="w-4 h-4 text-accent flex-shrink-0" />}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mb-2">{professional.service_type}</p>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <StarRating rating={professional.averageRating} size="sm" />
                                                                <span className="text-xs text-muted-foreground">({professional.totalReviews})</span>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button variant="outline" size="sm" onClick={() => handleViewProfile(professional)}>Ver Perfil</Button>
                                                                <Button variant="default" size="sm" onClick={() => handleContact(professional)}>Contactar</Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">Nenhum profissional encontrado</p>
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Profile Modal */}
            <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh]">
                    {selectedProfessional && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="sr-only">Perfil do Profissional</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-[calc(85vh-80px)] pr-4">
                                <div className="space-y-6">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Avatar className="w-20 h-20 border-4 border-accent/20">
                                            <AvatarImage src={selectedProfessional.avatar_url || undefined} />
                                            <AvatarFallback className="text-2xl bg-accent/10 text-accent">
                                                {selectedProfessional.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">Profissional Independente</Badge>
                                                {selectedProfessional.is_verified && (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                                        <Shield className="w-3 h-3 mr-1" />Verificado
                                                    </Badge>
                                                )}
                                            </div>
                                            <h2 className="text-2xl font-bold mb-2">{selectedProfessional.name}</h2>
                                            <div className="flex flex-wrap items-center gap-3 text-muted-foreground mb-3">
                                                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{categoryLabels[selectedProfessional.category as ServiceCategory]}</span>
                                                <span>•</span>
                                                <span>{selectedProfessional.service_type}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <StarRating rating={selectedProfessional.averageRating} showValue size="md" />
                                                <span className="text-sm text-muted-foreground">({selectedProfessional.totalReviews} avaliações)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h3 className="font-semibold mb-3">Sobre</h3>
                                        <p className="text-muted-foreground whitespace-pre-line text-sm">{selectedProfessional.bio || "Sem descrição disponível."}</p>
                                    </div>
                                    <Separator />
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {selectedProfessional.email && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"><Mail className="w-4 h-4 text-accent" /></div>
                                                <div><p className="text-xs text-muted-foreground">Email</p><a href={`mailto:${selectedProfessional.email}`} className="text-sm hover:text-accent transition-colors">{selectedProfessional.email}</a></div>
                                            </div>
                                        )}
                                        {selectedProfessional.phone && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"><Phone className="w-4 h-4 text-accent" /></div>
                                                <div><p className="text-xs text-muted-foreground">Telefone</p><a href={`tel:${selectedProfessional.phone}`} className="text-sm hover:text-accent transition-colors">{selectedProfessional.phone}</a></div>
                                            </div>
                                        )}
                                        {!selectedProfessional.email && !selectedProfessional.phone && (
                                            <p className="text-sm text-muted-foreground col-span-2">Contacte via mensagem do Imoponto.</p>
                                        )}
                                    </div>
                                    <Separator />
                                    <Button className="w-full" onClick={() => { setProfileModalOpen(false); handleContact(selectedProfessional); }}>
                                        <MessageSquare className="w-4 h-4 mr-2" />Enviar Mensagem
                                    </Button>
                                </div>
                            </ScrollArea>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Contact Dialog */}
            {selectedProfessional && (
                <ContactDialog
                    open={contactDialogOpen}
                    onOpenChange={setContactDialogOpen}
                    professional={selectedProfessional}
                />
            )}
        </div>
    );
}
