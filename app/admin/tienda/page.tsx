'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminTienda() {
  const [productos, setProductos] = useState<any[]>([])
  const [editando, setEditando] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setLoading(true)
    const { data: prods } = await supabase.from('tienda_productos').select('*').order('orden')
    setProductos(prods || [])
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editando) return

    const { error } = await supabase
      .from('tienda_productos')
      .upsert(editando)
    
    if (!error) {
      setEditando(null)
      cargarDatos()
      alert('Producto guardado correctamente')
    } else {
      alert('Error al guardar: ' + error.message)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans text-gray-800">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Panel Admin - Tienda RG</h1>
        <button 
          className="bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-gray-800 transition-all"
          onClick={() => setEditando({ nombre: '', precio: 0, activo: true, slug: '', unidad: 'unidad', etiqueta_destacada: '' })}
        >
          + Nuevo Producto
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Producto</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Precio</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Estado</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(p => (
              <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="p-4 flex items-center gap-4">
                  <img src={p.imagen_url} className="w-12 h-12 rounded-lg object-cover bg-gray-100" alt="" />
                  <div>
                    <div className="font-bold">{p.nombre}</div>
                    <div className="text-xs text-gray-400">{p.slug}</div>
                  </div>
                </td>
                <td className="p-4 font-semibold">${p.precio}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${p.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.activo ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => setEditando(p)}
                    className="text-blue-600 font-bold text-sm hover:underline"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDICIÓN - Aquí estaba el error */}
      {editando && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">{editando.id ? 'Editar' : 'Nuevo'} Producto</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Nombre</label>
                <input 
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500 transition-all"
                  value={editando.nombre} 
                  onChange={e => setEditando({...editando, nombre: e.target.value})} 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Slug (URL)</label>
                <input 
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500 transition-all"
                  value={editando.slug || ''} 
                  onChange={e => setEditando({...editando, slug: e.target.value})} 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Precio</label>
                  <input 
                    type="number"
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500 transition-all"
                    value={editando.precio} 
                    onChange={e => setEditando({...editando, precio: Number(e.target.value)})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Unidad</label>
                  <input 
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500 transition-all"
                    value={editando.unidad} 
                    onChange={e => setEditando({...editando, unidad: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Franja Superior (Badge)</label>
                <input 
                  placeholder="Ej: OFERTA, NUEVO, PREMIUM"
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500 transition-all"
                  value={editando.etiqueta_destacada || ''} 
                  onChange={e => setEditando({...editando, etiqueta_destacada: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">URL Imagen</label>
                <input 
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500 transition-all"
                  value={editando.imagen_url} 
                  onChange={e => setEditando({...editando, imagen_url: e.target.value})} 
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  checked={editando.activo} 
                  onChange={e => setEditando({...editando, activo: e.target.checked})} 
                />
                <span className="text-sm font-bold">Producto visible en tienda</span>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                type="button" 
                onClick={() => setEditando(null)}
                className="flex-1 p-4 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="flex-1 p-4 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}