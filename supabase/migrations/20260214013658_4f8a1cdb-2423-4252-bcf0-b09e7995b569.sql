-- Fix: Allow sellers (professionals) to also create conversations
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);
