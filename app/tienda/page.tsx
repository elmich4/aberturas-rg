'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import PublicLayout from '@/components/public/PublicLayout'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const WA_NUMBER = '59897699854'

// Tipos evolucionados para manejar datos profundos
type Categoria = { id: string; nombre: string; slug: string; orden: number }
type Subcategoria = { id: string; categoria_id: string; nombre: string; slug: string; orden: number }

type Variante = {
  label: string
  precio_extra: number
}

type Producto = {
  id: string
  subcategoria_id: string | null
  nombre: string
  descripcion: string | null
  descripcion_larga: string | null
  precio: number
  unidad: string
  imagen_url: string | null
  imagenes: string[] | null // Array de fotos extras
  especificaciones: Record<string, string> | null // Objeto Clave-Valor
  variantes: Variante[] | null // Opciones configurables
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

  // Estados para el Modal de Detalle
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

  const subcatsDeCat = subcategorias.filter(s => s.categoria_id === catActiva)

  const productosFiltrados = productos.filter(p => {
    const sub = subcategorias.find(s => s.id === p.subcategoria_id)
    const matchCat = catActiva === 'todas' || sub?.categoria_id === catActiva
    const matchSub = subActiva === 'todas' || p.subcategoria_id === subActiva
    const matchBusq = busqueda === '' || p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return matchCat && matchSub && matchBusq
  })

  // Abrir modal y resetear selecciones
  const abrirDetalle = (p: Producto) => {
    setProductoSeleccionado(p)
    setVarianteLocal(null)
    setFotoPrincipal(p.imagen_url)
  }

  const precioConVariante = useMemo(() => {
    if (!productoSeleccionado) return 0
    return productoSeleccionado.precio + (varianteLocal?.precio_extra || 0)
  }, [productoSeleccionado, varianteLocal])

  const agregarAlCarrito = (producto: Producto, variante?: Variante | null) => {
    const pFinal = producto.precio + (variante?.precio_extra || 0)
    const uniqueKey = `${producto.id}-${variante?.label || 'base'}`

    setCarrito(prev => {
      const existe = prev.find(i => `${i.producto.id}-${i.varianteElegida?.label || 'base'}` === uniqueKey)
      if (existe) {
        return prev.map(i => `${i.producto.id}-${i.varianteElegida?.label || 'base'}` === uniqueKey 
          ? { ...i, cantidad: i.cantidad + 1 } 
          : i
        )
      }
      return [...prev, { producto, cantidad: 1, varianteElegida: variante, precioFinal: pFinal }]
    })
    setProductoSeleccionado(null) // Cerrar modal al agregar
  }

  const cambiarCantidad = (uniqueKey: string, delta: number) => {
    setCarrito(prev =>
      prev.map(i => {
        const k = `${i.producto.id}-${i.varianteElegida?.label || 'base'}`
        return k === uniqueKey ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i
      }).filter(i => {
        const k = `${i.producto.id}-${i.varianteElegida?.label || 'base'}`
        return !(k === uniqueKey && i.cantidad + delta < 1)
      })
    )
  }

  const totalCarrito = carrito.reduce((acc, i) => acc + i.precioFinal * i.cantidad, 0)
  const cantidadTotal = carrito.reduce((acc, i) => acc + i.cantidad, 0)

  const enviarWA = () => {
    if (carrito.length === 0) return
    const lineas = carrito.map(i => {
      const varTxt = i.varianteElegida ? ` (${i.varianteElegida.label})` : ''
      return `• ${i.cantidad}x ${i.producto.nombre}${varTxt} — ${fmt(i.precioFinal * i.cantidad)}`
    }).join('\n')
    const msg = `¡Hola! Me interesa presupuesto por:\n\n${lineas}\n\n*Total estimado: ${fmt(totalCarrito)}*\n\n¿Tienen stock disponible?`
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <PublicLayout>
      <div className="tienda-wrapper">
        <div className="tienda-hero">
          <div className="tienda-hero-inner">
            <h1>Tienda RG</h1>
            <p>Catálogo de aberturas y materiales con stock real</p>
          </div>
        </div>

        <div className="tienda-body">
          <aside className="tienda-sidebar">
            <div className="sidebar-search">
              <input type="text" placeholder="¿Qué estás buscando?" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            </div>
            <nav className="sidebar-nav">
              <button className={`cat-btn ${catActiva === 'todas' ? 'active' : ''}`} onClick={() => setCatActiva('todas')}>Todos los rubros</button>
              {categorias.map(cat => (
                <div key={cat.id}>
                  <button className={`cat-btn ${catActiva === cat.id ? 'active' : ''}`} onClick={() => setCatActiva(cat.id)}>{cat.nombre}</button>
                  {catActiva === cat.id && subcatsDeCat.map(sub => (
                    <button key={sub.id} className={`subcat-btn ${subActiva === sub.id ? 'active' : ''}`} onClick={() => setSubActiva(sub.id)}>{sub.nombre}</button>
                  ))}
                </div>
              ))}
            </nav>
          </aside>

          <main className="tienda-main">
            {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
              <div className="productos-grid">
                {productosFiltrados.map(p => (
                  <div key={p.id} className="producto-card" onClick={() => abrirDetalle(p)}>
                    <div className="producto-img">
                      <img src={p.imagen_url || '/placeholder.png'} alt={p.nombre} />
                      {p.variantes && <span className="badge-variantes">Opciones</span>}
                    </div>
                    <div className="producto-info">
                      <h3>{p.nombre}</h3>
                      <div className="producto-footer">
                        <span className="producto-precio">{fmt(p.precio)}</span>
                        <button className="btn-ver">Ver detalle</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* MODAL DE DETALLE PROFUNDO */}
        {productoSeleccionado && (
          <div className="modal-overlay" onClick={() => setProductoSeleccionado(null)}>
            <div className="modal-detalle" onClick={e => e.stopPropagation()}>
              <button className="btn-close" onClick={() => setProductoSeleccionado(null)}>✕</button>
              <div className="detalle-container">
                <div className="detalle-media">
                  <div className="foto-principal">
                    <img src={fotoPrincipal || '/placeholder.png'} alt={productoSeleccionado.nombre} />
                  </div>
                  <div className="galeria-fotos">
                    <img src={productoSeleccionado.imagen_url || ''} onClick={() => setFotoPrincipal(productoSeleccionado.imagen_url)} className={fotoPrincipal === productoSeleccionado.imagen_url ? 'active' : ''} />
                    {productoSeleccionado.imagenes?.map((img, i) => (
                      <img key={i} src={img} onClick={() => setFotoPrincipal(img)} className={fotoPrincipal === img ? 'active' : ''} />
                    ))}
                  </div>
                </div>

                <div className="detalle-info">
                  <h2>{productoSeleccionado.nombre}</h2>
                  <p className="desc-larga">{productoSeleccionado.descripcion_larga || productoSeleccionado.descripcion}</p>
                  
                  {productoSeleccionado.especificaciones && (
                    <div className="specs-box">
                      <h4>Especificaciones técnicas</h4>
                      <div className="specs-grid">
                        {Object.entries(productoSeleccionado.especificaciones).map(([k, v]) => (
                          <div key={k} className="spec-item"><strong>{k}:</strong> {v}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {productoSeleccionado.variantes && (
                    <div className="variantes-box">
                      <h4>Selecciona una opción</h4>
                      <div className="variantes-list">
                        {productoSeleccionado.variantes.map((v, i) => (
                          <button 
                            key={i} 
                            className={`var-btn ${varianteLocal?.label === v.label ? 'active' : ''}`}
                            onClick={() => setVarianteLocal(v)}
                          >
                            {v.label} {v.precio_extra > 0 && `(+${fmt(v.precio_extra)})`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="detalle-footer">
                    <div className="precio-total">
                      <span>Total:</span>
                      <strong>{fmt(precioConVariante)}</strong>
                    </div>
                    <button className="btn-comprar" onClick={() => agregarAlCarrito(productoSeleccionado, varianteLocal)}>
                      Agregar al Pedido
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CARRITO Y DRAWER (Simplificado para brevedad, mantiene tu lógica original) */}
        {cantidadTotal > 0 && (
          <button className="carrito-fab" onClick={() => setCarritoAbierto(true)}>
             <span className="fab-badge">{cantidadTotal}</span>
             🛒
          </button>
        )}

        {carritoAbierto && (
          <div className="carrito-overlay" onClick={() => setCarritoAbierto(false)}>
            <div className="carrito-drawer" onClick={e => e.stopPropagation()}>
              <div className="drawer-header">
                <h2>Mi Pedido</h2>
                <button onClick={() => setCarritoAbierto(false)}>✕</button>
              </div>
              <div className="drawer-items">
                {carrito.map(item => {
                  const key = `${item.producto.id}-${item.varianteElegida?.label || 'base'}`
                  return (
                    <div key={key} className="drawer-item">
                      <div>
                        <strong>{item.producto.nombre}</strong>
                        {item.varianteElegida && <small style={{display:'block', color:'#888'}}>{item.varianteElegida.label}</small>}
                      </div>
                      <div className="drawer-item-ctrl">
                        <button onClick={() => cambiarCantidad(key, -1)}>−</button>
                        <span>{item.cantidad}</span>
                        <button onClick={() => cambiarCantidad(key, 1)}>+</button>
                      </div>
                      <strong>{fmt(item.precioFinal * item.cantidad)}</strong>
                    </div>
                  )
                })}
              </div>
              <div className="drawer-footer">
                <div className="drawer-total"><span>Total estimado:</span> <strong>{fmt(totalCarrito)}</strong></div>
                <button className="btn-wa" onClick={enviarWA}>Enviar a WhatsApp</button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .tienda-wrapper { background: #fdfdfd; min-height: 100vh; }
          .tienda-hero { background: #1a1a1a; color: white; padding: 4rem 2rem; border-bottom: 4px solid #D62828; }
          .tienda-hero-inner { max-width: 1200px; margin: 0 auto; }
          
          .tienda-body { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 260px 1fr; gap: 3rem; padding: 3rem 2rem; }
          
          .cat-btn { width: 100%; text-align: left; padding: 0.8rem; border: none; background: none; cursor: pointer; border-radius: 8px; font-weight: 600; }
          .cat-btn.active { background: #D62828; color: white; }
          .subcat-btn { width: 100%; text-align: left; padding: 0.5rem 1.5rem; border: none; background: none; cursor: pointer; font-size: 0.9rem; color: #666; }
          
          .productos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 2rem; }
          .producto-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: 0.3s; cursor: pointer; }
          .producto-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
          .producto-img { height: 200px; position: relative; background: #f5f5f5; }
          .producto-img img { width: 100%; height: 100%; object-fit: cover; }
          .badge-variantes { position: absolute; top: 10px; right: 10px; background: #F7B731; font-size: 0.7rem; font-weight: 800; padding: 3px 8px; border-radius: 4px; }
          .producto-info { padding: 1.2rem; }
          .producto-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; }
          .producto-precio { font-weight: 800; color: #D62828; font-size: 1.2rem; }
          .btn-ver { background: #f0f0f0; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; }

          /* MODAL */
          .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
          .modal-detalle { background: white; width: 100%; max-width: 1000px; border-radius: 24px; position: relative; max-height: 90vh; overflow-y: auto; }
          .btn-close { position: absolute; top: 20px; right: 20px; border: none; background: #eee; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; z-index: 10; }
          
          .detalle-container { display: grid; grid-template-columns: 1fr 1.2fr; gap: 2rem; padding: 3rem; }
          .foto-principal { height: 400px; border-radius: 12px; overflow: hidden; background: #f9f9f9; }
          .foto-principal img { width: 100%; height: 100%; object-fit: contain; }
          .galeria-fotos { display: flex; gap: 0.5rem; margin-top: 1rem; overflow-x: auto; padding-bottom: 5px; }
          .galeria-fotos img { width: 70px; height: 70px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid transparent; }
          .galeria-fotos img.active { border-color: #D62828; }

          .detalle-info h2 { font-size: 2rem; margin: 0 0 1rem; }
          .desc-larga { color: #555; line-height: 1.6; margin-bottom: 2rem; }
          
          .specs-box { background: #f8f9fa; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; }
          .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; font-size: 0.9rem; }
          
          .variantes-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
          .var-btn { padding: 0.6rem 1.2rem; border: 2px solid #eee; background: white; border-radius: 10px; cursor: pointer; font-weight: 600; }
          .var-btn.active { border-color: #D62828; background: #fff5f5; color: #D62828; }

          .detalle-footer { margin-top: 2.5rem; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #eee; padding-top: 2rem; }
          .precio-total span { display: block; color: #888; font-size: 0.9rem; }
          .precio-total strong { font-size: 2.2rem; color: #D62828; }
          .btn-comprar { background: #D62828; color: white; border: none; padding: 1.2rem 2.5rem; border-radius: 14px; font-weight: 700; font-size: 1.1rem; cursor: pointer; }

          @media (max-width: 850px) {
            .tienda-body { grid-template-columns: 1fr; }
            .detalle-container { grid-template-columns: 1fr; padding: 2rem; }
            .foto-principal { height: 300px; }
          }

          /* Estilos Carrito y Fab (Se mantienen de tu anterior version) */
          .carrito-fab { position: fixed; bottom: 2rem; right: 2rem; width: 70px; height: 70px; background: #D62828; color: white; border: none; border-radius: 50%; font-size: 1.5rem; cursor: pointer; box-shadow: 0 10px 30px rgba(214,40,40,0.3); z-index: 500; }
          .fab-badge { position: absolute; top: 0; right: 0; background: #F7B731; color: #1a1a1a; font-size: 0.8rem; font-weight: 800; width: 25px; height: 25px; border-radius: 50%; display: grid; place-items: center; }
          .carrito-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; justify-content: flex-end; }
          .carrito-drawer { width: 100%; max-width: 400px; background: white; height: 100%; padding: 2rem; display: flex; flex-direction: column; }
          .drawer-items { flex: 1; overflow-y: auto; margin: 2rem 0; }
          .drawer-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid #eee; }
          .btn-wa { background: #25D366; color: white; border: none; width: 100%; padding: 1rem; border-radius: 12px; font-weight: 700; cursor: pointer; margin-top: 1rem; }
        `}</style>
      </div>
    </PublicLayout>
  )
}