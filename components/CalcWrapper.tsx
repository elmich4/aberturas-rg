'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

type Props = {
  src: string
  title: string
  icon: string
}

const CALCS = [
  { href: '/ventanas',   icon: '🪟', label: 'Ventanas'    },
  { href: '/cielorraso', icon: '🏠', label: 'Cielorraso'  },
  { href: '/yeso',       icon: '🏗️', label: 'Yeso'        },
]

export default function CalcWrapper({ src, title, icon }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f0f0f', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Top bar ── */}
      <header style={{
        height: 52, flexShrink: 0,
        background: '#111',
        borderBottom: '1px solid #1e1e1e',
        display: 'flex', alignItems: 'center',
        padding: '0 12px', gap: 10, zIndex: 50,
      }}>
        {/* Logo / back */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg,#D62828,#A01E1E)',
            border: '2px solid #F7B731',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Bebas Neue',sans-serif", fontSize: 11, color: '#fff', letterSpacing: 2,
          }}>RG</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', display: 'none' }} className="hide-mobile">
            Aberturas RG
          </span>
        </Link>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: '#2a2a2a', flexShrink: 0 }} />

        {/* Current calc title */}
        <span style={{ fontSize: 13, fontWeight: 700, color: '#F7B731', whiteSpace: 'nowrap' }}>
          {icon} {title}
        </span>

        {/* Desktop nav pills */}
        <nav style={{ display: 'flex', gap: 2, marginLeft: 8, flex: 1, overflowX: 'auto' }}>
          {CALCS.map(c => {
            const active = pathname === c.href
            return (
              <Link key={c.href} href={c.href} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px',
                borderRadius: 6,
                textDecoration: 'none',
                fontSize: 12,
                fontWeight: active ? 700 : 400,
                color: active ? '#111' : '#666',
                background: active ? '#F7B731' : 'transparent',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all .15s',
              }}>
                <span>{c.icon}</span>
                <span className="hide-mobile">{c.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right: site link + WA */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          <Link href="/calculadoras" style={{
            fontSize: 11, color: '#555', textDecoration: 'none',
            padding: '4px 8px', border: '1px solid #2a2a2a', borderRadius: 6,
            whiteSpace: 'nowrap',
          }}>
            ← Menú
          </Link>
          <a href="https://wa.me/59897699854" target="_blank" rel="noopener noreferrer" style={{
            width: 30, height: 30, borderRadius: '50%',
            background: '#25D366',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        </div>
      </header>

      {/* ── iframe ── */}
      <iframe
        src={src}
        title={title}
        style={{
          flex: 1,
          border: 'none',
          width: '100%',
          display: 'block',
        }}
        allow="clipboard-write"
        onLoad={(e) => {
          try {
            const doc = (e.target as HTMLIFrameElement).contentDocument
            if (!doc) return
            const style = doc.createElement('style')
            // Ocultar header propio del HTML y barra de usuario
            style.textContent = `
              #user-bar { display: none !important; }
              .app-header { display: none !important; }
            `
            doc.head.appendChild(style)
          } catch {}
        }}
      />
    </div>
  )
}
