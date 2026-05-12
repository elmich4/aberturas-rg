'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    searchParams.get('error') === 'no-admin'
      ? 'Este usuario no tiene permisos de administrador.'
      : null
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos.'
          : authError.message
      )
      setLoading(false)
      return
    }

    // Login exitoso → redirigir al admin
    router.push('/admin')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f0f0f',
      fontFamily: "'DM Sans', sans-serif",
      padding: 20,
    }}>
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #2e2e2e',
        borderRadius: 20,
        padding: 40,
        maxWidth: 400,
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src="/logo.png"
            alt="RG Mejor Precio"
            style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 16 }}
          />
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 20,
            fontWeight: 700,
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}>
            Panel Admin
          </div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
            Aberturas RG · Uruguay
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(214,40,40,0.1)',
            border: '1px solid rgba(214,40,40,0.3)',
            color: '#D62828',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 20,
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: '#888',
              marginBottom: 6,
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#111',
                border: '1px solid #2e2e2e',
                borderRadius: 8,
                color: '#f0f0f0',
                fontSize: 14,
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: '#888',
              marginBottom: 6,
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#111',
                border: '1px solid #2e2e2e',
                borderRadius: 8,
                color: '#f0f0f0',
                fontSize: 14,
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#333' : '#D62828',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: 16,
              textTransform: 'uppercase',
              letterSpacing: 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#444' }}>
          Acceso restringido a administradores
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f', color: '#888' }}>
        Cargando...
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
