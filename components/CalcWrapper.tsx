'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Props = { src: string; title: string; icon: string }
type Vendedor = { nombre: string; usuario: string; telefono?: string }

const CALCS = [
  { href: '/ventanas',   icon: '🪟', label: 'Ventanas'   },
  { href: '/cielorraso', icon: '🏠', label: 'Cielorraso' },
  { href: '/yeso',       icon: '🏗️', label: 'Yeso'       },
]

export default function CalcWrapper({ src, title, icon }: Props) {
  const pathname = usePathname()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [vendedor, setVendedor] = useState<Vendedor | null>(null)
  const [loginModal, setLoginModal] = useState(false)
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const iframeSrc = vendedor
    ? `${src}?session=vendedor&nombre=${encodeURIComponent(vendedor.nombre)}&tel=${encodeURIComponent(vendedor.telefono || '097699854')}`
    : src

  const handleLogin = async () => {
    setLoginLoading(true); setLoginError('')
    const { data, error } = await supabase
      .from('vendedores').select('*')
      .eq("username", loginUser.trim())
      .eq("password", loginPass)
      .single()
    setLoginLoading(false)
    if (error || !data) { setLoginError('Usuario o contraseña incorrectos'); return }
    setVendedor({ nombre: data.nombre, usuario: data.username, telefono: data.telefono })
    setLoginModal(false); setLoginUser(''); setLoginPass('')
  }

  const handleLogout = () => {
    setVendedor(null)
  }

  const injectCSS = (iframe: HTMLIFrameElement) => {
    try {
      const doc = iframe.contentDocument
      if (!doc) return
      const style = doc.createElement('style')
      style.textContent = `
        #user-bar { display: none !important; }
        .app-header { display: none !important; }
      `
      doc.head.appendChild(style)
    } catch {}
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f0f0f', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Top bar ── */}
      <header style={{
        height: 52, flexShrink: 0,
        background: '#111', borderBottom: '1px solid #1e1e1e',
        display: 'flex', alignItems: 'center',
        padding: '0 12px', gap: 10, zIndex: 50,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg,#D62828,#A01E1E)',
            border: '2px solid #F7B731',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Bebas Neue',sans-serif", fontSize: 11, color: '#fff', letterSpacing: 2,
          }}>RG</div>
        </Link>

        <div style={{ width: 1, height: 24, background: '#2a2a2a', flexShrink: 0 }} />

        {/* Título */}
        <span style={{ fontSize: 13, fontWeight: 700, color: '#F7B731', whiteSpace: 'nowrap' }}>
          {icon} {title}
        </span>

        {/* Nav calculadoras */}
        <nav style={{ display: 'flex', gap: 2, marginLeft: 8, flex: 1, overflowX: 'auto' }}>
          {CALCS.map(c => {
            const active = pathname === c.href
            return (
              <Link key={c.href} href={c.href} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 6, textDecoration: 'none',
                fontSize: 12, fontWeight: active ? 700 : 400,
                color: active ? '#111' : '#666',
                background: active ? '#F7B731' : 'transparent',
                whiteSpace: 'nowrap', flexShrink: 0, transition: 'all .15s',
              }}>
                <span>{c.icon}</span>
                <span style={{ display: 'none' }} className="hide-mobile-calc">{c.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Derecha: login/logout + WA */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          {!vendedor ? (
            <button
              onClick={() => setLoginModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(247,183,49,0.12)',
                border: '1px solid rgba(247,183,49,0.3)',
                color: '#F7B731',
                borderRadius: 6, padding: '5px 12px',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all .15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(247,183,49,0.25)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(247,183,49,0.12)' }}
            >
              🔑 Vendedor
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#6ec8a0', fontWeight: 600 }}>✓ {vendedor.nombre}</span>
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(214,40,40,0.15)', border: '1px solid rgba(214,40,40,0.3)',
                  color: '#ff8888', borderRadius: 6, padding: '4px 10px',
                  fontSize: 11, cursor: 'pointer', transition: 'all .15s',
                }}
              >
                Salir
              </button>
            </div>
          )}

          <a href="https://wa.me/59897699854" target="_blank" rel="noopener noreferrer" style={{
            width: 30, height: 30, borderRadius: '50%', background: '#25D366',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
            </svg>
          </a>
        </div>
      </header>

      {/* ── iframe ── */}
      <iframe
        key={iframeSrc}
        ref={iframeRef}
        src={iframeSrc}
        title={title}
        style={{ flex: 1, border: 'none', width: '100%', display: 'block' }}
        allow="clipboard-write"
        onLoad={(e) => injectCSS(e.target as HTMLIFrameElement)}
      />

      {/* ── Modal login ── */}
      {loginModal && (
        <div
          onClick={() => setLoginModal(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
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
            {/* Header modal */}
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
              <button
                onClick={() => setLoginModal(false)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#555', fontSize: 16, cursor: 'pointer', padding: 4 }}
              >✕</button>
            </div>

            {/* Body modal */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Usuario</label>
                <input
                  value={loginUser}
                  onChange={e => setLoginUser(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="tu usuario"
                  autoComplete="username"
                  style={{
                    padding: '0.65rem 0.9rem', background: '#111',
                    border: '1.5px solid #2e2e2e', borderRadius: 8,
                    color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#F7B731' }}
                  onBlur={e => { e.target.style.borderColor = '#2e2e2e' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Contraseña</label>
                <input
                  type="password"
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    padding: '0.65rem 0.9rem', background: '#111',
                    border: '1.5px solid #2e2e2e', borderRadius: 8,
                    color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#F7B731' }}
                  onBlur={e => { e.target.style.borderColor = '#2e2e2e' }}
                />
              </div>

              {loginError && (
                <div style={{ background: 'rgba(214,40,40,0.15)', border: '1px solid rgba(214,40,40,0.3)', color: '#ff8888', fontSize: 13, padding: '0.5rem 0.8rem', borderRadius: 7 }}>
                  {loginError}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loginLoading}
                style={{
                  background: loginLoading ? '#333' : '#D62828',
                  color: '#fff', border: 'none', padding: '0.8rem',
                  borderRadius: 9, fontSize: 14, fontWeight: 700,
                  cursor: loginLoading ? 'not-allowed' : 'pointer',
                  transition: 'background .15s',
                }}
              >
                {loginLoading ? 'Verificando...' : 'Ingresar →'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (min-width: 640px) {
          .hide-mobile-calc { display: inline !important; }
        }
      `}</style>
    </div>
  )
}
