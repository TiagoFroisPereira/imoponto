-- Create properties table for user listings
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  location TEXT NOT NULL,
  price NUMERIC NOT NULL,
  property_type TEXT NOT NULL DEFAULT 'apartment',
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 0,
  area NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  views_count INTEGER NOT NULL DEFAULT 0,
  inquiries_count INTEGER NOT NULL DEFAULT 0,
  documentation_level TEXT NOT NULL DEFAULT 'none',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vault_documents table
CREATE TABLE public.vault_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_documents ENABLE ROW LEVEL SECURITY;

-- Properties RLS policies
CREATE POLICY "Users can view own properties" 
ON public.properties 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active properties" 
ON public.properties 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Users can create own properties" 
ON public.properties 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties" 
ON public.properties 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties" 
ON public.properties 
FOR DELETE 
USING (auth.uid() = user_id);

-- Vault documents RLS policies
CREATE POLICY "Users can view own documents" 
ON public.vault_documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own documents" 
ON public.vault_documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" 
ON public.vault_documents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" 
ON public.vault_documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vault_documents_updated_at
BEFORE UPDATE ON public.vault_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();