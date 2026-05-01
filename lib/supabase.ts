import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Vendedor = {
  id: string
  username: string
  nombre: string
  telefono: string
  activo: boolean
}

export type Perfil = {
  id: string
  vendedor_id: string
  nombre: string
  telefono: string
  es_activo: boolean
  orden: number
}

export type Presupuesto = {
  id: string
  vendedor_id: string | null
  tipo: 'ventanas' | 'pvc' | 'yeso' | 'presupuesto' | 'mapa'
  titulo: string | null
  cliente: string | null
  datos: Record<string, unknown>
  total: number | null
  perfil_nombre: string | null
  perfil_telefono: string | null
  created_at: string
}

export type Precio = {
  id: string
  categoria: string
  clave: string
  descripcion: string
  precio: number
  unidad: string
  activo: boolean
  orden: number
}
