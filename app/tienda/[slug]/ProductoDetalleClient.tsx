'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import PublicLayout from '@/components/public/PublicLayout'
import CartDrawer from '@/components/public/CartDrawer'
import CartButton from '@/components/public/CartButton'
import { useCart } from '@/lib/cart-context'

const WA_NUMBER = '59897699854'

type Variante = {
  id: string
  nombre: string
  precio: number
  orden: number
}

type ProductoData = {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  descripcion_larga: string | null
  precio: number
  unidad: string
  imagen_url: string
  imagenes: string[]
  especificaciones: Record<string, string>
  subcategoriaNombre: string
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    maximumFractionDigits: 0,
  }).format(n)
}

export default function ProductoDetalleClient({
  producto,
  variantes,
}: {
  producto: ProductoData
  variantes: Variante[]
}) {
  const router = useRouter()
  const { addItem } = useCart()

  const [varianteId, setVarianteId] = useState<string | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Galería
  const galeria = useMemo<string[]>(() => {
    const arr: string[] = []
    if (producto.imagen_url) arr.push(producto.imagen_url)
    if (Array.isArray(producto.imagenes)) {
      producto.imagenes.forEach((u: string) => {
        if (u && !arr.includes(u)) arr.push(u)
      })
    }
    return arr
  }, [producto])

  const [imagenActiva, setImagenActiva] = useState(galeria[0] || '')

  const varianteSeleccionada = useMemo(
    () => variantes.find(v => v.id === varianteId) || null,
    [variantes, varianteId]
  )

  const tieneVariantes = variantes.length > 0
  const requiereSeleccion = tieneVariantes && !varianteSeleccionada

  const precioActual = useMemo(() => {
    if (varianteSeleccionada) return varianteSeleccionada.precio
    if (tieneVariantes) return Math.min(...variantes.map(v => v.precio))
    return producto.precio ?? 0
  }, [producto, variantes, varianteSeleccionada, tieneVariantes])

  const handleAddToCart = () => {
    if (requiereSeleccion) return
    addItem(
      {
        productoId: producto.id,
        varianteId: varianteSeleccionada?.id ?? null,
        varianteNombre: varianteSeleccionada?.nombre ?? null,
        slug: producto.slug,
        nombre: producto.nombre,
        precio: precioActual,
        unidad: producto.unidad || 'unidad',
        imagen_url: producto.imagen_url || galeria[0] || '',
      },
      cantidad
    )
    const sufijo = varianteSeleccionada
      ? ` — ${varianteSeleccionada.nombre}`
      : ''
    setFeedback(`✓ Agregado al carrito (${cantidad})${sufijo}`)
    setTimeout(() => setFeedback(null), 2500)
  }

  const mensajeWA = `¡Hola! Me interesa el producto: ${producto.nombre}${
    varianteSeleccionada ? ` (${varianteSeleccionada.nombre})` : ''
  }`

  return (
    <PublicLayout>
      <div className="detalle-wrapper">
        <div className="container">
          <button onClick={() => router.back()} className="btn-volver">
            ← Volver atrás
          </button>

          <div className="detalle-grid">
            {/* COL IMAGEN — más compacta */}
            <div className="col-image">
              <div className="main-img-card">
                <img
                  src={imagenActiva || '/placeholder.png'}
                  alt={producto.nombre}
                />
              </div>

              {galeria.length > 1 && (
                <div className="thumbs">
                  {galeria.map(url => (
                    <button
                      key={url}
                      type="button"
                      className={`thumb ${
                        imagenActiva === url ? 'active' : ''
                      }`}
                      onClick={() => setImagenActiva(url)}
                    >
                      <img src={url} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* COL INFO */}
            <div className="col-info">
              <span className="subcat-badge">
                {producto.subcategoriaNombre}
              </span>
              <h1>{producto.nombre}</h1>

              <div className="price-box">
                {tieneVariantes && !varianteSeleccionada && (
                  <span className="price-label">Desde</span>
                )}
                <span className="price-amount">{fmt(precioActual)}</span>
                <span className="price-unit">/ {producto.unidad}</span>
              </div>

              {/* BOTÓN COMPRAR — siempre visible, antes de la descripción */}
              <div className="action-area">
                <div className="action-row">
                  <div className="cantidad-selector">
                    <div className="ctrl">
                      <button
                        onClick={() => setCantidad(c => Math.max(1, c - 1))}
                        aria-label="Restar"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={cantidad}
                        onChange={e =>
                          setCantidad(Math.max(1, Number(e.target.value) || 1))
                        }
                      />
                      <button
                        onClick={() => setCantidad(c => c + 1)}
                        aria-label="Sumar"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    className="btn-cart"
                    onClick={handleAddToCart}
                    disabled={requiereSeleccion}
                  >
                    {requiereSeleccion
                      ? 'Elegí una opción primero'
                      : `Agregar al carrito — ${fmt(precioActual * cantidad)}`}
                  </button>
                </div>

                {feedback && <div className="feedback">{feedback}</div>}

                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                    mensajeWA
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  Consultar por WhatsApp
                </a>
              </div>

              {tieneVariantes && (
                <div className="content-section">
                  <h3>
                    Elegí una opción
                    {requiereSeleccion && (
                      <span className="required-tag">requerido</span>
                    )}
                  </h3>
                  <div className="variantes-pills">
                    {variantes.map(v => (
                      <button
                        key={v.id}
                        type="button"
                        className={`variante-pill ${
                          varianteId === v.id ? 'active' : ''
                        }`}
                        onClick={() => setVarianteId(v.id)}
                      >
                        <span className="vp-nombre">{v.nombre}</span>
                        <span className="vp-precio">{fmt(v.precio)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="content-section">
                <h3>Descripción</h3>
                <p>
                  {producto.descripcion_larga ||
                    producto.descripcion ||
                    'Sin descripción disponible para este producto.'}
                </p>
              </div>

              {producto.especificaciones &&
                Object.keys(producto.especificaciones).length > 0 && (
                  <div className="content-section">
                    <h3>Ficha Técnica</h3>
                    <div className="specs-grid">
                      {Object.entries(producto.especificaciones).map(
                        ([key, val]: any) => (
                          <div key={key} className="spec-item">
                            <strong>{key}:</strong> {val}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        <CartButton />
        <CartDrawer />

        <style jsx>{`
          .detalle-wrapper {
            padding: 100px 20px 60px;
            background: #fdfcf9;
            min-height: 100vh;
          }
          .container {
            max-width: 1100px;
            margin: 0 auto;
          }

          .btn-volver {
            background: none;
            border: none;
            color: #888;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 16px;
            transition: 0.2s;
            font-size: 0.9rem;
          }
          .btn-volver:hover {
            color: #d62828;
          }

          .detalle-grid {
            display: grid;
            grid-template-columns: 1fr 1.2fr;
            gap: 40px;
            align-items: start;
          }

          /* ── Imagen: compacta, sin zoom excesivo ── */
          .col-image {
            position: sticky;
            top: 100px;
            align-self: start;
          }
          .main-img-card {
            background: white;
            border-radius: 16px;
            padding: 10px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
          }
          .main-img-card img {
            width: 100%;
            display: block;
            object-fit: contain;
            aspect-ratio: 1 / 1;
            border-radius: 12px;
            background: #fff;
          }

          .thumbs {
            display: flex;
            gap: 8px;
            margin-top: 10px;
            overflow-x: auto;
            padding: 2px;
          }
          .thumb {
            flex: 0 0 auto;
            width: 56px;
            height: 56px;
            border: 2px solid #eee;
            border-radius: 10px;
            overflow: hidden;
            background: white;
            cursor: pointer;
            padding: 3px;
            transition: 0.2s;
          }
          .thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            border-radius: 6px;
          }
          .thumb.active {
            border-color: #d62828;
            transform: scale(1.05);
          }
          .thumb:hover:not(.active) {
            border-color: #ccc;
          }

          /* ── Info: tipografía consistente ── */
          .subcat-badge {
            display: inline-block;
            background: #f0f0f0;
            color: #d62828;
            padding: 4px 12px;
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 800;
            text-transform: uppercase;
            margin-bottom: 8px;
          }

          h1 {
            font-family: 'Barlow Condensed', 'Bebas Neue', sans-serif;
            font-size: 1.8rem;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0 0 10px;
            line-height: 1.15;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .price-box {
            display: flex;
            align-items: baseline;
            gap: 8px;
            margin-bottom: 16px;
            flex-wrap: wrap;
          }
          .price-label {
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 700;
            color: #888;
          }
          .price-amount {
            font-size: 2rem;
            font-weight: 900;
            color: #d62828;
          }
          .price-unit {
            color: #999;
            font-weight: 600;
            font-size: 0.95rem;
          }

          /* ── Acción: siempre visible arriba ── */
          .action-area {
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
          }
          .action-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 10px;
          }

          .cantidad-selector {
            flex-shrink: 0;
          }
          .ctrl {
            display: inline-flex;
            align-items: center;
            border: 1px solid #ddd;
            border-radius: 50px;
            overflow: hidden;
            background: white;
          }
          .ctrl button {
            width: 38px;
            height: 42px;
            border: none;
            background: white;
            cursor: pointer;
            font-size: 1.1rem;
            font-weight: 700;
            color: #333;
          }
          .ctrl button:hover {
            background: #f5f5f5;
          }
          .ctrl input {
            width: 44px;
            text-align: center;
            border: none;
            font-weight: 700;
            font-size: 0.95rem;
            -moz-appearance: textfield;
          }
          .ctrl input::-webkit-outer-spin-button,
          .ctrl input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }

          .btn-cart {
            flex: 1;
            background: #d62828;
            color: white;
            padding: 14px 20px;
            border: none;
            border-radius: 50px;
            font-weight: 800;
            font-size: 0.95rem;
            cursor: pointer;
            box-shadow: 0 6px 20px rgba(214, 40, 40, 0.25);
            transition: 0.2s;
            white-space: nowrap;
          }
          .btn-cart:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 10px 28px rgba(214, 40, 40, 0.35);
          }
          .btn-cart:disabled {
            background: #d4a3a3;
            cursor: not-allowed;
            box-shadow: none;
          }

          .feedback {
            background: #ecfdf5;
            color: #047857;
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 10px;
            text-align: center;
            animation: fadeIn 0.3s ease;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .btn-whatsapp {
            display: block;
            width: 100%;
            text-align: center;
            background: white;
            color: #25d366;
            padding: 12px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 800;
            font-size: 0.9rem;
            border: 2px solid #25d366;
            transition: 0.2s;
            box-sizing: border-box;
          }
          .btn-whatsapp:hover {
            background: #25d366;
            color: white;
          }

          /* ── Secciones de contenido: más compactas ── */
          .content-section {
            margin-bottom: 20px;
          }
          .content-section h3 {
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #333;
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .required-tag {
            background: #fef2f2;
            color: #b91c1c;
            font-size: 0.65rem;
            padding: 3px 8px;
            border-radius: 50px;
            font-weight: 800;
            letter-spacing: 0.5px;
          }
          .content-section p {
            line-height: 1.6;
            color: #555;
            font-size: 0.92rem;
            white-space: pre-wrap;
          }

          .variantes-pills {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .variante-pill {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
            background: white;
            border: 2px solid #eee;
            border-radius: 12px;
            padding: 8px 14px;
            cursor: pointer;
            font-family: inherit;
            transition: 0.2s;
            min-width: 100px;
          }
          .variante-pill:hover {
            border-color: #ccc;
          }
          .variante-pill.active {
            border-color: #d62828;
            background: #fff5f5;
            box-shadow: 0 4px 12px rgba(214, 40, 40, 0.12);
          }
          .vp-nombre {
            font-weight: 700;
            color: #1a1a1a;
            font-size: 0.85rem;
          }
          .vp-precio {
            font-size: 0.75rem;
            color: #d62828;
            font-weight: 700;
          }

          .specs-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .spec-item {
            font-size: 0.85rem;
            color: #666;
            padding: 8px 10px;
            background: #fff;
            border-radius: 8px;
            border: 1px solid #f0f0f0;
          }

          /* ── Responsive ── */
          @media (max-width: 950px) {
            .detalle-grid {
              grid-template-columns: 1fr;
            }
            .col-image {
              position: static;
            }
            h1 {
              font-size: 1.5rem;
            }
            .detalle-wrapper {
              padding-top: 90px;
            }
            .action-row {
              flex-direction: column;
            }
            .btn-cart {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </PublicLayout>
  )
}
