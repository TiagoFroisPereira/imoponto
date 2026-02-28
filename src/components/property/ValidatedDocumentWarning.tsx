import { AlertTriangle } from "lucide-react";

interface ValidatedDocumentWarningProps {
  professionalName?: string;
}

const ValidatedDocumentWarning = ({ professionalName }: ValidatedDocumentWarningProps) => {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-2">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
          <p className="font-medium">Documento analisado por profissional independente.</p>
          <p>
            A validação ou parecer associado a este documento foi emitido exclusivamente 
            pelo profissional {professionalName ? `(${professionalName})` : "identificado"}.
          </p>
          <p>
            A ImoPonto não valida, não supervisiona e não garante o conteúdo ou o 
            resultado dessa análise.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ValidatedDocumentWarning;
