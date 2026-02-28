-- Create service categories enum
CREATE TYPE public.service_category AS ENUM (
  'juridico',
  'financeiro',
  'tecnico',
  'marketing'
);

-- Create professionals table
CREATE TABLE public.professionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  category service_category NOT NULL,
  service_type TEXT NOT NULL,
  price_from DECIMAL(10,2) NOT NULL,
  location TEXT,
  years_experience INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.professional_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id, user_id)
);

-- Create vault access requests table (payment for professional to access digital vault)
CREATE TABLE public.vault_access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vault_document_id TEXT NOT NULL,
  property_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'granted', 'denied', 'expired')),
  payment_amount DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact requests table
CREATE TABLE public.contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Professionals: Everyone can view active professionals
CREATE POLICY "Anyone can view active professionals"
ON public.professionals
FOR SELECT
USING (is_active = true);

-- Professionals: Owners can update their own profile
CREATE POLICY "Professionals can update own profile"
ON public.professionals
FOR UPDATE
USING (auth.uid() = user_id);

-- Reviews: Everyone can view reviews
CREATE POLICY "Anyone can view reviews"
ON public.professional_reviews
FOR SELECT
USING (true);

-- Reviews: Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
ON public.professional_reviews
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Reviews: Users can update their own reviews
CREATE POLICY "Users can update own reviews"
ON public.professional_reviews
FOR UPDATE
USING (auth.uid() = user_id);

-- Reviews: Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
ON public.professional_reviews
FOR DELETE
USING (auth.uid() = user_id);

-- Vault Access Requests: Users can view their own requests
CREATE POLICY "Users can view own vault access requests"
ON public.vault_access_requests
FOR SELECT
USING (auth.uid() = requester_id);

-- Vault Access Requests: Professionals can view requests for them
CREATE POLICY "Professionals can view vault requests for them"
ON public.vault_access_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.professionals
    WHERE professionals.id = vault_access_requests.professional_id
    AND professionals.user_id = auth.uid()
  )
);

-- Vault Access Requests: Users can create requests
CREATE POLICY "Users can create vault access requests"
ON public.vault_access_requests
FOR INSERT
WITH CHECK (auth.uid() = requester_id);

-- Vault Access Requests: Users can update their own requests
CREATE POLICY "Users can update own vault access requests"
ON public.vault_access_requests
FOR UPDATE
USING (auth.uid() = requester_id);

-- Contact Requests: Users can view their own contact requests
CREATE POLICY "Users can view own contact requests"
ON public.contact_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Contact Requests: Professionals can view contact requests for them
CREATE POLICY "Professionals can view contact requests for them"
ON public.contact_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.professionals
    WHERE professionals.id = contact_requests.professional_id
    AND professionals.user_id = auth.uid()
  )
);

-- Contact Requests: Users can create contact requests
CREATE POLICY "Users can create contact requests"
ON public.contact_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Contact Requests: Users can update their own contact requests
CREATE POLICY "Users can update own contact requests"
ON public.contact_requests
FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_professionals_updated_at
BEFORE UPDATE ON public.professionals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_professional_reviews_updated_at
BEFORE UPDATE ON public.professional_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vault_access_requests_updated_at
BEFORE UPDATE ON public.vault_access_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_requests_updated_at
BEFORE UPDATE ON public.contact_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample professionals data
INSERT INTO public.professionals (name, email, category, service_type, price_from, bio, location, years_experience, is_verified) VALUES
('Dr. António Silva', 'antonio.silva@email.com', 'juridico', 'Advogado Imobiliário', 250.00, 'Especialista em direito imobiliário com mais de 15 anos de experiência em transações complexas.', 'Lisboa', 15, true),
('Dra. Maria Santos', 'maria.santos@email.com', 'juridico', 'Advogado Imobiliário', 200.00, 'Advogada dedicada a proteger os interesses dos seus clientes em todas as fases do processo.', 'Porto', 8, true),
('Notário João Ferreira', 'joao.ferreira@email.com', 'juridico', 'Notário', 150.00, 'Notário público certificado com especialização em escrituras e autenticação de documentos.', 'Lisboa', 20, true),
('Notária Ana Costa', 'ana.costa@email.com', 'juridico', 'Notário', 175.00, 'Experiência comprovada em escrituras de compra e venda de imóveis.', 'Braga', 12, true),
('Carlos Mendes - Crédito', 'carlos.mendes@email.com', 'financeiro', 'Intermediação de Crédito', 0.00, 'Especialista em encontrar as melhores taxas de financiamento do mercado.', 'Lisboa', 10, true),
('Sofia Rodrigues - Crédito', 'sofia.rodrigues@email.com', 'financeiro', 'Intermediação de Crédito', 0.00, 'Consultora financeira com parcerias em todos os principais bancos.', 'Setúbal', 6, true),
('Eng. Pedro Almeida', 'pedro.almeida@email.com', 'tecnico', 'Certificação Energética', 75.00, 'Engenheiro certificado para emissão de certificados energéticos.', 'Lisboa', 8, true),
('Eng. Rita Oliveira', 'rita.oliveira@email.com', 'tecnico', 'Certificação Energética', 85.00, 'Especialista em eficiência energética e certificação de edifícios.', 'Porto', 5, true),
('Avaliador Miguel Sousa', 'miguel.sousa@email.com', 'tecnico', 'Avaliação Imobiliária', 180.00, 'Perito avaliador registado na CMVM com experiência em todo tipo de imóveis.', 'Lisboa', 12, true),
('Avaliadora Inês Martins', 'ines.martins@email.com', 'tecnico', 'Avaliação Imobiliária', 200.00, 'Avaliações precisas e relatórios detalhados para bancos e particulares.', 'Coimbra', 7, true),
('Fotógrafo Rui Carvalho', 'rui.carvalho@email.com', 'marketing', 'Fotografia Profissional', 120.00, 'Fotografia de alta qualidade para valorizar o seu imóvel.', 'Lisboa', 9, true),
('Fotógrafa Marta Lopes', 'marta.lopes@email.com', 'marketing', 'Fotografia Profissional', 150.00, 'Especialista em fotografia imobiliária, vídeos e tours virtuais 360º.', 'Porto', 6, true);