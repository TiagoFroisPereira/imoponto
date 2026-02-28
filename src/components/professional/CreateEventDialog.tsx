import { useState, useEffect } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { type EventType, eventTypeLabels } from "@/hooks/useProfessionalEvents";
import {
  CalendarIcon,
  Loader2,
  MapPin,
  X,
  UserPlus,
  Shield,
  User,
  Lock,
} from "lucide-react";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    event_type: EventType;
    title: string;
    description?: string;
    event_date: string;
    event_time?: string;
    location?: string;
    property_id?: string;
    participant_ids: string[];
  }) => Promise<string | undefined>;
  professionalCategory?: string;
}

interface RelatedUser {
  id: string;
  name: string;
  email?: string;
  source: string;
  type?: "owner" | "professional" | "buyer" | "contact";
}

const categoryLabels: Record<string, string> = {
  juridico: "Jurídico",
  financeiro: "Financeiro",
  tecnico: "Técnico",
  marketing: "Marketing",
};

export function CreateEventDialog({ open, onOpenChange, onSubmit, professionalCategory }: CreateEventDialogProps) {
  const { toast } = useToast();
  const isTecnico = professionalCategory === "tecnico";
  const [eventType, setEventType] = useState<EventType>(isTecnico ? "avaliacao" : "meeting");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [propertyId, setPropertyId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Participant selection
  const [relatedUsers, setRelatedUsers] = useState<RelatedUser[]>([]);
  const [vaultUsers, setVaultUsers] = useState<RelatedUser[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingVaultUsers, setLoadingVaultUsers] = useState(false);
  const [selectAllVault, setSelectAllVault] = useState(false);

  // Properties for association
  const [properties, setProperties] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    if (open) {
      fetchRelatedUsers();
      fetchProperties();
    }
  }, [open]);

  // When property changes, fetch vault stakeholders
  useEffect(() => {
    if (propertyId && propertyId !== "none") {
      fetchVaultUsers(propertyId);
    } else {
      setVaultUsers([]);
      setSelectAllVault(false);
    }
  }, [propertyId]);

  // Handle select all vault users
  useEffect(() => {
    if (selectAllVault) {
      const vaultIds = vaultUsers.map(u => u.id);
      setSelectedParticipants(prev => {
        const combined = new Set([...prev, ...vaultIds]);
        return Array.from(combined);
      });
    }
  }, [selectAllVault, vaultUsers]);

  // Auto-set title based on event type
  useEffect(() => {
    const autoTitles: Record<EventType, string> = {
      meeting: "Reunião Presencial",
      cpcv: "Assinatura do CPCV",
      escritura: "Assinatura da Escritura",
      avaliacao: "Visita de Avaliação Técnica",
    };
    setTitle(autoTitles[eventType]);
  }, [eventType]);

  const fetchProperties = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("properties")
      .select("id, title")
      .eq("user_id", user.id);

    setProperties(data || []);
  };

  const fetchVaultUsers = async (propId: string) => {
    setLoadingVaultUsers(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const result: RelatedUser[] = [];

      // 1. Property owner
      const { data: property } = await supabase
        .from("properties")
        .select("user_id, title")
        .eq("id", propId)
        .maybeSingle();

      if (property && property.user_id !== user.id) {
        const { data: ownerProfile } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("id", property.user_id)
          .maybeSingle();

        if (ownerProfile) {
          result.push({
            id: ownerProfile.id,
            name: ownerProfile.full_name || ownerProfile.email || "Proprietário",
            email: ownerProfile.email || undefined,
            source: "Proprietário",
            type: "owner",
          });
        }
      }

      // 2. Professionals with granted vault access
      const { data: profRequests } = await supabase
        .from("vault_access_requests")
        .select("professional_id")
        .eq("property_id", propId)
        .eq("status", "granted");

      if (profRequests && profRequests.length > 0) {
        const uniqueProfIds = [...new Set(profRequests.map(r => r.professional_id))];
        const { data: professionals } = await supabase
          .from("professionals")
          .select("id, name, category, user_id")
          .in("id", uniqueProfIds);

        if (professionals) {
          for (const prof of professionals) {
            if (prof.user_id && prof.user_id !== user.id) {
              result.push({
                id: prof.user_id,
                name: prof.name,
                source: categoryLabels[prof.category] || "Profissional",
                type: "professional",
              });
            }
          }
        }
      }

      // 3. Buyers with paid vault access
      const { data: buyerRequests } = await supabase
        .from("vault_buyer_access")
        .select("buyer_id")
        .eq("property_id", propId)
        .eq("status", "paid");

      if (buyerRequests && buyerRequests.length > 0) {
        const buyerIds = [...new Set(buyerRequests.map(r => r.buyer_id))].filter(id => id !== user.id);
        if (buyerIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", buyerIds);

          profiles?.forEach(p => {
            result.push({
              id: p.id,
              name: p.full_name || p.email || "Comprador",
              email: p.email || undefined,
              source: "Comprador",
              type: "buyer",
            });
          });
        }
      }

      setVaultUsers(result);
    } catch (error) {
      console.error("Error fetching vault users:", error);
    } finally {
      setLoadingVaultUsers(false);
    }
  };

  const fetchRelatedUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const usersMap = new Map<string, RelatedUser>();

      // Get users from conversations
      const { data: conversations } = await supabase
        .from("conversations")
        .select("seller_id, buyer_id, property_title")
        .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`);

      if (conversations) {
        const userIds = new Set<string>();
        conversations.forEach(c => {
          if (c.seller_id !== user.id) userIds.add(c.seller_id);
          if (c.buyer_id !== user.id) userIds.add(c.buyer_id);
        });

        if (userIds.size > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", Array.from(userIds));

          profiles?.forEach(p => {
            if (!usersMap.has(p.id)) {
              usersMap.set(p.id, {
                id: p.id,
                name: p.full_name || p.email || "Utilizador",
                email: p.email || undefined,
                source: "Conversa",
                type: "contact",
              });
            }
          });
        }
      }

      // Get users from professional relationships
      const { data: professional } = await supabase
        .from("professionals")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (professional) {
        const { data: relationships } = await supabase
          .from("professional_relationships")
          .select("user_id")
          .eq("professional_id", professional.id)
          .eq("is_active", true);

        if (relationships) {
          const relUserIds = relationships.map(r => r.user_id).filter(id => !usersMap.has(id));
          if (relUserIds.length > 0) {
            const { data: profiles } = await supabase
              .from("profiles")
              .select("id, full_name, email")
              .in("id", relUserIds);

            profiles?.forEach(p => {
              if (!usersMap.has(p.id)) {
                usersMap.set(p.id, {
                  id: p.id,
                  name: p.full_name || p.email || "Utilizador",
                  email: p.email || undefined,
                  source: "Cliente",
                  type: "contact",
                });
              }
            });
          }
        }
      }

      setRelatedUsers(Array.from(usersMap.values()));
    } catch (error) {
      console.error("Error fetching related users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAllVault = (checked: boolean) => {
    setSelectAllVault(checked);
    if (!checked) {
      const vaultIds = new Set(vaultUsers.map(u => u.id));
      setSelectedParticipants(prev => prev.filter(id => !vaultIds.has(id)));
    }
  };

  const handleSubmit = async () => {
    if (!date) {
      toast({ title: "Selecione uma data", variant: "destructive" });
      return;
    }
    if (!title.trim()) {
      toast({ title: "Insira um título", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        event_type: eventType,
        title: title.trim(),
        description: description.trim() || undefined,
        event_date: format(date, "yyyy-MM-dd"),
        event_time: time || undefined,
        location: location.trim() || undefined,
        property_id: propertyId && propertyId !== "none" ? propertyId : undefined,
        participant_ids: selectedParticipants,
      });

      toast({ title: "Evento criado!", description: "Os participantes foram notificados." });
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error creating event:", error);
      toast({ title: "Erro", description: "Não foi possível criar o evento.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEventType(isTecnico ? "avaliacao" : "meeting");
    setTitle("");
    setDescription("");
    setDate(undefined);
    setTime("");
    setLocation("");
    setPropertyId("");
    setSelectedParticipants([]);
    setVaultUsers([]);
    setSelectAllVault(false);
  };

  // Combine vault users and other users, avoiding duplicates
  const allAvailableUsers = (() => {
    const seen = new Set<string>();
    const combined: RelatedUser[] = [];

    // Vault users first
    vaultUsers.forEach(u => {
      if (!seen.has(u.id)) {
        seen.add(u.id);
        combined.push(u);
      }
    });

    // Then other contacts
    relatedUsers.forEach(u => {
      if (!seen.has(u.id)) {
        seen.add(u.id);
        combined.push(u);
      }
    });

    return combined;
  })();

  const getSourceIcon = (user: RelatedUser) => {
    switch (user.type) {
      case "owner": return <User className="w-3 h-3 text-primary" />;
      case "professional": return <Shield className="w-3 h-3 text-primary" />;
      case "buyer": return <Lock className="w-3 h-3 text-primary" />;
      default: return null;
    }
  };

  const getSourceColor = (user: RelatedUser) => {
    switch (user.type) {
      case "owner": return "bg-primary/10 text-primary border-primary/30";
      case "professional": return "bg-blue-500/10 text-blue-700 border-blue-500/30";
      case "buyer": return "bg-green-500/10 text-green-700 border-green-500/30";
      default: return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Evento</DialogTitle>
          <DialogDescription>
            Crie um evento e convide os intervenientes do cofre digital.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Event Type */}
          <div className="space-y-2">
            <Label>Tipo de Evento</Label>
            <Select value={eventType} onValueChange={(v) => setEventType(v as EventType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {isTecnico && (
                  <SelectItem value="avaliacao">📋 Avaliação Técnica</SelectItem>
                )}
                <SelectItem value="meeting">🤝 Reunião Presencial</SelectItem>
                <SelectItem value="cpcv">📝 CPCV</SelectItem>
                <SelectItem value="escritura">🏠 Escritura</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do evento" />
          </div>

          {/* Property / Vault selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Cofre Digital (Imóvel)
            </Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar cofre..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {properties.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {propertyId && propertyId !== "none" && (
              <p className="text-xs text-muted-foreground">
                Os utilizadores com acesso a este cofre serão sugeridos como participantes.
              </p>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : "Selecionar..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={pt}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Hora</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label>Local</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Morada ou local..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Notas (opcional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Informações adicionais..."
              rows={2}
            />
          </div>

          {/* Vault Participants */}
          {vaultUsers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Intervenientes do Cofre
                </Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all-vault"
                    checked={selectAllVault}
                    onCheckedChange={(c) => handleSelectAllVault(!!c)}
                  />
                  <label htmlFor="select-all-vault" className="text-xs text-muted-foreground cursor-pointer">
                    Selecionar todos
                  </label>
                </div>
              </div>
              <div className="border rounded-md divide-y">
                {vaultUsers.map(user => {
                  const isSelected = selectedParticipants.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      onClick={() => toggleParticipant(user.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-2.5 text-left text-sm transition-colors",
                        isSelected ? "bg-primary/5" : "hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox checked={isSelected} className="pointer-events-none" />
                        {getSourceIcon(user)}
                        <span className="font-medium">{user.name}</span>
                      </div>
                      <Badge variant="outline" className={cn("text-xs", getSourceColor(user))}>
                        {user.source}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {loadingVaultUsers && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
              <Loader2 className="h-4 w-4 animate-spin" />
              A carregar intervenientes do cofre...
            </div>
          )}

          {/* Other Participants */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Outros Participantes
            </Label>

            {selectedParticipants.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedParticipants.map(uid => {
                  const user = allAvailableUsers.find(u => u.id === uid);
                  return (
                    <Badge key={uid} variant="secondary" className="gap-1">
                      {user?.name || "Utilizador"}
                      <button onClick={() => toggleParticipant(uid)} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            {loadingUsers ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                A carregar contactos...
              </div>
            ) : (
              (() => {
                const vaultIds = new Set(vaultUsers.map(u => u.id));
                const otherUsers = relatedUsers.filter(
                  u => !selectedParticipants.includes(u.id) && !vaultIds.has(u.id)
                );
                return otherUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    {relatedUsers.length === 0
                      ? "Sem contactos adicionais disponíveis."
                      : "Todos os contactos já foram selecionados."}
                  </p>
                ) : (
                  <div className="border rounded-md max-h-32 overflow-y-auto">
                    {otherUsers.map(user => (
                      <button
                        key={user.id}
                        onClick={() => toggleParticipant(user.id)}
                        className="w-full flex items-center justify-between p-2 hover:bg-muted/50 text-left text-sm border-b last:border-b-0"
                      >
                        <div>
                          <span className="font-medium">{user.name}</span>
                          {user.email && (
                            <span className="text-muted-foreground ml-2 text-xs">{user.email}</span>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">{user.source}</Badge>
                      </button>
                    ))}
                  </div>
                );
              })()
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={submitting || !date || !title.trim()}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Criar Evento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
