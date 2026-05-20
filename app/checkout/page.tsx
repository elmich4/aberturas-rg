'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import PublicLayout from '@/components/public/PublicLayout'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function fmt(n: number) {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    maximumFractionDigits: 0,
  }).format(n)
}

// ── Helpers para el mapa ──
const MARKER_ICON_HTML = '<div style="width:28px;height:28px;background:#d62828;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>'

function loadLeaflet(): Promise<any> {
  if ((window as any).L) return Promise.resolve((window as any).L)
  // CSS
  if (!document.querySelector('link[href*="leaflet"]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  }
  // JS
  return new Promise((resolve) => {
    if (document.querySelector('script[src*="leaflet"]')) {
      const check = setInterval(() => {
        if ((window as any).L) { clearInterval(check); resolve((window as any).L) }
      }, 50)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => resolve((window as any).L)
    document.head.appendChild(script)
  })
}

// Geocoding con Nominatim (OpenStreetMap, gratis, sin API key)
async function geocodeDireccion(direccion: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = `${direccion}, Uruguay`
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=uy&limit=1`,
      { headers: { 'Accept-Language': 'es' } }
    )
    const data = await res.json()
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
    return null
  } catch {
    return null
  }
}

// ── Componente Mapa con Leaflet ──
export type MapaPickerRef = { flyToAndMark: (lat: number, lng: number) => void }

const MapaPicker = React.forwardRef<MapaPickerRef, {
  lat: number | null
  lng: number | null
  onSelect: (lat: number, lng: number) => void
}>(function MapaPicker({ lat, lng, onSelect }, ref) {
  const mapElRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const LRef = useRef<any>(null)
  const [mapReady, setMapReady] = useState(false)

  // Exponer flyToAndMark al padre
  React.useImperativeHandle(ref, () => ({
    flyToAndMark(newLat: number, newLng: number) {
      const map = mapInstanceRef.current
      const L = LRef.current
      if (!map || !L) return

      map.flyTo([newLat, newLng], 16, { duration: 1 })

      if (markerRef.current) {
        markerRef.current.setLatLng([newLat, newLng])
      } else {
        markerRef.current = L.marker([newLat, newLng], {
          icon: L.divIcon({
            html: MARKER_ICON_HTML,
            iconSize: [28, 28], iconAnchor: [14, 14], className: '',
          }),
        }).addTo(map)
      }
      onSelect(newLat, newLng)
    },
  }), [onSelect])

  useEffect(() => {
    if (mapInstanceRef.current) return

    loadLeaflet().then((L) => {
      if (!mapElRef.current || mapInstanceRef.current) return
      LRef.current = L

      const defaultLat = lat || -34.9011
      const defaultLng = lng || -56.1645

      const map = L.map(mapElRef.current, {
        scrollWheelZoom: true,
        zoomControl: true,
      }).setView([defaultLat, defaultLng], lat ? 16 : 12)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)

      if (lat && lng) {
        markerRef.current = L.marker([lat, lng], {
          icon: L.divIcon({
            html: MARKER_ICON_HTML,
            iconSize: [28, 28], iconAnchor: [14, 14], className: '',
          }),
        }).addTo(map)
      }

      map.on('click', (e: any) => {
        const { lat: cLat, lng: cLng } = e.latlng
        onSelect(cLat, cLng)
        if (markerRef.current) {
          markerRef.current.setLatLng([cLat, cLng])
        } else {
          markerRef.current = L.marker([cLat, cLng], {
            icon: L.divIcon({
              html: MARKER_ICON_HTML,
              iconSize: [28, 28], iconAnchor: [14, 14], className: '',
            }),
          }).addTo(map)
        }
      })

      mapInstanceRef.current = map
      setMapReady(true)
      setTimeout(() => map.invalidateSize(), 200)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
        LRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={mapElRef}
        style={{
          width: '100%',
          height: 260,
          borderRadius: 12,
          border: '1.5px solid #e0e0e0',
          overflow: 'hidden',
          background: '#f0f0f0',
        }}
      />
      {!mapReady && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: '#f5f5f5', borderRadius: 12,
          color: '#999', fontSize: 14,
        }}>
          Cargando mapa...
        </div>
      )}
      {mapReady && !lat && (
        <div style={{
          position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.75)', color: 'white',
          padding: '6px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600,
          pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>
          📍 Hacé click en tu ubicación
        </div>
      )}
    </div>
  )
})

// ── Página de Checkout ──
export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalItems, totalPrecio, clearCart } = useCart()

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [ubicacionLat, setUbicacionLat] = useState<number | null>(null)
  const [ubicacionLng, setUbicacionLng] = useState<number | null>(null)
  const [notas, setNotas] = useState('')
  const [medioPago, setMedioPago] = useState<string>('transferencia')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [buscandoDir, setBuscandoDir] = useState(false)
  const mapaRef = useRef<MapaPickerRef>(null)

  // Configuración de medios de pago y recargos
  const MEDIOS_PAGO = [
    {
      id: 'transferencia',
      label: 'Transferencia bancaria',
      icon: '🏦',
      recargo: 0,
      tag: 'Sin recargo',
      nota: 'Solo transferencias instantáneas. Se paga al recibir el producto.',
    },
    {
      id: 'debito',
      label: 'Tarjeta de débito',
      icon: '💳',
      recargo: 0,
      tag: 'Sin recargo',
      nota: 'Con POS al momento de la entrega.',
    },
    {
      id: 'efectivo',
      label: 'Efectivo',
      icon: '💵',
      recargo: 0,
      tag: 'Sin recargo',
      nota: 'Pago contra entrega.',
    },
    {
      id: 'credito_3',
      label: 'Crédito — 3 cuotas',
      icon: '💳',
      recargo: 5,
      tag: '+5% recargo',
      nota: 'Con POS al momento de la entrega.',
    },
    {
      id: 'credito_4_12',
      label: 'Crédito — 4 a 12 cuotas',
      icon: '💳',
      recargo: 10,
      tag: '+10% recargo',
      nota: 'Con POS al momento de la entrega. Cantidad de cuotas a coordinar.',
    },
  ]

  const medioSeleccionado = MEDIOS_PAGO.find(m => m.id === medioPago)!
  const recargoMonto = Math.round(totalPrecio * medioSeleccionado.recargo / 100)
  const totalFinal = totalPrecio + recargoMonto

  function handleMapSelect(lat: number, lng: number) {
    setUbicacionLat(lat)
    setUbicacionLng(lng)
  }

  // Geocoding: cuando el usuario sale del campo dirección, buscar en el mapa
  async function handleDireccionBlur() {
    const dir = direccion.trim()
    if (dir.length < 5) return // muy corta, no buscar
    setBuscandoDir(true)
    const result = await geocodeDireccion(dir)
    setBuscandoDir(false)
    if (result && mapaRef.current) {
      mapaRef.current.flyToAndMark(result.lat, result.lng)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return
    setEnviando(true)
    setError(null)

    try {
      const itemsParaGuardar = items.map(i => ({
        id: i.id,
        productoId: i.productoId,
        varianteId: i.varianteId,
        varianteNombre: i.varianteNombre,
        slug: i.slug,
        nombre: i.nombre,
        precio: i.precio,
        unidad: i.unidad,
        imagen_url: i.imagen_url,
        cantidad: i.cantidad,
        subtotal: i.precio * i.cantidad,
      }))

      // Guardar pedido en Supabase
      const { data, error: dbError } = await supabase
        .from('pedidos')
        .insert({
          nombre,
          apellido,
          telefono,
          direccion,
          ubicacion_lat: ubicacionLat,
          ubicacion_lng: ubicacionLng,
          medio_pago: medioPago,
          recargo_porcentaje: medioSeleccionado.recargo,
          recargo_monto: recargoMonto,
          notas: notas || null,
          items: itemsParaGuardar,
          total: totalFinal,
          estado: 'pendiente',
        })
        .select('codigo')
        .single()

      if (dbError) throw dbError

      const codigo = data?.codigo

      // Enviar email de notificación
      try {
        const mapsUrl = ubicacionLat && ubicacionLng
          ? `https://www.google.com/maps?q=${ubicacionLat},${ubicacionLng}`
          : null

        await fetch('/api/pedidos/notificar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            codigo,
            nombre,
            apellido,
            telefono,
            direccion,
            ubicacion_url: mapsUrl,
            medio_pago: medioSeleccionado.label,
            recargo_porcentaje: medioSeleccionado.recargo,
            subtotal: totalPrecio,
            notas,
            items: itemsParaGuardar,
            total: totalFinal,
          }),
        })
      } catch {
        console.warn('No se pudo enviar email de notificación')
      }

      clearCart()
      router.push(`/checkout/confirmacion?codigo=${codigo}`)
    } catch (e: any) {
      console.error('Error al crear pedido:', e)
      setError('Hubo un error al procesar tu pedido. Por favor intentá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  if (items.length === 0) {
    return (
      <PublicLayout>
        <section className="empty-section">
          <div className="empty-box">
            <div className="empty-icon">🛒</div>
            <h2>Tu carrito está vacío</h2>
            <p>Agregá productos desde nuestro catálogo para hacer un pedido.</p>
            <Link href="/tienda" className="btn-tienda">
              Ir a la tienda →
            </Link>
          </div>
        </section>
        <style jsx>{`
          .empty-section {
            padding: 120px 24px;
            text-align: center;
          }
          .empty-box {
            max-width: 400px;
            margin: 0 auto;
          }
          .empty-icon {
            font-size: 3.5rem;
            margin-bottom: 20px;
          }
          .empty-box h2 {
            font-family: 'Playfair Display', serif;
            font-size: 1.8rem;
            color: #1a1a1a;
            margin: 0 0 12px;
          }
          .empty-box p {
            color: #888;
            font-size: 1rem;
            margin: 0 0 28px;
            line-height: 1.6;
          }
          .empty-box :global(.btn-tienda) {
            display: inline-block;
            background: #d62828;
            color: white;
            padding: 14px 32px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 700;
            font-size: 1rem;
            transition: 0.2s;
          }
          .empty-box :global(.btn-tienda:hover) {
            background: #a51d1d;
            transform: translateY(-2px);
          }
        `}</style>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <section className="checkout-hero">
        <div className="container">
          <Link href="/tienda" className="back-link">← Volver a la tienda</Link>
          <h1>Finalizar pedido</h1>
          <p>Completá tus datos y te contactamos para coordinar el pago y la entrega.</p>
        </div>
      </section>

      <section className="checkout-body">
        <div className="container checkout-grid">

          {/* Formulario */}
          <div className="form-col">
            <div className="form-card">
              <h2>Tus datos</h2>

              {error && <div className="error-msg">{error}</div>}

              <div className="form-row two-col">
                <div className="field">
                  <label htmlFor="nombre">Nombre *</label>
                  <input
                    id="nombre"
                    type="text"
                    placeholder="Tu nombre"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    required
                    disabled={enviando}
                  />
                </div>
                <div className="field">
                  <label htmlFor="apellido">Apellido *</label>
                  <input
                    id="apellido"
                    type="text"
                    placeholder="Tu apellido"
                    value={apellido}
                    onChange={e => setApellido(e.target.value)}
                    required
                    disabled={enviando}
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="telefono">Teléfono *</label>
                <input
                  id="telefono"
                  type="tel"
                  placeholder="099 123 456"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  required
                  disabled={enviando}
                />
                <span className="hint">Te contactamos por acá para coordinar</span>
              </div>

              <div className="field">
                <label htmlFor="direccion">Dirección de entrega *</label>
                <input
                  id="direccion"
                  type="text"
                  placeholder="Calle, número, esquina, barrio/ciudad"
                  value={direccion}
                  onChange={e => setDireccion(e.target.value)}
                  onBlur={handleDireccionBlur}
                  required
                  disabled={enviando}
                />
                <span className="hint">
                  {buscandoDir ? '🔍 Buscando en el mapa...' : 'Al salir del campo, se marca automáticamente en el mapa'}
                </span>
              </div>

              {/* Mapa */}
              <div className="field">
                <label>
                  Ubicación en el mapa
                  {ubicacionLat ? (
                    <span className="ubicacion-ok"> ✓ Marcada</span>
                  ) : (
                    <span className="ubicacion-hint"> (opcional)</span>
                  )}
                </label>
                <MapaPicker
                  ref={mapaRef}
                  lat={ubicacionLat}
                  lng={ubicacionLng}
                  onSelect={handleMapSelect}
                />
                {ubicacionLat && ubicacionLng && (
                  <div className="ubicacion-coords">
                    <span>📍 Ubicación marcada</span>
                    <button
                      type="button"
                      className="ubicacion-clear"
                      onClick={() => { setUbicacionLat(null); setUbicacionLng(null) }}
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </div>

              <div className="field">
                <label htmlFor="notas">Notas adicionales</label>
                <textarea
                  id="notas"
                  placeholder="Ej: Horario de entrega preferido, medidas especiales, etc."
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  rows={3}
                  disabled={enviando}
                />
              </div>
            </div>

            {/* Método de pago */}
            <div className="form-card" style={{ marginTop: 16 }}>
              <h2>Método de pago</h2>
              <p className="pago-desc">Elegí cómo querés pagar. El cobro se realiza al momento de la entrega.</p>

              <div className="medios-lista">
                {MEDIOS_PAGO.map(m => {
                  const activo = medioPago === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={`medio-option ${activo ? 'activo' : ''}`}
                      onClick={() => setMedioPago(m.id)}
                    >
                      <div className="medio-radio">
                        <div className={`radio-dot ${activo ? 'checked' : ''}`} />
                      </div>
                      <span className="medio-icon">{m.icon}</span>
                      <div className="medio-info">
                        <div className="medio-label">{m.label}</div>
                        {activo && m.nota && (
                          <div className="medio-nota">{m.nota}</div>
                        )}
                      </div>
                      <span className={`medio-tag ${m.recargo > 0 ? 'recargo' : 'gratis'}`}>
                        {m.tag}
                      </span>
                    </button>
                  )
                })}
              </div>

              {medioSeleccionado.recargo > 0 && (
                <div className="recargo-aviso">
                  💡 El recargo de {medioSeleccionado.recargo}% se aplica por financiación con tarjeta de crédito.
                  El precio base es el de contado.
                </div>
              )}
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="summary-col">
            <div className="summary-card">
              <h2>Resumen del pedido</h2>

              <ul className="summary-items">
                {items.map(item => (
                  <li key={item.id} className="summary-item">
                    <div className="item-thumb">
                      <img src={item.imagen_url || '/placeholder.png'} alt={item.nombre} />
                    </div>
                    <div className="item-info">
                      <h4>{item.nombre}</h4>
                      {item.varianteNombre && (
                        <span className="variante">{item.varianteNombre}</span>
                      )}
                      <span className="qty">Cant: {item.cantidad}</span>
                    </div>
                    <div className="item-price">{fmt(item.precio * item.cantidad)}</div>
                  </li>
                ))}
              </ul>

              <div className="summary-totales">
                <div className="summary-row">
                  <span>Productos ({totalItems})</span>
                  <span>{fmt(totalPrecio)}</span>
                </div>
                {recargoMonto > 0 && (
                  <div className="summary-row recargo-row">
                    <span>Recargo {medioSeleccionado.label} ({medioSeleccionado.recargo}%)</span>
                    <span>+{fmt(recargoMonto)}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>Envío</span>
                  <span className="envio-tag">A coordinar</span>
                </div>
                <div className="summary-row">
                  <span>Pago</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{medioSeleccionado.icon} {medioSeleccionado.label}</span>
                </div>
                <div className="summary-row total-row">
                  <span>Total</span>
                  <strong>{fmt(totalFinal)}</strong>
                </div>
                {recargoMonto > 0 && (
                  <div className="summary-row" style={{ paddingTop: 0 }}>
                    <span></span>
                    <span style={{ fontSize: 12, color: '#999', textDecoration: 'line-through' }}>Contado: {fmt(totalPrecio)}</span>
                  </div>
                )}
              </div>

              <button
                className="btn-confirmar"
                onClick={handleSubmit}
                disabled={enviando || !nombre.trim() || !apellido.trim() || !telefono.trim() || !direccion.trim()}
              >
                {enviando ? (
                  <span className="spinner-wrap">
                    <span className="spinner" /> Procesando...
                  </span>
                ) : (
                  'Confirmar pedido'
                )}
              </button>

              <p className="disclaimer">
                Al confirmar, tu pedido queda registrado y nos comunicamos para coordinar pago y entrega. No se realiza ningún cobro automático.
              </p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .checkout-hero {
          background: #111;
          color: white;
          padding: 100px 20px 50px;
        }
        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .checkout-hero :global(.back-link) {
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 16px;
          transition: color 0.2s;
        }
        .checkout-hero :global(.back-link:hover) {
          color: white;
        }
        .checkout-hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          margin: 0 0 12px;
          font-weight: 900;
        }
        .checkout-hero p {
          color: rgba(255,255,255,0.65);
          font-size: 1.05rem;
          margin: 0;
        }

        .checkout-body {
          padding: 40px 20px 100px;
          background: #f9f9f9;
        }
        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 32px;
          align-items: start;
        }

        /* Form */
        .form-card {
          background: white;
          border-radius: 20px;
          padding: 32px;
          border: 1px solid #eee;
        }
        .form-card h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          margin: 0 0 24px;
          color: #1a1a1a;
        }
        .form-row.two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .field {
          margin-bottom: 20px;
        }
        .field label {
          display: block;
          font-size: 0.85rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 6px;
        }
        .field input,
        .field textarea {
          width: 100%;
          padding: 14px 16px;
          border: 1.5px solid #e0e0e0;
          border-radius: 12px;
          font-size: 1rem;
          font-family: inherit;
          color: #1a1a1a;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: #fafafa;
          outline: none;
          box-sizing: border-box;
        }
        .field input:focus,
        .field textarea:focus {
          border-color: #d62828;
          box-shadow: 0 0 0 3px rgba(214, 40, 40, 0.1);
          background: white;
        }
        .field input:disabled,
        .field textarea:disabled {
          opacity: 0.6;
        }
        .field textarea {
          resize: vertical;
        }
        .hint {
          display: block;
          font-size: 0.78rem;
          color: #999;
          margin-top: 4px;
        }

        .ubicacion-ok {
          color: #16a34a;
          font-weight: 700;
          font-size: 0.8rem;
        }
        .ubicacion-hint {
          color: #999;
          font-weight: 400;
          font-size: 0.8rem;
        }
        .ubicacion-coords {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 8px;
          padding: 8px 12px;
          background: #f0fdf4;
          border-radius: 8px;
          font-size: 0.82rem;
          color: #166534;
          font-weight: 600;
        }
        .ubicacion-clear {
          background: none;
          border: none;
          color: #d62828;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }

        .error-msg {
          background: #fef2f2;
          color: #b91c1c;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 0.9rem;
          margin-bottom: 20px;
          border: 1px solid #fecaca;
        }

        /* Payment selector */
        .pago-desc {
          font-size: 0.88rem;
          color: #777;
          margin: -16px 0 20px;
          line-height: 1.5;
        }
        .medios-lista {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .medio-option {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          border: 1.5px solid #e8e8e8;
          border-radius: 14px;
          background: white;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
          font-family: inherit;
          width: 100%;
        }
        .medio-option:hover {
          border-color: #ccc;
          background: #fafafa;
        }
        .medio-option.activo {
          border-color: #d62828;
          background: #fef8f8;
          box-shadow: 0 0 0 3px rgba(214, 40, 40, 0.08);
        }
        .medio-radio {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #ddd;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
          transition: border-color 0.15s;
        }
        .medio-option.activo .medio-radio {
          border-color: #d62828;
        }
        .radio-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: transparent;
          transition: background 0.15s;
        }
        .radio-dot.checked {
          background: #d62828;
        }
        .medio-icon {
          font-size: 1.3rem;
          flex-shrink: 0;
          margin-top: -1px;
        }
        .medio-info {
          flex: 1;
          min-width: 0;
        }
        .medio-label {
          font-size: 0.92rem;
          font-weight: 700;
          color: #1a1a1a;
        }
        .medio-nota {
          font-size: 0.78rem;
          color: #888;
          margin-top: 4px;
          line-height: 1.4;
        }
        .medio-tag {
          font-size: 0.72rem;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 50px;
          white-space: nowrap;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .medio-tag.gratis {
          background: #f0fdf4;
          color: #166534;
        }
        .medio-tag.recargo {
          background: #fef3c7;
          color: #92400e;
        }
        .recargo-aviso {
          margin-top: 14px;
          padding: 12px 14px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 10px;
          font-size: 0.82rem;
          color: #92400e;
          line-height: 1.5;
        }
        .recargo-row {
          color: #92400e;
          font-weight: 600;
        }

        /* Summary */
        .summary-card {
          background: white;
          border-radius: 20px;
          padding: 28px;
          border: 1px solid #eee;
          position: sticky;
          top: 120px;
        }
        .summary-card h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          margin: 0 0 20px;
          color: #1a1a1a;
        }
        .summary-items {
          list-style: none;
          padding: 0;
          margin: 0 0 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 320px;
          overflow-y: auto;
        }
        .summary-item {
          display: grid;
          grid-template-columns: 56px 1fr auto;
          gap: 12px;
          align-items: center;
          padding: 10px;
          background: #fafafa;
          border-radius: 12px;
        }
        .item-thumb {
          width: 56px;
          height: 56px;
          border-radius: 10px;
          overflow: hidden;
          background: #f0f0f0;
        }
        .item-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .item-info h4 {
          margin: 0;
          font-size: 0.88rem;
          color: #1a1a1a;
          line-height: 1.3;
        }
        .item-info .variante {
          display: inline-block;
          background: #fef2f2;
          color: #d62828;
          padding: 1px 7px;
          border-radius: 50px;
          font-size: 0.68rem;
          font-weight: 700;
        }
        .item-info .qty {
          display: block;
          font-size: 0.78rem;
          color: #999;
          margin-top: 2px;
        }
        .item-price {
          font-weight: 800;
          color: #1a1a1a;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .summary-totales {
          border-top: 1px solid #eee;
          padding-top: 16px;
          margin-bottom: 20px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 0.92rem;
          color: #555;
        }
        .envio-tag {
          background: #fef3c7;
          color: #92400e;
          padding: 2px 10px;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .total-row {
          border-top: 1px solid #eee;
          margin-top: 8px;
          padding-top: 14px;
          font-size: 1.15rem;
          color: #1a1a1a;
        }
        .total-row strong {
          color: #d62828;
          font-size: 1.4rem;
        }

        .btn-confirmar {
          width: 100%;
          background: #d62828;
          color: white;
          padding: 18px;
          border: none;
          border-radius: 50px;
          font-weight: 800;
          font-size: 1.1rem;
          cursor: pointer;
          transition: 0.2s;
          box-shadow: 0 6px 20px rgba(214, 40, 40, 0.3);
        }
        .btn-confirmar:hover:not(:disabled) {
          background: #a51d1d;
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(214, 40, 40, 0.4);
        }
        .btn-confirmar:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .disclaimer {
          font-size: 0.75rem;
          color: #999;
          margin: 14px 0 0;
          text-align: center;
          line-height: 1.5;
        }

        @media (max-width: 860px) {
          .checkout-grid {
            grid-template-columns: 1fr;
          }
          .summary-card {
            position: static;
          }
          .form-row.two-col {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </PublicLayout>
  )
}
