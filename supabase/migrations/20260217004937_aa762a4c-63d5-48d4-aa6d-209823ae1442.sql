
-- Allow property owners to view profiles of buyers who have vault access to their properties
CREATE POLICY "Owners can view profiles of vault buyers"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM vault_buyer_access vba
      JOIN properties p ON p.id = vba.property_id
      WHERE vba.buyer_id = profiles.id
        AND p.user_id = auth.uid()
        AND vba.status = 'paid'
    )
  )
);
