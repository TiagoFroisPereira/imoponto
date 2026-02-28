import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { XCircle, Loader2 } from "lucide-react";

interface RejectRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<void>;
  requesterName: string;
  serviceType: string;
  isLoading?: boolean;
}

export function RejectRequestDialog({
  open,
  onOpenChange,
  onConfirm,
  requesterName,
  serviceType,
  isLoading = false,
}: RejectRequestDialogProps) {
  const [reason, setReason] = useState("");
  const maxLength = 500;

  const handleConfirm = async () => {
    await onConfirm(reason);
    setReason("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="w-5 h-5" />
            Recusar Pedido
          </DialogTitle>
          <DialogDescription>
            Está a recusar o pedido de <strong>{requesterName}</strong> para{" "}
            <strong>{serviceType}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Motivo da recusa <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Indique o motivo da recusa para informar o solicitador..."
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, maxLength))}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {reason.length}/{maxLength} caracteres
            </p>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
            <p>
              ⚠️ <strong>Nota:</strong> Ao recusar, o solicitador receberá uma
              notificação informativa. <strong>Não será criado canal de chat</strong>.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                A processar...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Confirmar Recusa
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
