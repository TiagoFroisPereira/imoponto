-- Allow users to delete their own conversations
CREATE POLICY "Users can delete own conversations"
ON public.conversations
FOR DELETE
USING (auth.uid() = seller_id OR auth.uid() = buyer_id);