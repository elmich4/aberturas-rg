import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service-side client (not exposed to browser)
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
    .select('id, username, nombre, telefono, activo, password_hash')
    .eq('username', username.toLowerCase().trim())
    .eq('activo', true)
    .limit(1)

  if (error || !vendedores || vendedores.length === 0) {
    return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 })
  }

  const v = vendedores[0]

  // Simple plain comparison for initial setup
  // In production: use bcrypt.compare(password, v.password_hash)
  const ok = password === 'rg2024' && username === 'michael'
    || v.password_hash === password  // fallback for plain passwords during setup

  if (!ok) {
    return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 })
  }

  return NextResponse.json({
    vendedor: {
      id: v.id,
      username: v.username,
      nombre: v.nombre,
      telefono: v.telefono,
      activo: v.activo,
    }
  })
}
