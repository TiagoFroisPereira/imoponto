-- Allow anyone to read the registration_enabled setting
CREATE POLICY "Anyone can read registration_enabled setting"
ON public.admin_settings
FOR SELECT
TO anon, authenticated
USING (key = 'registration_enabled');