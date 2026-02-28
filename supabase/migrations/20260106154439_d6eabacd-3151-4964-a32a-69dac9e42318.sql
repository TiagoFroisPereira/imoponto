-- Drop the existing restrictive update policy
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;

-- Create new policy that allows users to update messages in their conversations
CREATE POLICY "Users can update messages in their conversations"
ON public.messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.seller_id = auth.uid() OR conversations.buyer_id = auth.uid())
  )
);