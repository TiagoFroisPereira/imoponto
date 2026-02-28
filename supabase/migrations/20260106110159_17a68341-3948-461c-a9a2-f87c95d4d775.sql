-- Add favorites_count and shares_count columns to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS favorites_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS shares_count integer NOT NULL DEFAULT 0;

-- Create notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  type text NOT NULL, -- 'favorite', 'view', 'share', 'visit_booking', 'message', 'visit_confirmed', 'visit_cancelled'
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- System can create notifications (using service role)
CREATE POLICY "Service role can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Create function to increment property favorites count
CREATE OR REPLACE FUNCTION public.increment_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.properties 
  SET favorites_count = favorites_count + 1 
  WHERE id = NEW.property_id;
  
  -- Create notification for property owner
  INSERT INTO public.notifications (user_id, property_id, type, title, message, metadata)
  SELECT 
    p.user_id,
    NEW.property_id,
    'favorite',
    'Novo favorito!',
    'O seu imóvel "' || p.title || '" foi adicionado aos favoritos.',
    jsonb_build_object('favorites_count', p.favorites_count + 1)
  FROM public.properties p
  WHERE p.id = NEW.property_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to decrement property favorites count
CREATE OR REPLACE FUNCTION public.decrement_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.properties 
  SET favorites_count = GREATEST(0, favorites_count - 1) 
  WHERE id = OLD.property_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for favorites count
DROP TRIGGER IF EXISTS on_favorite_added ON public.favorites;
CREATE TRIGGER on_favorite_added
  AFTER INSERT ON public.favorites
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_favorites_count();

DROP TRIGGER IF EXISTS on_favorite_removed ON public.favorites;
CREATE TRIGGER on_favorite_removed
  AFTER DELETE ON public.favorites
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_favorites_count();

-- Create function to handle view tracking and notification
CREATE OR REPLACE FUNCTION public.track_property_view(property_uuid uuid)
RETURNS void AS $$
DECLARE
  property_owner_id uuid;
  property_title text;
  current_views integer;
BEGIN
  -- Get property details and increment views
  UPDATE public.properties 
  SET views_count = views_count + 1 
  WHERE id = property_uuid
  RETURNING user_id, title, views_count INTO property_owner_id, property_title, current_views;
  
  -- Only notify every 10 views to avoid spam
  IF current_views % 10 = 0 THEN
    INSERT INTO public.notifications (user_id, property_id, type, title, message, metadata)
    VALUES (
      property_owner_id,
      property_uuid,
      'view',
      'Novas visualizações!',
      'O seu imóvel "' || property_title || '" atingiu ' || current_views || ' visualizações.',
      jsonb_build_object('views_count', current_views)
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to track property shares
CREATE OR REPLACE FUNCTION public.track_property_share(property_uuid uuid)
RETURNS void AS $$
DECLARE
  property_owner_id uuid;
  property_title text;
  current_shares integer;
BEGIN
  -- Update share count
  UPDATE public.properties 
  SET shares_count = shares_count + 1 
  WHERE id = property_uuid
  RETURNING user_id, title, shares_count INTO property_owner_id, property_title, current_shares;
  
  -- Create notification
  INSERT INTO public.notifications (user_id, property_id, type, title, message, metadata)
  VALUES (
    property_owner_id,
    property_uuid,
    'share',
    'O seu imóvel foi partilhado!',
    'O seu imóvel "' || property_title || '" foi partilhado. Total: ' || current_shares || ' partilhas.',
    jsonb_build_object('shares_count', current_shares)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;