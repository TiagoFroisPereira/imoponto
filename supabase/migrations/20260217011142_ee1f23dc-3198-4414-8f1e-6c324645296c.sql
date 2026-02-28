
-- Allow event participants to view profiles of other participants in the same event
CREATE POLICY "Event participants can view co-participant profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.professional_event_participants p1
    JOIN public.professional_event_participants p2 ON p1.event_id = p2.event_id
    WHERE p1.user_id = auth.uid()
    AND p2.user_id = profiles.id
  )
);

-- Allow event creators to view profiles for participant selection
CREATE POLICY "Event creators can view profiles of their event participants"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.professional_events pe
    JOIN public.professional_event_participants pep ON pep.event_id = pe.id
    WHERE pe.created_by = auth.uid()
    AND pep.user_id = profiles.id
  )
);
