import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { parseISO } from 'date-fns';

export interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
}

export interface AvailableDay {
  date: Date;
  slots: TimeSlot[];
}

export function useVisitAvailability(propertyId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: availableDays = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['visit-availability', propertyId],
    queryFn: async () => {
      if (!propertyId) return [];

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Get seller-defined availability
      const { data: availability, error: availError } = await (supabase
        .from('visit_availability') as any)
        .select('*')
        .eq('property_id', propertyId)
        .gte('available_date', todayStr)
        .order('available_date', { ascending: true });

      if (availError) throw availError;

      // Get existing bookings
      const { data: bookings } = await (supabase
        .from('visit_bookings') as any)
        .select('scheduled_date, scheduled_time, status')
        .eq('property_id', propertyId)
        .neq('status', 'cancelled');

      const days: AvailableDay[] = (availability || []).map((avail: any) => {
        const date = parseISO(avail.available_date);
        const timeSlots = avail.time_slots as string[];

        const slots: TimeSlot[] = timeSlots.map(time => {
          const slotId = `${avail.available_date}-${time}`;
          const isBooked = bookings?.some(
            (booking: any) =>
              booking.scheduled_date === avail.available_date &&
              booking.scheduled_time === time &&
              (booking.status === 'pending' || booking.status === 'confirmed')
          );

          return { id: slotId, time, isAvailable: !isBooked };
        });

        return { date, slots };
      });

      return days;
    },
    enabled: !!propertyId,
  });

  const invalidateAvailability = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['visit-availability', propertyId] });
  }, [queryClient, propertyId]);

  useEffect(() => {
    if (!propertyId) return;

    const channel = supabase
      .channel(`visit-upd-${propertyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visit_availability', filter: `property_id=eq.${propertyId}` }, () => invalidateAvailability())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visit_bookings', filter: `property_id=eq.${propertyId}` }, () => invalidateAvailability())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [propertyId, invalidateAvailability]);

  return { availableDays, loading, refetch };
}
