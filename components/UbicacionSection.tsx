'use client'

const MAPS_EMBED = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3272.1!2d-56.1645!3d-34.9011!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f80e1234567%3A0x1234567890abcdef!2sAv.%20de%20las%20Instrucciones%202248%2C%20Montevideo!5e0!3m2!1ses!2suy!4v1234567890'
const MAPS_LINK = 'https://maps.app.goo.gl/PYVccGwgjKM2C1Nh9'

const HORARIOS = [
  { dia: 'Lunes a viernes', hora: '8:00 a.m. – 6:00 p.m.' },
  { dia: 'Sábado',          hora: 'Cerrado' },
  { dia: 'Domingo',         hora: 'Cerrado' },
]

export default function UbicacionSection() {
  return (
    <section style={{ padding: '72px 20px', background: '#fff' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: '#D62828', marginBottom: 12 }}>
            Dónde encontrarnos
          </div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
            Visitanos en nuestro <em style={{ color: '#D62828' }}>local</em>
          </h2>
        </div>

        {/* Grid: foto + info + mapa */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'stretch' }}>

          {/* Columna izquierda: foto + info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Foto del local */}
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #ede8e2', flexShrink: 0 }}>
              <img
                src="/local-rg.jpg"
                alt="Local RG Mejor Precio — Av. de las Instrucciones 2248"
                style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
                onError={e => {
                  // Fallback a color sólido si la imagen falla
                  const el = e.currentTarget as HTMLImageElement
                  el.style.display = 'none'
                  const parent = el.parentElement!
                  parent.style.background = 'linear-gradient(135deg,#1a1a1a,#2d2d2d)'
                  parent.style.height = '220px'
                  parent.style.display = 'flex'
                  parent.style.alignItems = 'center'
                  parent.style.justifyContent = 'center'
                  parent.innerHTML = '<span style="font-size:48px">🏪</span>'
                }}
              />
            </div>

            {/* Info del negocio */}
            <div style={{ background: '#FAFAF8', borderRadius: 16, border: '1px solid #ede8e2', padding: 24, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#D62828,#A01E1E)', border: '2px solid #F7B731', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, color: '#fff', letterSpacing: 2, flexShrink: 0 }}>RG</div>
                <div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 16, color: '#1a1a1a' }}>RG Mejor Precio</div>
                  <div style={{ fontSize: 12, color: '#D62828', fontWeight: 600 }}>Aberturas · Montevideo</div>
                </div>
                {/* Rating */}
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#1a1a1a', fontFamily: "'Playfair Display',serif" }}>4.9</div>
                  <div style={{ fontSize: 11, color: '#F7B731' }}>★★★★★</div>
                  <div style={{ fontSize: 10, color: '#aaa' }}>41 reseñas</div>
                </div>
              </div>

              {/* Dirección */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>📍</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>Av. de las Instrucciones 2248</div>
                  <div style={{ fontSize: 13, color: '#666' }}>12300 Montevideo, Uruguay</div>
                </div>
              </div>

              {/* Teléfono */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>📞</span>
                <a href="tel:+59897699854" style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', textDecoration: 'none' }}>097 699 854</a>
              </div>

              {/* Horarios */}
              <div style={{ borderTop: '1px solid #ede8e2', paddingTop: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#aaa', marginBottom: 10 }}>🕐 Horario</div>
                {HORARIOS.map(h => (
                  <div key={h.dia} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: '#666' }}>{h.dia}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: h.hora === 'Cerrado' ? '#aaa' : '#1a1a1a' }}>{h.hora}</span>
                  </div>
                ))}
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#D62828', color: '#fff', borderRadius: 9, padding: '10px 16px', textDecoration: 'none', fontWeight: 700, fontSize: 13, fontFamily: "'Barlow Condensed',sans-serif", textTransform: 'uppercase', letterSpacing: 1 }}>
                  📍 Cómo llegar
                </a>
                <a href="https://wa.me/59897699854" target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#25D366', color: '#fff', borderRadius: 9, padding: '10px 16px', textDecoration: 'none', fontWeight: 700, fontSize: 13, fontFamily: "'Barlow Condensed',sans-serif", textTransform: 'uppercase', letterSpacing: 1 }}>
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Columna derecha: mapa */}
          <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #ede8e2', minHeight: 400, position: 'relative' }}>
            <iframe
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3272.0!2d-56.16802!3d-34.86792!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f804a3e6d1111%3A0xabcdef1234567890!2sAv.%20de%20las%20Instrucciones%202248%2C%20Montevideo!5e0!3m2!1ses!2suy!4v1234567890!5m2!1ses!2suy`}
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block', minHeight: 460 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación RG Mejor Precio"
            />
            {/* Overlay con link a Google Maps */}
            <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer" style={{ position: 'absolute', bottom: 12, right: 12, background: '#fff', border: '1px solid #ede8e2', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#1a1a1a', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Ver en Google Maps
            </a>
          </div>
        </div>
      </div>

      {/* Responsive */}
      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
