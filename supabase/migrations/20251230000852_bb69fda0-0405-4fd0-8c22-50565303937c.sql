-- Add phone_visible column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone_visible boolean DEFAULT true;