-- ============================================================
-- ABERTURAS RG — CMS Tables
-- Pegá esto en Supabase → SQL Editor → Run
-- (Ejecutar DESPUÉS del schema inicial)
-- ============================================================

-- Contenido del landing (key-value flexible)
create table if not exists contenido (
  id uuid primary key default gen_random_uuid(),
  seccion text not null,       -- 'hero' | 'stats' | 'servicios' | 'proceso' | 'nosotros'
  clave text not null,         -- 'titulo' | 'subtitulo' | 'descripcion' etc.
  valor text not null default '',
  orden int not null default 0,
  updated_at timestamptz default now(),
  unique(seccion, clave)
);

-- Posts del blog
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null,
  extracto text not null default '',
  contenido text not null default '',
  categoria text not null default 'General',
  emoji text not null default '📝',
  publicado boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Galería de trabajos
create table if not exists trabajos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text not null default '',
  categoria text not null default 'Ventanas',
  imagen_url text not null default '',
  orden int not null default 0,
  activo boolean not null default true,
  created_at timestamptz default now()
);

-- Precios de calculadoras
create table if not exists precios_calc (
  id uuid primary key default gen_random_uuid(),
  calculadora text not null,   -- 'ventanas' | 'pvc' | 'yeso' | 'general'
  clave text not null,
  descripcion text not null,
  precio numeric not null default 0,
  unidad text not null default 'c/u',
  activo boolean not null default true,
  orden int not null default 0,
  updated_at timestamptz default now(),
  unique(calculadora, clave)
);

-- RLS policies
alter table contenido enable row level security;
alter table blog_posts enable row level security;
alter table trabajos enable row level security;
alter table precios_calc enable row level security;

create policy "allow_all_contenido"    on contenido    for all using (true) with check (true);
create policy "allow_all_blog_posts"   on blog_posts   for all using (true) with check (true);
create policy "allow_all_trabajos"     on trabajos     for all using (true) with check (true);
create policy "allow_all_precios_calc" on precios_calc for all using (true) with check (true);

-- Contenido inicial del landing
insert into contenido (seccion, clave, valor, orden) values
  ('hero', 'titulo_linea1', 'Tu hogar,', 1),
  ('hero', 'titulo_linea2', 'bien cerrado.', 2),
  ('hero', 'subtitulo', 'Ventanas, puertas, rejas y cielorrasos a medida. Instalación profesional en todo Uruguay con más de 15 años de experiencia.', 3),
  ('hero', 'badge', 'Aberturas de aluminio y PVC', 4),
  ('stats', 'stat1_num', '15+', 1),
  ('stats', 'stat1_label', 'Años de experiencia', 2),
  ('stats', 'stat2_num', '2000+', 3),
  ('stats', 'stat2_label', 'Instalaciones realizadas', 4),
  ('stats', 'stat3_num', '100%', 5),
  ('stats', 'stat3_label', 'Medida a pedido', 6),
  ('stats', 'stat4_num', 'Urug.', 7),
  ('stats', 'stat4_label', 'Cobertura nacional', 8),
  ('nosotros', 'titulo', 'Una empresa familiar con años de oficio', 1),
  ('nosotros', 'subtitulo', 'Empezamos con un taller y las ganas de hacer las cosas bien. Hoy trabajamos en todo Uruguay con el mismo compromiso de siempre.', 2),
  ('nosotros', 'historia_p1', 'Aberturas RG nació de la pasión por la fabricación de aluminio y el deseo de ofrecer productos de calidad a precios justos.', 3),
  ('nosotros', 'historia_p2', 'Con el tiempo incorporamos nuevos productos — cielorrasos de PVC, yeso/Durlock, rejas, persianas — y expandimos nuestra cobertura a todo Uruguay.', 4)
on conflict (seccion, clave) do nothing;

-- Precios iniciales ventanas
insert into precios_calc (calculadora, clave, descripcion, precio, unidad, orden) values
  ('ventanas', 's20_1000x600',  'Ventana S20 1.0×0.6m', 2490, 'c/u', 1),
  ('ventanas', 's20_1000x1000', 'Ventana S20 1.0×1.0m', 2990, 'c/u', 2),
  ('ventanas', 's20_1200x1000', 'Ventana S20 1.2×1.0m', 3290, 'c/u', 3),
  ('ventanas', 's20_1200x1200', 'Ventana S20 1.2×1.2m', 3790, 'c/u', 4),
  ('ventanas', 's20_1500x1000', 'Ventana S20 1.5×1.0m', 3890, 'c/u', 5),
  ('ventanas', 's20_1500x1200', 'Ventana S20 1.5×1.2m', 3990, 'c/u', 6),
  ('ventanas', 's20_1500x1500', 'Ventana S20 1.5×1.5m', 5350, 'c/u', 7),
  ('ventanas', 's20_1500x2000', 'Ventana S20 1.5×2.0m', 5990, 'c/u', 8),
  ('ventanas', 's25_1000x1000', 'Ventana S25 1.0×1.0m', 5490, 'c/u', 10),
  ('ventanas', 's25_1200x1200', 'Ventana S25 1.2×1.2m', 6590, 'c/u', 11),
  ('ventanas', 's25_1500x1500', 'Ventana S25 1.5×1.5m', 8190, 'c/u', 12),
  ('ventanas', 's25_1800x2000', 'Ventana S25 1.8×2.0m', 9590, 'c/u', 13),
  ('ventanas', 'mb20_1200x1000','Monoblock S20 1.2×1.0m',7590, 'c/u', 20),
  ('ventanas', 'mb20_1500x1500','Monoblock S20 1.5×1.5m',12490,'c/u', 21),
  ('ventanas', 'mb25_1500x2000','Monoblock S25 1.5×2.0m',17890,'c/u', 22),
  ('ventanas', 'reja_12_m2',    'Reja 12mm (m²)',         2500, 'm²',  30),
  ('ventanas', 'reja_16_m2',    'Reja 16mm (m²)',         3500, 'm²',  31),
  ('ventanas', 'persiana_m2',   'Persiana (m²)',           4200, 'm²',  32),
  ('ventanas', 'mosquitero_m2', 'Mosquitero (m²)',         1100, 'm²',  33),
  ('ventanas', 'simil_madera_pct','Recargo simil madera (%)', 15, '%', 40),
  ('ventanas', 'color_pct',     'Recargo color (%)',         10, '%',  41)
on conflict (calculadora, clave) do nothing;

-- Precios PVC
insert into precios_calc (calculadora, clave, descripcion, precio, unidad, orden) values
  ('pvc', 'tablilla_blanco_6',  'Tablilla blanco 6mm',   285,  'ML',    1),
  ('pvc', 'tablilla_blanco_8',  'Tablilla blanco 8mm',   335,  'ML',    2),
  ('pvc', 'tablilla_blanco_10', 'Tablilla blanco 10mm',  390,  'ML',    3),
  ('pvc', 'tablilla_color_7',   'Tablilla color 7mm',    420,  'ML',    4),
  ('pvc', 'perfil_u',           'Perfil U terminación',  180,  'ML',    5),
  ('pvc', 'union_h_6m',         'Unión H (barra 6m)',    510,  'c/u',   6),
  ('pvc', 'montante_35',        'Montante 35mm',         290,  'c/u',   7),
  ('pvc', 'solera_35',          'Solera 35mm',           290,  'c/u',   8),
  ('pvc', 'tornillo_t1',        'Tornillo T1',           4,    'c/u',   9),
  ('pvc', 'fijacion_8',         'Fijación 8mm',          8,    'c/u',   10),
  ('pvc', 'lana_vidrio_18m2',   'Lana de vidrio (18m²)', 1850, 'rollo', 11),
  ('pvc', 'guata_aluminizada_15m2','Guata aluminizada (15m²)', 1200, 'rollo', 12),
  ('pvc', 'mo_m2',              'Mano de obra',          600,  'm²',    13)
on conflict (calculadora, clave) do nothing;

-- Precios Yeso
insert into precios_calc (calculadora, clave, descripcion, precio, unidad, orden) values
  ('yeso', 'placa_10',       'Placa Durlock 10mm',    329,  'c/u',   1),
  ('yeso', 'placa_125',      'Placa Durlock 12.5mm',  380,  'c/u',   2),
  ('yeso', 'placa_verde',    'Placa verde 12.5mm',    490,  'c/u',   3),
  ('yeso', 'montante_35',    'Montante 35mm',         290,  'c/u',   4),
  ('yeso', 'montante_70',    'Montante 70mm',         380,  'c/u',   5),
  ('yeso', 'solera_35',      'Solera 35mm',           270,  'c/u',   6),
  ('yeso', 'solera_70',      'Solera 70mm',           360,  'c/u',   7),
  ('yeso', 'omega_3m',       'Omega 3m',              210,  'c/u',   8),
  ('yeso', 'tornillo_t1_100','Tornillos T1 (x100)',   180,  'bolsa', 9),
  ('yeso', 'tornillo_t2_100','Tornillos T2 (x100)',   220,  'bolsa', 10),
  ('yeso', 'fijaciones_bolsa','Fijaciones c/taco',    320,  'bolsa', 11),
  ('yeso', 'masilla_7',      'Masilla 7kg',           480,  'balde', 12),
  ('yeso', 'masilla_25',     'Masilla 25kg',          1180, 'balde', 13),
  ('yeso', 'cinta_papel',    'Cinta papel',           95,   'rollo', 14),
  ('yeso', 'cinta_red',      'Cinta red',             110,  'rollo', 15),
  ('yeso', 'lana_vidrio_18m2','Lana de vidrio (18m²)',1850, 'rollo', 16),
  ('yeso', 'guata_aluminizada_15m2','Guata aluminizada (15m²)',1200,'rollo',17),
  ('yeso', 'mo_m2',          'Mano de obra',          800,  'm²',    18)
on conflict (calculadora, clave) do nothing;
