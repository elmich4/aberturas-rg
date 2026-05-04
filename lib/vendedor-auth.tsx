'use client'
import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Vendedor = { nombre: string; username: string; telefono?: string }

type VendedorCtx = {
  vendedor: Vendedor | null
  loading: boolean
  login: (user: string, pass: string) => Promise<string | null>
  logout: () => void
}

const Ctx = createContext<VendedorCtx>({
  vendedor: null, loading: false,
  login: async () => null, logout: () => {},
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
      .select('*')
      .eq('username', user.trim())
      .eq('password', pass)
      .single()
    if (error || !data) return 'Usuario o contraseña incorrectos'
    const v: Vendedor = { nombre: data.nombre, username: data.username, telefono: data.telefono }
    setVendedor(v)
    localStorage.setItem('rg_vendedor', JSON.stringify(v))
    return null
  }, [])

  const logout = useCallback(() => {
    setVendedor(null)
    localStorage.removeItem('rg_vendedor')
  }, [])

  return <Ctx.Provider value={{ vendedor, loading, login, logout }}>{children}</Ctx.Provider>
}

export function useVendedor() {
  return useContext(Ctx)
}
