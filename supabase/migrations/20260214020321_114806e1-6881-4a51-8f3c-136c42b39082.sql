
-- Allow professionals with granted vault access to INSERT documents into vault_documents
CREATE POLICY "Professionals can insert vault documents with granted access"
ON public.vault_documents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vault_access_requests var
    JOIN professionals p ON p.id = var.professional_id
    WHERE var.status = 'granted'
      AND p.user_id = auth.uid()
      AND var.property_id = (vault_documents.property_id)::text
  )
  AND auth.uid() = user_id
);

-- Allow professionals with granted vault access to UPDATE status on vault_documents
CREATE POLICY "Professionals can update vault document status with granted access"
ON public.vault_documents FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM vault_access_requests var
    JOIN professionals p ON p.id = var.professional_id
    WHERE var.status = 'granted'
      AND p.user_id = auth.uid()
      AND var.property_id = (vault_documents.property_id)::text
  )
);
