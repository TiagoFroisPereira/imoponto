-- Allow authenticated users to insert their own professional profile
CREATE POLICY "Users can create own professional profile"
ON public.professionals
FOR INSERT
WITH CHECK (auth.uid() = user_id);