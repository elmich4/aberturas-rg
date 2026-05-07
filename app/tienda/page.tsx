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
  
  // Persistencia
  const [presupuestoId, setPresupuestoId] = useState<string | null>(null)
  const [presupuestoCodigo, setPresupuestoCodigo] = useState<number | null>(null)

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
      
      // Recuperar carrito local si existe
      const saved = localStorage.getItem('rg_cart')
      if (saved) setCarrito(JSON.parse(saved))
      
      setLoading(false)
    }
    cargar()
  }, [])

  // Guardar en DB cada vez que el carrito cambia sustancialmente
  useEffect(() => {
    localStorage.setItem('rg_cart', JSON.stringify(carrito))
    
    const guardarPresupuesto = async () => {
      if (carrito.length === 0) return

      const total = carrito.reduce((acc, i) => acc + i.precioFinal * i.cantidad, 0)
      const dataToSave = {
        items: carrito,
        total: total,
      }

      if (presupuestoId) {
        await supabase.from('tienda_presupuestos').update(dataToSave).eq('id', presupuestoId)
      } else {
        const { data, error } = await supabase
          .from('tienda_presupuestos')
          .insert([dataToSave])
          .select()
          .single()
        
        if (data) {
          setPresupuestoId(data.id)
          setPresupuestoCodigo(data.codigo)
        }
      }
    }

    const timer = setTimeout(guardarPresupuesto, 1500) // Debounce para no saturar la DB
    return () => clearTimeout(timer)
  }, [carrito, presupuestoId])

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
    setCarritoAbierto(true)
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
    const ref = presupuestoCodigo ? `\n\n*REF: #${presupuestoCodigo}*` : ''
    const msg = `¡Hola! Me interesa presupuesto por:\n\n${lineas}\n\n*Total estimado: ${fmt(totalCarrito)}*${ref}`
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <PublicLayout>
      <div className="tienda-wrapper">
        <section className="tienda-hero">
          <div className="hero-content">
            <span className="hero-badge">CATÁLOGO EXCLUSIVO</span>
            <h1>Nuestra <span className="text-highlight">Tienda</span></h1>
            <p>Aberturas de alta gama y materiales de construcción.</p>
          </div>
        </section>

        <div className="tienda-container">
          <aside className="tienda-sidebar">
            <div className="search-box">
              <input type="text" placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            </div>
            <div className="filter-group">
              <label>RUBROS</label>
              <button className={catActiva === 'todas' ? 'active' : ''} onClick={() => setCatActiva('todas')}>Ver todo</button>
              {categorias.map(cat => (
                <button key={cat.id} className={catActiva === cat.id ? 'active' : ''} onClick={() => {setCatActiva(cat.id); setSubActiva('todas')}}>
                  {cat.nombre}
                </button>
              ))}
            </div>
          </aside>

          <main className="tienda-main">
            {loading ? <div className="loading-state">Cargando...</div> : (
              <div className="productos-grid">
                {productosFiltrados.map(p => (
                  <div key={p.id} className="card-producto" onClick={() => abrirDetalle(p)}>
                    <div className="card-image">
                      <img src={p.imagen_url || '/placeholder.png'} alt={p.nombre} />
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

        {/* Modal de Detalle */}
        {productoSeleccionado && (
          <div className="modal-overlay" onClick={() => setProductoSeleccionado(null)}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
              <button className="close-modal" onClick={() => setProductoSeleccionado(null)}>✕</button>
              <div className="modal-grid">
                <div className="modal-gallery">
                  <div className="main-img"><img src={fotoPrincipal || '/placeholder.png'} alt="" /></div>
                  <div className="thumb-strip">
                    <img src={productoSeleccionado.imagen_url || ''} onClick={() => setFotoPrincipal(productoSeleccionado.imagen_url)} className={fotoPrincipal === productoSeleccionado.imagen_url ? 'active' : ''} />
                    {productoSeleccionado.imagenes?.map((img, i) => (
                      <img key={i} src={img} onClick={() => setFotoPrincipal(img)} className={fotoPrincipal === img ? 'active' : ''} />
                    ))}
                  </div>
                </div>
                <div className="modal-details">
                  <h2>{productoSeleccionado.nombre}</h2>
                  <p className="modal-desc">{productoSeleccionado.descripcion_larga || productoSeleccionado.descripcion}</p>
                  
                  {productoSeleccionado.especificaciones && (
                    <div className="modal-specs">
                      <h4>Ficha Técnica</h4>
                      <div className="specs-grid">
                        {Object.entries(productoSeleccionado.especificaciones).map(([k, v]) => (
                          <div key={k} className="spec-row"><strong>{k}</strong> <span>{v}</span></div>
                        ))}
                      </div>
                    </div>
                  )}

                  {productoSeleccionado.variantes && (
                    <div className="modal-variants">
                      <h4>Variantes</h4>
                      <div className="variants-flex">
                        {productoSeleccionado.variantes.map((v, i) => (
                          <button key={i} className={varianteLocal?.label === v.label ? 'active' : ''} onClick={() => setVarianteLocal(v)}>
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="modal-footer">
                    <div className="total-price">
                      <span>Total:</span>
                      <strong>{fmt(productoSeleccionado.precio + (varianteLocal?.precio_extra || 0))}</strong>
                    </div>
                    <button className="btn-add" onClick={() => agregarAlCarrito(productoSeleccionado, varianteLocal)}>Añadir</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Cart FAB */}
        {cantidadTotal > 0 && (
          <button className="cart-fab" onClick={() => setCarritoAbierto(true)}>
            <span className="fab-count">{cantidadTotal}</span> 🛒
          </button>
        )}

        {/* Carrito Drawer */}
        {carritoAbierto && (
          <div className="cart-overlay" onClick={() => setCarritoAbierto(false)}>
            <div className="cart-drawer" onClick={e => e.stopPropagation()}>
              <div className="cart-header">
                <h3>Presupuesto {presupuestoCodigo ? `#${presupuestoCodigo}` : ''}</h3>
                <button onClick={() => setCarritoAbierto(false)}>✕</button>
              </div>
              <div className="cart-list">
                {carrito.map(item => {
                  const key = `${item.producto.id}-${item.varianteElegida?.label || 'base'}`
                  return (
                    <div key={key} className="cart-item">
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
                <div className="total-row"><span>Total estimado:</span> <strong>{fmt(totalCarrito)}</strong></div>
                <button className="btn-whatsapp" onClick={enviarWA}>Confirmar por WhatsApp</button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .tienda-wrapper { background: #fdfcf9; min-height: 100vh; font-family: sans-serif; }
          .tienda-hero { background: #1a1a1a; color: white; padding: 80px 20px; text-align: center; }
          .hero-content h1 { font-family: 'Playfair Display', serif; font-size: 3.5rem; margin: 10px 0; }
          .text-highlight { color: #D62828; }
          .hero-badge { background: #D62828; padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; }
          
          .tienda-container { max-width: 1200px; margin: -40px auto 0; display: grid; grid-template-columns: 250px 1fr; gap: 30px; padding: 0 20px 60px; }
          .tienda-sidebar { background: white; padding: 25px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); height: fit-content; }
          
          .filter-group button { display: block; width: 100%; text-align: left; padding: 10px; border: none; background: none; cursor: pointer; border-radius: 8px; margin-bottom: 5px; }
          .filter-group button.active { background: #D62828; color: white; }

          .productos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 25px; }
          .card-producto { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); cursor: pointer; transition: 0.3s; border: 1px solid #f0f0f0; }
          .card-producto:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
          .card-image { height: 200px; background: #f9f9f9; }
          .card-image img { width: 100%; height: 100%; object-fit: cover; }
          .card-body { padding: 20px; }
          .card-body h3 { font-family: 'Playfair Display', serif; font-size: 1.2rem; margin: 0 0 10px; }
          .price { font-size: 1.3rem; font-weight: 800; color: #D62828; }

          .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
          .modal-content { background: white; width: 100%; max-width: 1000px; border-radius: 24px; position: relative; max-height: 90vh; overflow-y: auto; }
          .modal-grid { display: grid; grid-template-columns: 1fr 1fr; }
          .modal-gallery { background: #f5f5f5; padding: 30px; }
          .main-img { height: 350px; background: white; border-radius: 15px; overflow: hidden; }
          .main-img img { width: 100%; height: 100%; object-fit: contain; }
          .thumb-strip { display: flex; gap: 8px; margin-top: 15px; }
          .thumb-strip img { width: 60px; height: 60px; border-radius: 8px; cursor: pointer; object-fit: cover; border: 2px solid transparent; }
          .thumb-strip img.active { border-color: #D62828; }
          .modal-details { padding: 40px; }
          .modal-details h2 { font-family: 'Playfair Display', serif; font-size: 2.2rem; margin-bottom: 15px; }
          .modal-specs { background: #fdfcf9; padding: 20px; border-radius: 15px; margin: 20px 0; border: 1px solid #f0e9e0; }
          .spec-row { display: flex; justify-content: space-between; font-size: 0.9rem; padding: 5px 0; border-bottom: 1px solid #eee; }
          .spec-row strong { color: #999; text-transform: uppercase; font-size: 0.7rem; }
          .btn-add { background: #D62828; color: white; border: none; padding: 15px 35px; border-radius: 50px; font-weight: 700; cursor: pointer; }

          .cart-fab { position: fixed; bottom: 25px; right: 25px; width: 65px; height: 65px; background: #1a1a1a; color: white; border-radius: 50%; border: none; cursor: pointer; z-index: 500; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
          .fab-count { position: absolute; top: -5px; right: -5px; background: #D62828; width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }

          .cart-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1100; display: flex; justify-content: flex-end; }
          .cart-drawer { width: 100%; max-width: 400px; background: white; height: 100%; padding: 30px; display: flex; flex-direction: column; }
          .cart-list { flex: 1; overflow-y: auto; padding: 20px 0; }
          .cart-item { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee; }
          .btn-whatsapp { background: #25D366; color: white; border: none; width: 100%; padding: 16px; border-radius: 50px; font-weight: 800; cursor: pointer; margin-top: 15px; }

          @media (max-width: 900px) { .tienda-container { grid-template-columns: 1fr; } .modal-grid { grid-template-columns: 1fr; } }
          .animate-pop { animation: pop 0.3s ease-out; }
          @keyframes pop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        `}</style>
      </div>
    </PublicLayout>
  )
}