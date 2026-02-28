-- Fix RLS policies for professional_relationships to be more restrictive

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "System can create relationships" ON public.professional_relationships;
DROP POLICY IF EXISTS "System can update relationships" ON public.professional_relationships;

-- Create proper RLS policies for professional_relationships
-- Only allow creating relationships when accepting a request (via the professional)
CREATE POLICY "Professionals can create relationships"
ON public.professional_relationships
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.professionals
    WHERE professionals.id = professional_relationships.professional_id
    AND professionals.user_id = auth.uid()
  )
);

-- Only the professional can update their relationships
CREATE POLICY "Professionals can update their relationships"
ON public.professional_relationships
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.professionals
    WHERE professionals.id = professional_relationships.professional_id
    AND professionals.user_id = auth.uid()
  )
);