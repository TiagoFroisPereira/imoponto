import { FileText, Lock, Unlock, Upload, Eye, Download, Trash2, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VaultDocument, getDocumentStatus, getStatusConfig } from "./vaultUtils";

interface VaultOthersSectionProps {
  otherDocs: VaultDocument[];
  categoryLabel: string;
  uploading: boolean;
  uploadingCategory: string | null;
  onUpload: (category: string) => void;
  onPreview: (doc: VaultDocument) => void;
  onDownload: (doc: VaultDocument) => void;
  onDelete: (doc: VaultDocument) => void;
  onToggleVisibility: (params: { id: string; isPublic: boolean }) => void;
  onValidate: (doc: VaultDocument) => void;
}

export function VaultOthersSection({
  otherDocs,
  categoryLabel,
  uploading,
  uploadingCategory,
  onUpload,
  onPreview,
  onDownload,
  onDelete,
  onToggleVisibility,
  onValidate,
}: VaultOthersSectionProps) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 p-3 md:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-background border flex-shrink-0">
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm md:text-base font-semibold text-foreground">{categoryLabel}</p>
            <p className="text-xs text-muted-foreground">
              {otherDocs.length} documento{otherDocs.length !== 1 ? 's' : ''} carregado{otherDocs.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 md:h-10 px-3 md:px-4 text-xs font-medium"
          onClick={() => onUpload('outros')}
          disabled={uploading && uploadingCategory === 'outros'}
        >
          {uploading && uploadingCategory === 'outros' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">Adicionar</span>
            </>
          )}
        </Button>
      </div>

      {otherDocs.length > 0 && (
        <div className="mt-4 space-y-2">
          {otherDocs.map((doc) => {
            const status = getDocumentStatus(doc);
            const statusConfig = getStatusConfig(status);

            return (
              <div
                key={doc.id}
                className="flex flex-col md:flex-row md:items-center gap-2 p-2.5 md:p-2 bg-background/50 rounded-lg border border-border/30"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="text-xs font-medium text-foreground truncate">{doc.name}</p>
                  <Badge variant="outline" className={`ml-auto md:ml-2 text-[10px] px-1.5 h-4 ${statusConfig.className}`}>
                    {statusConfig.label}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 mt-1 md:mt-0 justify-end border-t md:border-0 pt-1.5 md:pt-0">
                  <Badge
                    variant={doc.is_public ? "default" : "secondary"}
                    className="gap-1 cursor-pointer text-[10px] h-7 px-2"
                    onClick={() => onToggleVisibility({ id: doc.id, isPublic: doc.is_public })}
                  >
                    {doc.is_public ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                    <span className="md:hidden">{doc.is_public ? "Público" : "Privado"}</span>
                  </Badge>

                  <div className="h-4 w-px bg-border mx-1 hidden md:block" />

                  <Button variant="ghost" size="icon" className="h-8 w-8 md:h-7 md:w-7" onClick={() => onValidate(doc)} title="Validar">
                    <ShieldCheck className="w-4 h-4 text-muted-foreground hover:text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 md:h-7 md:w-7" onClick={() => onPreview(doc)} title="Ver">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 md:h-7 md:w-7" onClick={() => onDownload(doc)} title="Descarregar">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 md:h-7 md:w-7 text-destructive" onClick={() => onDelete(doc)} title="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
