
-- Fix Security Definer View issue
CREATE OR REPLACE VIEW public.professionals_public WITH (security_invoker = true) AS
SELECT 
  id, user_id, category, price_from, years_experience, is_verified, is_active,
  created_at, updated_at, profile_completed, name, avatar_url, bio, service_type,
  location, specialization
FROM public.professionals
WHERE is_active = true AND profile_completed = true;

GRANT SELECT ON public.professionals_public TO authenticated;
GRANT SELECT ON public.professionals_public TO anon;

-- Fix RLS on messages (re-enable existing policies with optimization)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.conversations 
  WHERE conversations.id = messages.conversation_id 
  AND (conversations.seller_id = auth.uid() OR conversations.buyer_id = auth.uid())
));

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;
CREATE POLICY "Users can send messages in their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.seller_id = auth.uid() OR conversations.buyer_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
CREATE POLICY "Users can update own messages"
ON public.messages FOR UPDATE
USING (auth.uid() = sender_id);
