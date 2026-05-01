import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const vendedor_id = searchParams.get('vendedor_id')
  if (!vendedor_id) return NextResponse.json({ error: 'vendedor_id required' }, { status: 400 })

  const { data, error } = await sb.from('perfiles').select('*').eq('vendedor_id', vendedor_id).order('orden')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ perfiles: data })
}

export async function POST(req: NextRequest) {
  const { vendedor_id, nombre, telefono } = await req.json()
  const { data: existing } = await sb.from('perfiles').select('orden').eq('vendedor_id', vendedor_id).order('orden', { ascending: false }).limit(1)
  const orden = existing && existing.length > 0 ? existing[0].orden + 1 : 0

  const { data, error } = await sb.from('perfiles').insert({ vendedor_id, nombre, telefono, es_activo: false, orden }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ perfil: data })
}

export async function PUT(req: NextRequest) {
  const { id, nombre, telefono, es_activo, vendedor_id } = await req.json()
  // If setting as active, deactivate others first
  if (es_activo && vendedor_id) {
    await sb.from('perfiles').update({ es_activo: false }).eq('vendedor_id', vendedor_id)
  }
  const { data, error } = await sb.from('perfiles').update({ nombre, telefono, es_activo }).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ perfil: data })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const { error } = await sb.from('perfiles').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
