-- 1. Fix mutable search_path for functions
-- We set search_path = public to prevent role-based search path attacks 
-- and ensure the function always finds the correct tables.

ALTER FUNCTION public.handle_visit_confirmed_email() SET search_path = public;
ALTER FUNCTION public.handle_new_message_email() SET search_path = public;
ALTER FUNCTION public.check_notification_preference(uuid, text) SET search_path = public;
ALTER FUNCTION public.handle_new_profile_welcome() SET search_path = public;
ALTER FUNCTION public.handle_property_published_email() SET search_path = public;
ALTER FUNCTION public.handle_visit_request_email() SET search_path = public;
ALTER FUNCTION public.handle_professional_reply_email() SET search_path = public;
ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_email_queue_insert() SET search_path = public;

-- Also fix any other core functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 2. Fix overly permissive RLS policies

-- email_queue: Remove public insert access. Triggers are SECURITY DEFINER so they will still work.
DROP POLICY IF EXISTS "Enable public insert for email queue" ON public.email_queue;

-- notifications: Restrict insert to service_role only
DROP POLICY IF EXISTS "Service role can create notifications" ON public.notifications;
CREATE POLICY "Service role can create notifications"
ON public.notifications
FOR INSERT
TO service_role
WITH CHECK (true);

-- visit_bookings: Changing from "Anyone" to "Authenticated" to improve security.
-- If guest bookings are required, this can be loosened, but with additional anti-spam measures.
DROP POLICY IF EXISTS "Anyone can create visit bookings" ON public.visit_bookings;
CREATE POLICY "Authenticated users can create visit bookings"
ON public.visit_bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = visitor_id);
