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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      const { data: cats } = await supabase.from('tienda_categorias').select('*').order('orden')
      const { data: prods } = await supabase.from('tienda_productos').select('*, tienda_subcategorias(categoria_id)').eq('activo', true)
      setCategorias(cats || [])
      setProductos(prods || [])
      setLoading(false)
    }
    cargar()
  }, [])

  const filtrados = useMemo(() => {
    return productos.filter(p => {
      const matchCat = catActiva === 'todas' || p.tienda_subcategorias?.categoria_id === catActiva
      const matchSearch = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      return matchCat && matchSearch
    })
  }, [productos, catActiva, busqueda])

  return (
    <PublicLayout>
      <div className="bg-[#0a0a0a] pt-32 pb-20 text-center text-white">
        <div className="container mx-auto px-4">
          <span className="text-[#D62828] text-[10px] font-bold tracking-[4px] uppercase mb-4 block">
            Showroom Virtual
          </span>
          <h1 className="text-5xl md:text-6xl font-serif">Catálogo <span className="text-[#D62828] italic">RG</span></h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row gap-12">
          <aside className="w-full md:w-72 shrink-0">
            <div className="sticky top-28 space-y-10">
              <div>
                <h3 className="text-[10px] font-black tracking-widest text-gray-400 mb-4 uppercase">Buscador</h3>
                <input 
                  type="text" 
                  placeholder="Serie 20, Puerta..." 
                  className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#D62828] transition-all font-medium"
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              
              <div>
                <h3 className="text-[10px] font-black tracking-widest text-gray-400 mb-4 uppercase">Categorías</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => setCatActiva('todas')}
                    className={`w-full text-left px-5 py-3 rounded-xl transition-all font-medium ${catActiva === 'todas' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Todos los productos
                  </button>
                  {categorias.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setCatActiva(cat.id)}
                      className={`w-full text-left px-5 py-3 rounded-xl transition-all font-medium ${catActiva === cat.id ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {cat.nombre}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtrados.map(p => (
                <Link href={`/tienda/${p.slug}`} key={p.id} className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 border border-gray-50">
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                    <div className="absolute top-0 left-0 right-0 bg-black/90 text-white text-[9px] font-black tracking-[3px] py-4 text-center uppercase z-20 group-hover:bg-[#D62828] transition-colors">
                      {p.etiqueta_destacada || 'Calidad RG'}
                    </div>
                    <img src={p.imagen_url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={p.nombre} />
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#D62828] transition-colors">{p.nombre}</h4>
                    <p className="text-2xl font-black text-gray-900 mt-3">
                      ${new Intl.NumberFormat('es-UY').format(p.precio)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </main>
        </div>
      </div>
    </PublicLayout>
  )
}