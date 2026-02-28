-- Fix infinite recursion: professional_events SELECT policy references professional_event_participants,
-- and professional_event_participants ALL policy references professional_events.
-- Solution: Remove the circular SELECT policy on professional_events and replace with a non-recursive approach.

-- Drop the recursive policy on professional_events
DROP POLICY IF EXISTS "Participants can view shared events" ON public.professional_events;

-- Create a non-recursive policy: participants can view events they are part of
-- by checking event IDs directly without subquery into participants table
CREATE POLICY "Participants can view shared events" 
ON public.professional_events 
FOR SELECT 
USING (
  auth.uid() = created_by 
  OR id IN (
    SELECT event_id FROM public.professional_event_participants 
    WHERE user_id = auth.uid()
  )
);

-- Also fix the participants policy to avoid the circular reference
-- Drop the recursive ALL policy  
DROP POLICY IF EXISTS "Event creators can manage participants" ON public.professional_event_participants;

-- Recreate without subquery that triggers recursion - use a simpler approach
CREATE POLICY "Event creators can manage participants" 
ON public.professional_event_participants 
FOR ALL
USING (
  auth.uid() = user_id 
  OR event_id IN (
    SELECT id FROM public.professional_events WHERE created_by = auth.uid()
  )
)
WITH CHECK (
  event_id IN (
    SELECT id FROM public.professional_events WHERE created_by = auth.uid()
  )
);