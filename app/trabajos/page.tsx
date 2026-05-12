'use client'
import { useEffect, useState } from 'react'
import PublicLayout from '@/components/public/PublicLayout'
import { supabase } from '@/lib/supabase'

type Trabajo = {
  id: string
  titulo: string
  descripcion: string
  categoria: string
  imagen_url: string
  activo: boolean
  orden: number
}

const COLOR_MAP: Record<string, string> = {
  'Ventanas': '#D62828',
  'Cielorraso PVC': '#2196F3',
  'Yeso': '#9C27B0',
  'Rejas': '#FF9800',
  'Persianas': '#00897B',
  'Monoblock': '#5C6BC0',
}

export default function TrabajosPage() {
  const [trabajos, setTrabajos] = useState<Trabajo[]>([])
  const [loading, setLoading] = useState(true)
  const [catActiva, setCatActiva] = useState('Todos')
  const [lightbox, setLightbox] = useState<Trabajo | null>(null)

  useEffect(() => {
    supabase
      .from('trabajos')
      .select('*')
      .eq('activo', true)
      .order('orden')
      .then(({ data }) => {
        setTrabajos(data || [])
        setLoading(false)
      })
  }, [])

  // Categorías dinámicas desde los trabajos reales
  const categoriasUnicas = ['Todos', ...Array.from(new Set(trabajos.map(t => t.categoria)))]

  const filtrados = catActiva === 'Todos'
    ? trabajos
    : trabajos.filter(t => t.categoria === catActiva)

  return (
    <PublicLayout>

      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', background: 'linear-gradient(135deg,#FAFAF8,#f5f0eb)', borderBottom: '1px solid #ede8e2' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: '#D62828', marginBottom: 16 }}>Portfolio</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(36px,5vw,56px)', fontWeight: 900, color: '#1a1a1a', margin: '0 0 20px', lineHeight: 1.1 }}>
            Nuestros<br /><em style={{ color: '#D62828' }}>trabajos realizados</em>
          </h1>
          <p style={{ fontSize: 17, color: '#666', lineHeight: 1.8 }}>
            Más de 2000 instalaciones en todo Uruguay. Cada proyecto es único y lo abordamos con el mismo cuidado.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section style={{ padding: '60px 24px 80px', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Category filter */}
          {categoriasUnicas.length > 2 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40, justifyContent: 'center' }}>
              {categoriasUnicas.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCatActiva(cat)}
                  style={{
                    padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer',
                    background: catActiva === cat ? '#D62828' : '#f5f0eb',
                    color: catActiva === cat ? '#fff' : '#555',
                    fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13,
                    textTransform: 'uppercase', letterSpacing: 1,
                    transition: 'all .15s',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>Cargando trabajos...</div>
          )}

          {/* Empty state */}
          {!loading && filtrados.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔨</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                {catActiva === 'Todos' ? 'Todavía no hay trabajos publicados' : `No hay trabajos en "${catActiva}"`}
              </div>
              <div style={{ fontSize: 14 }}>¡Próximamente estaremos subiendo nuestro portfolio!</div>
            </div>
          )}

          {/* Grid */}
          {!loading && filtrados.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 24 }}>
              {filtrados.map(t => {
                const color = COLOR_MAP[t.categoria] || '#D62828'
                return (
                  <div
                    key={t.id}
                    style={{
                      borderRadius: 16,
                      overflow: 'hidden',
                      border: '1px solid #ede8e2',
                      transition: 'transform .2s, box-shadow .2s',
                      cursor: t.imagen_url ? 'pointer' : 'default',
                    }}
                    onClick={() => t.imagen_url && setLightbox(t)}
                    onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 12px 32px rgba(0,0,0,.1)' }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none' }}
                  >
                    {/* Image */}
                    <div style={{ aspectRatio: '4/3' as any, background: '#f5f0eb', overflow: 'hidden', position: 'relative' }}>
                      {t.imagen_url ? (
                        <img
                          src={t.imagen_url}
                          alt={t.titulo}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%', height: '100%',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          gap: 8, color: '#ccc',
                        }}>
                          <div style={{ fontSize: 40 }}>📷</div>
                          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2 }}>Sin foto</div>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color, marginBottom: 6 }}>
                        {t.categoria}
                      </div>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>
                        {t.titulo}
                      </div>
                      {t.descripcion && (
                        <div style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>{t.descripcion}</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, cursor: 'pointer',
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 900, width: '100%', position: 'relative' }}>
            <button
              onClick={() => setLightbox(null)}
              style={{
                position: 'absolute', top: -40, right: 0,
                background: 'none', border: 'none', color: '#fff',
                fontSize: 28, cursor: 'pointer', padding: '4px 8px',
              }}
            >
              ×
            </button>
            <img
              src={lightbox.imagen_url}
              alt={lightbox.titulo}
              style={{ width: '100%', borderRadius: 12, maxHeight: '80vh', objectFit: 'contain' }}
            />
            <div style={{ color: '#fff', textAlign: 'center', marginTop: 16 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                {lightbox.titulo}
              </div>
              <div style={{ fontSize: 13, color: '#aaa' }}>{lightbox.categoria}</div>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section style={{ padding: '60px 24px', background: '#FAFAF8', borderTop: '1px solid #ede8e2', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: '#1a1a1a', margin: '0 0 12px' }}>¿Querés que hagamos el tuyo?</h2>
        <p style={{ fontSize: 16, color: '#666', marginBottom: 28 }}>Calculá tu presupuesto online o consultanos directamente.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/contacto" style={{ background: '#D62828', color: '#fff', borderRadius: 10, padding: '14px 28px', textDecoration: 'none', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 15, textTransform: 'uppercase', letterSpacing: 1 }}>Contactanos →</a>
          <a href="https://wa.me/59897699854" target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: '#fff', borderRadius: 10, padding: '14px 28px', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>💬 WhatsApp</a>
        </div>
      </section>

    </PublicLayout>
  )
}
