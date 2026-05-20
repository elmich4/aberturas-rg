'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useCart } from '@/lib/cart-context'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const NAV = [
  { href: '/',         label: '🏠 Inicio'    },
  { href: '/tienda',   label: '🛍️ Tienda'   },
  { href: '/trabajos', label: '🔨 Trabajos'  },
  { href: '/blog',     label: '📰 Novedades' },
  { href: '/contacto', label: '✉️ Contacto'  },
]

type Anuncio = {
  id: string
  texto: string
  link: string | null
  orden: number
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { totalItems, openCart } = useCart()

  // ── Barra de anuncios ──
  const [anuncios, setAnuncios] = useState<Anuncio[]>([])
  const [anuncioIdx, setAnuncioIdx] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    supabase
      .from('anuncios_barra')
      .select('id, texto, link, orden')
      .eq('activo', true)
      .order('orden')
      .then(({ data }) => {
        if (data && data.length > 0) setAnuncios(data)
      })
  }, [])

  // Rotación automática cada 4 segundos
  const siguiente = useCallback(() => {
    if (anuncios.length <= 1) return
    setAnimating(true)
    setTimeout(() => {
      setAnuncioIdx(prev => (prev + 1) % anuncios.length)
      setAnimating(false)
    }, 400)
  }, [anuncios.length])

  useEffect(() => {
    if (anuncios.length <= 1) return
    const timer = setInterval(siguiente, 4000)
    return () => clearInterval(timer)
  }, [anuncios.length, siguiente])

  const anuncioActual = anuncios[anuncioIdx]

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', color: '#1a1a1a', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Barra de anuncios + Navbar (sticky juntos) ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100 }}>

        {/* Barra de anuncios */}
        {anuncios.length > 0 && (
          <div style={{
            background: '#111',
            color: '#fff',
            overflow: 'hidden',
          }}>
            <div style={{
              maxWidth: 1200,
              margin: '0 auto',
              padding: '7px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 32,
            }}>
              <div style={{
                textAlign: 'center',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
                opacity: animating ? 0 : 1,
                transform: animating ? 'translateY(-8px)' : 'translateY(0)',
              }}>
                {anuncioActual?.link ? (
                  <a
                    href={anuncioActual.link}
                    style={{
                      color: '#fff',
                      textDecoration: 'none',
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: 0.8,
                      textTransform: 'uppercase',
                    }}
                  >
                    {anuncioActual.texto}
                    <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>→</span>
                  </a>
                ) : (
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                  }}>
                    {anuncioActual?.texto}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navbar */}
        <header style={{ background: 'rgba(250,250,248,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e8e4df' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', height: 60, gap: 12 }}>

            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
              <img src="/logo.png" alt="RG Mejor Precio" style={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0 }} />
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

            {/* Desktop CTA: teléfono + carrito */}
            <div className="nav-desktop" style={{ gap: 8, alignItems: 'center', flexShrink: 0 }}>
              <a href="tel:+59897699854"
                style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#555', textDecoration: 'none', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', padding: '7px 12px', borderRadius: 7, border: '1px solid #e0e0e0', transition: 'all 0.2s' }}>
                📞 097 699 854
              </a>
              <button
                onClick={openCart}
                style={{
                  position: 'relative',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 40, height: 40, borderRadius: 10,
                  background: totalItems > 0 ? '#D62828' : 'transparent',
                  color: totalItems > 0 ? 'white' : '#555',
                  border: totalItems > 0 ? 'none' : '1px solid #e0e0e0',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                aria-label="Abrir carrito"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {totalItems > 0 && (
                  <span style={{
                    position: 'absolute', top: -5, right: -5,
                    background: '#111', color: 'white',
                    fontSize: 10, fontWeight: 800,
                    minWidth: 18, height: 18, borderRadius: 9,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 4px', border: '2px solid #FAFAF8',
                  }}>
                    {totalItems}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile: carrito + hamburger */}
            <div className="nav-mobile" style={{ marginLeft: 'auto', gap: 8, alignItems: 'center' }}>
              <button
                onClick={openCart}
                style={{
                  position: 'relative',
                  width: 36, height: 36, borderRadius: '50%',
                  background: totalItems > 0 ? '#D62828' : '#f0f0f0',
                  color: totalItems > 0 ? 'white' : '#555',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
                aria-label="Abrir carrito"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {totalItems > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    background: '#111', color: 'white',
                    fontSize: 9, fontWeight: 800,
                    minWidth: 16, height: 16, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 3px', border: '2px solid white',
                  }}>
                    {totalItems}
                  </span>
                )}
              </button>
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
              <a href="tel:+59897699854" style={{ display: 'block', padding: '12px 4px', textDecoration: 'none', fontSize: 16, color: '#555', borderBottom: '1px solid #f5f5f5' }}>
                📞 097 699 854
              </a>
            </div>
          )}
        </header>
      </div>

      {/* Page content */}
      <main>{children}</main>

      {/* ── Footer ── */}
      <footer style={{ background: '#111', color: '#aaa', marginTop: 80 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 20px 28px' }}>
          <div className="grid-auto" style={{ marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <img src="/logo.png" alt="RG Mejor Precio" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: '#fff' }}>Aberturas RG</div>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: '#888', maxWidth: 260 }}>Especialistas en aberturas de aluminio y PVC. Ventanas, puertas, rejas y cielorrasos a medida.</p>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#F7B731', marginBottom: 14 }}>Empresa</div>
              {[['Tienda', '/tienda'], ['Nuestros trabajos', '/trabajos'], ['Novedades', '/blog'], ['Contacto', '/contacto']].map(([l, h]) => (
                <div key={h} style={{ marginBottom: 6 }}><Link href={h} style={{ color: '#888', textDecoration: 'none', fontSize: 13 }}>{l}</Link></div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#F7B731', marginBottom: 14 }}>Contacto</div>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>📍 Montevideo, Uruguay</div>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>🕐 Lun–Vie 9:00–18:00</div>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>📞 097 699 854</div>
              <Link href="/contacto"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#D62828', color: '#fff', borderRadius: 6, padding: '8px 14px', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                ✉️ Contactanos
              </Link>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #222', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 11, color: '#555', textAlign: 'center', lineHeight: 1.7 }}>
              FP Fabricación Propia SAS · RUT: 220035290010 · Av. de las Instrucciones 2248, Montevideo, Uruguay
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 12, color: '#555' }}>© 2026 Aberturas RG. Todos los derechos reservados.</div>
              <div style={{ fontSize: 12, color: '#555' }}>Montevideo · Todo Uruguay</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
