
-- Create event types enum-like approach using text for flexibility
-- Event types: meeting (reunião presencial), cpcv, escritura

-- Main events table
CREATE TABLE public.professional_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('meeting', 'cpcv', 'escritura')),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Participants table for sharing events
CREATE TABLE public.professional_event_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.professional_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('organizer', 'participant')),
  confirmation_status TEXT NOT NULL DEFAULT 'pending' CHECK (confirmation_status IN ('pending', 'confirmed', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.professional_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_event_participants ENABLE ROW LEVEL SECURITY;

-- RLS for professional_events: creator can do everything
CREATE POLICY "Creators can manage own events"
ON public.professional_events
FOR ALL
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Participants can view events they're invited to
CREATE POLICY "Participants can view shared events"
ON public.professional_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.professional_event_participants
    WHERE event_id = professional_events.id
    AND user_id = auth.uid()
  )
);

-- RLS for participants table
-- Creator of the event can manage participants
CREATE POLICY "Event creators can manage participants"
ON public.professional_event_participants
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.professional_events
    WHERE id = professional_event_participants.event_id
    AND created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.professional_events
    WHERE id = professional_event_participants.event_id
    AND created_by = auth.uid()
  )
);

-- Participants can view their own participation
CREATE POLICY "Users can view own participations"
ON public.professional_event_participants
FOR SELECT
USING (auth.uid() = user_id);

-- Participants can update their own confirmation status
CREATE POLICY "Users can update own confirmation"
ON public.professional_event_participants
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_professional_events_updated_at
BEFORE UPDATE ON public.professional_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_professional_event_participants_updated_at
BEFORE UPDATE ON public.professional_event_participants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for participants (for confirmation updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.professional_event_participants;
