import { Shield, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DocumentationStatus,
  type DocumentationLevel,
} from "@/components/property/DocumentationStatus";

interface PropertyVaultSectionProps {
  allDocuments: { id: string }[];
  documentationLevel: DocumentationLevel;
  onRequestAccess: (documentId: string | null, documentName: string) => void;
  onRequestBuyerAccess?: () => void;
  isOwner?: boolean;
}

export function PropertyVaultSection({
  allDocuments,
  documentationLevel,
  onRequestAccess,
  onRequestBuyerAccess,
  isOwner,
}: PropertyVaultSectionProps) {
  const hasDocuments = allDocuments.length > 0;

  return (
    <div className="bg-muted/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Cofre Digital</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {allDocuments.length} documento(s)
          </span>
          <DocumentationStatus level={documentationLevel} size="sm" />
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {hasDocuments
          ? "Os documentos do cofre digital só podem ser visualizados por utilizadores autorizados."
          : "Este imóvel ainda não possui documentos no cofre digital."}
      </p>

      <div className="space-y-2">
        {onRequestBuyerAccess && !isOwner && (
          <Button
            onClick={onRequestBuyerAccess}
            className="w-full"
            variant="default"
          >
            <Eye className="w-4 h-4 mr-2" />
            Solicitar Acesso Pessoal ao Cofre
          </Button>
        )}

        {isOwner && (
          <Button
            onClick={() => onRequestAccess(null, "Acesso Total ao Cofre")}
            className="w-full"
            variant="default"
          >
            <Users className="w-4 h-4 mr-2" />
            Adicionar Profissional ao Cofre
          </Button>
        )}

        {!isOwner && (
          <Button
            onClick={() => onRequestAccess(null, "Acesso Total ao Cofre")}
            className="w-full"
            variant="outline"
          >
            <Users className="w-4 h-4 mr-2" />
            Solicitar Acesso via Profissional
          </Button>
        )}
      </div>
    </div>
  );
}