import { FileText, Eye, Download, Loader2, ShieldCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VaultDocument, getDocumentStatus, getStatusConfig } from "./vaultUtils";
import { getCategoryLabel } from "@/data/documentCategories";

interface VaultValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: VaultDocument | null;
  onPreview: (doc: VaultDocument) => void;
  onDownload: (doc: VaultDocument) => void;
}

export function VaultValidationDialog({ open, onOpenChange, document: doc, onPreview, onDownload }: VaultValidationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Validar Documento
          </DialogTitle>
          <DialogDescription>Processo de validação do documento</DialogDescription>
        </DialogHeader>

        {doc && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <FileText className="w-8 h-8 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{doc.name}</p>
                <p className="text-sm text-muted-foreground">{getCategoryLabel(doc.category)}</p>
              </div>
              <Badge className={getStatusConfig(getDocumentStatus(doc)).className}>
                {getStatusConfig(getDocumentStatus(doc)).label}
              </Badge>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Como funciona a validação?</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">1.</span>
                  A validação é realizada exclusivamente por advogados ou notários com acesso ao cofre digital.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">2.</span>
                  O profissional analisa o documento e emite um parecer sobre a sua autenticidade e validade.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">3.</span>
                  Se aprovado, o estado muda para "Validado". Se rejeitado, receberá feedback do profissional.
                </li>
              </ul>
              <p className="text-xs text-muted-foreground italic">
                A ImoPonto não valida, não supervisiona e não garante o conteúdo ou resultado da análise profissional.
              </p>
            </div>

            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-medium text-foreground text-sm mb-2">Validação Oficial</h4>
              <p className="text-xs text-muted-foreground">
                Para confirmar a validade oficial de documentos públicos, pode consultar:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="https://www.predialonline.pt/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 mr-1" />Predial Online
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://www.portaldasfinancas.gov.pt/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 mr-1" />Portal Finanças
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => onPreview(doc)}>
                <Eye className="w-4 h-4 mr-2" />Ver Documento
              </Button>
              <Button variant="outline" onClick={() => onDownload(doc)}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface VaultPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: VaultDocument | null;
  previewUrl: string | null;
  onDownload: (doc: VaultDocument) => void;
}

export function VaultPreviewDialog({ open, onOpenChange, document: doc, previewUrl, onDownload }: VaultPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            <span className="truncate max-w-[400px]">{doc?.name}</span>
          </DialogTitle>
          <div className="flex items-center gap-2">
            {previewUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />Abrir Externamente
                </a>
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 bg-muted/20 rounded-lg border flex items-center justify-center p-4 overflow-hidden">
          {doc && (
            <>
              {!previewUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">A carregar documento...</p>
                </div>
              ) : doc.file_type?.toLowerCase() === 'pdf' || doc.name.toLowerCase().endsWith('.pdf') ? (
                <iframe src={previewUrl} className="w-full h-full rounded-md border-0" title={doc.name} />
              ) : ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].some(ext =>
                doc.name.toLowerCase().endsWith(ext) || doc.file_type?.toLowerCase().includes(ext)
              ) ? (
                <img src={previewUrl} alt={doc.name} className="max-w-full max-h-full object-contain rounded-md" />
              ) : (
                <div className="text-center space-y-4 p-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-lg text-foreground">Pré-visualização indisponível</p>
                    <p className="text-sm text-muted-foreground">Este tipo de ficheiro não pode ser visualizado aqui.</p>
                  </div>
                  <Button variant="outline" onClick={() => onDownload(doc)}>
                    <Download className="w-4 h-4 mr-2" />Descarregar para Ver
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
