import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useContactRequests } from "@/hooks/useContactRequests";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import {
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  Loader2,
  User,
  ExternalLink
} from "lucide-react";

const statusConfig = {
  pending: {
    label: "Pendente",
    variant: "secondary" as const,
    icon: Clock,
  },
  responded: {
    label: "Respondido",
    variant: "default" as const,
    icon: MessageSquare,
  },
  closed: {
    label: "Concluído",
    variant: "outline" as const,
    icon: CheckCircle,
  },
};

export function MyContactRequests() {
  const navigate = useNavigate();
  const {
    myRequests,
    receivedRequests,
    loadingMyRequests,
    loadingReceivedRequests,
    closeRequest,
    isClosing,
  } = useContactRequests();

  const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");

  if (loadingMyRequests || loadingReceivedRequests) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Pedidos de Serviço</h2>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "sent" | "received")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sent">
            Enviados ({myRequests.length})
          </TabsTrigger>
          <TabsTrigger value="received">
            Recebidos ({receivedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sent" className="mt-4">
          {myRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Não tem pedidos de serviço enviados.
                </p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => navigate("/servicos")}
                >
                  Explorar profissionais
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myRequests.map((request) => {
                const status = statusConfig[request.status as keyof typeof statusConfig];
                const StatusIcon = status?.icon || Clock;

                return (
                  <Card key={request.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-foreground">
                              {request.professional?.name || "Profissional"}
                            </span>
                            <Badge variant={status?.variant}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status?.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {request.message}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(request.created_at), {
                              addSuffix: true,
                              locale: pt,
                            })}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {request.status === "closed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/profissional/${request.professional_id}?openReview=true`)}
                            >
                              <Star className="w-4 h-4 mr-1" />
                              Avaliar
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/profissional/${request.professional_id}`)}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="received" className="mt-4">
          {receivedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Não tem pedidos de serviço recebidos.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {receivedRequests.map((request) => {
                const status = statusConfig[request.status as keyof typeof statusConfig];
                const StatusIcon = status?.icon || Clock;

                return (
                  <Card key={request.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={status?.variant}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status?.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                            {request.message}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(request.created_at), {
                              addSuffix: true,
                              locale: pt,
                            })}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {request.status !== "closed" && (
                            <Button
                              variant="accent"
                              size="sm"
                              disabled={isClosing}
                              onClick={() => closeRequest({
                                requestId: request.id,
                                professionalId: request.professional_id,
                                professionalName: request.professional?.name || "o profissional",
                              })}
                            >
                              {isClosing ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-1" />
                              )}
                              Concluir
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
