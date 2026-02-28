-- Add new columns to professionals table for complete professional profile
ALTER TABLE public.professionals
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS geographic_area TEXT,
ADD COLUMN IF NOT EXISTS specialization TEXT,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;

-- Add index for better query performance on profile_completed
CREATE INDEX IF NOT EXISTS idx_professionals_profile_completed ON public.professionals(profile_completed);

-- Update RLS policies to allow users to view all active AND profile_completed professionals
DROP POLICY IF EXISTS "Anyone can view active professionals" ON public.professionals;

CREATE POLICY "Anyone can view active and complete professionals"
ON public.professionals
FOR SELECT
USING (is_active = true AND profile_completed = true);

-- Create a separate policy for users to view their own incomplete profile
CREATE POLICY "Users can view own professional profile"
ON public.professionals
FOR SELECT
USING (auth.uid() = user_id);