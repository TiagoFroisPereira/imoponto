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
    AlertTriangle,
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
    Star,
    BadgeCheck,
    X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DOCUMENT_CATEGORIES, getCategoryLabel } from "@/data/documentCategories";
import { useProfessionalsWithReviews, type ProfessionalWithReviews, type ServiceCategory } from "@/hooks/useProfessionals";
import { ContactDialog } from "@/components/services/ContactDialog";
import { StarRating } from "@/components/services/StarRating";
import { DocumentStatusItem } from "./DocumentStatusItem";
import { cn } from "@/lib/utils";

interface CPCVManagerProps {
    propertyId: string;
    onOpenVault?: () => void;
}

// CPCV structure sections for informational purposes only
const CPCV_SECTIONS = [
    {
        id: "partes",
        title: "Identificação das Partes",
        description: "Dados completos do vendedor e comprador",
        fields: [
            "Nome completo",
            "NIF",
            "Morada completa",
            "Estado civil",
            "Documento de identificação",
        ],
    },
    {
        id: "imovel",
        title: "Identificação do Imóvel",
        description: "Descrição completa do imóvel objeto da transação",
        fields: [
            "Morada completa",
            "Descrição predial",
            "Artigo matricial",
            "Área bruta / útil",
            "Composição (tipologia)",
        ],
    },
    {
        id: "valor",
        title: "Valor e Sinal",
        description: "Condições financeiras da transação",
        fields: [
            "Preço total acordado",
            "Valor do sinal (normalmente 10-20%)",
            "Forma de pagamento do sinal",
            "Valor remanescente na escritura",
            "Forma de pagamento final",
        ],
    },
    {
        id: "prazos",
        title: "Prazos",
        description: "Datas e prazos acordados",
        fields: [
            "Data de assinatura do CPCV",
            "Prazo para escritura",
            "Data limite para escritura",
            "Prazos para condições suspensivas",
        ],
    },
    {
        id: "condicoes",
        title: "Condições Suspensivas",
        description: "Condições que podem suspender ou anular o contrato",
        fields: [
            "Aprovação de financiamento bancário",
            "Inexistência de ónus ou encargos",
            "Licenças e autorizações necessárias",
            "Outras condições específicas",
        ],
    },
    {
        id: "incumprimento",
        title: "Incumprimento",
        description: "Consequências em caso de não cumprimento",
        fields: [
            "Penalizações por incumprimento do vendedor",
            "Penalizações por incumprimento do comprador",
            "Destino do sinal em caso de incumprimento",
            "Resolução de litígios",
        ],
    },
];

// Standard documents needed for CPCV
const CPCV_REQUIRED_DOCS = [
    "certidao",
    "caderneta",
    "licenca",
    "certificado",
];

const categoryLabels: Record<ServiceCategory, string> = {
    juridico: "Jurídico",
    financeiro: "Financeiro",
    tecnico: "Técnico",
    marketing: "Marketing",
};

export function CPCVManager({ propertyId, onOpenVault }: CPCVManagerProps) {
    const [expandedSection, setExpandedSection] = useState<string>("disclaimer");
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

    // Only fetch professionals when search modal is open
    const { data: professionals = [], isLoading: loadingProfessionals } =
        useProfessionalsWithReviews(searchModalOpen ? "juridico" : undefined);

    // Check document status
    const getDocumentStatus = (category: string) => {
        const doc = documents.find((d) => d.category === category);
        if (!doc) return "missing";
        return doc.status === "validated" ? "validated" : "uploaded";
    };

    const uploadedDocsCount = CPCV_REQUIRED_DOCS.filter(
        (cat) => getDocumentStatus(cat) !== "missing"
    ).length;

    // Filter professionals by search query
    const filteredProfessionals = professionals.filter((prof) =>
        prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.service_type.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            {/* Main Disclaimer */}
            <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                    <strong>Aviso Importante:</strong> Esta ferramenta fornece apenas uma estrutura
                    informativa genérica de CPCV. Não constitui aconselhamento jurídico nem substitui
                    a consulta de um profissional qualificado. Recomendamos vivamente que contrate um
                    advogado ou solicitador para redigir e validar o seu CPCV.
                </AlertDescription>
            </Alert>

            {/* Section 1: CPCV Structure Template */}
            <Accordion type="single" collapsible>
                <AccordionItem value="cpcv-structure" className="border rounded-lg bg-card">
                    <AccordionTrigger className="p-4 hover:no-underline">
                        <div className="flex items-center gap-2 text-left">
                            <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-base">Estrutura Orientativa de CPCV</h3>
                                <p className="text-sm text-muted-foreground font-normal">
                                    Estrutura genérica para organizar a informação necessária
                                </p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="px-4 pb-4">
                            <Accordion
                                type="single"
                                collapsible
                                value={expandedSection}
                                onValueChange={setExpandedSection}
                            >
                                {CPCV_SECTIONS.map((section) => (
                                    <AccordionItem key={section.id} value={section.id}>
                                        <AccordionTrigger className="text-left">
                                            <div>
                                                <div className="font-medium">{section.title}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {section.description}
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-2 pt-2">
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    Informação normalmente incluída nesta secção:
                                                </p>
                                                <ul className="space-y-2">
                                                    {section.fields.map((field, idx) => (
                                                        <li
                                                            key={idx}
                                                            className="flex items-start gap-2 text-sm p-2 rounded bg-muted/30"
                                                        >
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                                            {field}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>

                            <Alert className="mt-4 border-blue-200 bg-blue-50">
                                <Info className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800 text-xs">
                                    Esta é apenas uma estrutura orientativa. O conteúdo específico do seu CPCV deve
                                    ser elaborado por um profissional jurídico qualificado.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* Section 2: Document Checklist */}
            <div className="border rounded-lg bg-card">
                <div className="p-4 border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                <h3 className="font-semibold text-base">Checklist Documental</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Documentos normalmente necessários para o CPCV
                            </p>
                        </div>
                        <Badge variant={uploadedDocsCount === CPCV_REQUIRED_DOCS.length ? "default" : "secondary"}>
                            {uploadedDocsCount}/{CPCV_REQUIRED_DOCS.length}
                        </Badge>
                    </div>
                </div>

                <div className="p-4 space-y-3">
                    {CPCV_REQUIRED_DOCS.map((category) => {
                        const status = getDocumentStatus(category);

                        return (
                            <DocumentStatusItem
                                key={category}
                                category={category}
                                status={status}
                                onOpenVault={onOpenVault}
                            />
                        );
                    })}

                    <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={onOpenVault}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Gerir Cofre Digital
                    </Button>
                </div >
            </div >

            {/* Section 3: Professional Access */}
            < div className="border rounded-lg bg-card" >
                <div className="p-4 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-base">Apoio Jurídico</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Procure profissionais para apoio na elaboração do CPCV
                    </p>
                </div>

                <div className="p-4 space-y-4">
                    <Alert className="border-blue-200 bg-blue-50">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800 text-xs">
                            A aplicação apenas apresenta os profissionais disponíveis. A escolha e
                            contacto são da sua responsabilidade. Não recomendamos nem atribuímos
                            automaticamente profissionais.
                        </AlertDescription>
                    </Alert>

                    <Button
                        variant="default"
                        className="w-full"
                        onClick={() => setSearchModalOpen(true)}
                    >
                        <Search className="w-4 h-4 mr-2" />
                        Procurar Profissionais Jurídicos
                    </Button>
                </div>
            </div >

            {/* Search Modal */}
            < Dialog open={searchModalOpen} onOpenChange={setSearchModalOpen} >
                <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Procurar Profissionais Jurídicos</DialogTitle>
                        <DialogDescription>
                            Encontre advogados e solicitadores para apoio no seu CPCV
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Procurar por nome ou especialidade..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Results */}
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
                                    <p className="text-sm">
                                        {searchQuery
                                            ? "Nenhum profissional encontrado"
                                            : "Nenhum profissional disponível no momento"}
                                    </p>
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog >

            {/* Profile Modal */}
            < Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen} >
                <DialogContent className="max-w-3xl max-h-[85vh]">
                    {selectedProfessional && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="sr-only">Perfil do Profissional</DialogTitle>
                            </DialogHeader>

                            <ScrollArea className="h-[calc(85vh-80px)] pr-4">
                                <div className="space-y-6">
                                    {/* Header */}
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Avatar className="w-20 h-20 border-4 border-accent/20">
                                            <AvatarImage src={selectedProfessional.avatar_url || undefined} />
                                            <AvatarFallback className="text-2xl bg-accent/10 text-accent">
                                                {selectedProfessional.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .toUpperCase()
                                                    .slice(0, 2)}
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
                                                    ({selectedProfessional.totalReviews}{" "}
                                                    {selectedProfessional.totalReviews === 1 ? "avaliação" : "avaliações"})
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* About */}
                                    <div>
                                        <h3 className="font-semibold mb-3">Sobre</h3>
                                        <p className="text-muted-foreground whitespace-pre-line">
                                            {selectedProfessional.bio || "Sem descrição disponível."}
                                        </p>
                                    </div>

                                    <Separator />

                                    {/* Contact Info */}
                                    <div>
                                        <h3 className="font-semibold mb-3">Contactos</h3>
                                        <div className="space-y-3">
                                            {selectedProfessional.email && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                                        <Mail className="w-4 h-4 text-accent" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Email</p>
                                                        <a
                                                            href={`mailto:${selectedProfessional.email}`}
                                                            className="text-sm hover:text-accent transition-colors"
                                                        >
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
                                                        <a
                                                            href={`tel:${selectedProfessional.phone}`}
                                                            className="text-sm hover:text-accent transition-colors"
                                                        >
                                                            {selectedProfessional.phone}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            {!selectedProfessional.email && !selectedProfessional.phone && (
                                                <p className="text-sm text-muted-foreground">
                                                    Contacte via mensagem do Imoponto.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Info */}
                                    <div>
                                        <h3 className="font-semibold mb-3">Informações</h3>
                                        <div className="space-y-2">
                                            {selectedProfessional.years_experience > 0 && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">
                                                        {selectedProfessional.years_experience}{" "}
                                                        {selectedProfessional.years_experience === 1 ? "ano" : "anos"} de experiência
                                                    </span>
                                                </div>
                                            )}

                                            {selectedProfessional.location && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">
                                                        {selectedProfessional.location}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Reviews */}
                                    {selectedProfessional.reviews.length > 0 && (
                                        <>
                                            <Separator />
                                            <div>
                                                <h3 className="font-semibold mb-3">Avaliações Recentes</h3>
                                                <div className="space-y-3">
                                                    {selectedProfessional.reviews.slice(0, 3).map((review) => (
                                                        <div key={review.id} className="border-b border-border pb-3 last:border-0">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <StarRating rating={review.rating} size="sm" />
                                                                <span className="text-xs text-muted-foreground">
                                                                    {formatDate(review.created_at)}
                                                                </span>
                                                            </div>
                                                            {review.comment && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {review.comment}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Contact Button */}
                                    <Button
                                        variant="default"
                                        className="w-full"
                                        onClick={() => {
                                            setProfileModalOpen(false);
                                            handleContact(selectedProfessional);
                                        }}
                                    >
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Enviar Mensagem
                                    </Button>

                                    {/* Legal Footer */}
                                    <div className="p-3 bg-muted/50 rounded-lg border border-border">
                                        <p className="text-xs text-muted-foreground text-center">
                                            A Imoponto não presta serviços profissionais nem se responsabiliza pela atuação deste profissional.
                                            A contratação é feita diretamente entre as partes.
                                        </p>
                                    </div>
                                </div>
                            </ScrollArea>
                        </>
                    )}
                </DialogContent>
            </Dialog >

            {/* Contact Dialog */}
            {
                selectedProfessional && (
                    <ContactDialog
                        open={contactDialogOpen}
                        onOpenChange={setContactDialogOpen}
                        professional={selectedProfessional}
                    />
                )
            }
        </div >
    );
}
