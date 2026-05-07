'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

const UNIDADES = ['unidad', 'metro', 'metro lineal', 'm²', 'kit', 'par', 'rollo', 'bolsa', 'caja']

function fmt(n: number) {
  return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(n)
}

const productoVacio: Omit<Producto, 'id'> = {
  subcategoria_id: null,
  nombre: '',
  slug: '',
  descripcion: '',
  precio: 0,
  unidad: 'unidad',
  imagen_url: '',
  activo: true,
  orden: 0,
}

export default function AdminTiendaPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [catFiltro, setCatFiltro] = useState<string>('todas')
  const [modal, setModal] = useState<'nuevo' | 'editar' | null>(null)
  const [form, setForm] = useState<Omit<Producto, 'id'>>(productoVacio)
  const [editId, setEditId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [loading, setLoading] = useState(true)

  async function cargar() {
    const [{ data: cats }, { data: subs }, { data: prods }] = await Promise.all([
      supabase.from('tienda_categorias').select('*').order('orden'),
      supabase.from('tienda_subcategorias').select('*').order('orden'),
      supabase.from('tienda_productos').select('*').order('orden'),
    ])
    setCategorias(cats || [])
    setSubcategorias(subs || [])
    setProductos(prods || [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  // Función para generar URL amigable
  const generarSlug = (texto: string) => {
    return texto.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  const productosFiltrados = productos.filter(p => {
    if (catFiltro === 'todas') return true
    const sub = subcategorias.find(s => s.id === p.subcategoria_id)
    return sub?.categoria_id === catFiltro
  })

  const abrirNuevo = () => {
    setForm(productoVacio)
    setEditId(null)
    setModal('nuevo')
  }

  const abrirEditar = (p: Producto) => {
    setForm({
      subcategoria_id: p.subcategoria_id,
      nombre: p.nombre,
      slug: p.slug || '',
      descripcion: p.descripcion || '',
      precio: p.precio,
      unidad: p.unidad,
      imagen_url: p.imagen_url || '',
      activo: p.activo,
      orden: p.orden,
    })
    setEditId(p.id)
    setModal('editar')
  }

  const guardar = async () => {
    if (!form.nombre || form.precio <= 0) return alert('Completá nombre y precio')
    setGuardando(true)

    // El slug se genera automáticamente a partir del nombre
    const nuevoSlug = generarSlug(form.nombre)
    
    const datos = {
      ...form,
      slug: nuevoSlug,
      descripcion: form.descripcion || null,
      imagen_url: form.imagen_url || null,
    }

    try {
      if (modal === 'nuevo') {
        await supabase.from('tienda_productos').insert(datos)
      } else if (editId) {
        await supabase.from('tienda_productos').update(datos).eq('id', editId)
      }
      setModal(null)
      cargar()
    } catch (error) {
      console.error("Error al guardar:", error)
      alert("Error al guardar el producto")
    } finally {
      setGuardando(false)
    }
  }

  const toggleActivo = async (p: Producto) => {
    await supabase.from('tienda_productos').update({ activo: !p.activo }).eq('id', p.id)
    cargar()
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    await supabase.from('tienda_productos').delete().eq('id', id)
    cargar()
  }

  const gruposSubcat = categorias.map(cat => ({
    cat,
    subs: subcategorias.filter(s => s.categoria_id === cat.id)
  }))

  return (
    <div className="admin-tienda">
      <div className="at-header">
        <div>
          <h1>Gestión de Tienda</h1>
          <p>{productos.length} productos en total</p>
        </div>
        <button className="btn-nuevo" onClick={abrirNuevo}>+ Nuevo producto</button>
      </div>

      <div className="at-filtros">
        <button className={catFiltro === 'todas' ? 'active' : ''} onClick={() => setCatFiltro('todas')}>Todos</button>
        {categorias.map(cat => (
          <button
            key={cat.id}
            className={catFiltro === cat.id ? 'active' : ''}
            onClick={() => setCatFiltro(cat.id)}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="at-loading">Cargando productos...</div>
      ) : (
        <div className="at-table-wrap">
          <table className="at-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Subcategoría</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map(p => {
                const sub = subcategorias.find(s => s.id === p.subcategoria_id)
                return (
                  <tr key={p.id} className={!p.activo ? 'inactivo' : ''}>
                    <td>
                      <div className="at-nombre">
                        {p.imagen_url && <img src={p.imagen_url} alt="" />}
                        <div>
                          <strong>{p.nombre}</strong>
                          <span className="at-slug-preview">/{p.slug || 'sin-slug'}</span>
                        </div>
                      </div>
                    </td>
                    <td>{sub?.nombre || 'General'}</td>
                    <td>{fmt(p.precio)}</td>
                    <td>
                      <button className={`at-toggle ${p.activo ? 'activo' : 'inactivo'}`} onClick={() => toggleActivo(p)}>
                        {p.activo ? 'Visible' : 'Oculto'}
                      </button>
                    </td>
                    <td>
                      <div className="at-acciones">
                        <button onClick={() => abrirEditar(p)}>✏️</button>
                        <button onClick={() => eliminar(p.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === 'nuevo' ? 'Crear Producto' : 'Editar Producto'}</h2>
              <button onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full">
                  <label>Nombre del Producto</label>
                  <input
                    value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="Ej: Ventana de Aluminio 120x100"
                  />
                </div>
                <div className="form-group">
                  <label>Precio (UYU)</label>
                  <input
                    type="number"
                    value={form.precio}
                    onChange={e => setForm(f => ({ ...f, precio: Number(e.target.value) }))}
                  />
                </div>
                <div className="form-group">
                  <label>Unidad</label>
                  <select value={form.unidad} onChange={e => setForm(f => ({ ...f, unidad: e.target.value }))}>
                    {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="form-group full">
                  <label>Subcategoría</label>
                  <select
                    value={form.subcategoria_id || ''}
                    onChange={e => setForm(f => ({ ...f, subcategoria_id: e.target.value || null }))}
                  >
                    <option value="">Sin categoría</option>
                    {gruposSubcat.map(({ cat, subs }) => (
                      <optgroup key={cat.id} label={cat.nombre}>
                        {subs.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="form-group full">
                  <label>URL Imagen</label>
                  <input
                    value={form.imagen_url || ''}
                    onChange={e => setForm(f => ({ ...f, imagen_url: e.target.value }))}
                  />
                </div>
                <div className="form-group full">
                  <label>Descripción Corta</label>
                  <textarea
                    value={form.descripcion || ''}
                    onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn-guardar" onClick={guardar} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-tienda { padding: 2rem; max-width: 1200px; margin: 0 auto; font-family: sans-serif; }
        .at-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .at-header h1 { margin: 0; font-size: 1.8rem; color: #333; }
        .btn-nuevo { background: #D62828; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
        
        .at-filtros { display: flex; gap: 10px; margin-bottom: 2rem; overflow-x: auto; padding-bottom: 5px; }
        .at-filtros button { padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid #ddd; background: white; cursor: pointer; white-space: nowrap; }
        .at-filtros button.active { background: #D62828; color: white; border-color: #D62828; }

        .at-table-wrap { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; }
        .at-table { width: 100%; border-collapse: collapse; }
        .at-table th { background: #f8f9fa; padding: 1rem; text-align: left; font-size: 0.8rem; color: #666; text-transform: uppercase; }
        .at-table td { padding: 1rem; border-bottom: 1px solid #eee; }
        
        .at-nombre { display: flex; align-items: center; gap: 1rem; }
        .at-nombre img { width: 45px; height: 45px; object-fit: cover; border-radius: 8px; }
        .at-slug-preview { display: block; font-size: 0.7rem; color: #999; }

        .at-toggle { border: none; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
        .at-toggle.activo { background: #e6f4ea; color: #1e7e34; }
        .at-toggle.inactivo { background: #f1f3f4; color: #5f6368; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: white; width: 90%; max-width: 600px; border-radius: 16px; overflow: hidden; }
        .modal-header { padding: 1.5rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
        .modal-body { padding: 1.5rem; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .full { grid-column: 1 / -1; }
        .form-group label { display: block; font-size: 0.85rem; margin-bottom: 0.5rem; color: #666; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.7rem; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; }
        .modal-footer { padding: 1.5rem; background: #f8f9fa; display: flex; justify-content: flex-end; gap: 1rem; }
        .btn-guardar { background: #D62828; color: white; border: none; padding: 0.7rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
      `}</style>
    </div>
  )
}