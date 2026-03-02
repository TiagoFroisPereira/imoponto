-- Create plans_addons table
CREATE TABLE IF NOT EXISTS public.plans_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    yearly_price NUMERIC DEFAULT 0,
    stripe_price_id TEXT,
    stripe_yearly_price_id TEXT,
    type TEXT NOT NULL CHECK (type IN ('plan', 'addon')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plans_addons ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access for plans_addons" ON public.plans_addons
    FOR SELECT USING (true);

CREATE POLICY "Admin full access for plans_addons" ON public.plans_addons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Initial data for plans
INSERT INTO public.plans_addons (key, name, description, price, yearly_price, type, stripe_price_id, stripe_yearly_price_id)
VALUES 
    ('free', 'Plano Free', 'Anúncio único para particulares', 0, 0, 'plan', NULL, NULL),
    ('start', 'Plano Start', 'Para quem quer começar com mais visibilidade', 9.90, 99.00, 'plan', 'price_1T4ivSPouTBk2CwULArTZiVF', 'price_1T4izwPouTBk2CwUJgJppQW9'),
    ('pro', 'Plano Pro', 'Máxima exposição para profissionais e agências', 19.90, 199.00, 'plan', 'price_1T4iz2PouTBk2CwU1YLleFNq', 'price_1T4izZPouTBk2CwU4pviaxDL')
ON CONFLICT (key) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    yearly_price = EXCLUDED.yearly_price,
    stripe_price_id = EXCLUDED.stripe_price_id,
    stripe_yearly_price_id = EXCLUDED.stripe_yearly_price_id;

-- Initial data for addons
INSERT INTO public.plans_addons (key, name, description, price, type, stripe_price_id)
VALUES 
    ('vault', 'Cofre Digital', 'Armazenamento seguro de documentos sensíveis com partilha protegida.', 9.90, 'addon', 'price_1T4MJNPouTBk2CwU2XIsLvw4'),
    ('extra_photos', 'Pack Extra Fotos', 'Aumente o limite de 10 para 25 fotografias em alta definição.', 4.90, 'addon', 'price_1T4MJNPouTBk2CwUW4lrUlmQ'),
    ('video', 'Video & 3D Tour', 'Desbloqueie o slot de vídeo e suporte para visitas virtuais Matterport.', 9.90, 'addon', NULL),
    ('promotion', 'Destaque Platinum', 'Apareça no topo das pesquisas e receba o selo de destaque.', 14.90, 'addon', NULL)
ON CONFLICT (key) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    stripe_price_id = EXCLUDED.stripe_price_id;
