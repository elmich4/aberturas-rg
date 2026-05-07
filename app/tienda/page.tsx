'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import PublicLayout from '@/components/public/PublicLayout'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const WA_NUMBER = '59897699854'

type Categoria = { id: string; nombre: string; slug: string; orden: number }
type Subcategoria = { id: string; categoria_id: string; nombre: string; slug: string; orden: number }

type Variante = { label: string; precio_extra: number }

type Producto = {
  id: string
  subcategoria_id: string | null
  nombre: string
  descripcion: string | null
  descripcion_larga: string | null
  precio: number
  unidad: string
  imagen_url: string | null
  imagenes: string[] | null
  especificaciones: Record<string, string> | null
  variantes: Variante[] | null
  activo: boolean
  orden: number
}

type ItemCarrito = { 
  producto: Producto
  cantidad: number
  varianteElegida?: Variante | null
  precioFinal: number 
}

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

  // Modal Detail States
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [varianteLocal, setVarianteLocal] = useState<Variante | null>(null)
  const [fotoPrincipal, setFotoPrincipal] = useState<string | null>(null)

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

  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      const sub = subcategorias.find(s => s.id === p.subcategoria_id)
      const matchCat = catActiva === 'todas' || sub?.categoria_id === catActiva
      const matchSub = subActiva === 'todas' || p.subcategoria_id === subActiva
      const matchBusq = busqueda === '' || p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      return matchCat && matchSub && matchBusq
    })
  }, [productos, catActiva, subActiva, busqueda, subcategorias])

  const abrirDetalle = (p: Producto) => {
    setProductoSeleccionado(p)
    setVarianteLocal(null)
    setFotoPrincipal(p.imagen_url)
  }

  const agregarAlCarrito = (producto: Producto, variante?: Variante | null) => {
    const pFinal = producto.precio + (variante?.precio_extra || 0)
    const uniqueKey = `${producto.id}-${variante?.label || 'base'}`

    setCarrito(prev => {
      const existe = prev.find(i => `${i.producto.id}-${i.varianteElegida?.label || 'base'}` === uniqueKey)
      if (existe) {
        return prev.map(i => `${i.producto.id}-${i.varianteElegida?.label || 'base'}` === uniqueKey 
          ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      }
      return [...prev, { producto, cantidad: 1, varianteElegida: variante, precioFinal: pFinal }]
    })
    setProductoSeleccionado(null)
  }

  const cambiarCantidad = (uniqueKey: string, delta: number) => {
    setCarrito(prev => prev.map(i => {
      const k = `${i.producto.id}-${i.varianteElegida?.label || 'base'}`
      return k === uniqueKey ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i
    }).filter(i => i.cantidad > 0))
  }

  const totalCarrito = carrito.reduce((acc, i) => acc + i.precioFinal * i.cantidad, 0)
  const cantidadTotal = carrito.reduce((acc, i) => acc + i.cantidad, 0)

  const enviarWA = () => {
    const lineas = carrito.map(i => `• ${i.cantidad}x ${i.producto.nombre}${i.varianteElegida ? ` (${i.varianteElegida.label})` : ''} — ${fmt(i.precioFinal * i.cantidad)}`).join('\n')
    const msg = `¡Hola! Me interesa presupuesto por:\n\n${lineas}\n\n*Total estimado: ${fmt(totalCarrito)}*`
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <PublicLayout>
      <div className="tienda-wrapper">
        {/* Hero Rediseñado Estilo Landing */}
        <section className="tienda-hero">
          <div className="hero-content">
            <span className="hero-badge">CATÁLOGO EXCLUSIVO</span>
            <h1>Nuestra <span className="text-highlight">Tienda</span></h1>
            <p>Aberturas de alta gama y materiales de construcción con entrega a todo el país.</p>
          </div>
        </section>

        <div className="tienda-container">
          {/* Sidebar con Glassmorphism */}
          <aside className="tienda-sidebar">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Buscar aberturas..." 
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>

            <div className="filter-group">
              <label>RUBROS</label>
              <button className={catActiva === 'todas' ? 'active' : ''} onClick={() => setCatActiva('todas')}>Ver todo</button>
              {categorias.map(cat => (
                <button 
                  key={cat.id} 
                  className={catActiva === cat.id ? 'active' : ''} 
                  onClick={() => {setCatActiva(cat.id); setSubActiva('todas')}}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>

            {catActiva !== 'todas' && (
              <div className="filter-group subcategories animate-in">
                <label>CATEGORÍAS</label>
                <button className={subActiva === 'todas' ? 'active' : ''} onClick={() => setSubActiva('todas')}>Todas</button>
                {subcategorias.filter(s => s.categoria_id === catActiva).map(sub => (
                  <button 
                    key={sub.id} 
                    className={subActiva === sub.id ? 'active' : ''} 
                    onClick={() => setSubActiva(sub.id)}
                  >
                    {sub.nombre}
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* Grid de Productos */}
          <main className="tienda-main">
            {loading ? (
              <div className="loading-state"><div className="loader"></div></div>
            ) : (
              <div className="productos-grid">
                {productosFiltrados.map(p => (
                  <div key={p.id} className="card-producto" onClick={() => abrirDetalle(p)}>
                    <div className="card-image">
                      <img src={p.imagen_url || '/placeholder.png'} alt={p.nombre} loading="lazy" />
                      <div className="card-overlay">
                        <span>VER DETALLE</span>
                      </div>
                    </div>
                    <div className="card-body">
                      <h3>{p.nombre}</h3>
                      <div className="card-price-row">
                        <span className="price">{fmt(p.precio)}</span>
                        <span className="unit">/ {p.unidad}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Modal de Detalle Estilo Premium */}
        {productoSeleccionado && (
          <div className="modal-overlay" onClick={() => setProductoSeleccionado(null)}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
              <button className="close-modal" onClick={() => setProductoSeleccionado(null)}>✕</button>
              
              <div className="modal-grid">
                <div className="modal-gallery">
                  <div className="main-img">
                    <img src={fotoPrincipal || '/placeholder.png'} alt="" />
                  </div>
                  <div className="thumb-strip">
                    <img 
                      src={productoSeleccionado.imagen_url || ''} 
                      onClick={() => setFotoPrincipal(productoSeleccionado.imagen_url)}
                      className={fotoPrincipal === productoSeleccionado.imagen_url ? 'active' : ''}
                    />
                    {productoSeleccionado.imagenes?.map((img, i) => (
                      <img 
                        key={i} 
                        src={img} 
                        onClick={() => setFotoPrincipal(img)}
                        className={fotoPrincipal === img ? 'active' : ''}
                      />
                    ))}
                  </div>
                </div>

                <div className="modal-details">
                  <span className="modal-category">
                    {categorias.find(c => c.id === subcategorias.find(s => s.id === productoSeleccionado.subcategoria_id)?.categoria_id)?.nombre}
                  </span>
                  <h2>{productoSeleccionado.nombre}</h2>
                  <p className="modal-desc">{productoSeleccionado.descripcion_larga || productoSeleccionado.descripcion}</p>

                  {productoSeleccionado.especificaciones && (
                    <div className="modal-specs">
                      <h4>Especificaciones</h4>
                      <div className="specs-grid">
                        {Object.entries(productoSeleccionado.especificaciones).map(([k, v]) => (
                          <div key={k} className="spec-row"><strong>{k}</strong> <span>{v}</span></div>
                        ))}
                      </div>
                    </div>
                  )}

                  {productoSeleccionado.variantes && (
                    <div className="modal-variants">
                      <h4>Opciones disponibles</h4>
                      <div className="variants-flex">
                        {productoSeleccionado.variantes.map((v, i) => (
                          <button 
                            key={i} 
                            className={varianteLocal?.label === v.label ? 'active' : ''}
                            onClick={() => setVarianteLocal(v)}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="modal-footer">
                    <div className="total-price">
                      <span>Precio Total:</span>
                      <strong>{fmt(productoSeleccionado.precio + (varianteLocal?.precio_extra || 0))}</strong>
                    </div>
                    <button className="btn-add" onClick={() => agregarAlCarrito(productoSeleccionado, varianteLocal)}>
                      Añadir al presupuesto
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Cart Button */}
        {cantidadTotal > 0 && (
          <button className="cart-fab" onClick={() => setCarritoAbierto(true)}>
            <div className="fab-icon">🛒</div>
            <span className="fab-count">{cantidadTotal}</span>
          </button>
        )}

        {/* Cart Drawer */}
        {carritoAbierto && (
          <div className="cart-overlay" onClick={() => setCarritoAbierto(false)}>
            <div className="cart-drawer" onClick={e => e.stopPropagation()}>
              <div className="cart-header">
                <h3>Mi Presupuesto</h3>
                <button onClick={() => setCarritoAbierto(false)}>✕</button>
              </div>
              <div className="cart-list">
                {carrito.map(item => {
                  const key = `${item.producto.id}-${item.varianteElegida?.label || 'base'}`
                  return (
                    <div key={key} className="cart-item">
                      <div className="item-img"><img src={item.producto.imagen_url || ''} alt="" /></div>
                      <div className="item-info">
                        <strong>{item.producto.nombre}</strong>
                        {item.varianteElegida && <small>{item.varianteElegida.label}</small>}
                        <div className="item-qty">
                          <button onClick={() => cambiarCantidad(key, -1)}>−</button>
                          <span>{item.cantidad}</span>
                          <button onClick={() => cambiarCantidad(key, 1)}>+</button>
                        </div>
                      </div>
                      <div className="item-price">{fmt(item.precioFinal * item.cantidad)}</div>
                    </div>
                  )
                })}
              </div>
              <div className="cart-footer">
                <div className="total-row"><span>Total:</span> <strong>{fmt(totalCarrito)}</strong></div>
                <button className="btn-whatsapp" onClick={enviarWA}>Confirmar por WhatsApp</button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .tienda-wrapper { background: #fdfcf9; color: #1a1a1a; min-height: 100vh; }
          
          /* Hero Section */
          .tienda-hero { 
            background: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80');
            background-size: cover; background-position: center;
            color: white; padding: 100px 20px; text-align: center;
          }
          .hero-content h1 { font-family: 'Playfair Display', serif; font-size: 4rem; margin: 10px 0; }
          .hero-badge { background: #D62828; padding: 5px 15px; border-radius: 50px; font-size: 0.8rem; font-weight: 700; letter-spacing: 1px; }
          .text-highlight { color: #D62828; }
          .hero-content p { font-size: 1.2rem; opacity: 0.8; max-width: 600px; margin: 0 auto; }

          .tienda-container { max-width: 1300px; margin: -50px auto 0; display: grid; grid-template-columns: 280px 1fr; gap: 40px; padding: 0 20px 100px; }

          /* Sidebar */
          .tienda-sidebar { background: white; padding: 30px; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); height: fit-content; position: sticky; top: 20px; }
          .search-box { position: relative; margin-bottom: 30px; }
          .search-box input { width: 100%; padding: 12px 40px 12px 15px; border: 1px solid #eee; border-radius: 12px; background: #f9f9f9; }
          .search-box svg { position: absolute; right: 15px; top: 12px; width: 20px; color: #999; }
          
          .filter-group label { display: block; font-size: 0.7rem; font-weight: 800; color: #999; letter-spacing: 1px; margin-bottom: 15px; }
          .filter-group button { display: block; width: 100%; text-align: left; padding: 10px; border: none; background: none; cursor: pointer; border-radius: 8px; font-weight: 500; transition: 0.2s; }
          .filter-group button:hover { background: #fff5f5; color: #D62828; }
          .filter-group button.active { background: #D62828; color: white; box-shadow: 0 4px 12px rgba(214,40,40,0.3); }

          /* Cards */
          .productos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px; }
          .card-producto { background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.03); transition: 0.3s; cursor: pointer; border: 1px solid #f0f0f0; }
          .card-producto:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
          .card-image { position: relative; height: 240px; }
          .card-image img { width: 100%; height: 100%; object-fit: cover; }
          .card-overlay { position: absolute; inset: 0; background: rgba(214,40,40,0.8); display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.3s; }
          .card-overlay span { color: white; font-weight: 800; border: 2px solid white; padding: 10px 20px; border-radius: 50px; }
          .card-producto:hover .card-overlay { opacity: 1; }
          .card-body { padding: 25px; }
          .card-body h3 { font-family: 'Playfair Display', serif; font-size: 1.3rem; margin: 0 0 15px; }
          .card-price-row { display: flex; align-items: baseline; gap: 5px; }
          .price { font-size: 1.5rem; font-weight: 800; color: #D62828; }
          .unit { color: #999; font-size: 0.8rem; }

          /* Modal Premium */
          .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(10px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
          .modal-content { background: white; width: 100%; max-width: 1100px; border-radius: 32px; position: relative; max-height: 90vh; overflow-y: auto; }
          .modal-grid { display: grid; grid-template-columns: 1.2fr 1fr; }
          .modal-gallery { background: #f9f9f9; padding: 40px; }
          .main-img { height: 450px; border-radius: 20px; overflow: hidden; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
          .main-img img { width: 100%; height: 100%; object-fit: contain; }
          .thumb-strip { display: flex; gap: 10px; margin-top: 20px; }
          .thumb-strip img { width: 70px; height: 70px; border-radius: 12px; cursor: pointer; object-fit: cover; border: 2px solid transparent; }
          .thumb-strip img.active { border-color: #D62828; }

          .modal-details { padding: 50px; }
          .modal-category { color: #D62828; font-weight: 800; font-size: 0.8rem; letter-spacing: 2px; }
          .modal-details h2 { font-family: 'Playfair Display', serif; font-size: 2.8rem; margin: 10px 0 20px; }
          .modal-desc { color: #666; line-height: 1.8; margin-bottom: 30px; }
          
          .modal-specs { background: #fdfcf9; border-radius: 20px; padding: 25px; border: 1px solid #f0e9e0; margin-bottom: 30px; }
          .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .spec-row { display: flex; flex-direction: column; font-size: 0.85rem; }
          .spec-row strong { color: #999; text-transform: uppercase; font-size: 0.7rem; }

          .variants-flex { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
          .variants-flex button { padding: 10px 20px; border: 1px solid #eee; border-radius: 50px; background: white; cursor: pointer; font-weight: 600; }
          .variants-flex button.active { border-color: #D62828; color: #D62828; background: #fff5f5; }

          .modal-footer { margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
          .total-price span { display: block; color: #999; }
          .total-price strong { font-size: 2.5rem; color: #D62828; }
          .btn-add { background: #D62828; color: white; padding: 15px 40px; border-radius: 50px; border: none; font-weight: 700; cursor: pointer; font-size: 1.1rem; box-shadow: 0 10px 25px rgba(214,40,40,0.3); }

          /* Cart FAB */
          .cart-fab { position: fixed; bottom: 30px; right: 30px; width: 70px; height: 70px; background: #1a1a1a; color: white; border-radius: 50%; border: none; cursor: pointer; z-index: 500; display: flex; align-items: center; justify-content: center; box-shadow: 0 15px 35px rgba(0,0,0,0.2); transition: 0.3s; }
          .cart-fab:hover { transform: scale(1.1) rotate(-10deg); background: #D62828; }
          .fab-icon { font-size: 1.5rem; }
          .fab-count { position: absolute; top: -5px; right: -5px; background: #D62828; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; border: 4px solid #fdfcf9; }

          /* Cart Drawer */
          .cart-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1100; display: flex; justify-content: flex-end; }
          .cart-drawer { width: 100%; max-width: 450px; background: white; height: 100%; padding: 40px; display: flex; flex-direction: column; }
          .cart-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 20px; }
          .cart-header h3 { font-family: 'Playfair Display', serif; font-size: 1.8rem; }
          .cart-list { flex: 1; overflow-y: auto; padding: 20px 0; }
          .cart-item { display: grid; grid-template-columns: 70px 1fr auto; gap: 20px; align-items: center; margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 16px; }
          .item-img img { width: 100%; height: 70px; object-fit: cover; border-radius: 10px; }
          .item-qty { display: flex; align-items: center; gap: 10px; margin-top: 5px; }
          .item-qty button { width: 25px; height: 25px; border-radius: 5px; border: none; background: white; cursor: pointer; }
          .btn-whatsapp { background: #25D366; color: white; border: none; width: 100%; padding: 18px; border-radius: 50px; font-weight: 800; font-size: 1rem; cursor: pointer; margin-top: 20px; }

          @media (max-width: 1000px) {
            .tienda-container { grid-template-columns: 1fr; margin-top: 20px; }
            .modal-grid { grid-template-columns: 1fr; }
            .tienda-sidebar { position: relative; top: 0; }
            .hero-content h1 { font-size: 2.5rem; }
          }

          .animate-pop { animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
          @keyframes pop { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `}</style>
      </div>
    </PublicLayout>
  )
}