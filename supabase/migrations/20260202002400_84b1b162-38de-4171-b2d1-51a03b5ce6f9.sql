-- =============================================
-- PROFESSIONAL PANEL RESTRUCTURE - SERVICE REQUESTS
-- =============================================

-- 1. Add rejection_reason and expires_at to contact_requests
ALTER TABLE public.contact_requests 
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone DEFAULT (now() + interval '72 hours'),
ADD COLUMN IF NOT EXISTS property_id uuid REFERENCES public.properties(id),
ADD COLUMN IF NOT EXISTS service_type text;

-- 2. Add rejection_reason and expires_at to vault_access_requests  
ALTER TABLE public.vault_access_requests
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone DEFAULT (now() + interval '72 hours');

-- 3. Add professional update capability for contact_requests
CREATE POLICY "Professionals can update contact requests for them"
ON public.contact_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.professionals
    WHERE professionals.id = contact_requests.professional_id
    AND professionals.user_id = auth.uid()
  )
);

-- 4. Add professional update capability for vault_access_requests
CREATE POLICY "Professionals can update vault requests for them"
ON public.vault_access_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.professionals
    WHERE professionals.id = vault_access_requests.professional_id
    AND professionals.user_id = auth.uid()
  )
);

-- 5. Create a table to track professional-user relationships (for chat access)
CREATE TABLE IF NOT EXISTS public.professional_relationships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id uuid NOT NULL REFERENCES public.professionals(id),
  user_id uuid NOT NULL,
  relationship_type text NOT NULL CHECK (relationship_type IN ('contact_accepted', 'vault_access', 'property_assignment')),
  source_id uuid, -- Reference to the original request/assignment
  property_id uuid REFERENCES public.properties(id),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(professional_id, user_id, relationship_type, source_id)
);

-- 6. Enable RLS on professional_relationships
ALTER TABLE public.professional_relationships ENABLE ROW LEVEL SECURITY;

-- 7. RLS policies for professional_relationships
CREATE POLICY "Users can view their relationships"
ON public.professional_relationships
FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.professionals
    WHERE professionals.id = professional_relationships.professional_id
    AND professionals.user_id = auth.uid()
  )
);

CREATE POLICY "System can create relationships"
ON public.professional_relationships
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update relationships"
ON public.professional_relationships
FOR UPDATE
USING (true);

-- 8. Create trigger for updated_at
CREATE TRIGGER update_professional_relationships_updated_at
BEFORE UPDATE ON public.professional_relationships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Enable realtime for professional_relationships
ALTER PUBLICATION supabase_realtime ADD TABLE public.professional_relationships;