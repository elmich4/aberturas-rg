'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const res = await login(user.trim(), pass)
    setLoading(false)
    if (res.error) { setError(res.error); return }
    router.push('/')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at top left,rgba(214,40,40,.12) 0%,transparent 50%),radial-gradient(ellipse at bottom right,rgba(247,183,49,.06) 0%,transparent 50%),#0f0f0f', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#D62828,#A01E1E)', border: '3px solid #F7B731', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily:"'Bebas Neue',sans-serif", fontSize: 22, color: '#fff', letterSpacing: 2, margin: '0 auto 12px', boxShadow: '0 6px 24px rgba(214,40,40,.4)' }}>RG</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: 4 }}>ABERTURAS RG</div>
          <div style={{ fontSize: 11, color: '#F7B731', fontFamily:"'Barlow Condensed',sans-serif", textTransform: 'uppercase', letterSpacing: 3, marginTop: 2 }}>Acceso Vendedor</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 14, padding: 28 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 5 }}>Usuario</label>
            <input value={user} onChange={e => setUser(e.target.value)} placeholder="tu usuario"
              style={{ width: '100%', background: '#111', border: '1px solid #2e2e2e', borderRadius: 7, color: '#f0f0f0', fontFamily: 'inherit', fontSize: 14, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#F7B731'}
              onBlur={e => e.target.style.borderColor = '#2e2e2e'}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 5 }}>Contraseña</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••"
              style={{ width: '100%', background: '#111', border: '1px solid #2e2e2e', borderRadius: 7, color: '#f0f0f0', fontFamily: 'inherit', fontSize: 14, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#F7B731'}
              onBlur={e => e.target.style.borderColor = '#2e2e2e'}
            />
          </div>
          {error && <div style={{ background: 'rgba(214,40,40,.15)', border: '1px solid rgba(214,40,40,.3)', borderRadius: 6, color: '#ff8080', fontSize: 12, padding: '8px 12px', marginBottom: 16 }}>❌ {error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#333' : '#D62828', color: '#fff', border: 'none', borderRadius: 8, fontFamily:"'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 15, textTransform: 'uppercase', letterSpacing: 1, padding: '12px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .15s' }}>
            {loading ? 'Verificando...' : 'Ingresar →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link href="/" style={{ fontSize: 12, color: '#555', textDecoration: 'none' }}>← Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}
