import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ error: 'Usuario y contraseña requeridos' }, { status: 400 })
  }

  const { data: vendedores, error } = await sb
    .from('vendedores')
    .select('id, username, nombre, telefono, activo, password_hash, password, rol')
    .eq('username', username.toLowerCase().trim())
    .eq('activo', true)
    .limit(1)

  if (error || !vendedores || vendedores.length === 0) {
    return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 })
  }

  const v = vendedores[0]

  // Verificar contraseña — soporta columna password (plain) y password_hash
  const ok = v.password === password || v.password_hash === password

  if (!ok) {
    return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 })
  }

  // Log login en audit_log
  await sb.from('audit_log').insert({
    vendedor_id: v.id,
    vendedor_nombre: v.nombre,
    accion: 'login',
    tabla: 'vendedores',
    descripcion: `${v.nombre} inició sesión`,
  }).then(() => {})

  return NextResponse.json({
    vendedor: {
      id: v.id,
      username: v.username,
      nombre: v.nombre,
      telefono: v.telefono,
      activo: v.activo,
      rol: v.rol || 'vendedor',
    }
  })
}
