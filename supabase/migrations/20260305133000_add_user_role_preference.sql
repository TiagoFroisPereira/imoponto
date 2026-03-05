-- Add user_role_preference to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_role_preference TEXT CHECK (user_role_preference IN ('buyer', 'seller'));

-- Update existing profiles to have a default if necessary (optional, but good for consistency)
-- For now we leave it null to trigger the segmentation dialog for existing users.
