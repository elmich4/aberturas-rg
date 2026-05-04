'use client'
import { useState } from 'react'
import { useVendedor } from '@/lib/vendedor-auth'

type Props = { onClose: () => void }

export default function VendedorLoginModal({ onClose }: Props) {
  const { login } = useVendedor()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true); setError('')
    const err = await login(user, pass)
    setLoading(false)
    if (err) { setError(err); return }
    onClose()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1a1a1a', border: '1px solid #2e2e2e',
          borderRadius: 16, width: '100%', maxWidth: 360,
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          animation: 'slideUp .2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '1.2rem 1.5rem', borderBottom: '1px solid #2e2e2e' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg,#D62828,#A01E1E)',
            border: '2px solid #F7B731',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 900, color: '#fff', letterSpacing: 1, flexShrink: 0,
          }}>RG</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Acceso Vendedor</div>
            <div style={{ fontSize: 11, color: '#666' }}>Ingresá tus credenciales</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#555', fontSize: 16, cursor: 'pointer', padding: 4 }}>✕</button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(['Usuario', 'Contraseña'] as const).map((label, i) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</label>
              <input
                type={i === 1 ? 'password' : 'text'}
                value={i === 0 ? user : pass}
                onChange={e => i === 0 ? setUser(e.target.value) : setPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder={i === 0 ? 'tu usuario' : '••••••••'}
                autoComplete={i === 0 ? 'username' : 'current-password'}
                style={{
                  padding: '0.65rem 0.9rem', background: '#111',
                  border: '1.5px solid #2e2e2e', borderRadius: 8,
                  color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit',
                }}
                onFocus={e => { e.target.style.borderColor = '#F7B731' }}
                onBlur={e => { e.target.style.borderColor = '#2e2e2e' }}
              />
            </div>
          ))}

          {error && (
            <div style={{ background: 'rgba(214,40,40,0.15)', border: '1px solid rgba(214,40,40,0.3)', color: '#ff8888', fontSize: 13, padding: '0.5rem 0.8rem', borderRadius: 7 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              background: loading ? '#333' : '#D62828', color: '#fff', border: 'none',
              padding: '0.8rem', borderRadius: 9, fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .15s',
            }}
          >
            {loading ? 'Verificando...' : 'Ingresar →'}
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  )
}
