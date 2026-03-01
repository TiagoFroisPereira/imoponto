-- Create policy to allow public read access to admin settings
-- This is necessary for the AuthForm to check if registration is enabled before a user is logged in.
CREATE POLICY "Anyone can read admin settings" ON "public"."admin_settings"
FOR SELECT USING (true);

-- Ensure the registration_enabled setting exists
INSERT INTO admin_settings (key, value) 
VALUES ('registration_enabled', 'true'::jsonb) 
ON CONFLICT (key) DO NOTHING;
