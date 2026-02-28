import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Calendar,
    MessageSquare,
    Info,
    ChevronRight,
    Globe,
    Lock,
    Plus,
    Mail,
    User,
    Clock
} from "lucide-react";
import { ProposalsManager } from "./ProposalsManager";
import { MessagesInbox } from "@/components/profile/MessagesInbox";
import { VisitAgendaManager } from "@/components/profile/VisitAgendaManager";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ListingProposalsManagerProps {
    propertyId: string;
    propertyTitle: string;
    status: string;
    propertyPrice?: number;
    onProposalAccepted: () => void;
    onUpdateStatus: () => void;
}

export function ListingProposalsManager({
    propertyId,
    propertyTitle,
    status,
    propertyPrice,
    onProposalAccepted,
    onUpdateStatus
}: ListingProposalsManagerProps) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("proposals");
    const isPublished = status === "active";

    const { data: user } = useQuery({
        queryKey: ["current-user"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            return user;
        }
    });

    return (
        <div className="space-y-6 min-h-[500px]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="proposals" className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="hidden sm:inline">Propostas</span>
                        <span className="sm:hidden">Propostas</span>
                    </TabsTrigger>
                    <TabsTrigger value="messages" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="hidden sm:inline">Mensagens</span>
                        <span className="sm:hidden">Mens.</span>
                    </TabsTrigger>
                    <TabsTrigger value="agenda" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="hidden sm:inline">Agenda</span>
                        <span className="sm:hidden">Agenda</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="proposals" className="space-y-4 pt-2 mt-0 border-none outline-none ring-0">
                    <ProposalsManager
                        propertyId={propertyId}
                        propertyPrice={propertyPrice}
                        onProposalAccepted={onProposalAccepted}
                    />
                </TabsContent>

                <TabsContent value="messages" className="pt-2 mt-0 border-none outline-none ring-0">
                    {user ? (
                        <div className="bg-card rounded-lg border overflow-hidden">
                            <div className="p-4 border-b bg-muted/30">
                                <h3 className="font-semibold text-sm">Centro de Mensagens</h3>
                                <p className="text-xs text-muted-foreground">Conversas relacionadas com este imóvel</p>
                            </div>
                            <div className="p-4">
                                <MessagesInbox propertyId={propertyId} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="agenda" className="pt-2 mt-0 border-none outline-none ring-0">
                    {!isPublished ? (
                        <div className="space-y-4">
                            <Card className="border-dashed border-2 bg-muted/30">
                                <CardContent className="p-8 text-center space-y-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-lg text-slate-700">Agenda Indisponível</h3>
                                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                            A gestão de visitas automática está apenas disponível para anúncios publicados.
                                        </p>
                                    </div>
                                    <Alert className="bg-blue-50 border-blue-100 text-left mt-4 max-w-md mx-auto">
                                        <Info className="h-4 w-4 text-blue-600" />
                                        <AlertDescription className="text-blue-800 text-xs">
                                            Publique o seu anúncio para ativar a agenda e permitir que compradores façam marcações diretamente.
                                        </AlertDescription>
                                    </Alert>
                                    <Button
                                        className="w-full max-w-xs"
                                        onClick={() => navigate(`/publicar-imovel/${propertyId}`)}
                                    >
                                        Publicar Anúncio
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="bg-card rounded-lg border overflow-hidden">
                            <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold text-sm">Agenda de Visitas</h3>
                                    <p className="text-xs text-muted-foreground">Gestão de marcações e disponibilidade</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-primary"
                                    onClick={() => navigate(`/agenda?propertyId=${propertyId}`)}
                                >
                                    Ver Agenda Completa
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                            <div className="p-4">
                                <VisitAgendaManager userId={user?.id} initialPropertyId={propertyId} />
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
