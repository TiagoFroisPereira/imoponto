-- Allow property owners to view vault access requests for their properties
CREATE POLICY "Owners can view vault requests for their properties"
ON public.vault_access_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id::text = vault_access_requests.property_id
    AND properties.user_id = auth.uid()
  )
);