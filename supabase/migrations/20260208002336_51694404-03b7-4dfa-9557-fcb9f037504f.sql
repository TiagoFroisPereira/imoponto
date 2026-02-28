-- Create table to store user legal acceptances after registration
CREATE TABLE public.user_legal_acceptances (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ip_address TEXT,
    user_agent TEXT,
    terms_version TEXT NOT NULL DEFAULT '1.0',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_legal_acceptances ENABLE ROW LEVEL SECURITY;

-- Users can insert their own acceptance
CREATE POLICY "Users can insert own legal acceptance"
ON public.user_legal_acceptances
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own acceptance
CREATE POLICY "Users can view own legal acceptance"
ON public.user_legal_acceptances
FOR SELECT
USING (auth.uid() = user_id);