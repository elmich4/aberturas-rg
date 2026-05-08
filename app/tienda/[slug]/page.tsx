'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import PublicLayout from '@/components/public/PublicLayout'
import CartDrawer from '@/components/public/CartDrawer'
import CartButton from '@/components/public/CartButton'
import { useCart } from '@/lib/cart-context'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const WA_NUMBER = '59897699854'

function fmt(n: number) {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    maximumFractionDigits: 0,
  }).format(n)
}

export default function ProductoDetallePage() {
  const { slug } = useParams()
  const router = useRouter()
  const [producto, setProducto] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cantidad, setCantidad] = useState(1)
  const [imagenActiva, setImagenActiva] = useState<string>('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const { addItem } = useCart()

  useEffect(() => {
    async function cargarProducto() {
      if (!slug) return
      const { data, error } = await supabase
        .from('tienda_productos')
        .select('*, tienda_subcategorias(nombre)')
        .eq('slug', slug)
        .single()

      if (error || !data) {
        console.error('Producto no encontrado')
      } else {
        setProducto(data)
        const inicial =
          data.imagen_url ||
          (Array.isArray(data.imagenes) && data.imagenes[0]) ||
          ''
        setImagenActiva(inicial)
      }
      setLoading(false)
    }
    cargarProducto()
  }, [slug])

  const galeria = useMemo<string[]>(() => {
    if (!producto) return []
    const arr: string[] = []
    if (producto.imagen_url) arr.push(producto.imagen_url)
    if (Array.isArray(producto.imagenes)) {
      producto.imagenes.forEach((u: string) => {
        if (u && !arr.includes(u)) arr.push(u)
      })
    }
    return arr
  }, [producto])

  if (loading)
    return (
      <PublicLayout>
        <div className="status-container">Cargando producto...</div>
        <style jsx>{`
          .status-container {
            padding: 150px;
            text-align: center;
          }
        `}</style>
      </PublicLayout>
    )

  if (!producto)
    return (
      <PublicLayout>
        <div className="status-container">
          <h2>Producto no encontrado</h2>
          <button onClick={() => router.push('/tienda')}>Volver a la tienda</button>
        </div>
        <style jsx>{`
          .status-container {
            padding: 150px;
            text-align: center;
          }
        `}</style>
      </PublicLayout>
    )

  const handleAddToCart = () => {
    addItem(
      {
        id: producto.id,
        slug: producto.slug,
        nombre: producto.nombre,
        precio: producto.precio,
        unidad: producto.unidad || 'unidad',
        imagen_url: producto.imagen_url || galeria[0] || '',
      },
      cantidad
    )
    setFeedback(`✓ Agregado al carrito (${cantidad})`)
    setTimeout(() => setFeedback(null), 2500)
  }

  const mensajeWA = `¡Hola! Me interesa el producto: ${producto.nombre}`

  return (
    <PublicLayout>
      <div className="detalle-wrapper">
        <div className="container">
          <button onClick={() => router.back()} className="btn-volver">
            ← Volver atrás
          </button>

          <div className="detalle-grid">
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
                      className={`thumb ${imagenActiva === url ? 'active' : ''}`}
                      onClick={() => setImagenActiva(url)}
                    >
                      <img src={url} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="col-info">
              <span className="subcat-badge">
                {producto.tienda_subcategorias?.nombre || 'General'}
              </span>
              <h1>{producto.nombre}</h1>

              <div className="price-box">
                <span className="price-amount">{fmt(producto.precio)}</span>
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

                <button className="btn-cart" onClick={handleAddToCart}>
                  Agregar al carrito — {fmt(producto.precio * cantidad)}
                </button>

                {feedback && <div className="feedback">{feedback}</div>}

                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensajeWA)}`}
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
            overflow: hidden;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
          }
          .main-img-card img {
            width: 100%;
            display: block;
            object-fit: cover;
            aspect-ratio: 4 / 3;
          }

          .thumbs {
            display: flex;
            gap: 8px;
            margin-top: 12px;
            overflow-x: auto;
            padding: 4px 2px;
          }
          .thumb {
            flex: 0 0 auto;
            width: 70px;
            height: 70px;
            border: 2px solid #eee;
            border-radius: 10px;
            overflow: hidden;
            background: white;
            cursor: pointer;
            padding: 0;
            transition: 0.2s;
          }
          .thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
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
          }
          .content-section p {
            line-height: 1.8;
            color: #555;
            font-size: 1.05rem;
            white-space: pre-wrap;
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
            border-radius: 8px;
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
          .btn-cart:hover {
            transform: translateY(-2px);
            box-shadow: 0 14px 32px rgba(214, 40, 40, 0.35);
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
