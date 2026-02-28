import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useServiceRequests } from "@/hooks/useServiceRequests";
import { ServiceRequestCard } from "./ServiceRequestCard";
import {
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Inbox,
} from "lucide-react";

interface ProfessionalServiceRequestsSectionProps {
  professionalId: string;
  onCountChange?: () => void;
}

export function ProfessionalServiceRequestsSection({ 
  professionalId, 
  onCountChange 
}: ProfessionalServiceRequestsSectionProps) {
  const {
    requests,
    loading,
    updating,
    pendingCount,
    acceptedCount,
    rejectedCount,
    acceptRequest,
    rejectRequest,
  } = useServiceRequests({ professionalId, onCountChange });

  const pendingRequests = requests.filter(r => r.status === "pending");
  const acceptedRequests = requests.filter(r => r.status === "accepted");
  const rejectedRequests = requests.filter(r => r.status === "rejected" || r.status === "expired");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Pedidos de Serviço 🔔</h1>
        {pendingCount > 0 && (
          <Badge variant="destructive">
            {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Info box */}
      <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
        <p className="text-sm text-muted-foreground">
          <strong>Como funciona:</strong> Cada pedido requer uma decisão explícita. 
          Ao <strong>aceitar</strong>, é criado automaticamente um canal de comunicação. 
          Ao <strong>recusar</strong>, o solicitador é notificado sem possibilidade de resposta.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pendentes
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Aceites
            {acceptedCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5">
                {acceptedCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="w-4 h-4" />
            Recusados
            {rejectedCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5">
                {rejectedCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Pending Requests */}
        <TabsContent value="pending" className="mt-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">Sem pedidos pendentes</h3>
                <p className="text-muted-foreground mt-2">
                  Os novos pedidos de serviço aparecerão aqui.
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {pendingRequests.map((request) => (
                  <ServiceRequestCard
                    key={request.id}
                    request={request}
                    onAccept={acceptRequest}
                    onReject={rejectRequest}
                    isUpdating={updating === request.id}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Accepted Requests */}
        <TabsContent value="accepted" className="mt-4">
          {acceptedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">Sem pedidos aceites</h3>
                <p className="text-muted-foreground mt-2">
                  Os pedidos que aceitar aparecerão aqui.
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {acceptedRequests.map((request) => (
                  <ServiceRequestCard
                    key={request.id}
                    request={request}
                    onAccept={acceptRequest}
                    onReject={rejectRequest}
                    isUpdating={updating === request.id}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Rejected Requests */}
        <TabsContent value="rejected" className="mt-4">
          {rejectedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">Sem pedidos recusados</h3>
                <p className="text-muted-foreground mt-2">
                  Os pedidos que recusar aparecerão aqui para referência.
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {rejectedRequests.map((request) => (
                  <ServiceRequestCard
                    key={request.id}
                    request={request}
                    onAccept={acceptRequest}
                    onReject={rejectRequest}
                    isUpdating={updating === request.id}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
