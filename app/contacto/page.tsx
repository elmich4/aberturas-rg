'use client'
import PublicLayout from '@/components/public/PublicLayout'
import Link from 'next/link'

export default function ContactoPage() {
  return (
    <PublicLayout>

      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', background: 'linear-gradient(135deg,#FAFAF8,#f5f0eb)', borderBottom: '1px solid #ede8e2' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: '#D62828', marginBottom: 16 }}>Contacto</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(36px,5vw,56px)', fontWeight: 900, color: '#1a1a1a', margin: '0 0 20px', lineHeight: 1.1 }}>
            Hablemos de<br /><em style={{ color: '#D62828' }}>tu proyecto</em>
          </h1>
          <p style={{ fontSize: 17, color: '#666', lineHeight: 1.8 }}>Respondemos rápido. Escribinos por WhatsApp y te damos precio al instante.</p>
        </div>
      </section>

      {/* Main content */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:24 }}>

          {/* Left: WhatsApp CTA */}
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: '#1a1a1a', margin: '0 0 24px' }}>La forma más rápida</h2>

            {/* Big WA button */}
            <a href="https://wa.me/59897699854?text=Hola!%20Necesito%20un%20presupuesto"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: '#25D366', color: '#fff', borderRadius: 16,
                padding: '20px 24px', textDecoration: 'none',
                marginBottom: 24,
                boxShadow: '0 6px 24px rgba(37,211,102,0.3)',
                transition: 'transform .15s, box-shadow .15s',
              }}
              onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = 'translateY(-2px)'; a.style.boxShadow = '0 10px 32px rgba(37,211,102,0.4)' }}
              onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = 'translateY(0)'; a.style.boxShadow = '0 6px 24px rgba(37,211,102,0.3)' }}
            >
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>097 699 854</div>
                <div style={{ fontSize: 14, opacity: 0.85 }}>Respondemos en minutos · Lun–Vie 9–18hs</div>
              </div>
            </a>

            {/* Info cards */}
            {[
              { icon: '📍', title: 'Cobertura', desc: 'Montevideo y todo Uruguay. Coordinamos logística para el interior.' },
              { icon: '🕐', title: 'Horario', desc: 'Lunes a Viernes de 9:00 a 18:00. Urgencias fuera de horario por WhatsApp.' },
              { icon: '⚡', title: 'Respuesta rápida', desc: 'Presupuesto online al instante. Por WhatsApp en menos de 2 horas.' },
            ].map(c => (
              <div key={c.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #f5f0eb' }}>
                <div style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{c.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 4 }}>{c.title}</div>
                  <div style={{ fontSize: 14, color: '#777', lineHeight: 1.6 }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: quick links + templates */}
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: '#1a1a1a', margin: '0 0 24px' }}>¿Ya sabés qué querés?</h2>
            <p style={{ fontSize: 15, color: '#666', marginBottom: 24, lineHeight: 1.7 }}>Usá nuestra calculadora y obtenés el precio exacto antes de escribirnos. Ahorra tiempo para los dos.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { href: '/ventanas', icon: '🪟', title: 'Calcular ventanas', desc: 'Serie 20, 25, Modena, colonial, guillotina' },
                { href: '/cielorraso', icon: '🏠', title: 'Calcular cielorraso PVC', desc: 'Tablillas, perfilería, aislación' },
                { href: '/yeso', icon: '🧱', title: 'Calcular yeso/Durlock', desc: 'Cielorraso, tabique, omega' },
                { href: '/presupuesto', icon: '📋', title: 'Presupuesto libre', desc: 'Combiná productos de distintas categorías' },
              ].map(l => (
                <a key={l.href} href={l.href} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px', borderRadius: 12,
                  background: '#FAFAF8', border: '1px solid #ede8e2',
                  textDecoration: 'none', color: '#1a1a1a',
                  transition: 'all .15s',
                }}
                  onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = '#fff'; a.style.borderColor = '#D62828'; a.style.transform = 'translateX(4px)' }}
                  onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = '#FAFAF8'; a.style.borderColor = '#ede8e2'; a.style.transform = 'translateX(0)' }}>
                  <span style={{ fontSize: 24 }}>{l.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{l.title}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{l.desc}</div>
                  </div>
                  <span style={{ color: '#D62828', fontSize: 16 }}>→</span>
                </a>
              ))}
            </div>

            {/* WA message templates */}
            <div style={{ marginTop: 32, padding: 20, background: '#FAFAF8', borderRadius: 14, border: '1px solid #ede8e2' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#888', marginBottom: 14 }}>Mensajes rápidos</div>
              {[
                { text: 'Consulta general', msg: 'Hola! Necesito información sobre aberturas' },
                { text: 'Pedir visita', msg: 'Hola! Quisiera coordinar una visita para presupuesto' },
                { text: 'Consultar medida', msg: 'Hola! Quiero consultar una medida especial' },
              ].map(m => (
                <a key={m.text} href={`https://wa.me/59897699854?text=${encodeURIComponent(m.msg)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: '1px solid #f0ebe4', textDecoration: 'none', color: '#1a1a1a', fontSize: 14 }}>
                  <span style={{ color: '#25D366', fontSize: 16 }}>💬</span>
                  {m.text}
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: '#aaa' }}>Abrir WA →</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

    </PublicLayout>
  )
}
