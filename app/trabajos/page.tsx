'use client'
import PublicLayout from '@/components/public/PublicLayout'

const CATEGORIAS = ['Todos', 'Ventanas', 'Cielorraso PVC', 'Yeso', 'Rejas']

const TRABAJOS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  categoria: ['Ventanas', 'Cielorraso PVC', 'Yeso', 'Rejas'][i % 4],
  titulo: [
    'Ventanas Serie 25 — Pocitos', 'Cielorraso PVC — Malvín', 'Durlock living — Prado',
    'Rejas 16mm — Buceo', 'Monoblock Series 20 — Sayago', 'PVC con aislación — Carrasco',
    'Tabique Durlock — Centro', 'Ventanas coloniales — Punta Gorda', 'Reja puerta — Cordón',
    'Cielorraso color — Montevideo', 'Guillotina S25 — La Blanqueada', 'Persiana + reja — Unión',
  ][i],
  desc: 'Instalación profesional con garantía. Medidas a pedido.',
  emoji: ['🪟', '🏠', '🧱', '🔒'][i % 4],
  color: ['#D62828', '#2196F3', '#9C27B0', '#FF9800'][i % 4],
}))

export default function TrabajosPage() {
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
          <div style={{ marginTop: 16, padding: '10px 16px', background: 'rgba(247,183,49,0.12)', border: '1px solid rgba(247,183,49,0.3)', borderRadius: 8, display: 'inline-block' }}>
            <span style={{ fontSize: 13, color: '#9a7000' }}>📸 Galería de fotos reales próximamente — ¡estamos actualizando el portfolio!</span>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section style={{ padding: '60px 24px 80px', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40, justifyContent: 'center' }}>
            {CATEGORIAS.map((cat, i) => (
              <button key={cat} style={{
                padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: i === 0 ? '#D62828' : '#f5f0eb',
                color: i === 0 ? '#fff' : '#555',
                fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13,
                textTransform: 'uppercase', letterSpacing: 1,
                transition: 'all .15s',
              }}>{cat}</button>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:24 }}>
            {TRABAJOS.map(t => (
              <div key={t.id} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #ede8e2', transition: 'transform .2s, box-shadow .2s', cursor: 'pointer' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 12px 32px rgba(0,0,0,.1)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none' }}>
                {/* Placeholder image */}
                <div style={{ aspectRatio: '4/3' as any, background: `linear-gradient(135deg, ${t.color}15, ${t.color}30)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, borderBottom: `3px solid ${t.color}` }}>
                  <div style={{ fontSize: 52 }}>{t.emoji}</div>
                  <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 2 }}>Foto próximamente</div>
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: t.color, marginBottom: 6 }}>{t.categoria}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>{t.titulo}</div>
                  <div style={{ fontSize: 13, color: '#888' }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 24px', background: '#FAFAF8', borderTop: '1px solid #ede8e2', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: '#1a1a1a', margin: '0 0 12px' }}>¿Querés que hagamos el tuyo?</h2>
        <p style={{ fontSize: 16, color: '#666', marginBottom: 28 }}>Calculá tu presupuesto online o consultanos directamente.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/ventanas" style={{ background: '#D62828', color: '#fff', borderRadius: 10, padding: '14px 28px', textDecoration: 'none', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 15, textTransform: 'uppercase', letterSpacing: 1 }}>Calcular presupuesto →</a>
          <a href="https://wa.me/59897699854" target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: '#fff', borderRadius: 10, padding: '14px 28px', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>💬 WhatsApp</a>
        </div>
      </section>

    </PublicLayout>
  )
}
