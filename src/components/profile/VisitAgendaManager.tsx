import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  CalendarX,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Clock,
  Settings,
  Bell,
  CalendarCheck
} from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { useVisitAvailability } from "@/hooks/useVisitAvailability";
import { Skeleton } from "@/components/ui/skeleton";
import { VisitScheduler, AvailableDay } from "@/components/property/VisitScheduler";
import { VisitAgenda } from "@/components/profile/VisitAgenda";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, isSameDay } from "date-fns";

interface VisitAgendaManagerProps {
  userId?: string;
  initialPropertyId?: string;
}

export function VisitAgendaManager({ userId, initialPropertyId }: VisitAgendaManagerProps) {
  const { properties, loading } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState<{
    id: string;
    title: string;
    address: string;
  } | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleClearFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('propertyId');
    if (!newParams.get('tab')) {
      newParams.set('tab', 'agenda');
    }
    setSearchParams(newParams);
  };

  // Fetch pending and confirmed visit counts
  useEffect(() => {
    if (!userId) return;

    const fetchCounts = async () => {
      const today = new Date().toISOString().split('T')[0];

      // Fetch pending visits
      let pendingQuery = supabase
        .from('visit_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', userId)
        .eq('status', 'pending');

      if (initialPropertyId) {
        pendingQuery = pendingQuery.eq('property_id', initialPropertyId);
      }
      const { count: pending } = await pendingQuery;

      // Fetch confirmed upcoming visits
      let confirmedQuery = supabase
        .from('visit_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', userId)
        .eq('status', 'confirmed')
        .gte('scheduled_date', today);

      if (initialPropertyId) {
        confirmedQuery = confirmedQuery.eq('property_id', initialPropertyId);
      }
      const { count: confirmed } = await confirmedQuery;

      setPendingCount(pending || 0);
      setConfirmedCount(confirmed || 0);
    };

    fetchCounts();

    // Set up realtime subscription for updates
    const channel = supabase
      .channel('visit-bookings-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visit_bookings',
          filter: `seller_id=eq.${userId}`
        },
        () => {
          fetchCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Handle initial property selection from props
  useEffect(() => {
    if (initialPropertyId && properties.length > 0) {
      const match = properties.find(p => p.id === initialPropertyId);
      if (match) {
        setSelectedProperty({
          id: match.id,
          title: match.title,
          address: match.address
        });
      }
    }
  }, [initialPropertyId, properties]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Show general bookings view or property selection
  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CalendarX className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Sem imóveis</h3>
          <p className="text-muted-foreground mt-2">
            Crie um anúncio para poder gerir a agenda de visitas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {initialPropertyId && properties.find(p => p.id === initialPropertyId) && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-primary mb-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="truncate">A filtrar por: <span className="font-semibold">{properties.find(p => p.id === initialPropertyId)?.title}</span></span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 sm:h-6 text-xs hover:bg-primary/10 sm:ml-auto w-fit"
            onClick={handleClearFilter}
          >
            Limpar filtro
          </Button>
        </div>
      )}

      <Tabs defaultValue="requests" className="space-y-6">
        <div className="w-full overflow-x-auto pb-1 scrollbar-none">
          <TabsList className="w-fit inline-flex min-w-full justify-start sm:w-full sm:justify-center">
            <TabsTrigger value="requests" className="gap-2 relative">
              <Bell className="w-4 h-4" />
              Pedidos
              {pendingCount > 0 && (
                <Badge
                  className="ml-1 h-5 min-w-[20px] px-1.5 flex items-center justify-center text-xs bg-amber-500 hover:bg-amber-500 text-white"
                >
                  {pendingCount > 99 ? '99+' : pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="gap-2 relative">
              <CalendarCheck className="w-4 h-4" />
              Confirmadas
              {confirmedCount > 0 && (
                <Badge
                  className="ml-1 h-5 min-w-[20px] px-1.5 flex items-center justify-center text-xs bg-green-500 hover:bg-green-500 text-white"
                >
                  {confirmedCount > 99 ? '99+' : confirmedCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="availability" className="gap-2">
              <Settings className="w-4 h-4" />
              Disponibilidade
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="requests">
          <VisitAgenda userId={userId} filter="pending" propertyId={initialPropertyId} />
        </TabsContent>

        <TabsContent value="confirmed">
          <VisitAgenda userId={userId} filter="confirmed" propertyId={initialPropertyId} />
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          {selectedProperty ? (
            <PropertyAvailabilityManager
              property={selectedProperty}
              userId={userId}
              onBack={() => setSelectedProperty(null)}
            />
          ) : (
            <>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Disponibilidade por Imóvel</h2>
                <p className="text-sm text-muted-foreground">
                  Selecione um imóvel para definir os horários disponíveis para visitas
                </p>
              </div>

              <div className="grid gap-4">
                {properties
                  // Filter list if we have an initialPropertyId but somehow desisted/went back, 
                  // or just show all? User asked to "filter the Gerir disponibilidade".
                  // So let's filter the list too.
                  .filter(p => !initialPropertyId || p.id === initialPropertyId)
                  .map((property) => (
                    <Card
                      key={property.id}
                      className="cursor-pointer hover:border-primary/50 transition-colors active:scale-[0.98] transition-all"
                      onClick={() => setSelectedProperty({
                        id: property.id,
                        title: property.title,
                        address: property.address
                      })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-medium text-foreground truncate">{property.title}</h3>
                              <p className="text-sm text-muted-foreground truncate">{property.address}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-[10px] sm:text-xs">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Definir Horários
                                </Badge>
                                <Badge variant={property.status === 'active' ? 'secondary' : 'outline'} className="text-[10px] sm:text-xs">
                                  {property.status === 'active' ? 'Ativo' : 'Pendente'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sub-component for managing availability of a specific property
function PropertyAvailabilityManager({
  property,
  userId,
  onBack
}: {
  property: { id: string; title: string; address: string };
  userId?: string;
  onBack: () => void;
}) {
  const { availableDays: fetchedDays, loading } = useVisitAvailability(property.id);
  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (fetchedDays) {
      setAvailableDays(fetchedDays);
    }
  }, [fetchedDays]);

  const handleAvailabilityChange = (days: AvailableDay[]) => {
    setAvailableDays(days);
  };

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);
    try {
      // Delete existing availability for this property
      await supabase
        .from('visit_availability')
        .delete()
        .eq('property_id', property.id)
        .eq('seller_id', userId);

      // Insert new availability
      const inserts = availableDays
        .filter(day => day.slots.some(s => s.isAvailable))
        .map(day => ({
          property_id: property.id,
          seller_id: userId,
          available_date: format(day.date, 'yyyy-MM-dd'),
          time_slots: day.slots.filter(s => s.isAvailable).map(s => s.time)
        }));

      if (inserts.length > 0) {
        const { error } = await supabase
          .from('visit_availability')
          .insert(inserts);

        if (error) throw error;
      }

      toast({
        title: "Disponibilidade guardada",
        description: "Os horários foram atualizados com sucesso"
      });
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: "Erro",
        description: "Não foi possível guardar a disponibilidade",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 px-2"
          >
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground truncate">{property.title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{property.address}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto h-10 sm:h-9">
          {saving ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              A guardar...
            </>
          ) : (
            'Guardar Alterações'
          )}
        </Button>
      </div>

      <VisitScheduler
        availableDays={availableDays}
        onAvailabilityChange={handleAvailabilityChange}
        mode="edit"
      />
    </div>
  );
}
