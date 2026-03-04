-- Add new columns for structured plan management
ALTER TABLE plans_addons 
ADD COLUMN IF NOT EXISTS features text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS limits jsonb DEFAULT '{}'::jsonb;

-- Update Free Plan
UPDATE plans_addons SET 
features = ARRAY['1 imóvel ativo', 'Até 5 fotografias HD', 'Ficha básica do imóvel', 'Visibilidade nos resultados', 'Cofre Digital disponível por 35€'],
limits = '{"properties": 1, "photos": 5, "videos": 0, "feature_keys": ["basic_fiche", "standard_visibility", "contact_direct", "marketplace"]}'::jsonb,
description = 'Comece a vender agora sem comissões. Ideal para testar o mercado.'
WHERE key = 'free';

-- Update Start Plan
UPDATE plans_addons SET 
features = ARRAY['1 imóvel ativo', 'Até 15 fotografias HD', '1 vídeo do imóvel', 'Destaque visual nas pesquisas', 'Cofre Digital Grátis (Poupe 35€)', 'Agenda de visitas integrada'],
limits = '{"properties": 1, "photos": 15, "videos": 1, "feature_keys": ["better_positioning", "contact_direct", "marketplace", "vault", "visit_scheduling"]}'::jsonb,
description = 'Venda mais rápido com visibilidade reforçada. Inclui Cofre Digital.'
WHERE key = 'start';

-- Update Pro Plan
UPDATE plans_addons SET 
features = ARRAY['Até 3 imóveis ativos', 'Até 20 fotografias por imóvel', '1 vídeo por imóvel', 'Prioridade máxima (Topo de pesquisa)', 'Selo de Perfil Verificado', 'Agenda e Gestão de Leads', 'Estatísticas semanais'],
limits = '{"properties": 3, "photos": 20, "videos": 1, "feature_keys": ["priority_results", "verified_badge", "contact_direct", "marketplace", "vault", "visit_scheduling"]}'::jsonb,
description = 'Solução completa para máxima performance e confiança.'
WHERE key = 'pro';
