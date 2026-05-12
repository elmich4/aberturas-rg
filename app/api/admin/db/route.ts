import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Tablas permitidas para operaciones de escritura
const TABLAS_PERMITIDAS = [
  'tienda_productos',
  'tienda_producto_variantes',
  'anuncios_barra',
  'tienda_presupuestos',
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, table, data, match, select, id } = body

    // Validar tabla
    if (!TABLAS_PERMITIDAS.includes(table)) {
      return NextResponse.json({ error: 'Tabla no permitida' }, { status: 403 })
    }

    // Validar acción
    if (!['insert', 'update', 'delete', 'upsert'].includes(action)) {
      return NextResponse.json({ error: 'Acción no permitida' }, { status: 403 })
    }

    let result: any

    switch (action) {
      case 'insert': {
        let query = supabaseAdmin.from(table).insert(data)
        if (select) query = query.select(select)
        result = await query
        break
      }

      case 'update': {
        if (!match || Object.keys(match).length === 0) {
          return NextResponse.json({ error: 'Se requiere match para update' }, { status: 400 })
        }
        let query = supabaseAdmin.from(table).update(data)
        Object.entries(match).forEach(([key, value]) => {
          query = query.eq(key, value as string)
        })
        if (select) query = query.select(select)
        result = await query
        break
      }

      case 'delete': {
        if (!match || Object.keys(match).length === 0) {
          return NextResponse.json({ error: 'Se requiere match para delete' }, { status: 400 })
        }
        let query = supabaseAdmin.from(table).delete()
        Object.entries(match).forEach(([key, value]) => {
          query = query.eq(key, value as string)
        })
        result = await query
        break
      }

      case 'upsert': {
        let query = supabaseAdmin.from(table).upsert(data)
        if (select) query = query.select(select)
        result = await query
        break
      }
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}
