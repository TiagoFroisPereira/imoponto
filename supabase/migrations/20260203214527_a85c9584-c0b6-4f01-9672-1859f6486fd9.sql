-- Migration to add virtual_tour_url to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS virtual_tour_url text;

-- Add description for the column
COMMENT ON COLUMN public.properties.virtual_tour_url IS 'External link for 3D virtual tour (e.g. Matterport, Kuula)';

-- Create property_addons table
create table if not exists public.property_addons (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade not null,
  addon_type text not null, -- 'vault', 'video', 'extra_photos', 'promotion'
  expires_at timestamptz, -- NULL for 'Até à Venda', Timestamp for 'Destaque'
  created_at timestamptz default now() not null,
  unique(property_id, addon_type)
);

-- Enable RLS
alter table public.property_addons enable row level security;

-- Policies
create policy "Users can view addons for their own properties"
on public.property_addons for select
to authenticated
using (
  exists (
    select 1 from public.properties
    where properties.id = property_addons.property_id
    and properties.user_id = auth.uid()
  )
);

create policy "Users can insert addons for their own properties"
on public.property_addons for insert
to authenticated
with check (
  exists (
    select 1 from public.properties
    where properties.id = property_addons.property_id
    and properties.user_id = auth.uid()
  )
);

-- Index for performance
create index if not exists idx_property_addons_property_id on public.property_addons(property_id);
create index if not exists idx_property_addons_type_expiry on public.property_addons(addon_type, expires_at);