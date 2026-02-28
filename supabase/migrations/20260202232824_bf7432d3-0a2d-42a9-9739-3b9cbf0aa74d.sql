-- Migration to add plan limits columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS premium_until timestamp with time zone;

-- Update existing profiles to have 'free' plan if null
UPDATE public.profiles SET plan_type = 'free' WHERE plan_type IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.plan_type IS 'The subscription plan of the user (free, start, pro)';
COMMENT ON COLUMN public.profiles.premium_until IS 'The expiration date of the premium subscription';