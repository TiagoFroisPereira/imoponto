-- Allow professionals with approved vault access requests to view vault documents
-- for properties where they have approved access
CREATE POLICY "Professionals can view vault documents with approved access"
ON public.vault_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.vault_access_requests var
    JOIN public.professionals p ON p.id = var.professional_id
    WHERE var.status = 'approved'
      AND p.user_id = auth.uid()
      AND var.property_id = vault_documents.property_id::text
  )
);