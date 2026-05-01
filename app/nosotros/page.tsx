'use client'
import PublicLayout from '@/components/public/PublicLayout'

export default function NosotrosPage() {
  return (
    <PublicLayout>

      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', background: 'linear-gradient(135deg,#FAFAF8,#f5f0eb)', borderBottom: '1px solid #ede8e2' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: '#D62828', marginBottom: 16 }}>Quiénes somos</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(36px,5vw,60px)', fontWeight: 900, color: '#1a1a1a', margin: '0 0 20px', lineHeight: 1.1 }}>
            Una empresa familiar<br /><em style={{ color: '#D62828' }}>con años de oficio</em>
          </h1>
          <p style={{ fontSize: 18, color: '#666', lineHeight: 1.8, maxWidth: 600, margin: '0 auto' }}>
            Empezamos con un taller y las ganas de hacer las cosas bien. Hoy trabajamos en todo Uruguay con el mismo compromiso de siempre.
          </p>
        </div>
      </section>

      {/* Historia */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:24 }}>
          <div style={{ borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(135deg,#1a1a1a,#2a1818)', aspectRatio: '4/3' as any, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ fontSize: 64 }}>🏭</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, color: '#555', textTransform: 'uppercase', letterSpacing: 2 }}>Foto del taller · Próximamente</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: '#D62828', marginBottom: 14 }}>Nuestra historia</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(26px,3vw,38px)', fontWeight: 700, color: '#1a1a1a', margin: '0 0 24px', lineHeight: 1.2 }}>Más de 15 años fabricando aberturas</h2>
            <p style={{ fontSize: 15, color: '#666', lineHeight: 1.9, marginBottom: 16 }}>Aberturas RG nació de la pasión por la fabricación de aluminio y el deseo de ofrecer productos de calidad a precios justos. Arrancamos fabricando ventanas para vecinos del barrio y fuimos creciendo de a poco.</p>
            <p style={{ fontSize: 15, color: '#666', lineHeight: 1.9, marginBottom: 16 }}>Con el tiempo incorporamos nuevos productos — cielorrasos de PVC, yeso/Durlock, rejas, persianas — y expandimos nuestra cobertura a todo Uruguay.</p>
            <p style={{ fontSize: 15, color: '#666', lineHeight: 1.9 }}>Hoy somos un equipo que combina experiencia artesanal con herramientas modernas, como nuestra calculadora online que permite conocer el costo del proyecto al instante.</p>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section style={{ padding: '80px 24px', background: '#FAFAF8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: '#D62828', marginBottom: 12 }}>Cómo trabajamos</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Nuestros valores</h2>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:24 }}>
            {[
              { icon: '🎯', title: 'Precisión', desc: 'Cada abertura se fabrica con las medidas exactas del vano. Sin aproximaciones, sin ajustes en obra.' },
              { icon: '🤝', title: 'Honestidad', desc: 'El precio que te decimos es el precio que pagás. Sin sorpresas ni adicionales no acordados.' },
              { icon: '⚡', title: 'Rapidez', desc: 'Respuesta inmediata por WhatsApp y tiempos de entrega que respetamos.' },
              { icon: '🛡️', title: 'Garantía', desc: 'Todo nuestro trabajo tiene garantía. Si algo no queda bien, volvemos a solucionarlo.' },
              { icon: '🌍', title: 'Cobertura nacional', desc: 'Instalamos en todo Uruguay, coordinamos viaje y logística.' },
              { icon: '💡', title: 'Innovación', desc: 'Fuimos de los primeros en ofrecer calculadora de precios online en Uruguay.' },
            ].map(v => (
              <div key={v.title} style={{ background: '#fff', borderRadius: 16, border: '1px solid #ede8e2', padding: 28 }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{v.icon}</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>{v.title}</div>
                <div style={{ fontSize: 14, color: '#777', lineHeight: 1.7 }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: '#D62828', marginBottom: 12 }}>El equipo</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 700, color: '#1a1a1a', margin: '0 0 48px' }}>Las personas detrás del trabajo</h2>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:24 }}>
            {[
              { nombre: 'Michael', rol: 'Fundador & Director', emoji: '👷' },
              { nombre: 'Equipo Taller', rol: 'Fabricación & Producción', emoji: '🔧' },
              { nombre: 'Equipo Campo', rol: 'Instalación & Logística', emoji: '🚚' },
            ].map(p => (
              <div key={p.nombre} style={{ textAlign: 'center' }}>
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg,#f5f0eb,#ede8e2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 40, boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>{p.emoji}</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>{p.nombre}</div>
                <div style={{ fontSize: 13, color: '#D62828', fontWeight: 600 }}>{p.rol}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 24px', background: '#FAFAF8', borderTop: '1px solid #ede8e2', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: '#1a1a1a', margin: '0 0 12px' }}>¿Querés trabajar con nosotros?</h2>
        <p style={{ fontSize: 16, color: '#666', marginBottom: 28 }}>Escribinos y coordinamos una visita o presupuesto.</p>
        <a href="https://wa.me/59897699854" target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', borderRadius: 10, padding: '14px 28px', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
          💬 Contactar por WhatsApp
        </a>
      </section>

    </PublicLayout>
  )
}
