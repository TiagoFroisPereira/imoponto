import { CheckCircle, AlertCircle, XCircle, ShieldCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type DocumentationLevel = "none" | "incomplete" | "complete" | "validated";

interface DocumentationStatusProps {
  level: DocumentationLevel | string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const statusConfig: Record<DocumentationLevel, {
  icon: typeof CheckCircle;
  color: string;
  bgColor: string;
  label: string;
  description: string;
}> = {
  none: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    label: "Sem Documentos",
    description: "Inexistência de documentação",
  },
  incomplete: {
    icon: AlertCircle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    label: "Documentos Incompletos",
    description: "Insuficientes para Escritura ou CPCV",
  },
  complete: {
    icon: CheckCircle,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Documentos Completos",
    description: "Totalidade de documentos mas não validados",
  },
  validated: {
    icon: ShieldCheck,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    label: "Documentos Válidos",
    description: "Validados para Escritura ou CPCV",
  },
};

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

// Map unknown levels to valid ones
const mapLevel = (level: string | undefined): DocumentationLevel => {
  if (level === 'validated' || level === 'valid') return 'validated';
  if (level === 'complete' || level === 'full') return 'complete';
  if (level === 'incomplete' || level === 'partial') return 'incomplete';
  if (level === 'none' || !level) return 'none';
  return 'none';
};

// All status info for tooltip
const allStatusInfo = [
  { level: 'none' as DocumentationLevel, icon: XCircle, color: 'text-red-500', label: 'Sem Documentos', description: 'Inexistência de documentação' },
  { level: 'incomplete' as DocumentationLevel, icon: AlertCircle, color: 'text-yellow-500', label: 'Documentos Incompletos', description: 'Insuficientes para Escritura ou CPCV' },
  { level: 'complete' as DocumentationLevel, icon: CheckCircle, color: 'text-blue-500', label: 'Documentos Completos', description: 'Totalidade de documentos mas não validados' },
  { level: 'validated' as DocumentationLevel, icon: ShieldCheck, color: 'text-green-500', label: 'Documentos Válidos', description: 'Validados para Escritura ou CPCV' },
];

export function DocumentationStatus({ 
  level, 
  size = "md",
  showLabel = true 
}: DocumentationStatusProps) {
  const mappedLevel = mapLevel(level);
  const config = statusConfig[mappedLevel];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} cursor-help`}>
            <Icon className={`${sizeClasses[size]} ${config.color}`} />
            {showLabel && (
              <span className={`text-sm font-medium ${config.color}`}>
                {config.label}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-72 p-3">
          <p className="text-xs font-semibold mb-2 text-foreground">Estados de Documentação:</p>
          <div className="space-y-2">
            {allStatusInfo.map((status) => {
              const StatusIcon = status.icon;
              const isActive = status.level === mappedLevel;
              return (
                <div 
                  key={status.level} 
                  className={`flex items-start gap-2 p-1.5 rounded ${isActive ? 'bg-muted' : ''}`}
                >
                  <StatusIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${status.color}`} />
                  <div>
                    <p className={`text-xs font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {status.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{status.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function DocumentationDot({ level }: { level: DocumentationLevel | string }) {
  const mappedLevel = mapLevel(level);
  
  const colorMap: Record<DocumentationLevel, string> = {
    none: "bg-red-500",
    incomplete: "bg-yellow-500",
    complete: "bg-blue-500",
    validated: "bg-green-500",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span 
            className={`inline-block w-3 h-3 rounded-full ${colorMap[mappedLevel]} animate-pulse cursor-help`}
          />
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-72 p-3">
          <p className="text-xs font-semibold mb-2 text-foreground">Estados de Documentação:</p>
          <div className="space-y-2">
            {allStatusInfo.map((status) => {
              const StatusIcon = status.icon;
              const isActive = status.level === mappedLevel;
              return (
                <div 
                  key={status.level} 
                  className={`flex items-start gap-2 p-1.5 rounded ${isActive ? 'bg-muted' : ''}`}
                >
                  <StatusIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${status.color}`} />
                  <div>
                    <p className={`text-xs font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {status.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{status.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
