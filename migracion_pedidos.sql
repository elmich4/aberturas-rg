-- =============================================
-- MIGRACIÓN: Sistema de Pedidos - Aberturas RG
-- Ejecutar en Supabase → SQL Editor
-- =============================================

-- 1. Secuencia para códigos de pedido (auto-incremental legible)
CREATE SEQUENCE IF NOT EXISTS pedidos_codigo_seq START WITH 1001;

-- 2. Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo INTEGER DEFAULT nextval('pedidos_codigo_seq') UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT NOT NULL,
  direccion TEXT NOT NULL,
  notas TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'contactado', 'confirmado', 'entregado', 'cancelado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos (estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_created ON pedidos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_codigo ON pedidos (codigo);

-- RLS: permitir insert desde anon (el cliente crea el pedido)
-- y select/update desde authenticated (admin)
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Política: cualquiera puede crear un pedido
CREATE POLICY "Anon puede crear pedidos"
  ON pedidos FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política: anon puede leer solo su pedido por código (para la página de confirmación)
-- En la práctica el código se pasa por URL, así que permitimos select también
CREATE POLICY "Anon puede leer pedidos"
  ON pedidos FOR SELECT
  TO anon
  USING (true);

-- Política: authenticated (admin) tiene acceso total
CREATE POLICY "Admin acceso total pedidos"
  ON pedidos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- 3. Tabla de mensajes de contacto
CREATE TABLE IF NOT EXISTS contacto_mensajes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contacto_mensajes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon puede crear mensajes"
  ON contacto_mensajes FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admin puede leer mensajes"
  ON contacto_mensajes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- =============================================
-- ¡Listo! Después de ejecutar esto, tu web ya
-- puede crear pedidos y mensajes de contacto.
-- =============================================
