'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import PublicLayout from '@/components/public/PublicLayout'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const WA_NUMBER = '59897699854'

type Categoria = { id: string; nombre: string; slug: string; orden: number }
type Subcategoria = { id: string; categoria_id: string; nombre: string; slug: string; orden: number }
type Producto = {
  id: string
  subcategoria_id: string | null
  nombre: string
  descripcion: string | null
  precio: number
  unidad: string
  imagen_url: string | null
  activo: boolean
  orden: number
}
type ItemCarrito = { producto: Producto; cantidad: number }

function fmt(n: number) {
  return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(n)
}

export default function TiendaPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [catActiva, setCatActiva] = useState<string>('todas')
  const [subActiva, setSubActiva] = useState<string>('todas')
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      const [{ data: cats }, { data: subs }, { data: prods }] = await Promise.all([
        supabase.from('tienda_categorias').select('*').order('orden'),
        supabase.from('tienda_subcategorias').select('*').order('orden'),
        supabase.from('tienda_productos').select('*').eq('activo', true).order('orden'),
      ])
      setCategorias(cats || [])
      setSubcategorias(subs || [])
      setProductos(prods || [])
      setLoading(false)
    }
    cargar()
  }, [])

  const subcatsDeCat = subcategorias.filter(s => s.categoria_id === catActiva)

  const productosFiltrados = productos.filter(p => {
    const sub = subcategorias.find(s => s.id === p.subcategoria_id)
    const matchCat = catActiva === 'todas' || sub?.categoria_id === catActiva
    const matchSub = subActiva === 'todas' || p.subcategoria_id === subActiva
    const matchBusq = busqueda === '' || p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return matchCat && matchSub && matchBusq
  })

  const agregarAlCarrito = useCallback((producto: Producto) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.producto.id === producto.id)
      if (existe) return prev.map(i => i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      return [...prev, { producto, cantidad: 1 }]
    })
  }, [])

  const cambiarCantidad = (id: string, delta: number) => {
    setCarrito(prev =>
      prev.map(i => i.producto.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i)
        .filter(i => !(i.producto.id === id && i.cantidad + delta < 1))
    )
  }

  const eliminarItem = (id: string) => setCarrito(prev => prev.filter(i => i.producto.id !== id))

  const totalCarrito = carrito.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0)
  const cantidadTotal = carrito.reduce((acc, i) => acc + i.cantidad, 0)

  const enviarWA = () => {
    if (carrito.length === 0) return
    const lineas = carrito.map(i => `• ${i.cantidad}x ${i.producto.nombre} — ${fmt(i.producto.precio * i.cantidad)}`).join('\n')
    const msg = `¡Hola! Me interesa hacer el siguiente pedido:\n\n${lineas}\n\n*Total estimado: ${fmt(totalCarrito)}*\n\n¿Pueden confirmar disponibilidad y coordinar la entrega?`
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const seleccionarCategoria = (slug: string) => {
    setCatActiva(slug)
    setSubActiva('todas')
  }

  return (
    <PublicLayout>
      <div className="tienda-wrapper">
        {/* Hero strip */}
        <div className="tienda-hero">
          <div className="tienda-hero-inner">
            <h1>Tienda</h1>
            <p>Productos con precio fijo · Pedido por WhatsApp · Instalación a coordinar</p>
          </div>
        </div>

        <div className="tienda-body">
          {/* Sidebar filtros */}
          <aside className="tienda-sidebar">
            <div className="sidebar-search">
              <input
                type="text"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>

            <nav className="sidebar-nav">
              <button
                className={`cat-btn ${catActiva === 'todas' ? 'active' : ''}`}
                onClick={() => seleccionarCategoria('todas')}
              >
                Todos los productos
              </button>
              {categorias.map(cat => (
                <div key={cat.id}>
                  <button
                    className={`cat-btn ${catActiva === cat.id ? 'active' : ''}`}
                    onClick={() => seleccionarCategoria(cat.id)}
                  >
                    {cat.nombre}
                  </button>
                  {catActiva === cat.id && subcatsDeCat.length > 0 && (
                    <div className="subcats">
                      <button
                        className={`subcat-btn ${subActiva === 'todas' ? 'active' : ''}`}
                        onClick={() => setSubActiva('todas')}
                      >
                        Todas
                      </button>
                      {subcatsDeCat.map(sub => (
                        <button
                          key={sub.id}
                          className={`subcat-btn ${subActiva === sub.id ? 'active' : ''}`}
                          onClick={() => setSubActiva(sub.id)}
                        >
                          {sub.nombre}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </aside>

          {/* Grid productos */}
          <main className="tienda-main">
            {loading ? (
              <div className="tienda-loading">
                <div className="spinner" />
                <p>Cargando productos...</p>
              </div>
            ) : productosFiltrados.length === 0 ? (
              <div className="tienda-empty">
                <span>🔍</span>
                <p>No hay productos en esta categoría todavía.</p>
              </div>
            ) : (
              <div className="productos-grid">
                {productosFiltrados.map(producto => {
                  const enCarrito = carrito.find(i => i.producto.id === producto.id)
                  const sub = subcategorias.find(s => s.id === producto.subcategoria_id)
                  return (
                    <div key={producto.id} className="producto-card">
                      <div className="producto-img">
                        {producto.imagen_url
                          ? <img src={producto.imagen_url} alt={producto.nombre} />
                          : <div className="producto-img-placeholder">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <path d="m21 15-5-5L5 21" />
                              </svg>
                            </div>
                        }
                        {sub && <span className="producto-badge">{sub.nombre}</span>}
                      </div>
                      <div className="producto-info">
                        <h3>{producto.nombre}</h3>
                        {producto.descripcion && <p>{producto.descripcion}</p>}
                        <div className="producto-footer">
                          <span className="producto-precio">{fmt(producto.precio)}<small>/{producto.unidad}</small></span>
                          {enCarrito ? (
                            <div className="cantidad-ctrl">
                              <button onClick={() => cambiarCantidad(producto.id, -1)}>−</button>
                              <span>{enCarrito.cantidad}</span>
                              <button onClick={() => cambiarCantidad(producto.id, +1)}>+</button>
                            </div>
                          ) : (
                            <button className="btn-agregar" onClick={() => agregarAlCarrito(producto)}>
                              Agregar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </main>
        </div>

        {/* Carrito flotante */}
        {cantidadTotal > 0 && (
          <button className="carrito-fab" onClick={() => setCarritoAbierto(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span className="fab-badge">{cantidadTotal}</span>
          </button>
        )}

        {/* Drawer carrito */}
        {carritoAbierto && (
          <div className="carrito-overlay" onClick={() => setCarritoAbierto(false)}>
            <div className="carrito-drawer" onClick={e => e.stopPropagation()}>
              <div className="drawer-header">
                <h2>Tu pedido</h2>
                <button onClick={() => setCarritoAbierto(false)}>✕</button>
              </div>
              <div className="drawer-items">
                {carrito.map(item => (
                  <div key={item.producto.id} className="drawer-item">
                    <div className="drawer-item-info">
                      <span className="drawer-item-nombre">{item.producto.nombre}</span>
                      <span className="drawer-item-precio">{fmt(item.producto.precio)} c/u</span>
                    </div>
                    <div className="drawer-item-ctrl">
                      <button onClick={() => cambiarCantidad(item.producto.id, -1)}>−</button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => cambiarCantidad(item.producto.id, +1)}>+</button>
                      <button className="btn-eliminar" onClick={() => eliminarItem(item.producto.id)}>🗑</button>
                    </div>
                    <span className="drawer-item-subtotal">{fmt(item.producto.precio * item.cantidad)}</span>
                  </div>
                ))}
              </div>
              <div className="drawer-footer">
                <div className="drawer-total">
                  <span>Total estimado</span>
                  <strong>{fmt(totalCarrito)}</strong>
                </div>
                <p className="drawer-nota">* Los precios son de referencia. Se confirman al coordinar el pedido.</p>
                <button className="btn-wa" onClick={enviarWA}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                  </svg>
                  Enviar pedido por WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .tienda-wrapper { min-height: 100vh; background: #f8f7f4; }

          .tienda-hero {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border-bottom: 3px solid #D62828;
            padding: 3rem 1.5rem 2.5rem;
          }
          .tienda-hero-inner { max-width: 1200px; margin: 0 auto; }
          .tienda-hero h1 {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: clamp(2rem, 5vw, 3.5rem);
            color: #fff;
            margin: 0 0 0.5rem;
            letter-spacing: -0.02em;
          }
          .tienda-hero p { color: #aaa; font-size: 0.95rem; margin: 0; }

          .tienda-body {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1.5rem;
            display: grid;
            grid-template-columns: 240px 1fr;
            gap: 2rem;
          }
          @media (max-width: 768px) {
            .tienda-body { grid-template-columns: 1fr; }
          }

          /* Sidebar */
          .tienda-sidebar { position: sticky; top: 80px; height: fit-content; }
          .sidebar-search input {
            width: 100%;
            padding: 0.6rem 0.9rem;
            border: 1.5px solid #ddd;
            border-radius: 8px;
            font-size: 0.9rem;
            background: #fff;
            margin-bottom: 1.2rem;
            box-sizing: border-box;
            outline: none;
            transition: border-color 0.2s;
          }
          .sidebar-search input:focus { border-color: #D62828; }

          .sidebar-nav { display: flex; flex-direction: column; gap: 2px; }
          .cat-btn {
            width: 100%;
            text-align: left;
            padding: 0.6rem 0.8rem;
            border: none;
            background: transparent;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 500;
            color: #444;
            cursor: pointer;
            transition: all 0.15s;
          }
          .cat-btn:hover { background: #f0f0f0; }
          .cat-btn.active { background: #D62828; color: #fff; }

          .subcats { margin-left: 0.8rem; margin-top: 2px; display: flex; flex-direction: column; gap: 2px; }
          .subcat-btn {
            width: 100%;
            text-align: left;
            padding: 0.4rem 0.8rem;
            border: none;
            background: transparent;
            border-radius: 6px;
            font-size: 0.82rem;
            color: #666;
            cursor: pointer;
            transition: all 0.15s;
            border-left: 2px solid #eee;
          }
          .subcat-btn:hover { background: #f5f5f5; border-left-color: #D62828; }
          .subcat-btn.active { background: #fff0f0; color: #D62828; border-left-color: #D62828; font-weight: 600; }

          /* Loading / empty */
          .tienda-loading, .tienda-empty {
            display: flex; flex-direction: column; align-items: center;
            justify-content: center; padding: 4rem; gap: 1rem; color: #888;
          }
          .tienda-empty span { font-size: 2.5rem; }
          .spinner {
            width: 36px; height: 36px;
            border: 3px solid #eee;
            border-top-color: #D62828;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }

          /* Grid */
          .productos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 1.2rem;
          }

          .producto-card {
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 4px rgba(0,0,0,0.08);
            transition: transform 0.2s, box-shadow 0.2s;
            display: flex;
            flex-direction: column;
          }
          .producto-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.12);
          }

          .producto-img {
            position: relative;
            height: 160px;
            background: #f3f3f3;
          }
          .producto-img img { width: 100%; height: 100%; object-fit: cover; }
          .producto-img-placeholder {
            width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
          }
          .producto-img-placeholder svg { width: 48px; height: 48px; color: #ccc; }
          .producto-badge {
            position: absolute; top: 8px; left: 8px;
            background: rgba(0,0,0,0.75);
            color: #fff;
            font-size: 0.72rem;
            padding: 2px 8px;
            border-radius: 20px;
            backdrop-filter: blur(4px);
          }

          .producto-info { padding: 1rem; flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
          .producto-info h3 { font-size: 0.95rem; font-weight: 600; margin: 0; color: #222; line-height: 1.3; }
          .producto-info p { font-size: 0.82rem; color: #777; margin: 0; line-height: 1.4; flex: 1; }

          .producto-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 0.8rem;
          }
          .producto-precio {
            font-size: 1.1rem;
            font-weight: 700;
            color: #D62828;
          }
          .producto-precio small { font-size: 0.75rem; font-weight: 400; color: #999; }

          .btn-agregar {
            background: #D62828;
            color: #fff;
            border: none;
            padding: 0.45rem 1rem;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.15s;
          }
          .btn-agregar:hover { background: #b52020; }

          .cantidad-ctrl {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            background: #f5f5f5;
            border-radius: 8px;
            padding: 2px 4px;
          }
          .cantidad-ctrl button {
            width: 26px; height: 26px;
            border: none;
            background: #fff;
            border-radius: 6px;
            font-size: 1rem;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: background 0.1s;
          }
          .cantidad-ctrl button:hover { background: #ffe5e5; }
          .cantidad-ctrl span { font-size: 0.9rem; font-weight: 600; min-width: 20px; text-align: center; }

          /* FAB */
          .carrito-fab {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 60px; height: 60px;
            background: #D62828;
            color: #fff;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(214,40,40,0.4);
            display: flex; align-items: center; justify-content: center;
            z-index: 100;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .carrito-fab:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(214,40,40,0.5); }
          .carrito-fab svg { width: 26px; height: 26px; }
          .fab-badge {
            position: absolute;
            top: -4px; right: -4px;
            background: #F7B731;
            color: #1a1a1a;
            font-size: 0.75rem;
            font-weight: 700;
            width: 22px; height: 22px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
          }

          /* Drawer */
          .carrito-overlay {
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 200;
            display: flex; justify-content: flex-end;
          }
          .carrito-drawer {
            width: min(420px, 100vw);
            height: 100%;
            background: #fff;
            display: flex; flex-direction: column;
            animation: slideIn 0.25s ease;
          }
          @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

          .drawer-header {
            padding: 1.2rem 1.5rem;
            border-bottom: 1px solid #eee;
            display: flex; justify-content: space-between; align-items: center;
          }
          .drawer-header h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 1.4rem; margin: 0; }
          .drawer-header button {
            background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #666;
            width: 32px; height: 32px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            transition: background 0.15s;
          }
          .drawer-header button:hover { background: #f0f0f0; }

          .drawer-items { flex: 1; overflow-y: auto; padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 0.8rem; }

          .drawer-item {
            display: grid;
            grid-template-columns: 1fr auto auto;
            gap: 0.5rem;
            align-items: center;
            padding: 0.8rem;
            background: #f8f7f4;
            border-radius: 10px;
          }
          .drawer-item-info { display: flex; flex-direction: column; gap: 2px; }
          .drawer-item-nombre { font-size: 0.9rem; font-weight: 600; color: #222; }
          .drawer-item-precio { font-size: 0.78rem; color: #888; }
          .drawer-item-ctrl {
            display: flex; align-items: center; gap: 0.3rem;
          }
          .drawer-item-ctrl button {
            width: 24px; height: 24px;
            border: none; background: #fff;
            border-radius: 6px; cursor: pointer;
            font-size: 0.9rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: background 0.1s;
          }
          .drawer-item-ctrl button:hover { background: #ffe5e5; }
          .drawer-item-ctrl span { font-size: 0.85rem; font-weight: 600; min-width: 18px; text-align: center; }
          .btn-eliminar { color: #999 !important; font-size: 0.85rem !important; }
          .drawer-item-subtotal { font-size: 0.9rem; font-weight: 700; color: #D62828; text-align: right; }

          .drawer-footer {
            padding: 1.2rem 1.5rem;
            border-top: 1px solid #eee;
            display: flex; flex-direction: column; gap: 0.8rem;
          }
          .drawer-total {
            display: flex; justify-content: space-between; align-items: center;
          }
          .drawer-total span { font-size: 0.95rem; color: #555; }
          .drawer-total strong { font-size: 1.3rem; color: #222; }
          .drawer-nota { font-size: 0.78rem; color: #999; margin: 0; line-height: 1.4; }

          .btn-wa {
            display: flex; align-items: center; justify-content: center; gap: 0.6rem;
            background: #25D366;
            color: #fff;
            border: none;
            padding: 0.9rem;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.15s, transform 0.1s;
          }
          .btn-wa:hover { background: #1da851; transform: scale(1.01); }
          .btn-wa svg { width: 22px; height: 22px; }
        `}</style>
      </div>
    </PublicLayout>
  )
}
