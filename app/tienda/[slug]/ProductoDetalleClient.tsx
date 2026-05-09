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
            {/* COL IMAGEN */}
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

              <div className="content-section">
                <h3>Descripción</h3>
                <p>
                  {producto.descripcion_larga ||
                    producto.descripcion ||
                    'Sin descripción disponible para este producto.'}
                </p>
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

              <div className="action-area">
                <div className="cantidad-selector">
                  <label>Cantidad</label>
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
            </div>
          </div>
        </div>

        <CartButton />
        <CartDrawer />

        <style jsx>{`
          .detalle-wrapper {
            padding: 120px 20px 80px;
            background: #fdfcf9;
            min-height: 100vh;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }

          .btn-volver {
            background: none;
            border: none;
            color: #888;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 30px;
            transition: 0.2s;
          }
          .btn-volver:hover {
            color: #d62828;
          }

          .detalle-grid {
            display: grid;
            grid-template-columns: 1.2fr 1fr;
            gap: 60px;
          }

          .col-image {
            position: sticky;
            top: 120px;
            align-self: start;
          }
          .main-img-card {
            background: white;
            border-radius: 30px;
            padding: 16px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
          }
          .main-img-card img {
            width: 100%;
            display: block;
            object-fit: cover;
            aspect-ratio: 4 / 3;
            border-radius: 20px;
          }

          .thumbs {
            display: flex;
            gap: 10px;
            margin-top: 14px;
            overflow-x: auto;
            padding: 4px 2px;
          }
          .thumb {
            flex: 0 0 auto;
            width: 76px;
            height: 76px;
            border: 2px solid #eee;
            border-radius: 14px;
            overflow: hidden;
            background: white;
            cursor: pointer;
            padding: 4px;
            transition: 0.2s;
          }
          .thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            border-radius: 8px;
          }
          .thumb.active {
            border-color: #d62828;
            transform: scale(1.05);
          }
          .thumb:hover:not(.active) {
            border-color: #ccc;
          }

          .subcat-badge {
            display: inline-block;
            background: #f0f0f0;
            color: #d62828;
            padding: 6px 16px;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 800;
            text-transform: uppercase;
            margin-bottom: 15px;
          }

          h1 {
            font-family: 'Playfair Display', serif;
            font-size: 3.2rem;
            color: #1a1a1a;
            margin: 0 0 20px;
            line-height: 1.1;
          }

          .price-box {
            display: flex;
            align-items: baseline;
            gap: 10px;
            margin-bottom: 40px;
            flex-wrap: wrap;
          }
          .price-label {
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 700;
            color: #888;
          }
          .price-amount {
            font-size: 2.8rem;
            font-weight: 900;
            color: #d62828;
          }
          .price-unit {
            color: #999;
            font-weight: 600;
            font-size: 1.1rem;
          }

          .content-section {
            margin-bottom: 40px;
          }
          .content-section h3 {
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #333;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
            margin-bottom: 15px;
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
            line-height: 1.8;
            color: #555;
            font-size: 1.05rem;
            white-space: pre-wrap;
          }

          .variantes-pills {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          .variante-pill {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
            background: white;
            border: 2px solid #eee;
            border-radius: 14px;
            padding: 10px 16px;
            cursor: pointer;
            font-family: inherit;
            transition: 0.2s;
            min-width: 110px;
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
            font-size: 0.92rem;
          }
          .vp-precio {
            font-size: 0.78rem;
            color: #d62828;
            font-weight: 700;
          }

          .specs-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .spec-item {
            font-size: 0.9rem;
            color: #666;
            padding: 10px;
            background: #fff;
            border-radius: 10px;
            border: 1px solid #f0f0f0;
          }

          .action-area {
            margin-top: 30px;
          }

          .cantidad-selector {
            margin-bottom: 16px;
          }
          .cantidad-selector label {
            display: block;
            font-size: 0.85rem;
            font-weight: 700;
            color: #555;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
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
            width: 44px;
            height: 44px;
            border: none;
            background: white;
            cursor: pointer;
            font-size: 1.2rem;
            font-weight: 700;
            color: #333;
          }
          .ctrl button:hover {
            background: #f5f5f5;
          }
          .ctrl input {
            width: 60px;
            text-align: center;
            border: none;
            font-weight: 700;
            font-size: 1rem;
            -moz-appearance: textfield;
          }
          .ctrl input::-webkit-outer-spin-button,
          .ctrl input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }

          .btn-cart {
            display: block;
            width: 100%;
            background: #d62828;
            color: white;
            padding: 20px;
            border: none;
            border-radius: 50px;
            font-weight: 800;
            font-size: 1.05rem;
            cursor: pointer;
            box-shadow: 0 10px 25px rgba(214, 40, 40, 0.25);
            transition: 0.2s;
            margin-bottom: 12px;
          }
          .btn-cart:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 14px 32px rgba(214, 40, 40, 0.35);
          }
          .btn-cart:disabled {
            background: #d4a3a3;
            cursor: not-allowed;
            box-shadow: none;
          }

          .feedback {
            background: #ecfdf5;
            color: #047857;
            padding: 10px 16px;
            border-radius: 10px;
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 12px;
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
            padding: 16px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 800;
            font-size: 1rem;
            border: 2px solid #25d366;
            transition: 0.2s;
          }
          .btn-whatsapp:hover {
            background: #25d366;
            color: white;
          }

          @media (max-width: 950px) {
            .detalle-grid {
              grid-template-columns: 1fr;
            }
            .col-image {
              position: static;
            }
            h1 {
              font-size: 2.5rem;
            }
            .detalle-wrapper {
              padding-top: 100px;
            }
          }
        `}</style>
      </div>
    </PublicLayout>
  )
}
