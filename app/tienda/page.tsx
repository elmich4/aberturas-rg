'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import PublicLayout from '@/components/public/PublicLayout'
import Link from 'next/link'

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
  slug: string
  descripcion: string | null
  precio: number
  unidad: string
  imagen_url: string | null
  activo: boolean
  orden: number
}
type ItemCarrito = { 
  producto: Producto
  cantidad: number 
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
  const [loading, setLoading] = useState(true)
  
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const [presupuestoId, setPresupuestoId] = useState<string | null>(null)
  const [presupuestoCodigo, setPresupuestoCodigo] = useState<number | null>(null)

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
      
      const saved = localStorage.getItem('rg_cart')
      if (saved) setCarrito(JSON.parse(saved))
      
      setLoading(false)
    }
    cargar()
  }, [])

  useEffect(() => {
    localStorage.setItem('rg_cart', JSON.stringify(carrito))
    
    const guardarPresupuesto = async () => {
      if (carrito.length === 0) return
      const total = carrito.reduce((acc, i) => acc + i.precioFinal * i.cantidad, 0)
      const dataToSave = { items: carrito, total: total }

      if (presupuestoId) {
        await supabase.from('tienda_presupuestos').update(dataToSave).eq('id', presupuestoId)
      } else {
        const { data } = await supabase.from('tienda_presupuestos').insert([dataToSave]).select().single()
        if (data) {
          setPresupuestoId(data.id)
          setPresupuestoCodigo(data.codigo)
        }
      }
    }

    const timer = setTimeout(guardarPresupuesto, 1500)
    return () => clearTimeout(timer)
  }, [carrito, presupuestoId])

  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      if (catActiva === 'todas') return true
      const sub = subcategorias.find(s => s.id === p.subcategoria_id)
      return sub?.categoria_id === catActiva
    })
  }, [productos, catActiva, subcategorias])

  const cambiarCantidad = (id: string, delta: number) => {
    setCarrito(prev => prev.map(i => 
      i.producto.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i
    ).filter(i => i.cantidad > 0))
  }

  const totalCarrito = carrito.reduce((acc, i) => acc + i.precioFinal * i.cantidad, 0)
  const cantidadTotal = carrito.reduce((acc, i) => acc + i.cantidad, 0)

  const enviarWA = () => {
    const lineas = carrito.map(i => `• ${i.cantidad}x ${i.producto.nombre} — ${fmt(i.precioFinal * i.cantidad)}`).join('\n')
    const ref = presupuestoCodigo ? `\n\n*REF: #${presupuestoCodigo}*` : ''
    const msg = `¡Hola! Me interesa presupuesto por:\n\n${lineas}\n\n*Total estimado: ${fmt(totalCarrito)}*${ref}`
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <PublicLayout>
      <div className="tienda-wrapper">
        <header className="tienda-header">
          <div className="container">
            <span className="badge">PRODUCTOS PREMIUM</span>
            <h1>Catálogo <span className="highlight">RG</span></h1>
          </div>
        </header>

        <div className="tienda-grid container">
          <aside className="filters">
            <div className="filter-box">
              <label>CATEGORÍAS</label>
              <button className={catActiva === 'todas' ? 'active' : ''} onClick={() => setCatActiva('todas')}>Ver todo</button>
              {categorias.map(cat => (
                <button key={cat.id} className={catActiva === cat.id ? 'active' : ''} onClick={() => setCatActiva(cat.id)}>
                  {cat.nombre}
                </button>
              ))}
            </div>
          </aside>

          <main className="products">
            {loading ? <div className="loader">Cargando catálogo...</div> : (
              <div className="grid">
                {productosFiltrados.map(p => (
                  <Link href={`/tienda/${p.slug}`} key={p.id} className="p-card">
                    <div className="p-img">
                      <img src={p.imagen_url || '/placeholder.png'} alt={p.nombre} />
                    </div>
                    <div className="p-info">
                      <h3>{p.nombre}</h3>
                      <p className="p-price">{fmt(p.precio)} <small>/ {p.unidad}</small></p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>

        {cantidadTotal > 0 && (
          <button className="cart-fab" onClick={() => setCarritoAbierto(true)}>
            <span className="count">{cantidadTotal}</span> 🛒
          </button>
        )}

        {carritoAbierto && (
          <div className="cart-drawer-overlay" onClick={() => setCarritoAbierto(false)}>
            <div className="cart-drawer" onClick={e => e.stopPropagation()}>
              <div className="drawer-header">
                <h3>Presupuesto {presupuestoCodigo ? `#${presupuestoCodigo}` : ''}</h3>
                <button onClick={() => setCarritoAbierto(false)}>✕</button>
              </div>
              <div className="drawer-content">
                {carrito.map(item => (
                  <div key={item.producto.id} className="drawer-item">
                    <div className="item-detail">
                      <strong>{item.producto.nombre}</strong>
                      <div className="qty-ctrl">
                        <button onClick={() => cambiarCantidad(item.producto.id, -1)}>−</button>
                        <span>{item.cantidad}</span>
                        <button onClick={() => cambiarCantidad(item.producto.id, 1)}>+</button>
                      </div>
                    </div>
                    <span className="item-subtotal">{fmt(item.precioFinal * item.cantidad)}</span>
                  </div>
                ))}
              </div>
              <div className="drawer-footer">
                <div className="total-line"><span>Total:</span> <strong>{fmt(totalCarrito)}</strong></div>
                <button className="btn-confirm" onClick={enviarWA}>Confirmar vía WhatsApp</button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .tienda-wrapper { background: #fdfcf9; min-height: 100vh; padding-bottom: 60px; }
          .tienda-header { background: #1a1a1a; color: white; padding: 100px 20px 60px; text-align: center; }
          .container { max-width: 1200px; margin: 0 auto; }
          .highlight { color: #D62828; }
          .badge { background: #D62828; padding: 4px 12px; border-radius: 50px; font-size: 0.7rem; font-weight: 700; }
          .tienda-grid { display: grid; grid-template-columns: 250px 1fr; gap: 40px; margin-top: -30px; padding: 0 20px; }
          .filters { background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); height: fit-content; }
          .filter-box label { font-size: 0.75rem; font-weight: 800; color: #999; display: block; margin-bottom: 15px; letter-spacing: 1px; }
          .filter-box button { display: block; width: 100%; text-align: left; padding: 10px; border: none; background: none; cursor: pointer; border-radius: 8px; margin-bottom: 5px; }
          .filter-box button.active { background: #D62828; color: white; }
          .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 25px; }
          .p-card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); text-decoration: none; color: inherit; transition: 0.3s; border: 1px solid #f0f0f0; }
          .p-card:hover { transform: translateY(-5px); box-shadow: 0 12px 25px rgba(0,0,0,0.08); }
          .p-img { height: 200px; overflow: hidden; background: #f9f9f9; }
          .p-img img { width: 100%; height: 100%; object-fit: cover; }
          .p-info { padding: 20px; }
          .p-info h3 { font-family: 'Playfair Display', serif; margin: 0; font-size: 1.15rem; }
          .p-price { font-size: 1.2rem; font-weight: 800; color: #D62828; margin-top: 10px; }
          .cart-fab { position: fixed; bottom: 30px; right: 30px; width: 65px; height: 65px; background: #1a1a1a; color: white; border-radius: 50%; border: none; cursor: pointer; z-index: 500; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
          .count { position: absolute; top: -5px; right: -5px; background: #D62828; width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 800; }
          .cart-drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; justify-content: flex-end; }
          .cart-drawer { width: 100%; max-width: 400px; background: white; height: 100%; display: flex; flex-direction: column; }
          .drawer-header { padding: 25px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
          .drawer-content { flex: 1; overflow-y: auto; padding: 25px; }
          .drawer-item { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 1px solid #f9f9f9; margin-bottom: 20px; }
          .qty-ctrl { display: flex; align-items: center; gap: 10px; margin-top: 5px; }
          .qty-ctrl button { width: 25px; height: 25px; border-radius: 50%; border: 1px solid #ddd; background: white; cursor: pointer; }
          .drawer-footer { padding: 25px; border-top: 1px solid #eee; }
          .total-line { display: flex; justify-content: space-between; font-size: 1.2rem; margin-bottom: 20px; }
          .btn-confirm { width: 100%; background: #25D366; color: white; border: none; padding: 16px; border-radius: 50px; font-weight: 800; cursor: pointer; }
          @media (max-width: 900px) { .tienda-grid { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    </PublicLayout>
  )
}