-- Fix Security Definer View issue
-- By adding WITH (security_invoker = true), the view will use the RLS policies 
-- of the user querying the view instead of the view creator's permissions.
CREATE OR REPLACE VIEW public.professionals_public WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  category,
  price_from,
  years_experience,
  is_verified,
  is_active,
  created_at,
  updated_at,
  profile_completed,
  name,
  avatar_url,
  bio,
  service_type,
  location,
  specialization
FROM public.professionals
WHERE is_active = true AND profile_completed = true;

-- Grant access to the view
GRANT SELECT ON public.professionals_public TO authenticated;
GRANT SELECT ON public.professionals_public TO anon;

-- Fix RLS Disabled in Public issue for messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Re-enable missing policies for messages (ensuring they only see/send in their conversations)
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.conversations 
  WHERE conversations.id = messages.conversation_id 
  AND (conversations.seller_id = auth.uid() OR conversations.buyer_id = auth.uid())
));

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;
CREATE POLICY "Users can send messages in their conversations"
ON public.messages
FOR INSERT
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
ON public.messages
FOR UPDATE
USING (auth.uid() = sender_id);
