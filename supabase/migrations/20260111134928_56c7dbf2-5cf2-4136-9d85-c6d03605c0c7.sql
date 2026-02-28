-- Drop the existing public read policy
DROP POLICY IF EXISTS "Anyone can view active and complete professionals" ON public.professionals;

-- Create new policy that requires authentication
CREATE POLICY "Authenticated users can view active and complete professionals" 
ON public.professionals 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND is_active = true 
  AND profile_completed = true
);