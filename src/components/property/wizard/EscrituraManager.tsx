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
    Landmark,
    User,
    Building,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getCategoryLabel } from "@/data/documentCategories";
import { useProfessionalsWithReviews, type ProfessionalWithReviews, type ServiceCategory } from "@/hooks/useProfessionals";
import { ContactDialog } from "@/components/services/ContactDialog";
import { StarRating } from "@/components/services/StarRating";
import { DocumentStatusItem } from "./DocumentStatusItem";
import { cn } from "@/lib/utils";

interface EscrituraManagerProps {
    propertyId: string;
    onOpenVault?: () => void;
}

const ESCRITURA_INFO = {
    description: "A fase da escritura é o momento final da transação, onde o direito de propriedade é transmitido formalmente do vendedor para o comprador perante uma entidade com fé pública (Notário, Advogado ou Solicitador, ou através do serviço Casa Pronta).",
    participants: "Normalmente, o comprador é quem escolhe o local e o profissional para realizar a escritura, uma vez que é quem suporta os custos da mesma.",
};

const ESCRITURA_CHECKLIST = {
    vendedor: [
        { id: "v_id", label: "Documento de Identificação válido (CC/BI)" },
        { id: "v_nif", label: "Cartão de Contribuinte (NIF)" },
        { id: "v_civil", label: "Confirmação do Estado Civil e regime de bens" },
    ],
    comprador: [
        { id: "c_id", label: "Documento de Identificação válido (CC/BI)" },
        { id: "c_nif", label: "Cartão de Contribuinte (NIF)" },
        { id: "c_morada", label: "Comprovativo de Morada" },
        { id: "c_finan", label: "Confirmação de Financiamento (se aplicável)" },
    ],
    imovel: [
        "certidao",
        "caderneta",
        "licenca",
        "certificado",
        "impostos",
    ],
};

const categoryLabels: Record<ServiceCategory, string> = {
    juridico: "Jurídico",
    financeiro: "Financeiro",
    tecnico: "Técnico",
    marketing: "Marketing",
};

export function EscrituraManager({ propertyId, onOpenVault }: EscrituraManagerProps) {
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

    // Fetch professionals for legal services (notary, casa pronta, solicitors)
    const { data: professionals = [], isLoading: loadingProfessionals } =
        useProfessionalsWithReviews(searchModalOpen ? "juridico" : undefined);

    // Check document status
    const getDocumentStatus = (category: string) => {
        const doc = documents.find((d) => d.category === category);
        if (!doc) return "missing";
        return doc.status === "validated" ? "validated" : "uploaded";
    };

    const uploadedDocsCount = ESCRITURA_CHECKLIST.imovel.filter(
        (cat) => getDocumentStatus(cat) !== "missing"
    ).length;

    // Filter professionals by search query and relevance to escritura
    const filteredProfessionals = professionals.filter((prof) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = prof.name.toLowerCase().includes(searchLower) ||
            prof.service_type.toLowerCase().includes(searchLower);

        // Prioritize professionals that might be related to escritura/notary
        const isEscrituraRelated = prof.service_type.toLowerCase().includes("notário") ||
            prof.service_type.toLowerCase().includes("solicitador") ||
            prof.service_type.toLowerCase().includes("casa pronta");

        return matchesSearch;
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-PT", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            {/* Educational Info */}
            <Card className="bg-primary/5 border-primary/10">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-primary">
                        <Info className="w-5 h-5" />
                        <h3 className="font-semibold">O que acontece nesta fase?</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {ESCRITURA_INFO.description}
                    </p>
                    <div className="bg-white/50 p-3 rounded-lg border border-primary/5">
                        <p className="text-xs text-primary font-medium">Dica:</p>
                        <p className="text-xs text-muted-foreground">
                            {ESCRITURA_INFO.participants}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Dynamic Checklist */}
            <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="checklist" className="border rounded-lg bg-card">
                    <AccordionTrigger className="p-4 hover:no-underline">
                        <div className="flex items-center gap-2 text-left">
                            <Landmark className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-base">Checklist de Preparação</h3>
                                <p className="text-sm text-muted-foreground font-normal">
                                    Documentação necessária organizada por interveniente
                                </p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="px-4 pb-4 space-y-6">
                            {/* Vendedor */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <User className="w-4 h-4 text-emerald-500" />
                                    Vendedor
                                </div>
                                <div className="grid gap-2">
                                    {ESCRITURA_CHECKLIST.vendedor.map((item) => (
                                        <div key={item.id} className="flex items-center gap-2 text-sm p-3 rounded-lg border bg-muted/30">
                                            <div className="w-4 h-4 rounded-full border border-muted-foreground/30 mt-0.5 flex-shrink-0" />
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Comprador */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <User className="w-4 h-4 text-blue-500" />
                                    Comprador
                                </div>
                                <div className="grid gap-2">
                                    {ESCRITURA_CHECKLIST.comprador.map((item) => (
                                        <div key={item.id} className="flex items-center gap-2 text-sm p-3 rounded-lg border bg-muted/30">
                                            <div className="w-4 h-4 rounded-full border border-muted-foreground/30 mt-0.5 flex-shrink-0" />
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Imóvel (Integrated with Vault) */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                                    <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4 text-indigo-500" />
                                        Imóvel
                                    </div>
                                    <Badge variant={uploadedDocsCount === ESCRITURA_CHECKLIST.imovel.length ? "default" : "secondary"} className="text-[10px] h-5">
                                        {uploadedDocsCount}/{ESCRITURA_CHECKLIST.imovel.length} Documentos
                                    </Badge>
                                </div>
                                <div className="grid gap-2">
                                    {ESCRITURA_CHECKLIST.imovel.map((category) => {
                                        const status = getDocumentStatus(category);

                                        return (
                                            <DocumentStatusItem
                                                key={category}
                                                category={category}
                                                status={status}
                                                compact
                                            />
                                        );
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2"
                                    onClick={onOpenVault}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Ir para Cofre Digital
                                </Button>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* Professional Access */}
            <div className="border rounded-lg bg-card">
                <div className="p-4 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-base">Serviços Profissionais</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Encontre profissionais para formalização da escritura
                    </p>
                </div>

                <div className="p-4 space-y-4">
                    <Alert className="border-blue-200 bg-blue-50">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800 text-xs">
                            A aplicação fornece acesso aos profissionais cadastrados. A escolha, marcação e
                            responsabilidade pelo processo legal são exclusivas dos intervenientes.
                        </AlertDescription>
                    </Alert>

                    <Button
                        variant="default"
                        className="w-full"
                        onClick={() => setSearchModalOpen(true)}
                    >
                        <Search className="w-4 h-4 mr-2" />
                        Procurar Notários e Solicitadores
                    </Button>
                </div>
            </div>

            {/* Search Modal */}
            <Dialog open={searchModalOpen} onOpenChange={setSearchModalOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Procurar Profissionais</DialogTitle>
                        <DialogDescription>
                            Serviços de Notariado, Casa Pronta e Solicitadoria
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Ex: Notário, Solicitador, Casa Pronta..."
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
                                        const initials = professional.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .slice(0, 2)
                                            .toUpperCase();

                                        return (
                                            <Card key={professional.id} className="hover:shadow-md transition-shadow">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start gap-4">
                                                        <Avatar className="w-12 h-12 border-2 border-accent/20">
                                                            <AvatarImage src={professional.avatar_url || undefined} />
                                                            <AvatarFallback className="bg-accent/10 text-accent">
                                                                {initials}
                                                            </AvatarFallback>
                                                        </Avatar>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-semibold truncate">
                                                                    {professional.name}
                                                                </h4>
                                                                {professional.is_verified && (
                                                                    <BadgeCheck className="w-4 h-4 text-accent flex-shrink-0" />
                                                                )}
                                                            </div>

                                                            <p className="text-sm text-muted-foreground mb-2">
                                                                {professional.service_type}
                                                            </p>

                                                            <div className="flex items-center gap-2 mb-2">
                                                                <StarRating rating={professional.averageRating} size="sm" />
                                                                <span className="text-xs text-muted-foreground">
                                                                    ({professional.totalReviews})
                                                                </span>
                                                            </div>

                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleViewProfile(professional)}
                                                                >
                                                                    Ver Perfil
                                                                </Button>
                                                                <Button
                                                                    variant="default"
                                                                    size="sm"
                                                                    onClick={() => handleContact(professional)}
                                                                >
                                                                    Contactar
                                                                </Button>
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
                                                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                                                    Profissional Independente
                                                </Badge>
                                                {selectedProfessional.is_verified && (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                                        <Shield className="w-3 h-3 mr-1" />
                                                        Verificado
                                                    </Badge>
                                                )}
                                            </div>

                                            <h2 className="text-2xl font-bold mb-2">{selectedProfessional.name}</h2>

                                            <div className="flex flex-wrap items-center gap-3 text-muted-foreground mb-3">
                                                <span className="flex items-center gap-1">
                                                    <Briefcase className="w-4 h-4" />
                                                    {categoryLabels[selectedProfessional.category as ServiceCategory]}
                                                </span>
                                                <span>•</span>
                                                <span>{selectedProfessional.service_type}</span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <StarRating rating={selectedProfessional.averageRating} showValue size="md" />
                                                <span className="text-sm text-muted-foreground">
                                                    ({selectedProfessional.totalReviews} avaliações)
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="font-semibold mb-3">Sobre</h3>
                                        <p className="text-muted-foreground whitespace-pre-line text-sm">
                                            {selectedProfessional.bio || "Sem descrição disponível."}
                                        </p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="font-semibold mb-3">Contactos</h3>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {selectedProfessional.email && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                                        <Mail className="w-4 h-4 text-accent" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Email</p>
                                                        <a href={`mailto:${selectedProfessional.email}`} className="text-sm hover:text-accent transition-colors">
                                                            {selectedProfessional.email}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedProfessional.phone && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                                        <Phone className="w-4 h-4 text-accent" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Telefone</p>
                                                        <a href={`tel:${selectedProfessional.phone}`} className="text-sm hover:text-accent transition-colors">
                                                            {selectedProfessional.phone}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            {!selectedProfessional.email && !selectedProfessional.phone && (
                                                <p className="text-sm text-muted-foreground col-span-2">
                                                    Contacte via mensagem do Imoponto.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="font-semibold mb-3">Localização</h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="w-4 h-4" />
                                                {selectedProfessional.location || "Nacional"}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-3">Experiência</h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="w-4 h-4" />
                                                {selectedProfessional.years_experience} anos
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full"
                                        onClick={() => {
                                            setProfileModalOpen(false);
                                            handleContact(selectedProfessional);
                                        }}
                                    >
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Enviar Mensagem
                                    </Button>

                                    <div className="p-3 bg-muted/50 rounded-lg border border-border">
                                        <p className="text-[10px] text-muted-foreground text-center">
                                            A Imoponto não presta serviços profissionais nem se responsabiliza pela atuação deste profissional.
                                            A contratação é feita diretamente entre as partes.
                                        </p>
                                    </div>
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
