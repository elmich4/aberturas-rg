'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, Vendedor, Perfil } from './supabase'

type AuthState = {
  vendedor: Vendedor | null
  perfiles: Perfil[]
  perfilActivo: Perfil | null
  loading: boolean
  isAdmin: boolean
  login: (username: string, password: string) => Promise<{ error?: string }>
  logout: () => void
  cambiarPerfil: (id: string) => void
  refreshPerfiles: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)
const SESSION_KEY = 'rg_vendedor'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [vendedor, setVendedor] = useState<Vendedor | null>(null)
  const [perfiles, setPerfiles] = useState<Perfil[]>([])
  const [perfilActivo, setPerfilActivo] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY)
    if (saved) {
      try {
        const v = JSON.parse(saved) as Vendedor
        setVendedor(v)
        loadPerfiles(v.id)
      } catch { /* ignore */ }
    }
    setLoading(false)
  }, [])

  async function loadPerfiles(vendedorId: string) {
    const { data } = await supabase
      .from('perfiles')
      .select('*')
      .eq('vendedor_id', vendedorId)
      .order('orden')
    if (data && data.length > 0) {
      setPerfiles(data)
      const activo = data.find((p: Perfil) => p.es_activo) || data[0]
      setPerfilActivo(activo)
    }
  }

  async function login(username: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error || 'Error de autenticación' }

    const v: Vendedor = data.vendedor
    setVendedor(v)
    localStorage.setItem(SESSION_KEY, JSON.stringify(v))
    await loadPerfiles(v.id)
    return {}
  }

  function logout() {
    setVendedor(null)
    setPerfiles([])
    setPerfilActivo(null)
    localStorage.removeItem(SESSION_KEY)
  }

  function cambiarPerfil(id: string) {
    const p = perfiles.find(x => x.id === id)
    if (p) setPerfilActivo(p)
  }

  async function refreshPerfiles() {
    if (vendedor) await loadPerfiles(vendedor.id)
  }

  const isAdmin = vendedor?.rol === 'admin'

  return (
    <AuthContext.Provider value={{
      vendedor, perfiles, perfilActivo, loading, isAdmin,
      login, logout, cambiarPerfil, refreshPerfiles,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function usePerfilActivo() {
  const { perfilActivo } = useAuth()
  return perfilActivo ?? { nombre: 'Aberturas RG', telefono: '097 699 854' }
}
