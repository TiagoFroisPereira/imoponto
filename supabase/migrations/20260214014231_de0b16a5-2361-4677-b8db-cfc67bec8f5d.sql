-- Fix RLS policy to use correct status value 'granted' instead of 'approved'
DROP POLICY IF EXISTS "Professionals can view vault documents with approved access" ON public.vault_documents;

CREATE POLICY "Professionals can view vault documents with granted access"
ON public.vault_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM vault_access_requests var
    JOIN professionals p ON p.id = var.professional_id
    WHERE var.status = 'granted'
      AND p.user_id = auth.uid()
      AND var.property_id = vault_documents.property_id::text
  )
);
