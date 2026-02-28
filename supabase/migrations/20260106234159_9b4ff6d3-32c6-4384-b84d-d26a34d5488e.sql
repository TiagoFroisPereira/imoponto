-- Add wizard_step column to track property creation progress
ALTER TABLE public.properties 
ADD COLUMN wizard_step integer NOT NULL DEFAULT 0;