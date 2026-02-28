-- Allow authenticated users to view basic profile info of conversation participants
-- This is needed for the messaging system to show names

CREATE POLICY "Users can view profiles of conversation participants" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    -- User can always see their own profile
    auth.uid() = id
    OR
    -- User can see profiles of people they have conversations with
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE (c.seller_id = auth.uid() AND c.buyer_id = profiles.id)
         OR (c.buyer_id = auth.uid() AND c.seller_id = profiles.id)
    )
  )
);