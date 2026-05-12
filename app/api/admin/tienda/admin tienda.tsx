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
  const [subcategorias, setSubcategorias] = useState<any[]>([])

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    const { data: prods } = await supabase.from('tienda_productos').select('*').order('orden')
    const { data: subs } = await supabase.from('tienda_subcategorias').select('*')
    setProductos(prods || [])
    setSubcategorias(subs || [])
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase
      .from('tienda_productos')
      .upsert(editando)
    
    if (!error) {
      setEditando(null)
      cargarDatos()
      alert('Producto guardado correctamente')
    }
  }

  return (
    <div className="admin-container">
      <header>
        <h1>Gestión de Productos - RG</h1>
        <button className="btn-add" onClick={() => setEditando({ nombre: '', precio: 0, activo: true, slug: '' })}>
          + Nuevo Producto
        </button>
      </header>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre / Slug</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id}>
              <td><img src={p.imagen_url} width="50" alt="" /></td>
              <td>
                <strong>{p.nombre}</strong><br/>
                <small>{p.slug}</small>
              </td>
              <td>${p.precio}</td>
              <td>{p.activo ? '✅' : '❌'}</td>
              <td><button onClick={() => setEditando(p)}>Editar</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {editando && (
        <div className="modal">
          <form onSubmit={handleSave} className="modal-content">
            <h2>{editando.id ? 'Editar' : 'Nuevo'} Producto</h2>
            
            <div className="form-group">
              <label>Nombre del Producto</label>
              <input value={editando.nombre} onChange={e => setEditando({...editando, nombre: e.target.value})} required />
            </div>

            <div className="form-group">
              <label>URL Amigable (Slug) - <i>Ej: ventana-serie-20</i></label>
              <input value={editando.slug} onChange={e => setEditando({...editando, slug: e.target.value})} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Precio</label>
                <input type="number" value={editando.precio} onChange={e => setEditando({...editando, precio: Number(e.target.value)})} />
              </div>
              <div className="form-group">
                <label>Unidad (m2, unidad, etc)</label>
                <input value={editando.unidad} onChange={e => setEditando({...editando, unidad: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label>Descripción Larga (Detalle)</label>
              <textarea rows={4} value={editando.descripcion} onChange={e => setEditando({...editando, descripcion: e.target.value})} />
            </div>

            <div className="form-group">
              <label>URL Imagen Principal</label>
              <input value={editando.imagen_url} onChange={e => setEditando({...editando, imagen_url: e.target.value})} />
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setEditando(null)}>Cancelar</button>
              <button type="submit" className="btn-save">Guardar Cambios</button>
            </div>
          </form>
        </div>
      )}

      <style jsx>{`
        .admin-container { padding: 40px; max-width: 1000px; margin: 0 auto; font-family: sans-serif; }
        header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .admin-table { width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .admin-table th, .admin-table td { padding: 15px; text-align: left; border-bottom: 1px solid #eee; }
        .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; padding: 40px; border-radius: 20px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
        .form-group { margin-bottom: 20px; }
        label { display: block; font-weight: 700; margin-bottom: 8px; font-size: 0.9rem; }
        input, textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .btn-add { background: #111; color: white; padding: 10px 20px; border-radius: 50px; border: none; cursor: pointer; }
        .btn-save { background: #D62828; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: 700; }
      `}</style>
    </div>
  )
}