import { useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type EventType = "meeting" | "cpcv" | "escritura" | "avaliacao";
export type EventStatus = "scheduled" | "completed" | "cancelled";
export type ConfirmationStatus = "pending" | "confirmed" | "declined";

export interface ProfessionalEvent {
  id: string;
  created_by: string;
  property_id: string | null;
  event_type: EventType;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  status: EventStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  property_title?: string;
  creator_name?: string;
  participants?: EventParticipant[];
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  role: "organizer" | "participant";
  confirmation_status: ConfirmationStatus;
  user_name?: string;
  user_email?: string;
}

export const eventTypeLabels: Record<EventType, string> = {
  meeting: "Reunião Presencial",
  cpcv: "CPCV",
  escritura: "Escritura",
  avaliacao: "Avaliação Técnica",
};

export const eventTypeColors: Record<EventType, string> = {
  meeting: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  cpcv: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  escritura: "bg-green-500/10 text-green-700 border-green-500/30",
  avaliacao: "bg-purple-500/10 text-purple-700 border-purple-500/30",
};

export const confirmationLabels: Record<ConfirmationStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  declined: "Recusado",
};

export function useProfessionalEvents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading: loading, refetch } = useQuery({
    queryKey: ["professional-events", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Fetch events I created
      const { data: myEvents, error: myError } = await (supabase
        .from("professional_events") as any)
        .select("*")
        .eq("created_by", user.id)
        .order("event_date", { ascending: true });

      if (myError) console.error("Error fetching my events:", myError);

      // Fetch events I'm a participant of
      const { data: participations, error: partError } = await (supabase
        .from("professional_event_participants") as any)
        .select("event_id")
        .eq("user_id", user.id);

      if (partError) console.error("Error fetching participations:", partError);

      const participantEventIds = (participations || []).map((p: any) => p.event_id);
      let participantEvents: any[] = [];

      if (participantEventIds.length > 0) {
        const { data, error } = await (supabase
          .from("professional_events") as any)
          .select("*")
          .in("id", participantEventIds)
          .order("event_date", { ascending: true });

        if (error) console.error("Error fetching participant events:", error);
        else participantEvents = data || [];
      }

      // Merge and deduplicate
      const allEventsMap = new Map<string, any>();
      (myEvents || []).forEach((e: any) => allEventsMap.set(e.id, e));
      participantEvents.forEach((e: any) => allEventsMap.set(e.id, e));
      const allEvents = Array.from(allEventsMap.values());

      if (allEvents.length === 0) return [];

      // Fetch property titles
      const propertyIds = allEvents
        .map(e => e.property_id)
        .filter(Boolean) as string[];

      let propertiesMap: Record<string, string> = {};
      if (propertyIds.length > 0) {
        const { data: properties } = await (supabase
          .from("properties") as any)
          .select("id, title")
          .in("id", propertyIds);
        if (properties) {
          propertiesMap = properties.reduce((acc: any, p: any) => {
            acc[p.id] = p.title;
            return acc;
          }, {});
        }
      }

      // Fetch all participants for these events
      const eventIds = allEvents.map(e => e.id);
      let participantsMap: Record<string, EventParticipant[]> = {};

      if (eventIds.length > 0) {
        const { data: allParticipants } = await (supabase
          .from("professional_event_participants") as any)
          .select("*")
          .in("event_id", eventIds);

        if (allParticipants) {
          const userIds = [...new Set(allParticipants.map((p: any) => p.user_id))];
          let profilesMap: Record<string, { full_name: string | null; email: string | null }> = {};

          if (userIds.length > 0) {
            const { data: profiles } = await (supabase
              .from("profiles") as any)
              .select("id, full_name, email")
              .in("id", userIds);
            if (profiles) {
              profilesMap = profiles.reduce((acc: any, p: any) => {
                acc[p.id] = { full_name: p.full_name, email: p.email };
                return acc;
              }, {});
            }
          }

          allParticipants.forEach((p: any) => {
            if (!participantsMap[p.event_id]) participantsMap[p.event_id] = [];
            participantsMap[p.event_id].push({
              ...p,
              role: p.role as any,
              confirmation_status: p.confirmation_status as any,
              user_name: profilesMap[p.user_id]?.full_name || "Utilizador",
              user_email: profilesMap[p.user_id]?.email || undefined,
            });
          });
        }
      }

      // Fetch creator profiles
      const creatorIds = [...new Set(allEvents.map(e => e.created_by))];
      let creatorsMap: Record<string, string> = {};
      if (creatorIds.length > 0) {
        const { data: creatorProfiles } = await (supabase
          .from("profiles") as any)
          .select("id, full_name")
          .in("id", creatorIds);
        if (creatorProfiles) {
          creatorsMap = creatorProfiles.reduce((acc: any, p: any) => {
            acc[p.id] = p.full_name || "Utilizador";
            return acc;
          }, {});
        }
      }

      const transformedEvents: ProfessionalEvent[] = allEvents.map(e => ({
        ...e,
        event_type: e.event_type as EventType,
        status: e.status as EventStatus,
        property_title: e.property_id ? propertiesMap[e.property_id] : undefined,
        creator_name: creatorsMap[e.created_by] || "Utilizador",
        participants: participantsMap[e.id] || [],
      }));

      return transformedEvents.sort((a, b) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      );
    },
    enabled: !!user?.id,
  });

  const invalidateEvents = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["professional-events", user?.id] });
  }, [queryClient, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel("professional-events-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "professional_event_participants" }, () => invalidateEvents())
      .on("postgres_changes", { event: "*", schema: "public", table: "professional_events" }, () => invalidateEvents())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, invalidateEvents]);

  const createEventMutation = useMutation({
    mutationFn: async (eventData: {
      event_type: EventType;
      title: string;
      description?: string;
      event_date: string;
      event_time?: string;
      location?: string;
      property_id?: string;
      participant_ids: string[];
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: event, error } = await (supabase
        .from("professional_events") as any)
        .insert({
          created_by: user.id,
          event_type: eventData.event_type,
          title: eventData.title,
          description: eventData.description || null,
          event_date: eventData.event_date,
          event_time: eventData.event_time || null,
          location: eventData.location || null,
          property_id: eventData.property_id || null,
        })
        .select("id")
        .single();

      if (error) throw error;

      const participants = [
        { event_id: event.id, user_id: user.id, role: "organizer", confirmation_status: "confirmed" },
        ...eventData.participant_ids.map(uid => ({
          event_id: event.id, user_id: uid, role: "participant", confirmation_status: "pending"
        })),
      ];

      const { error: partError } = await (supabase.from("professional_event_participants") as any).insert(participants);
      if (partError) console.error("Error adding participants:", partError);

      for (const uid of eventData.participant_ids) {
        await (supabase.from("notifications") as any).insert({
          user_id: uid,
          property_id: eventData.property_id || null,
          type: "visit_booking",
          title: `Novo evento: ${eventTypeLabels[eventData.event_type]}`,
          message: `Foi convidado para "${eventData.title}" em ${eventData.event_date}.`,
          metadata: { event_id: event.id, event_type: eventData.event_type },
        });
      }
      return event.id;
    },
    onSuccess: () => invalidateEvents(),
  });

  const updateConfirmationMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string, status: ConfirmationStatus }) => {
      if (!user) return;
      const { error } = await (supabase
        .from("professional_event_participants") as any)
        .update({ confirmation_status: status })
        .eq("event_id", eventId)
        .eq("user_id", user.id);
      if (error) throw error;

      const event = events.find(e => e.id === eventId);
      if (event && event.created_by !== user.id) {
        const { data: profile } = await (supabase.from("profiles") as any).select("full_name").eq("id", user.id).maybeSingle();
        const statusLabel = status === "confirmed" ? "confirmou" : "recusou";
        await (supabase.from("notifications") as any).insert({
          user_id: event.created_by,
          property_id: event.property_id,
          type: "visit_confirmed",
          title: `Presença ${status === "confirmed" ? "confirmada" : "recusada"}`,
          message: `${profile?.full_name || "Utilizador"} ${statusLabel} presença em "${event.title}".`,
          metadata: { event_id: eventId },
        });
      }
    },
    onSuccess: () => invalidateEvents(),
  });

  const updateEventStatusMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string, status: EventStatus }) => {
      const { error } = await (supabase.from("professional_events") as any).update({ status }).eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => invalidateEvents(),
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await (supabase.from("professional_events") as any).delete().eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => invalidateEvents(),
  });

  return {
    events,
    loading,
    createEvent: createEventMutation.mutateAsync,
    updateConfirmation: (eventId: string, status: ConfirmationStatus) => updateConfirmationMutation.mutateAsync({ eventId, status }),
    updateEventStatus: (eventId: string, status: EventStatus) => updateEventStatusMutation.mutateAsync({ eventId, status }),
    deleteEvent: deleteEventMutation.mutateAsync,
    refetch,
  };
}
