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

function fmt(n: number) {
  return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(n)
}

export default function TiendaPage() {
  const [categorias, setCategorias] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [catActiva, setCatActiva] = useState('todas')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data: cats } = await supabase.from('tienda_categorias').select('*').order('orden')
      const { data: prods } = await supabase.from('tienda_productos').select('*, tienda_subcategorias(categoria_id)').eq('activo', true).order('orden')
      setCategorias(cats || [])
      setProductos(prods || [])
      setLoading(false)
    }
    cargar()
  }, [])

  const productosFiltrados = useMemo(() => {
    if (catActiva === 'todas') return productos
    return productos.filter(p => p.tienda_subcategorias?.categoria_id === catActiva)
  }, [productos, catActiva])

  return (
    <PublicLayout>
      <div className="tienda-wrapper">
        <header className="hero-compact">
          <div className="container">
            <span className="badge">PRODUCTOS PREMIUM</span>
            <h1>Catálogo <span className="highlight">RG</span></h1>
          </div>
        </header>

        <div className="main-grid container">
          <aside className="sidebar">
            <div className="sticky-box">
              <h3>CATEGORÍAS</h3>
              <nav>
                <button className={catActiva === 'todas' ? 'active' : ''} onClick={() => setCatActiva('todas')}>Ver todo</button>
                {categorias.map(cat => (
                  <button key={cat.id} className={catActiva === cat.id ? 'active' : ''} onClick={() => setCatActiva(cat.id)}>
                    {cat.nombre}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <main className="content">
            {loading ? <div className="loader">Cargando...</div> : (
              <div className="products-grid">
                {productosFiltrados.map(p => (
                  <Link href={`/tienda/${p.slug}`} key={p.id} className="product-card">
                    <div className="img-holder">
                      <img src={p.imagen_url || '/placeholder.png'} alt={p.nombre} />
                    </div>
                    <div className="info">
                      <h3>{p.nombre}</h3>
                      <p className="price">{fmt(p.precio)} <small>/ {p.unidad}</small></p>
                      <span className="btn-ver">Ver detalles</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>

        <style jsx>{`
          .tienda-wrapper { background: #f9f9f9; min-height: 100vh; padding-bottom: 100px; }
          .hero-compact { background: #111; color: white; padding: 120px 20px 80px; text-align: center; }
          .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
          .highlight { color: #D62828; }
          .badge { background: #D62828; padding: 5px 15px; border-radius: 50px; font-size: 0.7rem; font-weight: 800; }
          h1 { font-size: 3rem; margin-top: 10px; font-family: 'Playfair Display', serif; }
          
          .main-grid { display: grid; grid-template-columns: 280px 1fr; gap: 40px; margin-top: -40px; }
          
          .sidebar { background: white; border-radius: 20px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); height: fit-content; }
          .sticky-box h3 { font-size: 0.8rem; letter-spacing: 2px; color: #999; margin-bottom: 20px; }
          .sticky-box button { width: 100%; text-align: left; padding: 12px; border: none; background: none; cursor: pointer; border-radius: 10px; font-weight: 600; color: #444; transition: 0.3s; }
          .sticky-box button.active { background: #D62828; color: white; }
          .sticky-box button:hover:not(.active) { background: #f0f0f0; }

          .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; }
          .product-card { background: white; border-radius: 20px; overflow: hidden; text-decoration: none; color: inherit; transition: 0.3s; border: 1px solid #eee; }
          .product-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0,0,0,0.1); border-color: #D62828; }
          .img-holder { height: 220px; background: #fff; overflow: hidden; }
          .img-holder img { width: 100%; height: 100%; object-fit: cover; }
          .info { padding: 20px; text-align: center; }
          .info h3 { margin: 0; font-size: 1.1rem; height: 2.4em; display: flex; align-items: center; justify-content: center; }
          .price { color: #D62828; font-size: 1.3rem; font-weight: 800; margin: 10px 0; }
          .btn-ver { display: inline-block; padding: 8px 20px; border: 1px solid #ddd; border-radius: 50px; font-size: 0.8rem; font-weight: 700; transition: 0.3s; }
          .product-card:hover .btn-ver { background: #111; color: white; border-color: #111; }

          @media (max-width: 900px) { .main-grid { grid-template-columns: 1fr; } .hero-compact { padding-top: 100px; } }
        `}</style>
      </div>
    </PublicLayout>
  )
}