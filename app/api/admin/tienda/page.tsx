'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function fmt(n: number) {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    maximumFractionDigits: 0,
  }).format(n || 0)
}

type Producto = {
  id: string
  nombre: string
  slug: string
  precio: number
  unidad: string
  imagen_url: string
  imagenes: any
  activo: boolean
  destacado: boolean
  orden: number
  categoria_id: string | null
  subcategoria_id: string | null
  tienda_subcategorias?: { nombre: string; categoria_id: string }
}

export default function AdminTiendaPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [filtroCat, setFiltroCat] = useState<string>('todas')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'inactivos'>('todos')
  const [filtroDestacado, setFiltroDestacado] = useState<'todos' | 'destacados' | 'normales'>('todos')

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setLoading(true)
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase
        .from('tienda_productos')
        .select('*, tienda_subcategorias(nombre, categoria_id)')
        .order('orden', { ascending: true })
        .order('created_at', { ascending: false }),
      supabase.from('tienda_categorias').select('*').order('orden'),
    ])
    setProductos(prods || [])
    setCategorias(cats || [])
    setLoading(false)
  }

  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      // Búsqueda
      if (busqueda) {
        const q = busqueda.toLowerCase()
        if (
          !p.nombre?.toLowerCase().includes(q) &&
          !p.slug?.toLowerCase().includes(q)
        )
          return false
      }
      // Filtro categoría
      if (filtroCat !== 'todas') {
        if (p.tienda_subcategorias?.categoria_id !== filtroCat) return false
      }
      // Filtro estado
      if (filtroEstado === 'activos' && !p.activo) return false
      if (filtroEstado === 'inactivos' && p.activo) return false
      // Filtro destacado
      if (filtroDestacado === 'destacados' && !p.destacado) return false
      if (filtroDestacado === 'normales' && p.destacado) return false

      return true
    })
  }, [productos, busqueda, filtroCat, filtroEstado, filtroDestacado])

  async function toggleActivo(p: Producto) {
    const { error } = await supabase
      .from('tienda_productos')
      .update({ activo: !p.activo })
      .eq('id', p.id)
    if (!error) {
      setProductos(prev =>
        prev.map(x => (x.id === p.id ? { ...x, activo: !p.activo } : x))
      )
    }
  }

  async function toggleDestacado(p: Producto) {
    const { error } = await supabase
      .from('tienda_productos')
      .update({ destacado: !p.destacado })
      .eq('id', p.id)
    if (!error) {
      setProductos(prev =>
        prev.map(x => (x.id === p.id ? { ...x, destacado: !p.destacado } : x))
      )
    }
  }

  async function eliminar(p: Producto) {
    if (
      !confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)
    )
      return
    const { error } = await supabase
      .from('tienda_productos')
      .delete()
      .eq('id', p.id)
    if (!error) {
      setProductos(prev => prev.filter(x => x.id !== p.id))
    } else {
      alert('No se pudo eliminar: ' + error.message)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Productos de la Tienda</h1>
          <p className="subtitle">
            {productos.length} producto{productos.length !== 1 ? 's' : ''} en
            total · {productosFiltrados.length} mostrado
            {productosFiltrados.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/admin/tienda/nuevo" className="btn-add">
          + Nuevo Producto
        </Link>
      </header>

      <div className="filtros">
        <div className="search-box">
          <input
            type="search"
            placeholder="Buscar por nombre o slug..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        <select
          value={filtroCat}
          onChange={e => setFiltroCat(e.target.value)}
        >
          <option value="todas">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value as any)}
        >
          <option value="todos">Activos e inactivos</option>
          <option value="activos">Solo activos</option>
          <option value="inactivos">Solo inactivos</option>
        </select>

        <select
          value={filtroDestacado}
          onChange={e => setFiltroDestacado(e.target.value as any)}
        >
          <option value="todos">Todos</option>
          <option value="destacados">Solo destacados ⭐</option>
          <option value="normales">Solo normales</option>
        </select>
      </div>

      {loading ? (
        <div className="empty">Cargando productos...</div>
      ) : productosFiltrados.length === 0 ? (
        <div className="empty">
          {productos.length === 0
            ? 'No hay productos cargados todavía. Creá el primero.'
            : 'No hay productos que coincidan con los filtros.'}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Img</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>⭐</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map(p => (
                <tr key={p.id} className={!p.activo ? 'inactive' : ''}>
                  <td>
                    <img
                      src={p.imagen_url || '/placeholder.png'}
                      alt=""
                      width={50}
                      height={50}
                    />
                  </td>
                  <td>
                    <div className="cell-nombre">
                      <strong>{p.nombre}</strong>
                      <small>/{p.slug}</small>
                    </div>
                  </td>
                  <td>
                    <span className="badge-cat">
                      {p.tienda_subcategorias?.nombre || '—'}
                    </span>
                  </td>
                  <td className="cell-precio">{fmt(p.precio)}</td>
                  <td>
                    <button
                      className={`pill ${p.activo ? 'on' : 'off'}`}
                      onClick={() => toggleActivo(p)}
                      title="Click para alternar"
                    >
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>
                    <button
                      className="star-btn"
                      onClick={() => toggleDestacado(p)}
                      title="Marcar como destacado"
                    >
                      {p.destacado ? '⭐' : '☆'}
                    </button>
                  </td>
                  <td>
                    <div className="actions">
                      <Link href={`/admin/tienda/${p.id}`} className="btn-edit">
                        Editar
                      </Link>
                      <button
                        className="btn-del"
                        onClick={() => eliminar(p)}
                        aria-label="Eliminar"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .admin-page {
          padding: 32px;
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .admin-header h1 {
          margin: 0;
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
        }
        .subtitle {
          margin: 4px 0 0;
          color: #888;
          font-size: 0.9rem;
        }
        .btn-add {
          background: #111;
          color: white;
          padding: 12px 24px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 700;
          transition: 0.2s;
        }
        .btn-add:hover {
          background: #d62828;
        }

        .filtros {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
          padding: 16px;
          background: #fafafa;
          border-radius: 12px;
        }
        .filtros input,
        .filtros select {
          padding: 10px 14px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: white;
          font-size: 0.9rem;
          font-family: inherit;
        }
        .filtros input:focus,
        .filtros select:focus {
          outline: none;
          border-color: #d62828;
        }

        .empty {
          padding: 60px;
          text-align: center;
          color: #888;
          background: #fafafa;
          border-radius: 12px;
        }

        .table-wrap {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }
        .admin-table th {
          background: #fafafa;
          text-align: left;
          padding: 14px 16px;
          font-size: 0.78rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #666;
          border-bottom: 1px solid #eee;
        }
        .admin-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f5f5f5;
          vertical-align: middle;
        }
        .admin-table tr.inactive {
          opacity: 0.55;
        }
        .admin-table tr:hover {
          background: #fafafa;
        }
        .admin-table img {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 8px;
          background: #f0f0f0;
        }

        .cell-nombre strong {
          display: block;
          color: #111;
          font-size: 0.95rem;
          margin-bottom: 2px;
        }
        .cell-nombre small {
          color: #999;
          font-family: monospace;
          font-size: 0.75rem;
        }
        .cell-precio {
          font-weight: 700;
          color: #d62828;
          white-space: nowrap;
        }

        .badge-cat {
          display: inline-block;
          background: #f0f0f0;
          padding: 4px 10px;
          border-radius: 50px;
          font-size: 0.75rem;
          color: #555;
        }

        .pill {
          padding: 5px 12px;
          border: none;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }
        .pill.on {
          background: #d1fae5;
          color: #047857;
        }
        .pill.off {
          background: #fee2e2;
          color: #b91c1c;
        }
        .pill:hover {
          opacity: 0.8;
        }

        .star-btn {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 4px;
        }

        .actions {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .btn-edit {
          background: #111;
          color: white;
          padding: 7px 14px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .btn-edit:hover {
          background: #d62828;
        }
        .btn-del {
          background: white;
          border: 1px solid #ddd;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.95rem;
        }
        .btn-del:hover {
          background: #fee2e2;
          border-color: #fca5a5;
        }

        @media (max-width: 800px) {
          .filtros {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
