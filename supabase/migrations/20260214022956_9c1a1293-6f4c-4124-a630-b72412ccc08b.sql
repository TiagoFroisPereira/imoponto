
-- Allow authenticated users to see vault documents metadata for active properties
-- This enables the PropertyDetail page to show document listings to potential buyers/professionals
CREATE POLICY "Authenticated users can view vault docs of active properties"
ON public.vault_documents FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = vault_documents.property_id
    AND properties.status = 'active'
  )
);
