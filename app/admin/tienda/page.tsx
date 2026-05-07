'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

const UNIDADES = ['unidad', 'metro', 'm²', 'kit', 'par', 'rollo', 'bolsa', 'caja']

const productoVacio: Omit<Producto, 'id'> = {
  subcategoria_id: null,
  nombre: '',
  descripcion: '',
  descripcion_larga: '',
  precio: 0,
  unidad: 'unidad',
  imagen_url: '',
  imagenes: [],
  especificaciones: {},
  variantes: [],
  activo: true,
  orden: 0,
}

export default function AdminTiendaPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<Producto | Partial<Producto> | null>(null)

  // Estados temporales para el editor dinámico
  const [nuevaSpec, setNuevaSpec] = useState({ clave: '', valor: '' })
  const [nuevaVar, setNuevaVar] = useState<Variante>({ label: '', precio_extra: 0 })

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    const [{ data: cats }, { data: subs }, { data: prods }] = await Promise.all([
      supabase.from('tienda_categorias').select('*').order('orden'),
      supabase.from('tienda_subcategorias').select('*').order('orden'),
      supabase.from('tienda_productos').select('*').order('orden', { ascending: false }),
    ])
    setCategorias(cats || [])
    setSubcategorias(subs || [])
    setProductos(prods || [])
    setLoading(false)
  }

  const handleGuardar = async () => {
    if (!editando) return
    const { id, ...data } = editando as Producto

    if (id) {
      await supabase.from('tienda_productos').update(data).eq('id', id)
    } else {
      await supabase.from('tienda_productos').insert([data])
    }
    setEditando(null)
    cargarDatos()
  }

  // --- Lógica para Especificaciones (JSONB) ---
  const agregarSpec = () => {
    if (!nuevaSpec.clave || !nuevaSpec.valor) return
    const specs = { ...(editando?.especificaciones || {}), [nuevaSpec.clave]: nuevaSpec.valor }
    setEditando({ ...editando, especificaciones: specs })
    setNuevaSpec({ clave: '', valor: '' })
  }

  const eliminarSpec = (clave: string) => {
    const specs = { ...(editando?.especificaciones || {}) }
    delete specs[clave]
    setEditando({ ...editando, especificaciones: specs })
  }

  // --- Lógica para Variantes (JSONB) ---
  const agregarVariante = () => {
    if (!nuevaVar.label) return
    const vars = [...(editando?.variantes || []), nuevaVar]
    setEditando({ ...editando, variantes: vars })
    setNuevaVar({ label: '', precio_extra: 0 })
  }

  const eliminarVariante = (index: number) => {
    const vars = (editando?.variantes || []).filter((_, i) => i !== index)
    setEditando({ ...editando, variantes: vars })
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Gestión de Tienda</h1>
        <button className="btn-nuevo" onClick={() => setEditando(productoVacio)}>+ Nuevo Producto</button>
      </header>

      {editando && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <h2>{editando.id ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            
            <div className="form-grid">
              {/* Información Básica */}
              <div className="form-section">
                <h3>Información Básica</h3>
                <input type="text" placeholder="Nombre del producto" value={editando.nombre} onChange={e => setEditando({...editando, nombre: e.target.value})} />
                
                <select value={editando.subcategoria_id || ''} onChange={e => setEditando({...editando, subcategoria_id: e.target.value})}>
                  <option value="">Seleccionar Subcategoría</option>
                  {subcategorias.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>

                <div className="row-2">
                  <input type="number" placeholder="Precio" value={editando.precio} onChange={e => setEditando({...editando, precio: Number(e.target.value)})} />
                  <select value={editando.unidad} onChange={e => setEditando({...editando, unidad: e.target.value})}>
                    {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>

                <textarea placeholder="Descripción corta" value={editando.descripcion || ''} onChange={e => setEditando({...editando, descripcion: e.target.value})} />
                <textarea placeholder="Descripción detallada (Markdown compatible)" rows={4} value={editando.descripcion_larga || ''} onChange={e => setEditando({...editando, descripcion_larga: e.target.value})} />
              </div>

              {/* Media y Specs */}
              <div className="form-section">
                <h3>Media & Especificaciones</h3>
                <input type="text" placeholder="URL Imagen Principal" value={editando.imagen_url || ''} onChange={e => setEditando({...editando, imagen_url: e.target.value})} />
                
                <div className="dynamic-box">
                  <h4>Especificaciones Técnicas</h4>
                  <div className="dynamic-input">
                    <input type="text" placeholder="Ej: Material" value={nuevaSpec.clave} onChange={e => setNuevaSpec({...nuevaSpec, clave: e.target.value})} />
                    <input type="text" placeholder="Ej: Aluminio" value={nuevaSpec.valor} onChange={e => setNuevaSpec({...nuevaSpec, valor: e.target.value})} />
                    <button onClick={agregarSpec}>Add</button>
                  </div>
                  <div className="tags-list">
                    {Object.entries(editando.especificaciones || {}).map(([k, v]) => (
                      <span key={k} className="tag">{k}: {v} <i onClick={() => eliminarSpec(k)}>✕</i></span>
                    ))}
                  </div>
                </div>

                <div className="dynamic-box">
                  <h4>Variantes de Producto</h4>
                  <div className="dynamic-input">
                    <input type="text" placeholder="Ej: Negro" value={nuevaVar.label} onChange={e => setNuevaVar({...nuevaVar, label: e.target.value})} />
                    <input type="number" placeholder="+ Precio" value={nuevaVar.precio_extra} onChange={e => setNuevaVar({...nuevaVar, precio_extra: Number(e.target.value)})} />
                    <button onClick={agregarVariante}>Add</button>
                  </div>
                  <div className="tags-list">
                    {(editando.variantes || []).map((v, i) => (
                      <span key={i} className="tag var-tag">{v.label} (+${v.precio_extra}) <i onClick={() => eliminarVariante(i)}>✕</i></span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secundario" onClick={() => setEditando(null)}>Cancelar</button>
              <button className="btn-primario" onClick={handleGuardar}>Guardar Producto</button>
            </div>
          </div>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id}>
              <td><img src={p.imagen_url || ''} width="50" height="50" style={{objectFit:'cover', borderRadius:'4px'}} /></td>
              <td><strong>{p.nombre}</strong></td>
              <td>{new Intl.NumberFormat('es-UY', {style:'currency', currency:'UYU'}).format(p.precio)}</td>
              <td>{subcategorias.find(s => s.id === p.subcategoria_id)?.nombre || '-'}</td>
              <td><span className={`status ${p.activo ? 'on' : 'off'}`}>{p.activo ? 'Activo' : 'Pausado'}</span></td>
              <td>
                <button onClick={() => setEditando(p)}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .admin-container { padding: 2rem; max-width: 1400px; margin: 0 auto; font-family: sans-serif; }
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .btn-nuevo { background: #D62828; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 700; }
        
        .admin-table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .admin-table th, .admin-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #eee; }
        .admin-table th { background: #f8f9fa; color: #666; font-size: 0.8rem; text-transform: uppercase; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem; }
        .admin-modal { background: white; width: 100%; max-width: 1100px; border-radius: 20px; padding: 2.5rem; max-height: 95vh; overflow-y: auto; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-top: 2rem; }
        .form-section { display: flex; flex-direction: column; gap: 1rem; }
        .form-section h3 { font-size: 1.1rem; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; margin-bottom: 0.5rem; }
        
        input, select, textarea { width: 100%; padding: 0.8rem; border: 1.5px solid #ddd; border-radius: 8px; font-size: 0.95rem; }
        .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

        .dynamic-box { background: #f9f9f9; padding: 1rem; border-radius: 12px; border: 1px dashed #ccc; }
        .dynamic-input { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
        .dynamic-input button { background: #333; color: white; border: none; padding: 0 1rem; border-radius: 6px; cursor: pointer; }
        
        .tags-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .tag { background: #eee; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.8rem; display: flex; align-items: center; gap: 0.5rem; }
        .tag i { cursor: pointer; color: #D62828; font-weight: bold; }
        .var-tag { background: #fff5f5; border: 1px solid #ffcccc; color: #D62828; }

        .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #eee; }
        .btn-primario { background: #D62828; color: white; border: none; padding: 1rem 2rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
        .btn-secundario { background: #eee; border: none; padding: 1rem 2rem; border-radius: 10px; cursor: pointer; }

        .status { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
        .status.on { background: #e6fffa; color: #2c7a7b; }
        .status.off { background: #fff5f5; color: #c53030; }
      `}</style>
    </div>
  )
}