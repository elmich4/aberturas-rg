'use client'
import PublicLayout from '@/components/public/PublicLayout'
import Link from 'next/link'

const CALCS = [
  { href: '/ventanas',    icon: '🪟', title: 'Ventanas',            sub: 'Aberturas, monoblocks, rejas, persianas',  color: '#D62828' },
  { href: '/cielorraso',  icon: '🏠', title: 'Cielorraso PVC',      sub: 'Tablillas, perfilería, aislaciones',       color: '#2196F3' },
  { href: '/yeso',        icon: '🧱', title: 'Yeso / Durlock',      sub: 'Cielorraso, tabique, omega',               color: '#9C27B0' },
  { href: '/presupuesto', icon: '📋', title: 'Presupuesto General', sub: 'Lista libre de ítems · catálogo completo', color: '#F7B731' },
  { href: '/mapa',        icon: '🗺️', title: 'Mapa de Fletes',      sub: 'Costos por barrio · Montevideo',           color: '#4CAF50' },
]

export default function CalculadorasPage() {
  return (
    <PublicLayout>
      <section style={{
        minHeight: '80vh', display: 'flex', alignItems: 'center',
        background: 'linear-gradient(135deg,#FAFAF8 0%,#f5f0eb 100%)',
        padding: '60px 24px',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto', width: '100%' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#D62828,#A01E1E)', border: '3px solid #F7B731', marginBottom: 16, boxShadow: '0 6px 24px rgba(214,40,40,.35)' }}>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: '#fff', letterSpacing: 2 }}>RG</span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#1a1a1a', margin: '0 0 10px', lineHeight: 1.1 }}>
              Suite de Calculadoras
            </h1>
            <p style={{ fontSize: 16, color: '#777', margin: 0 }}>Calculá el precio de tu proyecto en minutos, sin esperar visita.</p>
          </div>

          {/* Grid */}
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:24, marginBottom: 32 }}>
            {CALCS.map(c => (
              <Link key={c.href} href={c.href} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '18px 20px',
                background: '#fff',
                border: `1px solid #ede8e2`,
                borderRadius: 14, textDecoration: 'none', color: '#1a1a1a',
                transition: 'all .2s cubic-bezier(.2,.7,.3,1)',
                boxShadow: '0 2px 12px rgba(0,0,0,.06)',
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = c.color; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = `0 8px 24px ${c.color}25` }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = '#ede8e2'; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 2px 12px rgba(0,0,0,.06)' }}
              >
                <span style={{ fontSize: 30, flexShrink: 0, width: 44, textAlign: 'center' }}>{c.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 17, textTransform: 'uppercase', letterSpacing: 1, color: '#1a1a1a', marginBottom: 2 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{c.sub}</div>
                </div>
                <span style={{ color: '#ccc', fontSize: 18, flexShrink: 0 }}>→</span>
              </Link>
            ))}
          </div>

          {/* Footer note */}
          <div style={{ textAlign: 'center', fontSize: 13, color: '#aaa' }}>
            📞 <strong style={{ color: '#D62828' }}>097 699 854</strong> · Aberturas RG, Uruguay
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
