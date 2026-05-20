'use client'
import { useState } from 'react'
import PublicLayout from '@/components/public/PublicLayout'
import Link from 'next/link'

export default function ContactoPage() {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim() || !telefono.trim() || !mensaje.trim()) return
    setEnviando(true)
    setError(null)

    try {
      await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, telefono, mensaje }),
      })
      setEnviado(true)
      setNombre('')
      setTelefono('')
      setMensaje('')
    } catch {
      setError('No se pudo enviar el mensaje. Intentá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <PublicLayout>

      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', background: 'linear-gradient(135deg,#FAFAF8,#f5f0eb)', borderBottom: '1px solid #ede8e2' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: '#D62828', marginBottom: 16 }}>Contacto</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(36px,5vw,56px)', fontWeight: 900, color: '#1a1a1a', margin: '0 0 20px', lineHeight: 1.1 }}>
            Hablemos de<br /><em style={{ color: '#D62828' }}>tu proyecto</em>
          </h1>
          <p style={{ fontSize: 17, color: '#666', lineHeight: 1.8 }}>Dejanos tu consulta y te respondemos a la brevedad. También podés armar tu pedido directo desde la tienda.</p>
        </div>
      </section>

      {/* Main content */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 24 }}>

          {/* Left: Contact form */}
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: '#1a1a1a', margin: '0 0 24px' }}>Escribinos</h2>

            {enviado ? (
              <div style={{
                background: '#f0fdf4',
                border: '1.5px solid #bbf7d0',
                borderRadius: 16,
                padding: '32px 28px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#166534', marginBottom: 8 }}>¡Mensaje enviado!</div>
                <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: '0 0 20px' }}>
                  Recibimos tu consulta. Te vamos a contactar a la brevedad.
                </p>
                <button
                  onClick={() => setEnviado(false)}
                  style={{
                    background: '#111', color: 'white', border: 'none', borderRadius: 50,
                    padding: '12px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  }}
                >
                  Enviar otra consulta
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{
                    background: '#fef2f2', color: '#b91c1c', padding: '12px 16px',
                    borderRadius: 10, fontSize: 14, marginBottom: 16, border: '1px solid #fecaca',
                  }}>
                    {error}
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#333', marginBottom: 6 }}>Nombre *</label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    required
                    disabled={enviando}
                    style={{
                      width: '100%', padding: '14px 16px', border: '1.5px solid #e0e0e0',
                      borderRadius: 12, fontSize: 16, fontFamily: 'inherit', background: '#fafafa',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#333', marginBottom: 6 }}>Teléfono *</label>
                  <input
                    type="tel"
                    placeholder="099 123 456"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    required
                    disabled={enviando}
                    style={{
                      width: '100%', padding: '14px 16px', border: '1.5px solid #e0e0e0',
                      borderRadius: 12, fontSize: 16, fontFamily: 'inherit', background: '#fafafa',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#333', marginBottom: 6 }}>Mensaje *</label>
                  <textarea
                    placeholder="Contanos qué necesitás: medidas, tipo de abertura, consulta..."
                    value={mensaje}
                    onChange={e => setMensaje(e.target.value)}
                    rows={4}
                    required
                    disabled={enviando}
                    style={{
                      width: '100%', padding: '14px 16px', border: '1.5px solid #e0e0e0',
                      borderRadius: 12, fontSize: 16, fontFamily: 'inherit', background: '#fafafa',
                      outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={enviando || !nombre.trim() || !telefono.trim() || !mensaje.trim()}
                  style={{
                    width: '100%', background: '#D62828', color: '#fff', borderRadius: 50,
                    padding: '16px 24px', border: 'none', fontWeight: 800, fontSize: 16,
                    cursor: 'pointer', transition: 'all 0.2s',
                    opacity: enviando ? 0.6 : 1,
                    boxShadow: '0 6px 20px rgba(214,40,40,0.3)',
                  }}
                >
                  {enviando ? 'Enviando...' : 'Enviar consulta'}
                </button>
              </form>
            )}

            {/* Info cards */}
            <div style={{ marginTop: 32 }}>
              {[
                { icon: '📍', title: 'Cobertura', desc: 'Montevideo y todo Uruguay. Coordinamos logística para el interior.' },
                { icon: '🕐', title: 'Horario', desc: 'Lunes a Viernes de 9:00 a 18:00.' },
                { icon: '📞', title: 'Teléfono', desc: '097 699 854 — Llamadas y WhatsApp.' },
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
          </div>

          {/* Right: tienda link */}
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: '#1a1a1a', margin: '0 0 24px' }}>¿Ya sabés qué querés?</h2>
            <p style={{ fontSize: 15, color: '#666', marginBottom: 24, lineHeight: 1.7 }}>Explorá nuestro catálogo de productos con precios y hacé tu pedido directamente desde la tienda.</p>

            <Link href="/tienda" style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '20px 24px', borderRadius: 14,
              background: '#D62828', color: '#fff',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(214,40,40,.35)',
              transition: 'all .15s',
              marginBottom: 32,
            }}
              onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = 'translateY(-2px)'; a.style.boxShadow = '0 8px 24px rgba(214,40,40,.45)' }}
              onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = 'translateY(0)'; a.style.boxShadow = '0 4px 16px rgba(214,40,40,.35)' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>
                🛍️
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>Ir a la tienda</div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>Ver productos, precios y hacer tu pedido</div>
              </div>
              <span style={{ fontSize: 20 }}>→</span>
            </Link>

            {/* Medios de pago */}
            <div style={{ padding: 24, background: '#FAFAF8', borderRadius: 14, border: '1px solid #ede8e2' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#888', marginBottom: 14 }}>Medios de pago</div>
              {[
                { icon: '🏦', text: 'Transferencia bancaria', detail: 'Sin recargo' },
                { icon: '💳', text: 'Débito', detail: 'Sin recargo' },
                { icon: '💳', text: 'Crédito en cuotas', detail: 'Con POS al entregar' },
                { icon: '💵', text: 'Efectivo', detail: 'Contra entrega' },
              ].map(m => (
                <div key={m.text} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 0', borderBottom: '1px solid #f0ebe4',
                  fontSize: 14, color: '#1a1a1a',
                }}>
                  <span style={{ fontSize: 18 }}>{m.icon}</span>
                  <span style={{ flex: 1 }}>{m.text}</span>
                  <span style={{ fontSize: 12, color: '#888' }}>{m.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </PublicLayout>
  )
}
