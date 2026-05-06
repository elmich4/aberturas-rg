'use client'
import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Vendedor = {
  id: string
  nombre: string
  username: string
  telefono?: string
  rol: 'admin' | 'vendedor'
}

type VendedorCtx = {
  vendedor: Vendedor | null
  loading: boolean
  isAdmin: boolean
  login: (user: string, pass: string) => Promise<string | null>
  logout: () => void
  logAction: (accion: string, tabla: string, descripcion: string, registroId?: string, datosAntes?: any, datosDespues?: any) => Promise<void>
}

const Ctx = createContext<VendedorCtx>({
  vendedor: null, loading: false, isAdmin: false,
  login: async () => null, logout: () => {},
  logAction: async () => {},
})

export function VendedorProvider({ children }: { children: React.ReactNode }) {
  const [vendedor, setVendedor] = useState<Vendedor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rg_vendedor')
      if (stored) setVendedor(JSON.parse(stored))
    } catch {}
    setLoading(false)
  }, [])

  const login = useCallback(async (user: string, pass: string): Promise<string | null> => {
    const { data, error } = await supabase
      .from('vendedores')
      .select('id, nombre, username, telefono, rol, activo')
      .eq('username', user.trim())
      .eq('password', pass)
      .single()
    if (error || !data) return 'Usuario o contraseña incorrectos'
    if (!data.activo) return 'Usuario desactivado. Contactá al administrador.'
    const v: Vendedor = {
      id: data.id, nombre: data.nombre, username: data.username,
      telefono: data.telefono, rol: data.rol || 'vendedor'
    }
    setVendedor(v)
    localStorage.setItem('rg_vendedor', JSON.stringify(v))
    // Log login
    await supabase.from('audit_log').insert({
      vendedor_id: v.id, vendedor_nombre: v.nombre,
      accion: 'login', tabla: 'vendedores',
      descripcion: `${v.nombre} inició sesión`,
    })
    return null
  }, [])

  const logout = useCallback(() => {
    setVendedor(null)
    localStorage.removeItem('rg_vendedor')
  }, [])

  const logAction = useCallback(async (
    accion: string, tabla: string, descripcion: string,
    registroId?: string, datosAntes?: any, datosDespues?: any
  ) => {
    if (!vendedor) return
    await supabase.from('audit_log').insert({
      vendedor_id: vendedor.id, vendedor_nombre: vendedor.nombre,
      accion, tabla, descripcion,
      registro_id: registroId || null,
      datos_antes: datosAntes || null,
      datos_despues: datosDespues || null,
    })
  }, [vendedor])

  const isAdmin = vendedor?.rol === 'admin'

  return (
    <Ctx.Provider value={{ vendedor, loading, isAdmin, login, logout, logAction }}>
      {children}
    </Ctx.Provider>
  )
}

export function useVendedor() { return useContext(Ctx) }
