'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import PublicLayout from '@/components/public/PublicLayout'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function TiendaPage() {
  const [categorias, setCategorias] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [catActiva, setCatActiva] = useState('todas')
  const [orden, setOrden] = useState('recientes')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data: cats } = await supabase.from('tienda_categorias').select('*').order('orden')
      const { data: prods } = await supabase.from('tienda_productos').select('*, tienda_subcategorias(categoria_id)').eq('activo', true)
      setCategorias(cats || [])
      setProductos(prods || [])
      setLoading(false)
    }
    cargar()
  }, [])

  const productosFiltrados = useMemo(() => {
    let filtrados = productos.filter(p => {
      const coincideCat = catActiva === 'todas' || p.tienda_subcategorias?.categoria_id === catActiva
      const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      return coincideCat && coincideBusqueda
    })

    if (orden === 'precio-menor') filtrados.sort((a, b) => a.precio - b.precio)
    if (orden === 'precio-mayor') filtrados.sort((a, b) => b.precio - a.precio)
    
    return filtrados
  }, [productos, catActiva, busqueda, orden])

  return (
    <PublicLayout>
      <div className="tienda-container">
        {/* BUSCADOR Y FILTROS SUPERIORES */}
        <div className="toolbar container">
          <input 
            type="text" 
            placeholder="Buscar aberturas..." 
            className="search-input"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select className="sort-select" onChange={(e) => setOrden(e.target.value)}>
            <option value="recientes">Más recientes</option>
            <option value="precio-menor">Precio: Menor a Mayor</option>
            <option value="precio-mayor">Precio: Mayor a Menor</option>
          </select>
        </div>

        <div className="main-layout container">
          {/* SIDEBAR DE CATEGORÍAS */}
          <aside className="filters-sidebar">
            <h3>CATEGORÍAS</h3>
            <button className={catActiva === 'todas' ? 'active' : ''} onClick={() => setCatActiva('todas')}>
              Todas las aberturas
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
          </aside>

          {/* GRILLA DE PRODUCTOS */}
          <main className="products-grid">
            {productosFiltrados.map(p => (
              <Link href={`/tienda/${p.slug}`} key={p.id} className="product-card">
                <div className="img-container">
                  {/* Etiqueta negra superior configurable */}
                  <div className="promo-badge">{p.etiqueta_destacada || 'NUEVO'}</div>
                  <img src={p.imagen_url || '/placeholder.png'} alt={p.nombre} />
                </div>
                <div className="card-info">
                  <h4>{p.nombre}</h4>
                  <p className="price-tag">${new Intl.NumberFormat('es-UY').format(p.precio)} / {p.unidad}</p>
                  <span className="btn-detalle">VER DETALLES</span>
                </div>
              </Link>
            ))}
          </main>
        </div>

        <style jsx>{`
          .tienda-container { background: #fbfbfb; padding: 140px 0 80px; min-height: 100vh; }
          .container { max-width: 1300px; margin: 0 auto; padding: 0 20px; }
          
          .toolbar { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 30px; }
          .search-input { flex: 1; padding: 15px 25px; border-radius: 50px; border: 1px solid #eee; box-shadow: 0 2px 10px rgba(0,0,0,0.03); outline: none; font-size: 1rem; }
          .sort-select { padding: 0 20px; border-radius: 50px; border: 1px solid #eee; background: white; }

          .main-layout { display: grid; grid-template-columns: 260px 1fr; gap: 40px; }
          
          .filters-sidebar h3 { font-size: 0.8rem; letter-spacing: 2px; color: #999; margin-bottom: 20px; }
          .filters-sidebar button { display: block; width: 100%; text-align: left; padding: 12px 15px; border: none; background: none; cursor: pointer; border-radius: 8px; margin-bottom: 5px; font-weight: 500; color: #444; }
          .filters-sidebar button.active { background: #1a1a1a; color: white; }

          .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px; }
          
          .product-card { background: white; border-radius: 12px; overflow: hidden; text-decoration: none; color: inherit; transition: 0.3s; border: 1px solid #f0f0f0; }
          .product-card:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.08); }

          .img-container { position: relative; height: 240px; overflow: hidden; background: #fff; }
          .img-container img { width: 100%; height: 100%; object-fit: cover; }

          .promo-badge { position: absolute; top: 0; left: 0; right: 0; background: rgba(0,0,0,0.85); color: white; text-align: center; padding: 8px; font-size: 0.7rem; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }

          .card-info { padding: 20px; text-align: center; }
          .card-info h4 { margin: 0; font-size: 1.1rem; color: #222; font-weight: 600; }
          .price-tag { color: #D62828; font-weight: 800; font-size: 1.2rem; margin: 10px 0; }
          .btn-detalle { display: inline-block; padding: 10px 20px; background: #f8f8f8; border-radius: 50px; font-size: 0.75rem; font-weight: 700; color: #666; transition: 0.3s; }
          .product-card:hover .btn-detalle { background: #D62828; color: white; }

          @media (max-width: 900px) { .main-layout { grid-template-columns: 1fr; } .toolbar { flex-direction: column; } }
        `}</style>
      </div>
    </PublicLayout>
  )
}