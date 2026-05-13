'use client'
import { useEffect, useState } from 'react'
import PublicLayout from '@/components/public/PublicLayout'
import Link from 'next/link'
import Resenas from '@/components/Resenas'
import HeroSlider from '@/components/HeroSlider'
import UbicacionSection from '@/components/UbicacionSection'
import { supabase } from '@/lib/supabase'

const PORQUES = [
  { title: 'Precio justo',       desc: 'Sin intermediarios. Fabricamos y colocamos nosotros mismos.' },
  { title: 'Garantía escrita',   desc: 'Si algo falla, volvemos sin costo adicional.' },
  { title: 'Presupuesto online', desc: 'Consultá el costo por WhatsApp, sin esperar una visita.' },
  { title: 'Envios a TODO EL PAIS',    desc: 'Enviamos a todo el país, o para retirar en nuestro local.' },
]

const CATEGORIAS = [
  { nombre: 'Ventanas', slug: 'ventanas', d: 'M10 10h44v44H10zM32 10v44M10 32h44M21 16v10M43 16v10M21 38v10M43 38v10' },
  { nombre: 'Puertas Exteriores', slug: 'puertas-exteriores', d: 'M14 6h36v52H14zM41 32a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM20 12h10v16H20zM34 12h10v16H34zM8 58h48' },
  { nombre: 'Puertas Interiores', slug: 'puertas-interiores', d: 'M16 6h32v52H16zM40 32a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM16 6v52M8 58h48' },
  { nombre: 'PVC', slug: 'pvc', d: 'M10 10h44v44H10zM17 17h30v30H17zM10 10l7 7M54 10l-7 7M10 54l7-7M54 54l-7-7' },
  { nombre: 'Placas de Yeso', slug: 'placas-de-yeso', d: 'M8 14h48v36H8zM8 26h48M8 38h48M24 14v36M40 14v36' },
  { nombre: 'Perfilería', slug: 'perfileria', d: 'M10 10h8v44h-8zM24 10h6v44h-6zM36 10h10v44H36zM52 10h4v44h-4zM6 54h52' },
]

// Defaults si Supabase no tiene datos aún
const DEFAULTS: Record<string, string> = {
  'hero__badge':         'Aberturas de aluminio y PVC',
  'hero__titulo_linea1': 'Tu hogar,',
  'hero__titulo_linea2': 'bien cerrado.',
  'hero__subtitulo':     'Ventanas, puertas, rejas y cielorrasos a medida. Instalación profesional en todo Uruguay con más de 15 años de experiencia.',
  'stats__stat1_num':    '15+',
  'stats__stat1_label':  'Años de experiencia',
  'stats__stat2_num':    '2000+',
  'stats__stat2_label':  'Instalaciones realizadas',
  'stats__stat3_num':    '100%',
  'stats__stat3_label':  'Medida a pedido',
  'stats__stat4_num':    'UY',
  'stats__stat4_label':  'Cobertura nacional',
}

export default function HomePage() {
  const [content, setContent] = useState<Record<string, string>>(DEFAULTS)

  useEffect(() => {
    supabase.from('contenido').select('seccion,clave,valor').then(({ data }) => {
      if (!data?.length) return
      const map: Record<string, string> = { ...DEFAULTS }
      data.forEach((r: any) => { map[`${r.seccion}__${r.clave}`] = r.valor })
      setContent(map)
    })
  }, [])

  const c = (key: string) => content[key] || DEFAULTS[key] || ''

  const STATS = [
    { num: c('stats__stat1_num'), label: c('stats__stat1_label') },
    { num: c('stats__stat2_num'), label: c('stats__stat2_label') },
    { num: c('stats__stat3_num'), label: c('stats__stat3_label') },
    { num: c('stats__stat4_num'), label: c('stats__stat4_label') },
  ]

  return (
    <PublicLayout>

      {/* ── BÚSQUEDA + CATEGORÍAS ── */}
      <section style={{ background: '#FAFAF8', paddingTop: 48, paddingBottom: 56, borderBottom: '1px solid #ede8e2' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>

          <h2 style={{
            textAlign: 'center',
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 5vw, 48px)',
            color: '#1a1a1a',
            marginBottom: 28,
            fontWeight: 700,
            lineHeight: 1.2,
          }}>
            ¿Qué estás{' '}
            <span style={{ color: '#D62828', fontStyle: 'italic' }}>buscando?</span>
          </h2>

          <div style={{ maxWidth: 600, margin: '0 auto 40px', position: 'relative' }}>
            <form action="/tienda" method="get" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <input
                type="text"
                name="q"
                placeholder="Buscar productos..."
                style={{
                  width: '100%',
                  padding: '14px 56px 14px 20px',
                  borderRadius: 12,
                  border: '1px solid #ddd',
                  background: '#fff',
                  fontSize: 15,
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 40,
                  height: 40,
                  background: '#D62828',
                  border: 'none',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          </div>

          <div className="home-cats-grid">
            {CATEGORIAS.map((cat) => (
              <Link key={cat.slug} href={`/tienda?categoria=${cat.slug}`}>
                <div className="home-cat-item">
                  <div className="home-cat-circle">
                    <svg
                      width="42"
                      height="42"
                      viewBox="0 0 64 64"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ display: 'block' }}
                    >
                      <path
                        d={cat.d}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="home-cat-name">{cat.nombre}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HERO (altura reducida) ── */}
      <section className="hero-section" style={{ display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg,#FAFAF8 0%,#f5f0eb 100%)', position: 'relative', overflow: 'hidden', padding: '36px 20px', minHeight: 'unset', maxHeight: '55vh' }}>
        <HeroSlider />
        <div style={{ position: 'absolute', right: -80, top: -80, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(214,40,40,.07) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <div className="grid-2col">
            <div>
              <div style={{ display: 'inline-block', background: 'rgba(214,40,40,.08)', color: '#D62828', borderRadius: 4, padding: '4px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, border: '1px solid rgba(214,40,40,.15)' }}>
                {c('hero__badge')}
              </div>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize: 'clamp(34px,4.5vw,58px)', fontWeight: 900, lineHeight: 1.08, color: '#1a1a1a', margin: '0 0 16px' }}>
                {c('hero__titulo_linea1')}<br />
                <em style={{ color: '#D62828', fontStyle: 'italic' }}>{c('hero__titulo_linea2')}</em>
              </h1>
              <p style={{ fontSize: 'clamp(14px,1.8vw,17px)', lineHeight: 1.7, color: '#555', maxWidth: 440, margin: '0 0 24px' }}>
                {c('hero__subtitulo')}
              </p>
              <div className="hero-btns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/tienda" style={{ background: '#D62828', color: '#fff', borderRadius: 10, padding: '12px 24px', textDecoration: 'none', fontFamily:"'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 15, textTransform: 'uppercase', letterSpacing: 1, boxShadow: '0 4px 16px rgba(214,40,40,.35)' }}>
                  Ir a la tienda →
                </Link>
                <a href="https://wa.me/59897699854" target="_blank" rel="noopener noreferrer"
                  style={{ background: 'transparent', color: '#1a1a1a', border: '2px solid #1a1a1a', borderRadius: 10, padding: '12px 24px', textDecoration: 'none', fontFamily:"'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 15, textTransform: 'uppercase', letterSpacing: 1 }}>
                  💬 WhatsApp
                </a>
              </div>
            </div>

            {/* Stats card — oculta en mobile */}
            <div className="hero-stats-card" style={{ background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,.1)', padding: 32, border: '1px solid #f0ebe4' }}>
              <div className="grid-2col-sm">
                {STATS.map(s => (
                  <div key={s.num} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize: 38, fontWeight: 900, color: '#D62828', lineHeight: 1, marginBottom: 4 }}>{s.num}</div>
                    <div style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #f0ebe4', marginTop: 22, paddingTop: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>¿Necesitás un presupuesto ahora?</div>
                <a href="https://wa.me/59897699854?text=Hola!%20Necesito%20un%20presupuesto" target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', borderRadius: 8, padding: '9px 18px', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
                  💬 Escribinos ahora
                </a>
              </div>
            </div>
          </div>

          {/* Mobile stats row */}
          <div className="nav-mobile" style={{ gap: 0, marginTop: 24, background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #ede8e2' }}>
            {STATS.map((s, i) => (
              <div key={s.num} style={{ flex: 1, textAlign: 'center', padding: '12px 8px', borderRight: i < STATS.length - 1 ? '1px solid #ede8e2' : 'none' }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize: 24, fontWeight: 900, color: '#D62828', lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: 10, color: '#888', marginTop: 3, lineHeight: 1.3 }}>{s.label}</div>
              </div>
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

      {/* ── UBICACIÓN ── */}
      <UbicacionSection />

      {/* ── PROCESO ── */}
      <section className="section-pad" style={{ padding: '72px 20px', background: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: '#D62828', marginBottom: 12 }}>Cómo funciona</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 700, color: '#1a1a1a', margin: '0 0 48px' }}>Del presupuesto a la instalación</h2>
          <div className="grid-4col" style={{ position: 'relative' }}>
            {[
              { num: '01', title: 'Consultás', desc: 'Mandanos un mensaje por WhatsApp' },
              { num: '02', title: 'Cotizamos', desc: 'Te respondemos con precios al instante' },
              { num: '03', title: 'Fabricamos', desc: 'A medida exacta en nuestro taller' },
              { num: '04', title: 'Enviamos a TODO EL PAIS', desc: 'Enviamos a todo el país, o para retirar en nuestro local.' },
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

      {/* ── CSS para categorías del home ── */}
      <style jsx global>{`
        .home-cats-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
          max-width: 800px;
          margin: 0 auto;
        }
        .home-cat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-align: center;
          cursor: pointer;
        }
        .home-cat-circle {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: rgba(214, 40, 40, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          transition: all 0.3s ease;
        }
        .home-cat-item:hover .home-cat-circle {
          background: rgba(214, 40, 40, 0.16);
          color: #D62828;
          transform: scale(1.08);
        }
        .home-cat-name {
          font-size: 13px;
          font-weight: 600;
          color: #444;
          line-height: 1.3;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.3s;
        }
        .home-cat-item:hover .home-cat-name {
          color: #D62828;
        }
        @media (max-width: 768px) {
          .home-cats-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 20px !important;
          }
          .home-cat-circle {
            width: 72px !important;
            height: 72px !important;
          }
          .home-cat-circle svg {
            width: 34px !important;
            height: 34px !important;
          }
        }
      `}</style>

    </PublicLayout>
  )
}
