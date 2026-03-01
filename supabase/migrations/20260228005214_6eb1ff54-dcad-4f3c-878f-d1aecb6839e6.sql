
-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete professionals
CREATE POLICY "Admins can delete professionals"
ON public.professionals
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
