import { Lock, Unlock, Upload, Eye, Download, Trash2, Loader2, Info, ShieldCheck, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ExternalLink } from "lucide-react";
import { VaultDocument, getDocumentStatus, getStatusConfig } from "./vaultUtils";
import { DocumentInfo } from "@/data/documentCategories";

const STATUS_ICON_MAP = {
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
} as const;

interface VaultDocumentCardProps {
  category: { value: string; label: string };
  doc: VaultDocument | undefined;
  isStepByStep: boolean;
  uploading: boolean;
  uploadingCategory: string | null;
  info?: DocumentInfo;
  onUpload: (category: string) => void;
  onPreview: (doc: VaultDocument) => void;
  onDownload: (doc: VaultDocument) => void;
  onDelete: (doc: VaultDocument) => void;
  onToggleVisibility: (params: { id: string; isPublic: boolean }) => void;
  onGuide: (category: string) => void;
  onValidate: (doc: VaultDocument) => void;
}

export function VaultDocumentCard({
  category,
  doc,
  isStepByStep,
  uploading,
  uploadingCategory,
  info,
  onUpload,
  onPreview,
  onDownload,
  onDelete,
  onToggleVisibility,
  onGuide,
  onValidate,
}: VaultDocumentCardProps) {
  const status = getDocumentStatus(doc);
  const statusConfig = getStatusConfig(status);
  const StatusIcon = STATUS_ICON_MAP[statusConfig.iconName];

  if (isStepByStep) {
    return (
      <div className={`rounded-lg border transition-all ${statusConfig.borderClassName}`}>
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center gap-3 p-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${statusConfig.className}`}>
            <StatusIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{category.label}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className={`text-[10px] h-4 px-1.5 ${statusConfig.className}`}>
                {statusConfig.label}
              </Badge>
              {doc && <span className="text-xs text-muted-foreground truncate">{doc.name}</span>}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground hover:text-primary" onClick={() => onGuide(category.value)}>
              <Info className="w-4 h-4" />
              <span className="text-xs">Como obter</span>
            </Button>

            {doc ? (
              <>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onValidate(doc)}>
                  <ShieldCheck className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </Button>
                <Badge variant={doc.is_public ? "default" : "secondary"} className="gap-1 cursor-pointer text-xs h-6" onClick={() => onToggleVisibility({ id: doc.id, isPublic: doc.is_public })}>
                  {doc.is_public ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPreview(doc)}><Eye className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDownload(doc)}><Download className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(doc)}><Trash2 className="w-4 h-4" /></Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => onUpload(category.value)} disabled={uploading && uploadingCategory === category.value}>
                {uploading && uploadingCategory === category.value ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4 mr-1.5" />Upload</>}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex md:hidden flex-col p-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${statusConfig.className}`}>
              <StatusIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base">{category.label}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="outline" className={`text-[10px] ${statusConfig.className}`}>{statusConfig.label}</Badge>
                {doc && (
                  <Badge variant={doc.is_public ? "default" : "secondary"} className="text-[10px] gap-1 h-5" onClick={() => onToggleVisibility({ id: doc.id, isPublic: doc.is_public })}>
                    {doc.is_public ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                    {doc.is_public ? "Público" : "Privado"}
                  </Badge>
                )}
              </div>
              {doc && <p className="text-xs text-muted-foreground mt-2 truncate max-w-full italic">{doc.name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="h-10 text-xs font-medium" onClick={() => onGuide(category.value)}>
              <Info className="w-4 h-4 mr-2" />Como obter
            </Button>
            {!doc ? (
              <Button variant="default" size="sm" className="h-10 text-xs font-semibold" onClick={() => onUpload(category.value)} disabled={uploading && uploadingCategory === category.value}>
                {uploading && uploadingCategory === category.value ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                Inserir Doc
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="h-10 text-xs font-medium" onClick={() => onValidate(doc)}>
                <ShieldCheck className="w-4 h-4 mr-2" />Validar
              </Button>
            )}
          </div>

          {doc && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <Button variant="secondary" size="sm" className="flex-1 h-10 text-xs font-medium" onClick={() => onPreview(doc)}>
                <Eye className="w-4 h-4 mr-2" />Ver
              </Button>
              <Button variant="secondary" size="sm" className="flex-1 h-10 text-xs font-medium" onClick={() => onDownload(doc)}>
                <Download className="w-4 h-4 mr-2" />Baixar
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive border border-destructive/20" onClick={() => onDelete(doc)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Accordion-based card
  return (
    <AccordionItem value={category.value} className={`rounded-lg border transition-all ${statusConfig.borderClassName} px-0`}>
      {/* Desktop Layout Header */}
      <div className="hidden md:flex items-center gap-3 p-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${statusConfig.className}`}>
          <StatusIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{category.label}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className={`text-[10px] h-4 px-1.5 ${statusConfig.className}`}>{statusConfig.label}</Badge>
            {doc && <span className="text-xs text-muted-foreground truncate">{doc.name}</span>}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <AccordionTrigger className="p-0 hover:no-underline">
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground hover:text-primary" asChild>
              <span><Info className="w-4 h-4" /><span className="text-xs">Como obter</span></span>
            </Button>
          </AccordionTrigger>

          {doc ? (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onValidate(doc)}>
                <ShieldCheck className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </Button>
              <Badge variant={doc.is_public ? "default" : "secondary"} className="gap-1 cursor-pointer text-xs h-6" onClick={() => onToggleVisibility({ id: doc.id, isPublic: doc.is_public })}>
                {doc.is_public ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              </Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPreview(doc)}><Eye className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDownload(doc)}><Download className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(doc)}><Trash2 className="w-4 h-4" /></Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => onUpload(category.value)} disabled={uploading && uploadingCategory === category.value}>
              {uploading && uploadingCategory === category.value ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4 mr-1.5" />Upload</>}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Layout Header */}
      <div className="flex md:hidden flex-col p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${statusConfig.className}`}>
            <StatusIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <p className="font-semibold text-base">{category.label}</p>
              <AccordionTrigger className="p-0 hover:no-underline w-auto border rounded-full p-1 h-6 w-6" />
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="outline" className={`text-[10px] ${statusConfig.className}`}>{statusConfig.label}</Badge>
              {doc && (
                <Badge variant={doc.is_public ? "default" : "secondary"} className="text-[10px] gap-1 h-5" onClick={() => onToggleVisibility({ id: doc.id, isPublic: doc.is_public })}>
                  {doc.is_public ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                  {doc.is_public ? "Público" : "Privado"}
                </Badge>
              )}
            </div>
            {doc && <p className="text-xs text-muted-foreground mt-2 truncate max-w-full italic">{doc.name}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {!doc ? (
            <Button variant="default" size="sm" className="h-10 text-xs font-semibold" onClick={() => onUpload(category.value)} disabled={uploading && uploadingCategory === category.value}>
              {uploading && uploadingCategory === category.value ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              Inserir Doc
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="h-10 text-xs font-medium" onClick={() => onValidate(doc)}>
              <ShieldCheck className="w-4 h-4 mr-2" />Validar Estado
            </Button>
          )}
        </div>

        {doc && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button variant="secondary" size="sm" className="flex-1 h-10 text-xs font-medium" onClick={() => onPreview(doc)}>
              <Eye className="w-4 h-4 mr-2" />Ver
            </Button>
            <Button variant="secondary" size="sm" className="flex-1 h-10 text-xs font-medium" onClick={() => onDownload(doc)}>
              <Download className="w-4 h-4 mr-2" />Baixar
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive border border-destructive/20" onClick={() => onDelete(doc)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <AccordionContent className="px-4 pb-4 pt-0">
        {info && (
          <div className="space-y-4 pl-4 border-l-2 border-primary/20 bg-primary/5 rounded-r-lg py-3">
            <div>
              <h5 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Descrição</h5>
              <p className="text-xs text-foreground leading-relaxed">{info.description}</p>
            </div>
            <div>
              <h5 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Onde obter</h5>
              <p className="text-xs text-foreground leading-relaxed">{info.whereToGet}</p>
            </div>
            {info.additionalInfo && (
              <div>
                <h5 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Dica</h5>
                <p className="text-xs text-foreground leading-relaxed italic">{info.additionalInfo}</p>
              </div>
            )}
            {info.link && (
              <Button variant="link" size="sm" className="h-auto p-0 text-primary text-xs" asChild>
                <a href={info.link.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {info.link.label}
                </a>
              </Button>
            )}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
