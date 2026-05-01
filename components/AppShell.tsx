'use client'

import { useAuth, usePerfilActivo } from '@/lib/auth'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

const TABS = [
  { href: '/',           label: 'Inicio',      icon: '🏠' },
  { href: '/ventanas',   label: 'Ventanas',     icon: '🪟' },
  { href: '/cielorraso', label: 'Cielorraso',   icon: '🏗️' },
  { href: '/yeso',       label: 'Yeso',         icon: '🧱' },
  { href: '/presupuesto',label: 'Presupuesto',  icon: '📋' },
  { href: '/mapa',       label: 'Mapa Fletes',  icon: '🗺️' },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { vendedor, perfiles, perfilActivo, cambiarPerfil, logout } = useAuth()
  const perfil = usePerfilActivo()
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    router.push('/login')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <header style={{
        background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
      }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px' }}>
          <Link href="/" style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--rg-red), var(--rg-red-dark))',
            border: '2px solid var(--rg-yellow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: '#fff',
            letterSpacing: 2, textDecoration: 'none', flexShrink: 0,
            boxShadow: '0 2px 12px rgba(214,40,40,0.4)',
          }}>RG</Link>

          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 18,
              letterSpacing: 3, color: '#fff', lineHeight: 1,
            }}>ABERTURAS RG</div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11,
              color: 'var(--rg-yellow)', textTransform: 'uppercase', letterSpacing: 2,
            }}>Suite de Calculadoras</div>
          </div>

          {/* Perfil selector (solo vendedores) */}
          {vendedor && perfiles.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Perfil:</span>
              <select
                value={perfilActivo?.id || ''}
                onChange={e => cambiarPerfil(e.target.value)}
                style={{
                  background: '#111', border: '1px solid var(--border)', borderRadius: 6,
                  color: 'var(--text)', fontFamily: "'Barlow', sans-serif", fontSize: 12,
                  padding: '4px 8px', outline: 'none', cursor: 'pointer',
                  maxWidth: 180,
                }}
              >
                {perfiles.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} · {p.telefono}</option>
                ))}
              </select>
            </div>
          )}

          {/* User info / login */}
          {vendedor ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                👤 <strong style={{ color: 'var(--text)' }}>{vendedor.nombre}</strong>
              </span>
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent', border: '1px solid #333', borderRadius: 6,
                  color: '#666', fontSize: 11, padding: '4px 10px', cursor: 'pointer',
                  fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: 1,
                }}
              >Salir</button>
            </div>
          ) : (
            <Link href="/login" style={{
              background: 'var(--rg-red)', color: '#fff', borderRadius: 6,
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: 12, textTransform: 'uppercase', letterSpacing: 1,
              padding: '6px 14px', textDecoration: 'none',
            }}>Vendedor →</Link>
          )}
        </div>

        {/* Nav tabs */}
        <nav style={{
          display: 'flex', overflowX: 'auto', gap: 2, padding: '0 12px',
          borderTop: '1px solid #1e1e1e',
        }}>
          {TABS.map(tab => {
            const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
            return (
              <Link key={tab.href} href={tab.href} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '8px 14px', textDecoration: 'none',
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5,
                color: active ? '#fff' : 'var(--muted)',
                borderBottom: active ? '2px solid var(--rg-red)' : '2px solid transparent',
                transition: 'color .15s, border-color .15s',
                whiteSpace: 'nowrap',
              }}>
                <span style={{ fontSize: 14 }}>{tab.icon}</span>
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </header>

      {/* ── Page content ── */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>

      {/* ── WA bottom bar (clientes) ── */}
      {!vendedor && (
        <div style={{
          background: '#111', borderTop: '1px solid var(--border)',
          padding: '10px 16px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
              ¿Listo para hacer tu pedido?
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              Enviá tu presupuesto · Te respondemos al toque
            </div>
          </div>
          <a
            href={`https://wa.me/59897699854`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#25D366', color: '#fff', borderRadius: 8,
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: 14, textTransform: 'uppercase', letterSpacing: 1,
              padding: '10px 20px', textDecoration: 'none', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Enviar a WhatsApp
          </a>
        </div>
      )}
    </div>
  )
}
