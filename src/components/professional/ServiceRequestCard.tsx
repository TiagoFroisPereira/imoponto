import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, differenceInHours, differenceInMinutes } from "date-fns";
import { pt } from "date-fns/locale";
import {
  User,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Building2,
  Lock,
  MessageSquare,
  AlertTriangle,
  Timer,
} from "lucide-react";
import { ServiceRequest } from "@/hooks/useServiceRequests";
import { RejectRequestDialog } from "./RejectRequestDialog";

interface ServiceRequestCardProps {
  request: ServiceRequest;
  onAccept: (request: ServiceRequest) => Promise<void>;
  onReject: (request: ServiceRequest, reason: string) => Promise<void>;
  isUpdating: boolean;
}

export function ServiceRequestCard({
  request,
  onAccept,
  onReject,
  isUpdating,
}: ServiceRequestCardProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Calculate time remaining
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const expiresAt = new Date(request.expires_at);
      const hoursLeft = differenceInHours(expiresAt, now);
      const minutesLeft = differenceInMinutes(expiresAt, now);

      if (minutesLeft <= 0) {
        setTimeLeft("Expirado");
        setIsExpired(true);
        setIsExpiringSoon(false);
        return;
      }

      setIsExpired(false);

      if (hoursLeft < 12) {
        setIsExpiringSoon(true);
      } else {
        setIsExpiringSoon(false);
      }

      if (hoursLeft >= 24) {
        const days = Math.floor(hoursLeft / 24);
        setTimeLeft(`${days}d ${hoursLeft % 24}h`);
      } else if (hoursLeft >= 1) {
        setTimeLeft(`${hoursLeft}h ${minutesLeft % 60}m`);
      } else {
        setTimeLeft(`${minutesLeft}m`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [request.expires_at]);

  const statusConfig = {
    pending: { 
      label: "Pendente", 
      variant: "secondary" as const, 
      icon: Clock,
      className: "bg-amber-500/10 text-amber-700 border-amber-500/30"
    },
    accepted: { 
      label: "Aceite", 
      variant: "default" as const, 
      icon: CheckCircle,
      className: "bg-green-500/10 text-green-700 border-green-500/30"
    },
    rejected: { 
      label: "Recusado", 
      variant: "destructive" as const, 
      icon: XCircle,
      className: "bg-red-500/10 text-red-700 border-red-500/30"
    },
    expired: { 
      label: "Expirado", 
      variant: "outline" as const, 
      icon: AlertTriangle,
      className: "bg-muted text-muted-foreground"
    },
  };

  const effectiveStatus = isExpired && request.status === "pending" ? "expired" : request.status;
  const status = statusConfig[effectiveStatus] || statusConfig.pending;
  const StatusIcon = status.icon;

  const isPending = request.status === "pending" && !isExpired;

  const handleReject = async (reason: string) => {
    await onReject(request, reason);
  };

  return (
    <>
      <Card className={`border-border/50 transition-all hover:shadow-md ${isPending ? "border-l-4 border-l-primary" : ""}`}>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Header row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${request.type === "vault_access" ? "bg-amber-500/10" : "bg-primary/10"}`}>
                  {request.type === "vault_access" ? (
                    <Lock className="w-5 h-5 text-amber-600" />
                  ) : (
                    <User className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {request.requester_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {request.service_type}
                  </p>
                </div>
              </div>

              <Badge variant="outline" className={status.className}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
            </div>

            {/* Property info */}
            {request.property_title && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{request.property_title}</span>
              </div>
            )}

            {/* Message */}
            {request.message && (
              <div className="bg-muted/30 p-3 rounded-md">
                <p className="text-sm text-foreground italic">
                  "{request.message}"
                </p>
              </div>
            )}

            {/* Rejection reason (if rejected) */}
            {request.status === "rejected" && request.rejection_reason && (
              <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>Motivo:</strong> {request.rejection_reason}
                </p>
              </div>
            )}

            {/* Footer row */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(request.created_at), {
                    addSuffix: true,
                    locale: pt,
                  })}
                </span>

                {isPending && (
                  <span className={`flex items-center gap-1 ${isExpiringSoon ? "text-amber-600 font-medium" : ""}`}>
                    <Timer className="w-3 h-3" />
                    Expira em {timeLeft}
                  </span>
                )}
              </div>

              {/* Actions */}
              {isPending && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUpdating}
                    onClick={() => setRejectDialogOpen(true)}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-1" />
                        Recusar
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    disabled={isUpdating}
                    onClick={() => onAccept(request)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aceitar
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Accepted indicator */}
              {request.status === "accepted" && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat ativo</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <RejectRequestDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleReject}
        requesterName={request.requester_name || "Utilizador"}
        serviceType={request.service_type || "serviço"}
        isLoading={isUpdating}
      />
    </>
  );
}
