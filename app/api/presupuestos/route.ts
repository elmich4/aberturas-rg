import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const vendedor_id = searchParams.get('vendedor_id')
  const tipo = searchParams.get('tipo')

  let q = sb.from('presupuestos').select('*').order('created_at', { ascending: false }).limit(50)
  if (vendedor_id) q = q.eq('vendedor_id', vendedor_id)
  if (tipo) q = q.eq('tipo', tipo)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ presupuestos: data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { vendedor_id, tipo, titulo, cliente, datos, total, perfil_nombre, perfil_telefono } = body

  const { data, error } = await sb.from('presupuestos').insert({
    vendedor_id, tipo, titulo, cliente, datos, total, perfil_nombre, perfil_telefono
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ presupuesto: data })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const { error } = await sb.from('presupuestos').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
