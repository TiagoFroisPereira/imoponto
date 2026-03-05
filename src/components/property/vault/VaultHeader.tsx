import { ShieldCheck, FolderDown, Loader2, UserPlus, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { VaultState } from "./vaultUtils";

interface VaultHeaderProps {
  documentsCount: number;
  onDownloadAll: () => void;
  downloadingAll: boolean;
  onAddProfessional?: () => void;
  vaultState?: VaultState;
}

export function VaultHeader({ documentsCount, onDownloadAll, downloadingAll, onAddProfessional, vaultState }: VaultHeaderProps) {
  const isPremium = vaultState === 'PREMIUM';
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          Cofre Digital
          {isPremium ? (
            <Badge className="text-[10px] font-bold bg-green-500 hover:bg-green-600 text-white border-0 gap-1.5 px-2 py-0.5">
              <FileCheck className="w-3 h-3" />
              COFRE VERIFICADO
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] font-medium border-primary/20 bg-primary/5 text-primary">
              SEGURANÇA TOTAL
            </Badge>
          )}
        </h2>
        <p className="text-muted-foreground text-sm">
          {isPremium
            ? "Documentação verificada e pronta para escritura com segurança máxima."
            : "Organização, armazenamento e partilha segura de toda a documentação legal e técnica do imóvel."}
        </p>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        {onAddProfessional && (
          <Button
            variant="default"
            size="sm"
            className="h-10 text-xs font-semibold w-full sm:w-auto gap-2"
            onClick={onAddProfessional}
          >
            <UserPlus className="w-4 h-4" />
            Adicionar Profissional
          </Button>
        )}

        {documentsCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="h-10 text-xs font-semibold w-full sm:w-auto"
            onClick={onDownloadAll}
            disabled={downloadingAll}
          >
            {downloadingAll ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                A processar...
              </>
            ) : (
              <>
                <FolderDown className="w-4 h-4 mr-2" />
                Descarregar tudo (.zip)
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
