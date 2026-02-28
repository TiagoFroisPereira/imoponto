-- Allow users to delete messages in their own conversations
CREATE POLICY "Users can delete messages in their conversations"
ON public.messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
      AND (conversations.seller_id = auth.uid() OR conversations.buyer_id = auth.uid())
  )
);
