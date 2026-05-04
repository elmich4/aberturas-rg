'use client'
import PublicLayout from '@/components/public/PublicLayout'
import Link from 'next/link'
import Resenas from '@/components/Resenas'

const SERVICIOS = [
  { icon: '🪟', title: 'Ventanas & Puertas',  desc: 'Serie 20, Serie 25, Modena, Colonial, Guillotina. Aluminio de alta resistencia con vidrio simple, doble o DVH.', href: '/ventanas' },
  { icon: '🏠', title: 'Cielorraso PVC',       desc: 'Tablillas de 6 a 10mm, con o sin aislación. Instalación prolija y duradera para cualquier ambiente.', href: '/cielorraso' },
  { icon: '🧱', title: 'Yeso / Durlock',       desc: 'Cielorrasos y tabiques de placa. Terminación perfecta, aislación acústica y térmica garantizada.', href: '/yeso' },
  { icon: '🔒', title: 'Rejas & Seguridad',    desc: 'Rejas fijas y puertas reja en varillas de 12mm y 16mm. Protección sin sacrificar el diseño.', href: '/ventanas' },
  { icon: '🎨', title: 'Persianas',             desc: 'PVC blanco, aluminio en varios colores, imitación madera. Enrollables y de accionamiento manual.', href: '/ventanas' },
  { icon: '📐', title: 'Medida a pedido',       desc: 'Cada abertura se fabrica a la medida exacta de tu vano. Sin compromisos ni adaptaciones.', href: '/contacto' },
]

const STATS = [
  { num: '15+',   label: 'Años de experiencia'      },
  { num: '2000+', label: 'Instalaciones realizadas'  },
  { num: '100%',  label: 'Medida a pedido'           },
  { num: 'UY',    label: 'Cobertura nacional'        },
]

const PORQUES = [
  { title: 'Precio justo',       desc: 'Sin intermediarios. Fabricamos y colocamos nosotros mismos.' },
  { title: 'Garantía escrita',   desc: 'Si algo falla, volvemos sin costo adicional.' },
  { title: 'Presupuesto online', desc: 'Calculá el costo en minutos, sin esperar una visita.' },
  { title: 'Cobertura total',    desc: 'Instalamos en todo Uruguay. Coordinamos la logística.' },
]

export default function HomePage() {
  return (
    <PublicLayout>

      {/* ── HERO ── */}
      <section className="hero-section" style={{ display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg,#FAFAF8 0%,#f5f0eb 100%)', position: 'relative', overflow: 'hidden', padding: '48px 20px' }}>
        <div style={{ position: 'absolute', right: -80, top: -80, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(214,40,40,.07) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <div className="grid-2col">
            {/* Text */}
            <div>
              <div style={{ display: 'inline-block', background: 'rgba(214,40,40,.08)', color: '#D62828', borderRadius: 4, padding: '4px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20, border: '1px solid rgba(214,40,40,.15)' }}>
                Aberturas de aluminio y PVC
              </div>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize: 'clamp(38px,5vw,66px)', fontWeight: 900, lineHeight: 1.08, color: '#1a1a1a', margin: '0 0 20px' }}>
                Tu hogar,<br /><em style={{ color: '#D62828', fontStyle: 'italic' }}>bien cerrado.</em>
              </h1>
              <p style={{ fontSize: 'clamp(15px,2vw,18px)', lineHeight: 1.75, color: '#555', maxWidth: 460, margin: '0 0 32px' }}>
                Ventanas, puertas, rejas y cielorrasos a medida. Instalación profesional en todo Uruguay con más de 15 años de experiencia.
              </p>
              <div className="hero-btns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/presupuesto" style={{ background: '#D62828', color: '#fff', borderRadius: 10, padding: '14px 26px', textDecoration: 'none', fontFamily:"'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1, boxShadow: '0 4px 16px rgba(214,40,40,.35)' }}>
                  Pedir presupuesto →
                </Link>
                <a href="https://wa.me/59897699854" target="_blank" rel="noopener noreferrer"
                  style={{ background: 'transparent', color: '#1a1a1a', border: '2px solid #1a1a1a', borderRadius: 10, padding: '14px 26px', textDecoration: 'none', fontFamily:"'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
                  💬 WhatsApp
                </a>
              </div>
            </div>

            {/* Stats card — hidden on mobile */}
            <div className="hero-stats-card" style={{ background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,.1)', padding: 40, border: '1px solid #f0ebe4' }}>
              <div className="grid-2col-sm">
                {STATS.map(s => (
                  <div key={s.num} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize: 44, fontWeight: 900, color: '#D62828', lineHeight: 1, marginBottom: 6 }}>{s.num}</div>
                    <div style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #f0ebe4', marginTop: 28, paddingTop: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>¿Necesitás un presupuesto ahora?</div>
                <a href="https://wa.me/59897699854?text=Hola!%20Necesito%20un%20presupuesto" target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', borderRadius: 8, padding: '10px 20px', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                  💬 Escribinos ahora
                </a>
              </div>
            </div>
          </div>

          {/* Mobile stats row */}
          <div className="nav-mobile" style={{ gap: 0, marginTop: 32, background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #ede8e2' }}>
            {STATS.map((s, i) => (
              <div key={s.num} style={{ flex: 1, textAlign: 'center', padding: '14px 8px', borderRight: i < STATS.length - 1 ? '1px solid #ede8e2' : 'none' }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: '#D62828', lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: 10, color: '#888', marginTop: 3, lineHeight: 1.3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section className="section-pad" style={{ padding: '72px 20px', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: '#D62828', marginBottom: 12 }}>Lo que hacemos</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize: 'clamp(28px,4vw,46px)', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
              Soluciones completas<br /><em style={{ color: '#D62828' }}>para tu obra</em>
            </h2>
          </div>
          <div className="grid-auto">
            {SERVICIOS.map(s => (
              <Link key={s.title} href={s.href} style={{ textDecoration: 'none', display: 'block', background: '#FAFAF8', borderRadius: 16, border: '1px solid #ede8e2', padding: 24, transition: 'all .2s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 12px 32px rgba(0,0,0,.08)'; el.style.borderColor = '#D62828' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; el.style.borderColor = '#ede8e2' }}>
                <div style={{ fontSize: 34, marginBottom: 14 }}>{s.icon}</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: '#777', lineHeight: 1.7, marginBottom: 12 }}>{s.desc}</div>
                <div style={{ fontSize: 13, color: '#D62828', fontWeight: 600 }}>Ver precios →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>



      {/* ── POR QUÉ ── */}
      <section className="section-pad" style={{ padding: '72px 20px', background: '#FAFAF8' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="grid-2col" style={{ alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: '#D62828', marginBottom: 12 }}>Por qué elegirnos</div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 700, color: '#1a1a1a', margin: '0 0 28px', lineHeight: 1.2 }}>
                Más de 15 años<br />haciendo bien las cosas
              </h2>
              <p style={{ fontSize: 15, color: '#666', lineHeight: 1.85, marginBottom: 24 }}>
                Somos una empresa familiar que empezó con un taller y hoy cubre todo el país. Cada trabajo lo hacemos como si fuera nuestra propia casa.
              </p>
              <a href="https://wa.me/59897699854" target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#D62828', textDecoration: 'none', fontWeight: 700, fontSize: 15, borderBottom: '2px solid #D62828', paddingBottom: 2 }}>
                Hablemos por WhatsApp →
              </a>
            </div>
            <div className="grid-2col-sm">
              {PORQUES.map((p,i) => (
                <div key={p.title} style={{ background: '#fff', borderRadius: 14, border: '1px solid #ede8e2', padding: 22, marginTop: i%2===1?20:0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(214,40,40,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#D62828' }} />
                  </div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>{p.title}</div>
                  <div style={{ fontSize: 13, color: '#777', lineHeight: 1.65 }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── RESEÑAS ── */}
      <Resenas />

      {/* ── PROCESO ── */}
      <section className="section-pad" style={{ padding: '72px 20px', background: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: '#D62828', marginBottom: 12 }}>Cómo funciona</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 700, color: '#1a1a1a', margin: '0 0 48px' }}>Del presupuesto a la instalación</h2>
          <div className="grid-4col" style={{ position: 'relative' }}>
            {[
              { num: '01', title: 'Calculás', desc: 'Precio al instante en nuestra calculadora' },
              { num: '02', title: 'Consultás', desc: 'Confirmás por WhatsApp' },
              { num: '03', title: 'Fabricamos', desc: 'A medida exacta en nuestro taller' },
              { num: '04', title: 'Instalamos', desc: 'Coordinamos día y horario' },
            ].map(paso => (
              <div key={paso.num} style={{ textAlign: 'center', padding: '0 12px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#D62828', color: '#fff', fontFamily:"'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 4px 14px rgba(214,40,40,.3)' }}>{paso.num}</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>{paso.title}</div>
                <div style={{ fontSize: 13, color: '#777', lineHeight: 1.6 }}>{paso.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="section-pad" style={{ padding: '56px 20px', background: '#FAFAF8', borderTop: '1px solid #ede8e2', textAlign: 'center' }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize: 'clamp(24px,3vw,38px)', fontWeight: 700, color: '#1a1a1a', margin: '0 0 14px' }}>¿Tenés un proyecto en mente?</h2>
        <p style={{ fontSize: 16, color: '#666', marginBottom: 28 }}>Escribinos y te respondemos en minutos.</p>
        <a href="https://wa.me/59897699854?text=Hola!%20Necesito%20un%20presupuesto" target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#25D366', color: '#fff', borderRadius: 12, padding: '15px 30px', textDecoration: 'none', fontWeight: 700, fontSize: 17, boxShadow: '0 6px 24px rgba(37,211,102,.35)' }}>
          💬 Escribir por WhatsApp
        </a>
      </section>

    </PublicLayout>
  )
}
