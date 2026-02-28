-- Create security definer functions to break RLS recursion cycles

-- Function to check if a user is a creator of events that include a given participant
CREATE OR REPLACE FUNCTION public.is_event_creator_of(creator_uid uuid, participant_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM professional_events pe
    JOIN professional_event_participants pep ON pep.event_id = pe.id
    WHERE pe.created_by = creator_uid AND pep.user_id = participant_uid
  );
$$;

-- Function to check if two users share an event as co-participants
CREATE OR REPLACE FUNCTION public.are_co_participants(user1_uid uuid, user2_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM professional_event_participants p1
    JOIN professional_event_participants p2 ON p1.event_id = p2.event_id
    WHERE p1.user_id = user1_uid AND p2.user_id = user2_uid
  );
$$;

-- Function to check if user is participant in a given event
CREATE OR REPLACE FUNCTION public.is_event_participant(check_user_id uuid, check_event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM professional_event_participants
    WHERE user_id = check_user_id AND event_id = check_event_id
  );
$$;

-- Function to get event IDs created by a user
CREATE OR REPLACE FUNCTION public.get_user_event_ids(check_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM professional_events WHERE created_by = check_user_id;
$$;

-- Function to get event IDs a user participates in
CREATE OR REPLACE FUNCTION public.get_participant_event_ids(check_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT event_id FROM professional_event_participants WHERE user_id = check_user_id;
$$;

-- Now fix profiles policies that cause recursion
DROP POLICY IF EXISTS "Event creators can view profiles of their event participants" ON public.profiles;
CREATE POLICY "Event creators can view profiles of their event participants"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND public.is_event_creator_of(auth.uid(), profiles.id)
);

DROP POLICY IF EXISTS "Event participants can view co-participant profiles" ON public.profiles;
CREATE POLICY "Event participants can view co-participant profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND public.are_co_participants(auth.uid(), profiles.id)
);

-- Fix professional_events SELECT policy to use security definer function
DROP POLICY IF EXISTS "Participants can view shared events" ON public.professional_events;
CREATE POLICY "Participants can view shared events"
ON public.professional_events
FOR SELECT
USING (
  auth.uid() = created_by
  OR public.is_event_participant(auth.uid(), professional_events.id)
);

-- Fix professional_event_participants ALL policy to use security definer function
DROP POLICY IF EXISTS "Event creators can manage participants" ON public.professional_event_participants;
CREATE POLICY "Event creators can manage participants"
ON public.professional_event_participants
FOR ALL
USING (
  auth.uid() = user_id
  OR event_id IN (SELECT public.get_user_event_ids(auth.uid()))
)
WITH CHECK (
  event_id IN (SELECT public.get_user_event_ids(auth.uid()))
);