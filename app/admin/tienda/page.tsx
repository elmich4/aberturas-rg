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
    const datos = {
      ...form,
      descripcion: form.descripcion || null,
      imagen_url: form.imagen_url || null,
    }
    if (modal === 'nuevo') {
      await supabase.from('tienda_productos').insert(datos)
    } else if (editId) {
      await supabase.from('tienda_productos').update(datos).eq('id', editId)
    }
    setGuardando(false)
    setModal(null)
    cargar()
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

  const subsDeCatForm = form.subcategoria_id
    ? subcategorias.filter(s => {
        const catSub = subcategorias.find(ss => ss.id === form.subcategoria_id)
        return catSub ? s.categoria_id === catSub.categoria_id : false
      })
    : []

  // Subcategorías agrupadas por categoría para el select del form
  const gruposSubcat = categorias.map(cat => ({
    cat,
    subs: subcategorias.filter(s => s.categoria_id === cat.id)
  }))

  return (
    <div className="admin-tienda">
      <div className="at-header">
        <div>
          <h1>Tienda</h1>
          <p>{productos.length} productos · {productos.filter(p => p.activo).length} activos</p>
        </div>
        <button className="btn-nuevo" onClick={abrirNuevo}>+ Nuevo producto</button>
      </div>

      {/* Filtro por categoría */}
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

      {/* Tabla */}
      {loading ? (
        <div className="at-loading">Cargando...</div>
      ) : (
        <div className="at-table-wrap">
          <table className="at-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Subcategoría</th>
                <th>Precio</th>
                <th>Unidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length === 0 ? (
                <tr><td colSpan={6} className="at-empty">No hay productos en esta categoría</td></tr>
              ) : productosFiltrados.map(p => {
                const sub = subcategorias.find(s => s.id === p.subcategoria_id)
                const cat = categorias.find(c => c.id === sub?.categoria_id)
                return (
                  <tr key={p.id} className={!p.activo ? 'inactivo' : ''}>
                    <td>
                      <div className="at-nombre">
                        {p.imagen_url && <img src={p.imagen_url} alt="" />}
                        <div>
                          <strong>{p.nombre}</strong>
                          {p.descripcion && <span>{p.descripcion}</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      {cat && <span className="at-cat">{cat.nombre}</span>}
                      {sub && <span className="at-sub">{sub.nombre}</span>}
                    </td>
                    <td><strong className="at-precio">{fmt(p.precio)}</strong></td>
                    <td><span className="at-unidad">{p.unidad}</span></td>
                    <td>
                      <button
                        className={`at-toggle ${p.activo ? 'activo' : 'inactivo'}`}
                        onClick={() => toggleActivo(p)}
                      >
                        {p.activo ? 'Activo' : 'Oculto'}
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

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === 'nuevo' ? 'Nuevo producto' : 'Editar producto'}</h2>
              <button onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full">
                  <label>Nombre *</label>
                  <input
                    value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="Ej: Ventana Serie 20 60x40cm"
                  />
                </div>
                <div className="form-group full">
                  <label>Descripción</label>
                  <textarea
                    value={form.descripcion || ''}
                    onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                    placeholder="Descripción breve del producto..."
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>Precio (UYU) *</label>
                  <input
                    type="number"
                    value={form.precio}
                    onChange={e => setForm(f => ({ ...f, precio: Number(e.target.value) }))}
                    min={0}
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
                  <label>URL de imagen</label>
                  <input
                    value={form.imagen_url || ''}
                    onChange={e => setForm(f => ({ ...f, imagen_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group">
                  <label>Orden</label>
                  <input
                    type="number"
                    value={form.orden}
                    onChange={e => setForm(f => ({ ...f, orden: Number(e.target.value) }))}
                    min={0}
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={form.activo}
                      onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
                    />
                    Producto activo (visible en tienda)
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn-guardar" onClick={guardar} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar producto'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-tienda { padding: 1.5rem; max-width: 1100px; }

        .at-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 1.5rem;
        }
        .at-header h1 { font-size: 1.6rem; margin: 0 0 0.2rem; color: #1a1a1a; }
        .at-header p { font-size: 0.85rem; color: #888; margin: 0; }

        .btn-nuevo {
          background: #D62828; color: #fff; border: none;
          padding: 0.6rem 1.2rem; border-radius: 8px;
          font-size: 0.9rem; font-weight: 600; cursor: pointer;
          transition: background 0.15s;
        }
        .btn-nuevo:hover { background: #b52020; }

        .at-filtros {
          display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1.2rem;
        }
        .at-filtros button {
          padding: 0.4rem 0.9rem; border: 1.5px solid #ddd;
          border-radius: 20px; background: #fff;
          font-size: 0.82rem; cursor: pointer; transition: all 0.15s;
          color: #555;
        }
        .at-filtros button:hover { border-color: #D62828; color: #D62828; }
        .at-filtros button.active { background: #D62828; color: #fff; border-color: #D62828; }

        .at-loading { padding: 3rem; text-align: center; color: #888; }

        .at-table-wrap { overflow-x: auto; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
        .at-table { width: 100%; border-collapse: collapse; background: #fff; }
        .at-table th {
          text-align: left; padding: 0.8rem 1rem;
          font-size: 0.8rem; font-weight: 600;
          color: #666; text-transform: uppercase; letter-spacing: 0.05em;
          border-bottom: 2px solid #f0f0f0;
          background: #fafafa;
        }
        .at-table td { padding: 0.8rem 1rem; border-bottom: 1px solid #f5f5f5; vertical-align: middle; }
        .at-table tr:last-child td { border-bottom: none; }
        .at-table tr.inactivo td { opacity: 0.5; }

        .at-nombre { display: flex; align-items: center; gap: 0.6rem; }
        .at-nombre img { width: 40px; height: 40px; object-fit: cover; border-radius: 6px; }
        .at-nombre strong { display: block; font-size: 0.9rem; color: #222; }
        .at-nombre span { display: block; font-size: 0.78rem; color: #888; }

        .at-cat { display: block; font-size: 0.75rem; color: #888; }
        .at-sub { display: block; font-size: 0.82rem; color: #444; font-weight: 500; }
        .at-precio { color: #D62828; font-size: 0.95rem; }
        .at-unidad { font-size: 0.8rem; color: #888; background: #f5f5f5; padding: 2px 8px; border-radius: 20px; }

        .at-toggle {
          padding: 0.3rem 0.8rem; border-radius: 20px; border: none;
          font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
        }
        .at-toggle.activo { background: #dcfce7; color: #166534; }
        .at-toggle.inactivo { background: #f5f5f5; color: #888; }

        .at-acciones { display: flex; gap: 0.3rem; }
        .at-acciones button {
          background: none; border: none; cursor: pointer;
          padding: 0.3rem; border-radius: 6px; font-size: 1rem;
          transition: background 0.15s;
        }
        .at-acciones button:hover { background: #f0f0f0; }

        .at-empty { text-align: center; color: #aaa; padding: 3rem !important; }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          z-index: 300; display: flex; align-items: center; justify-content: center;
          padding: 1rem;
        }
        .modal {
          background: #fff; border-radius: 16px;
          width: 100%; max-width: 600px;
          max-height: 90vh; display: flex; flex-direction: column;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .modal-header {
          padding: 1.2rem 1.5rem; border-bottom: 1px solid #eee;
          display: flex; justify-content: space-between; align-items: center;
        }
        .modal-header h2 { font-size: 1.2rem; margin: 0; }
        .modal-header button {
          background: none; border: none; font-size: 1.1rem;
          cursor: pointer; color: #666; width: 30px; height: 30px;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
        }
        .modal-header button:hover { background: #f0f0f0; }
        .modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; }
        .modal-footer {
          padding: 1rem 1.5rem; border-top: 1px solid #eee;
          display: flex; justify-content: flex-end; gap: 0.8rem;
        }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-group.full { grid-column: 1 / -1; }
        .form-group label { font-size: 0.82rem; font-weight: 600; color: #555; }
        .form-group input, .form-group select, .form-group textarea {
          padding: 0.6rem 0.8rem; border: 1.5px solid #e0e0e0;
          border-radius: 8px; font-size: 0.9rem; outline: none;
          transition: border-color 0.15s; font-family: inherit;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          border-color: #D62828;
        }
        .check-label {
          display: flex !important; flex-direction: row !important;
          align-items: center; gap: 0.5rem;
          font-size: 0.88rem; cursor: pointer;
        }
        .check-label input { width: 16px; height: 16px; cursor: pointer; }

        .btn-cancelar {
          padding: 0.6rem 1.2rem; border: 1.5px solid #ddd;
          border-radius: 8px; background: #fff;
          font-size: 0.9rem; cursor: pointer; transition: all 0.15s;
        }
        .btn-cancelar:hover { border-color: #999; }
        .btn-guardar {
          padding: 0.6rem 1.4rem; background: #D62828; color: #fff;
          border: none; border-radius: 8px;
          font-size: 0.9rem; font-weight: 600; cursor: pointer;
          transition: background 0.15s;
        }
        .btn-guardar:hover:not(:disabled) { background: #b52020; }
        .btn-guardar:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  )
}
