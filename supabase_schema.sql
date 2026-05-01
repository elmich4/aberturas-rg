-- ============================================================
-- ABERTURAS RG — Schema Supabase
-- Pegá esto en Supabase → SQL Editor → Run
-- ============================================================

-- Tabla de vendedores
create table if not exists vendedores (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,      -- bcrypt hash
  nombre text not null,
  telefono text not null default '097 699 854',
  activo boolean not null default true,
  created_at timestamptz default now()
);

-- Tabla de perfiles de vendedor (un vendedor puede tener múltiples)
create table if not exists perfiles (
  id uuid primary key default gen_random_uuid(),
  vendedor_id uuid references vendedores(id) on delete cascade,
  nombre text not null,
  telefono text not null,
  es_activo boolean not null default false,
  orden int not null default 0,
  created_at timestamptz default now()
);

-- Tabla de presupuestos guardados
create table if not exists presupuestos (
  id uuid primary key default gen_random_uuid(),
  vendedor_id uuid references vendedores(id) on delete set null,
  tipo text not null,               -- 'ventanas' | 'pvc' | 'yeso' | 'presupuesto' | 'mapa'
  titulo text,
  cliente text,
  datos jsonb not null default '{}', -- snapshot completo del cálculo
  total numeric,
  perfil_nombre text,
  perfil_telefono text,
  created_at timestamptz default now()
);

-- Tabla de precios (permite editar desde admin sin deploy)
create table if not exists precios (
  id uuid primary key default gen_random_uuid(),
  categoria text not null,          -- 'ventanas' | 'pvc' | 'yeso' | 'otros'
  clave text not null,
  descripcion text not null,
  precio numeric not null default 0,
  unidad text not null default 'c/u',
  activo boolean not null default true,
  orden int not null default 0,
  updated_at timestamptz default now(),
  unique(categoria, clave)
);

-- RLS: solo acceso con service_role o anon autenticado con JWT
alter table vendedores enable row level security;
alter table perfiles enable row level security;
alter table presupuestos enable row level security;
alter table precios enable row level security;

-- Políticas: acceso total para anon (la auth la manejamos en Next.js con cookies)
-- En producción podés refinar esto con auth.uid()
create policy "allow_all_vendedores"   on vendedores   for all using (true) with check (true);
create policy "allow_all_perfiles"     on perfiles     for all using (true) with check (true);
create policy "allow_all_presupuestos" on presupuestos for all using (true) with check (true);
create policy "allow_all_precios"      on precios      for all using (true) with check (true);

-- Insertar vendedor inicial: michael / rg2024
-- (contraseña hasheada con bcrypt rounds=10)
insert into vendedores (username, password_hash, nombre, telefono)
values (
  'michael',
  '$2b$10$YourHashHere',  -- se reemplaza con el hash real al iniciar
  'Michael · Aberturas RG',
  '097 699 854'
)
on conflict (username) do nothing;

-- Perfil inicial
insert into perfiles (vendedor_id, nombre, telefono, es_activo, orden)
select id, 'Michael · Aberturas RG', '097 699 854', true, 0
from vendedores where username = 'michael'
on conflict do nothing;
