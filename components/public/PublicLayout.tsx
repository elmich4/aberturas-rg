'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV = [
  { href: '/',         label: 'Inicio'     },
  { href: '/nosotros', label: 'Nosotros'   },
  { href: '/trabajos', label: 'Trabajos'   },
  { href: '/blog',     label: 'Novedades'  },
  { href: '/tienda',   label: '🛍️ Tienda' },
  { href: '/contacto', label: 'Contacto'   },
]

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', color: '#1a1a1a', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Navbar ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(250,250,248,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e8e4df' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', height: 60, gap: 12 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#D62828,#A01E1E)', border: '2px solid #F7B731', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily:"'Bebas Neue',sans-serif", fontSize: 13, color: '#fff', letterSpacing: 2, flexShrink: 0 }}>RG</div>
            <div className="hide-mobile">
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>Aberturas RG</div>
              <div style={{ fontSize: 9, color: '#D62828', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600 }}>Uruguay</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="nav-desktop" style={{ gap: 2, marginLeft: 24, flex: 1 }}>
            {NAV.map(n => {
              const active = pathname === n.href
              return (
                <Link key={n.href} href={n.href} style={{ padding: '6px 12px', borderRadius: 6, textDecoration: 'none', fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#D62828' : '#555', background: active ? 'rgba(214,40,40,0.06)' : 'transparent', whiteSpace: 'nowrap' }}>
                  {n.label}
                </Link>
              )
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="nav-desktop" style={{ gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <a href="https://wa.me/59897699854" target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#25D366', color: '#fff', borderRadius: 7, padding: '7px 14px', textDecoration: 'none', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              097 699 854
            </a>
            <Link href="/calculadoras" style={{ background: '#D62828', color: '#fff', borderRadius: 7, padding: '7px 14px', textDecoration: 'none', fontFamily:"'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>
              Calculadoras →
            </Link>
          </div>

          {/* Mobile: WA + hamburger */}
          <div className="nav-mobile" style={{ marginLeft: 'auto', gap: 8, alignItems: 'center' }}>
            <a href="https://wa.me/59897699854" target="_blank" rel="noopener noreferrer"
              style={{ width: 36, height: 36, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
            <button onClick={() => setMobileOpen(!mobileOpen)}
              style={{ width: 36, height: 36, background: 'transparent', border: '1px solid #e0e0e0', borderRadius: 8, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 8, flexShrink: 0 }}>
              <div style={{ width: 18, height: 2, background: mobileOpen ? '#D62828' : '#1a1a1a', borderRadius: 2, transition: 'all .2s', transform: mobileOpen ? 'rotate(45deg) translateY(6px)' : 'none' }} />
              <div style={{ width: 18, height: 2, background: '#1a1a1a', borderRadius: 2, opacity: mobileOpen ? 0 : 1, transition: 'opacity .2s' }} />
              <div style={{ width: 18, height: 2, background: mobileOpen ? '#D62828' : '#1a1a1a', borderRadius: 2, transition: 'all .2s', transform: mobileOpen ? 'rotate(-45deg) translateY(-6px)' : 'none' }} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid #e8e4df', padding: '8px 16px 16px' }}>
            {NAV.map(n => {
              const active = pathname === n.href
              return (
                <Link key={n.href} href={n.href} onClick={() => setMobileOpen(false)}
                  style={{ display: 'block', padding: '12px 4px', textDecoration: 'none', fontSize: 16, fontWeight: active ? 700 : 400, color: active ? '#D62828' : '#1a1a1a', borderBottom: '1px solid #f5f5f5' }}>
                  {n.label}
                </Link>
              )
            })}
            <Link href="/calculadoras" onClick={() => setMobileOpen(false)}
              style={{ display: 'block', marginTop: 12, background: '#D62828', color: '#fff', borderRadius: 10, padding: '13px 20px', textDecoration: 'none', fontFamily:"'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>
              Calculadoras →
            </Link>
          </div>
        )}
      </header>

      {/* Page content */}
      <main>{children}</main>

      {/* ── Footer ── */}
      <footer style={{ background: '#111', color: '#aaa', marginTop: 80 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 20px 28px' }}>
          <div className="grid-auto" style={{ marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#D62828,#A01E1E)', border: '2px solid #F7B731', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily:"'Bebas Neue',sans-serif", fontSize: 12, color: '#fff', letterSpacing: 2 }}>RG</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: '#fff' }}>Aberturas RG</div>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: '#888', maxWidth: 260 }}>Especialistas en aberturas de aluminio y PVC. Ventanas, puertas, rejas y cielorrasos a medida.</p>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#F7B731', marginBottom: 14 }}>Calculadoras</div>
              {[['Ventanas', '/ventanas'], ['Cielorraso PVC', '/cielorraso'], ['Yeso / Durlock', '/yeso'], ['Presupuesto general', '/presupuesto'], ['Mapa de fletes', '/mapa']].map(([l, h]) => (
                <div key={h} style={{ marginBottom: 6 }}><Link href={h} style={{ color: '#888', textDecoration: 'none', fontSize: 13 }}>{l}</Link></div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#F7B731', marginBottom: 14 }}>Empresa</div>
              {[['Nosotros', '/nosotros'], ['Nuestros trabajos', '/trabajos'], ['Novedades', '/blog'], ['Contacto', '/contacto']].map(([l, h]) => (
                <div key={h} style={{ marginBottom: 6 }}><Link href={h} style={{ color: '#888', textDecoration: 'none', fontSize: 13 }}>{l}</Link></div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#F7B731', marginBottom: 14 }}>Contacto</div>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>📍 Montevideo, Uruguay</div>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>🕐 Lun–Vie 9:00–18:00</div>
              <a href="https://wa.me/59897699854" target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#25D366', color: '#fff', borderRadius: 6, padding: '8px 14px', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                💬 097 699 854
              </a>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #222', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 12, color: '#555' }}>© 2026 Aberturas RG. Todos los derechos reservados.</div>
            <div style={{ fontSize: 12, color: '#555' }}>Montevideo · Todo Uruguay</div>
          </div>
        </div>
      </footer>

      {/* Floating WA */}
      <a href="https://wa.me/59897699854" target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 200, width: 52, height: 52, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37,211,102,.5)' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
    </div>
  )
}
