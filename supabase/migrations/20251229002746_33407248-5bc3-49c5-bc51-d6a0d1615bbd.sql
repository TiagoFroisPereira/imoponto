-- Adicionar campos adicionais à tabela properties para suportar todos os detalhes
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS features text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS year_built integer,
ADD COLUMN IF NOT EXISTS energy_certification text,
ADD COLUMN IF NOT EXISTS parking integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS floor text,
ADD COLUMN IF NOT EXISTS has_garden boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_pool boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_garage boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_elevator boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_ac boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_central_heating boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pets_allowed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS gross_area numeric,
ADD COLUMN IF NOT EXISTS condition text DEFAULT 'used',
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS transaction_type text DEFAULT 'sell';