import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { notifyVaultStakeholders } from "@/lib/notifyVaultStakeholders";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import {
  FileText,
  ChevronDown,
  ChevronRight,
  Building2,
  Eye,
  Download,
  Loader2,
  Lock,
  Upload,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface VaultDoc {
  id: string;
  name: string;
  file_type: string;
  file_url: string;
  file_size: string | null;
  category: string | null;
  status: string;
  created_at: string;
  property_id: string | null;
}

interface PropertyVaultGroup {
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  ownerName: string;
  documents: VaultDoc[];
}

interface ProfessionalDocumentsSectionProps {
  professionalId: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  certidao_permanente: "Certidão Permanente",
  caderneta_predial: "Caderneta Predial",
  licenca_utilizacao: "Licença de Utilização",
  ficha_tecnica: "Ficha Técnica de Habitação",
  certificado_energetico: "Certificado Energético",
  comprovativos_impostos: "Comprovativos de Impostos",
  outros: "Outros",
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: "Em análise", className: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30" },
  validated: { label: "Válido", className: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30" },
  rejected: { label: "Inválido", className: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30" },
};

export function ProfessionalDocumentsSection({ professionalId }: ProfessionalDocumentsSectionProps) {
  const [vaultGroups, setVaultGroups] = useState<PropertyVaultGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(new Set());
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingPropertyId, setUploadingPropertyId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadPropertyIdRef = useRef<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVaultAccess();
  }, [professionalId]);

  const fetchVaultAccess = async () => {
    try {
      const { data: requests, error: reqError } = await supabase
        .from("vault_access_requests")
        .select("id, requester_id, property_id")
        .eq("professional_id", professionalId)
        .eq("status", "granted");

      if (reqError || !requests?.length) {
        console.log("No granted vault access requests found", reqError);
        setVaultGroups([]);
        return;
      }

      const propertyIds = [...new Set(requests.map(r => r.property_id).filter(Boolean))] as string[];

      if (propertyIds.length === 0) {
        setVaultGroups([]);
        return;
      }

      const [propertiesResult, documentsResult] = await Promise.all([
        supabase
          .from("properties")
          .select("id, title, address")
          .in("id", propertyIds),
        supabase
          .from("vault_documents")
          .select("id, name, file_type, file_url, file_size, category, status, created_at, property_id")
          .in("property_id", propertyIds)
          .order("created_at", { ascending: false }),
      ]);

      const properties = propertiesResult.data || [];
      const documents = documentsResult.data || [];

      const requesterIds = [...new Set(requests.map(r => r.requester_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", requesterIds);

      const groups: PropertyVaultGroup[] = propertyIds.map(propId => {
        const property = properties.find(p => p.id === propId);
        const request = requests.find(r => r.property_id === propId);
        const ownerProfile = profiles?.find(p => p.id === request?.requester_id);

        return {
          propertyId: propId,
          propertyTitle: property?.title || "Imóvel",
          propertyAddress: property?.address || "",
          ownerName: ownerProfile?.full_name || "Proprietário",
          documents: documents
            .filter(d => d.property_id === propId)
            .map(d => ({
              id: d.id,
              name: d.name,
              file_type: d.file_type,
              file_url: d.file_url,
              file_size: d.file_size,
              category: d.category,
              status: d.status,
              created_at: d.created_at,
              property_id: d.property_id,
            })),
        };
      });

      setVaultGroups(groups);

      if (groups.length === 1) {
        setExpandedProperties(new Set([groups[0].propertyId]));
      }
    } catch (error) {
      console.error("Error fetching vault access:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProperty = (propertyId: string) => {
    const newSet = new Set(expandedProperties);
    if (newSet.has(propertyId)) {
      newSet.delete(propertyId);
    } else {
      newSet.add(propertyId);
    }
    setExpandedProperties(newSet);
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      window.open(fileUrl, "_blank");
    }
  };

  const handleValidateDocument = async (doc: VaultDoc, newStatus: "validated" | "rejected") => {
    setUpdatingStatus(doc.id);
    try {
      const { error } = await supabase
        .from("vault_documents")
        .update({ status: newStatus })
        .eq("id", doc.id);

      if (error) {
        console.error("Error updating status:", error);
        toast({ title: "Erro", description: "Não foi possível atualizar o estado do documento", variant: "destructive" });
        return;
      }

      toast({
        title: newStatus === "validated" ? "Documento validado ✅" : "Documento marcado como inválido ❌",
        description: newStatus === "validated"
          ? "O documento foi marcado como válido."
          : "O documento foi marcado como inválido.",
      });

      // Notify all stakeholders
      const { data: { user } } = await supabase.auth.getUser();
      if (user && doc.property_id) {
        const group = vaultGroups.find(g => g.propertyId === doc.property_id);
        notifyVaultStakeholders({
          propertyId: doc.property_id,
          propertyTitle: group?.propertyTitle,
          documentName: doc.name,
          action: newStatus === "rejected" ? "rejected_doc" : newStatus,
          actorUserId: user.id,
        });
      }

      await fetchVaultAccess();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleUploadClick = (propertyId: string) => {
    uploadPropertyIdRef.current = propertyId;
    setUploadingPropertyId(propertyId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const propertyId = uploadPropertyIdRef.current;
    if (!file || !propertyId) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Ficheiro demasiado grande", description: "O tamanho máximo é 10MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Erro", description: "Precisa estar autenticado", variant: "destructive" });
        return;
      }

      const timestamp = Date.now();
      const fileName = `${user.id}/${propertyId}/${timestamp}-${file.name}`;
      const fileExt = file.name.split('.').pop();

      const { error: uploadError } = await supabase.storage
        .from('vault-documents')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({ title: "Erro no upload", description: uploadError.message, variant: "destructive" });
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('vault-documents').getPublicUrl(fileName);

      const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
      };

      const { error: insertError } = await supabase
        .from('vault_documents')
        .insert({
          property_id: propertyId,
          user_id: user.id,
          name: file.name,
          file_type: fileExt || 'unknown',
          file_url: publicUrl,
          file_size: formatFileSize(file.size),
          category: 'outros',
          is_public: false,
          status: 'pending'
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        toast({ title: "Erro", description: "Não foi possível guardar o documento", variant: "destructive" });
        return;
      }

      toast({ title: "Sucesso", description: "Documento adicionado ao cofre com sucesso" });

      // Notify all stakeholders
      const group = vaultGroups.find(g => g.propertyId === propertyId);
      notifyVaultStakeholders({
        propertyId,
        propertyTitle: group?.propertyTitle,
        documentName: file.name,
        action: "upload",
        actorUserId: user.id,
      });

      await fetchVaultAccess();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Erro", description: "Ocorreu um erro ao carregar o documento", variant: "destructive" });
    } finally {
      setUploading(false);
      setUploadingPropertyId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Documentação 📁</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Cofres digitais dos imóveis a que tem acesso aprovado.
        Visualize, valide e adicione documentos a cada cofre.
      </p>

      {/* Hidden file input */}
      <Input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        onChange={handleFileChange}
      />

      {vaultGroups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              Sem cofres disponíveis
            </h3>
            <p className="text-muted-foreground text-sm">
              Os cofres digitais aparecerão aqui após os seus pedidos de acesso serem aprovados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-4 pr-4">
            {vaultGroups.map((group) => (
              <Collapsible
                key={group.propertyId}
                open={expandedProperties.has(group.propertyId)}
                onOpenChange={() => toggleProperty(group.propertyId)}
              >
                <Card>
                  <CollapsibleTrigger asChild>
                    <div className="cursor-pointer hover:bg-muted/50 transition-colors p-4">
                      <div className="flex items-center gap-3">
                        {expandedProperties.has(group.propertyId) ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                        )}
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {group.propertyTitle}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {group.propertyAddress} • {group.ownerName}
                          </p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {group.documents.length} doc{group.documents.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-2">
                      {/* Upload button for professional */}
                      <div className="flex justify-end mb-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={(e) => { e.stopPropagation(); handleUploadClick(group.propertyId); }}
                          disabled={uploading && uploadingPropertyId === group.propertyId}
                        >
                          {uploading && uploadingPropertyId === group.propertyId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          Adicionar Documento
                        </Button>
                      </div>

                      {group.documents.map((doc) => {
                        const statusInfo = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;
                        const categoryLabel = CATEGORY_LABELS[doc.category || "outros"] || doc.category || "Outro";
                        const isUpdating = updatingStatus === doc.id;

                        return (
                          <div
                            key={doc.id}
                            className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                          >
                            <div className="w-8 h-8 rounded bg-primary/5 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {doc.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="text-xs text-muted-foreground">
                                  {categoryLabel}
                                </span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <Badge variant="outline" className={`text-xs h-5 ${statusInfo.className}`}>
                                  {statusInfo.label}
                                </Badge>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(doc.created_at), {
                                    addSuffix: true,
                                    locale: pt,
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              {/* Validate as valid */}
                              <Button
                                size="icon"
                                variant={doc.status === "validated" ? "default" : "ghost"}
                                className={`h-8 w-8 ${doc.status === "validated" ? "bg-green-500 hover:bg-green-600 text-white" : "text-green-600 hover:text-green-700 hover:bg-green-50"}`}
                                title="Marcar como válido"
                                onClick={() => handleValidateDocument(doc, "validated")}
                                disabled={isUpdating}
                              >
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              </Button>
                              {/* Validate as invalid */}
                              <Button
                                size="icon"
                                variant={doc.status === "rejected" ? "default" : "ghost"}
                                className={`h-8 w-8 ${doc.status === "rejected" ? "bg-red-500 hover:bg-red-600 text-white" : "text-red-600 hover:text-red-700 hover:bg-red-50"}`}
                                title="Marcar como inválido"
                                onClick={() => handleValidateDocument(doc, "rejected")}
                                disabled={isUpdating}
                              >
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                title="Visualizar"
                                onClick={() => window.open(doc.file_url, "_blank")}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                title="Descarregar"
                                onClick={() => handleDownload(doc.file_url, doc.name)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
