'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import PublicLayout from '@/components/public/PublicLayout'
import Link from 'next/link'
import CartDrawer from '@/components/public/CartDrawer'
import CartButton from '@/components/public/CartButton'
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

export default function TiendaPage() {
  const [categorias, setCategorias] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  // Map producto_id → { count, minPrecio }
  const [variantesPorProducto, setVariantesPorProducto] = useState<
    Record<string, { count: number; minPrecio: number }>
  >({})
  const [catActiva, setCatActiva] = useState('todas')
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    async function cargar() {
      const [{ data: cats }, { data: prods }, { data: varsRaw }] =
        await Promise.all([
          supabase.from('tienda_categorias').select('*').order('orden'),
          supabase
            .from('tienda_productos')
            .select('*, tienda_subcategorias(categoria_id)')
            .eq('activo', true)
            .order('orden'),
          supabase
            .from('tienda_producto_variantes')
            .select('producto_id, precio')
            .eq('activo', true),
        ])

      // Agrupar variantes por producto_id
      const mapa: Record<string, { count: number; minPrecio: number }> = {}
      ;(varsRaw || []).forEach((v: any) => {
        const pid = v.producto_id
        const precio = Number(v.precio) || 0
        if (!mapa[pid]) {
          mapa[pid] = { count: 0, minPrecio: precio }
        }
        mapa[pid].count += 1
        if (precio < mapa[pid].minPrecio) mapa[pid].minPrecio = precio
      })

      setCategorias(cats || [])
      setProductos(prods || [])
      setVariantesPorProducto(mapa)
      setLoading(false)
    }
    cargar()
  }, [])

  const productosFiltrados = useMemo(() => {
    if (catActiva === 'todas') return productos
    return productos.filter(
      p => p.tienda_subcategorias?.categoria_id === catActiva
    )
  }, [productos, catActiva])

  const handleAdd = (e: React.MouseEvent, p: any) => {
    e.preventDefault()
    e.stopPropagation()
    // Si tiene variantes, no se debería poder llegar acá (botón deshabilitado),
    // pero por las dudas:
    if (variantesPorProducto[p.id]?.count > 0) return
    addItem({
      productoId: p.id,
      varianteId: null,
      varianteNombre: null,
      slug: p.slug,
      nombre: p.nombre,
      precio: p.precio,
      unidad: p.unidad || 'unidad',
      imagen_url: p.imagen_url,
    })
  }

  return (
    <PublicLayout>
      <div className="tienda-wrapper">
        <header className="hero-compact">
          <div className="container">
            <span className="badge">PRODUCTOS PREMIUM</span>
            <h1>
              Catálogo <span className="highlight">RG</span>
            </h1>
          </div>
        </header>

        <div className="main-grid container">
          <aside className="sidebar">
            <div className="sticky-box">
              <h3>CATEGORÍAS</h3>
              <nav>
                <button
                  className={catActiva === 'todas' ? 'active' : ''}
                  onClick={() => setCatActiva('todas')}
                >
                  Ver todo
                </button>
                {categorias.map(cat => (
                  <button
                    key={cat.id}
                    className={catActiva === cat.id ? 'active' : ''}
                    onClick={() => setCatActiva(cat.id)}
                  >
                    {cat.nombre}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <main className="content">
            {loading ? (
              <div className="loader">Cargando...</div>
            ) : productosFiltrados.length === 0 ? (
              <div className="loader">No hay productos en esta categoría</div>
            ) : (
              <div className="products-grid">
                {productosFiltrados.map(p => {
                  const info = variantesPorProducto[p.id]
                  const tieneVariantes = (info?.count ?? 0) > 0
                  // Precio a mostrar:
                  // - Con variantes: el min de variantes (o precio_desde si está)
                  // - Sin variantes: el precio normal
                  const precioMostrar = tieneVariantes
                    ? p.precio_desde ?? info!.minPrecio
                    : p.precio
                  return (
                    <Link
                      href={`/tienda/${p.slug}`}
                      key={p.id}
                      className="product-card"
                    >
                      <div className="img-holder">
                        <img
                          src={p.imagen_url || '/placeholder.png'}
                          alt={p.nombre}
                        />
                      </div>
                      <div className="info">
                        <h3>{p.nombre}</h3>
                        <p className="price">
                          {tieneVariantes && (
                            <span className="price-desde">Desde </span>
                          )}
                          {fmt(precioMostrar)} <small>/ {p.unidad}</small>
                        </p>
                        <div className="actions">
                          <span className="btn-ver">Ver detalle</span>
                          {tieneVariantes ? (
                            <span
                              className="btn-add disabled"
                              title="Elegí una opción en el detalle"
                            >
                              Elegir
                            </span>
                          ) : (
                            <button
                              className="btn-add"
                              onClick={e => handleAdd(e, p)}
                              aria-label="Agregar al carrito"
                            >
                              + Agregar
                            </button>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </main>
        </div>

        <CartButton />
        <CartDrawer />

        <style jsx>{`
          .tienda-wrapper {
            background: #f9f9f9;
            min-height: 100vh;
            padding-bottom: 100px;
          }
          .hero-compact {
            background: #111;
            color: white;
            padding: 120px 20px 80px;
            text-align: center;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
          }
          .highlight {
            color: #d62828;
          }
          .badge {
            background: #d62828;
            padding: 5px 15px;
            border-radius: 50px;
            font-size: 0.7rem;
            font-weight: 800;
          }
          h1 {
            font-size: 3rem;
            margin-top: 10px;
            font-family: 'Playfair Display', serif;
          }

          .main-grid {
            display: grid;
            grid-template-columns: 280px 1fr;
            gap: 40px;
            margin-top: -40px;
          }

          .sidebar {
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            height: fit-content;
          }
          .sticky-box h3 {
            font-size: 0.8rem;
            letter-spacing: 2px;
            color: #999;
            margin-bottom: 20px;
          }
          .sticky-box button {
            width: 100%;
            text-align: left;
            padding: 12px;
            border: none;
            background: none;
            cursor: pointer;
            border-radius: 10px;
            font-weight: 600;
            color: #444;
            transition: 0.3s;
          }
          .sticky-box button.active {
            background: #d62828;
            color: white;
          }
          .sticky-box button:hover:not(.active) {
            background: #f0f0f0;
          }

          .loader {
            padding: 60px;
            text-align: center;
            color: #999;
          }

          .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 25px;
          }

          .product-card {
            background: white;
            border-radius: 20px;
            overflow: hidden;
            transition: 0.3s;
            border: 1px solid #eee;
            display: flex;
            flex-direction: column;
            cursor: pointer;
            color: #1a1a1a;
            padding: 12px;
            text-decoration: none;
          }
          .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            border-color: #d62828;
          }
          .img-holder {
            height: 220px;
            background: #f5f5f5;
            overflow: hidden;
            border-radius: 14px;
          }
          .img-holder img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
          .info {
            padding: 16px 8px 8px;
            text-align: center;
            display: flex;
            flex-direction: column;
            flex: 1;
          }
          .info h3 {
            margin: 0;
            font-size: 1.05rem;
            min-height: 2.4em;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #1a1a1a;
          }
          .price {
            color: #d62828;
            font-size: 1.3rem;
            font-weight: 800;
            margin: 10px 0;
          }
          .price small {
            color: #999;
            font-weight: 500;
          }
          .price-desde {
            font-size: 0.7rem;
            font-weight: 700;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-right: 4px;
          }
          .actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: auto;
          }
          .btn-ver {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 700;
            color: #333;
            transition: 0.3s;
          }
          .product-card:hover .btn-ver {
            background: #111;
            color: white;
            border-color: #111;
          }
          .btn-add {
            background: #d62828;
            color: white;
            border: none;
            border-radius: 50px;
            padding: 10px 12px;
            font-size: 0.8rem;
            font-weight: 800;
            cursor: pointer;
            transition: 0.2s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          .btn-add:hover:not(.disabled) {
            background: #a51d1d;
            transform: scale(1.03);
          }
          .btn-add.disabled {
            background: #f3a3a3;
            cursor: pointer;
          }

          @media (max-width: 900px) {
            .main-grid {
              grid-template-columns: 1fr;
            }
            .hero-compact {
              padding-top: 100px;
            }
          }
        `}</style>
      </div>
    </PublicLayout>
  )
}
