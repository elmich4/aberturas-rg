'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { adminDB } from '@/lib/admin-db'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const WA_NUMBER = '59897699854'

type ItemPresupuesto = {
  id?: string
  productoId?: string
  varianteId?: string | null
  varianteNombre?: string | null
  slug?: string
  nombre: string
  precio: number
  unidad?: string
  cantidad: number
  subtotal?: number
  imagen_url?: string
}

type Presupuesto = {
  id: string
  codigo: number
  items: ItemPresupuesto[]
  total: number
  estado: string
  created_at: string
}

type Estado = 'pendiente' | 'contactado' | 'cerrado' | 'cancelado'
const ESTADOS: { value: Estado; label: string; color: string; bg: string }[] = [
  { value: 'pendiente',  label: 'Pendiente',  color: '#856404', bg: '#fff3cd' },
  { value: 'contactado', label: 'Contactado', color: '#084298', bg: '#cfe2ff' },
  { value: 'cerrado',    label: 'Cerrado',    color: '#0f5132', bg: '#d1e7dd' },
  { value: 'cancelado',  label: 'Cancelado',  color: '#842029', bg: '#f8d7da' },
]

function fmt(n: number) {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    maximumFractionDigits: 0,
  }).format(n || 0)
}

function fmtFecha(s: string) {
  const d = new Date(s)
  return d.toLocaleDateString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminPresupuestosPage() {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | Estado>('todos')

  // Modal
  const [seleccionado, setSeleccionado] = useState<Presupuesto | null>(null)

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('tienda_presupuestos')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      setError('Error al cargar: ' + error.message)
    } else {
      setPresupuestos(data || [])
    }
    setLoading(false)
  }

  async function cambiarEstado(id: string, nuevo: Estado) {
    const result = await adminDB.update('tienda_presupuestos', { estado: nuevo }, { id })
    if (result.error) {
      alert('No se pudo actualizar: ' + result.error)
      return
    }
    setPresupuestos(prev =>
      prev.map(p => (p.id === id ? { ...p, estado: nuevo } : p))
    )
    if (seleccionado?.id === id) {
      setSeleccionado(s => (s ? { ...s, estado: nuevo } : s))
    }
  }

  async function eliminar(p: Presupuesto) {
    if (
      !confirm(
        `¿Eliminar el presupuesto #${p.codigo}? Esta acción no se puede deshacer.`
      )
    )
      return
    const result = await adminDB.delete('tienda_presupuestos', { id: p.id })
    if (result.error) {
      alert('No se pudo eliminar: ' + result.error)
      return
    }
    setPresupuestos(prev => prev.filter(x => x.id !== p.id))
    if (seleccionado?.id === p.id) setSeleccionado(null)
  }

  const filtrados = useMemo(() => {
    return presupuestos.filter(p => {
      if (filtroEstado !== 'todos' && p.estado !== filtroEstado) return false
      if (busqueda) {
        const q = busqueda.replace(/^#/, '').trim().toLowerCase()
        if (!p.codigo.toString().includes(q)) return false
      }
      return true
    })
  }, [presupuestos, busqueda, filtroEstado])

  // Conteos por estado para los chips de filtro
  const conteo = useMemo(() => {
    const c: Record<string, number> = { todos: presupuestos.length }
    ESTADOS.forEach(e => (c[e.value] = 0))
    presupuestos.forEach(p => {
      c[p.estado] = (c[p.estado] || 0) + 1
    })
    return c
  }, [presupuestos])

  return (
    <div className="presupuestos-page">
      <header className="page-header">
        <div>
          <h1>Presupuestos</h1>
          <p className="subtitle">
            Solicitudes recibidas desde la tienda online · {presupuestos.length}{' '}
            en total
          </p>
        </div>
        <button className="btn-refresh" onClick={cargar} title="Recargar">
          ↻
        </button>
      </header>

      {/* Filtros */}
      <div className="toolbar">
        <div className="search-wrap">
          <input
            type="search"
            placeholder="Buscar por #REF (ej: 1024)..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        <div className="estado-filter">
          <button
            className={`chip ${filtroEstado === 'todos' ? 'on' : ''}`}
            onClick={() => setFiltroEstado('todos')}
          >
            Todos
            <span className="badge">{conteo.todos || 0}</span>
          </button>
          {ESTADOS.map(e => (
            <button
              key={e.value}
              className={`chip ${filtroEstado === e.value ? 'on' : ''}`}
              onClick={() => setFiltroEstado(e.value)}
              style={
                filtroEstado === e.value
                  ? { background: e.bg, color: e.color, borderColor: e.bg }
                  : undefined
              }
            >
              {e.label}
              <span className="badge">{conteo[e.value] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="empty">Cargando presupuestos...</div>
      ) : error ? (
        <div className="empty error">{error}</div>
      ) : filtrados.length === 0 ? (
        <div className="empty">
          {presupuestos.length === 0
            ? 'Todavía no hay presupuestos. Cuando alguien envíe un pedido desde la tienda, aparecerá acá.'
            : 'Ningún presupuesto coincide con el filtro.'}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#REF</th>
                <th>Fecha</th>
                <th>Items</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id} onClick={() => setSeleccionado(p)} className="row">
                  <td className="ref">#{p.codigo}</td>
                  <td>{fmtFecha(p.created_at)}</td>
                  <td className="items-cell">
                    <span className="items-count">
                      {Array.isArray(p.items) ? p.items.length : 0} producto
                      {(p.items?.length || 0) !== 1 ? 's' : ''}
                    </span>
                    <small>
                      {Array.isArray(p.items) &&
                        p.items
                          .slice(0, 2)
                          .map(i => i.nombre)
                          .join(', ')}
                      {p.items?.length > 2 ? '...' : ''}
                    </small>
                  </td>
                  <td className="total">{fmt(p.total)}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <select
                      className="estado-select"
                      value={p.estado || 'pendiente'}
                      onChange={e =>
                        cambiarEstado(p.id, e.target.value as Estado)
                      }
                      style={(() => {
                        const e = ESTADOS.find(x => x.value === p.estado)
                        return e ? { background: e.bg, color: e.color } : {}
                      })()}
                    >
                      {ESTADOS.map(e => (
                        <option key={e.value} value={e.value}>
                          {e.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="actions">
                      <button
                        className="btn-link"
                        onClick={() => setSeleccionado(p)}
                      >
                        Ver
                      </button>
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

      {/* Modal */}
      {seleccionado && (
        <PresupuestoModal
          presupuesto={seleccionado}
          onClose={() => setSeleccionado(null)}
          onCambiarEstado={n => cambiarEstado(seleccionado.id, n)}
          onEliminar={() => eliminar(seleccionado)}
        />
      )}

      <style jsx>{`
        .presupuestos-page {
          padding: 32px;
          max-width: 1300px;
          margin: 0 auto;
          font-family: 'DM Sans', system-ui, sans-serif;
          background: #f8f9fa;
          min-height: 100vh;
        }
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .page-header h1 {
          margin: 0;
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          color: #1a1a1a;
        }
        .subtitle {
          margin: 4px 0 0;
          color: #888;
          font-size: 0.9rem;
        }
        .btn-refresh {
          background: white;
          border: 1px solid #ddd;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.1rem;
          color: #666;
          transition: 0.2s;
        }
        .btn-refresh:hover {
          background: #fafafa;
          color: #d62828;
          transform: rotate(90deg);
        }

        .toolbar {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .search-wrap {
          flex: 1;
          min-width: 240px;
        }
        .search-wrap input {
          width: 100%;
          padding: 12px 18px;
          border: 1px solid #ddd;
          border-radius: 50px;
          background: white;
          font-size: 0.92rem;
          font-family: inherit;
          outline: none;
        }
        .search-wrap input:focus {
          border-color: #d62828;
        }

        .estado-filter {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .chip {
          padding: 8px 14px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 50px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          color: #444;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: 0.15s;
          font-family: inherit;
        }
        .chip:hover {
          border-color: #aaa;
        }
        .chip.on {
          background: #111;
          color: white;
          border-color: #111;
        }
        .chip .badge {
          background: rgba(255, 255, 255, 0.25);
          color: inherit;
          padding: 2px 8px;
          border-radius: 50px;
          font-size: 0.72rem;
          font-weight: 700;
        }
        .chip:not(.on) .badge {
          background: #f0f0f0;
          color: #666;
        }

        .empty {
          padding: 80px 40px;
          text-align: center;
          color: #888;
          background: white;
          border-radius: 16px;
          font-size: 0.95rem;
        }
        .empty.error {
          color: #b91c1c;
          background: #fef2f2;
        }

        .table-wrap {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          background: #fafafa;
          text-align: left;
          padding: 14px 16px;
          font-size: 0.75rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #666;
          border-bottom: 1px solid #eee;
        }
        td {
          padding: 14px 16px;
          border-bottom: 1px solid #f5f5f5;
          font-size: 0.9rem;
          vertical-align: middle;
        }
        tr.row {
          cursor: pointer;
          transition: 0.15s;
        }
        tr.row:hover {
          background: #fafafa;
        }
        .ref {
          font-weight: 800;
          color: #d62828;
          font-size: 1rem;
        }
        .items-cell {
          max-width: 280px;
        }
        .items-count {
          display: block;
          font-weight: 600;
          color: #333;
        }
        .items-cell small {
          color: #999;
          font-size: 0.78rem;
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 280px;
        }
        .total {
          font-weight: 800;
          color: #1a1a1a;
          white-space: nowrap;
        }

        .estado-select {
          padding: 6px 10px;
          border-radius: 50px;
          border: none;
          font-weight: 700;
          font-size: 0.78rem;
          cursor: pointer;
          font-family: inherit;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          outline: none;
        }

        .actions {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .btn-link {
          background: #111;
          color: white;
          border: none;
          padding: 7px 14px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-link:hover {
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
          background: #fef2f2;
          border-color: #fca5a5;
        }
      `}</style>
    </div>
  )
}

// ====================================================================
// MODAL DE DETALLE
// ====================================================================

function PresupuestoModal({
  presupuesto,
  onClose,
  onCambiarEstado,
  onEliminar,
}: {
  presupuesto: Presupuesto
  onClose: () => void
  onCambiarEstado: (estado: Estado) => void
  onEliminar: () => void
}) {
  const items = Array.isArray(presupuesto.items) ? presupuesto.items : []
  const estado = ESTADOS.find(e => e.value === presupuesto.estado)

  // Reconstruir mensaje de WhatsApp para reenvío
  const mensajeWA = useMemo(() => {
    const lineas = items.map(
      i => {
        const sufijo = i.varianteNombre ? ` (${i.varianteNombre})` : ''
        return `• ${i.nombre}${sufijo} x${i.cantidad} — ${fmt(i.precio * i.cantidad)}`
      }
    )
    return [
      `*Presupuesto #${presupuesto.codigo}*`,
      ``,
      ...lineas,
      ``,
      `*Total: ${fmt(presupuesto.total)}*`,
    ].join('\n')
  }, [items, presupuesto.codigo, presupuesto.total])

  const linkWA = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensajeWA)}`

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <div>
            <span className="modal-ref">#{presupuesto.codigo}</span>
            <h2>Detalle del presupuesto</h2>
            <small>{fmtFecha(presupuesto.created_at)}</small>
          </div>
          <button className="close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>

        <div className="modal-body">
          <div className="estado-row">
            <label>Estado actual</label>
            <div className="estado-buttons">
              {ESTADOS.map(e => (
                <button
                  key={e.value}
                  className={`estado-btn ${
                    presupuesto.estado === e.value ? 'on' : ''
                  }`}
                  onClick={() => onCambiarEstado(e.value)}
                  style={
                    presupuesto.estado === e.value
                      ? { background: e.bg, color: e.color, borderColor: e.bg }
                      : undefined
                  }
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          <div className="items-section">
            <h3>Productos solicitados</h3>
            <div className="items-list">
              {items.map((item, i) => (
                <div key={i} className="item-row">
                  <div className="item-img">
                    {item.imagen_url ? (
                      <img src={item.imagen_url} alt={item.nombre} />
                    ) : (
                      <div className="no-img">📦</div>
                    )}
                  </div>
                  <div className="item-info">
                    <strong>{item.nombre}</strong>
                    {item.varianteNombre && (
                      <span className="item-variante">{item.varianteNombre}</span>
                    )}
                    <small>
                      {fmt(item.precio)} {item.unidad ? `/ ${item.unidad}` : ''}
                    </small>
                  </div>
                  <div className="item-qty">×{item.cantidad}</div>
                  <div className="item-subtotal">
                    {fmt(item.precio * item.cantidad)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="total-row">
            <span>TOTAL</span>
            <strong>{fmt(presupuesto.total)}</strong>
          </div>
        </div>

        <footer className="modal-footer">
          <button className="btn-del-big" onClick={onEliminar}>
            🗑 Eliminar
          </button>
          <a
            className="btn-wa"
            href={linkWA}
            target="_blank"
            rel="noopener noreferrer"
          >
            Reenviar por WhatsApp
          </a>
        </footer>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 720px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
          font-family: 'DM Sans', system-ui, sans-serif;
        }

        .modal-header {
          padding: 24px 28px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .modal-ref {
          display: inline-block;
          background: #fee2e2;
          color: #d62828;
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 800;
          margin-bottom: 8px;
        }
        .modal-header h2 {
          margin: 0;
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          color: #1a1a1a;
        }
        .modal-header small {
          color: #999;
          font-size: 0.85rem;
        }
        .close {
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #888;
          width: 36px;
          height: 36px;
          padding: 0;
          line-height: 1;
          border-radius: 50%;
        }
        .close:hover {
          background: #f5f5f5;
          color: #d62828;
        }

        .modal-body {
          padding: 24px 28px;
          overflow-y: auto;
          flex: 1;
        }

        .estado-row {
          margin-bottom: 28px;
        }
        .estado-row label {
          display: block;
          font-size: 0.78rem;
          font-weight: 700;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 10px;
        }
        .estado-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .estado-btn {
          padding: 10px 16px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.85rem;
          transition: 0.2s;
          font-family: inherit;
        }
        .estado-btn:hover {
          border-color: #aaa;
        }
        .estado-btn.on {
          font-weight: 800;
        }

        .items-section h3 {
          font-size: 0.9rem;
          color: #333;
          letter-spacing: 1px;
          text-transform: uppercase;
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 8px;
          margin: 0 0 16px;
        }
        .items-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
        }
        .item-row {
          display: grid;
          grid-template-columns: 60px 1fr auto auto;
          gap: 14px;
          align-items: center;
          padding: 12px;
          background: #fafafa;
          border-radius: 12px;
        }
        .item-img {
          width: 60px;
          height: 60px;
          border-radius: 10px;
          overflow: hidden;
          background: white;
          padding: 4px;
        }
        .item-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 6px;
        }
        .no-img {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          opacity: 0.4;
        }
        .item-info strong {
          display: block;
          font-size: 0.95rem;
          color: #111;
          margin-bottom: 2px;
        }
        .item-variante {
          display: inline-block;
          background: #fef2f2;
          color: #d62828;
          padding: 2px 8px;
          border-radius: 50px;
          font-size: 0.68rem;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .item-info small {
          color: #888;
          font-size: 0.8rem;
        }
        .item-qty {
          font-weight: 700;
          color: #555;
          font-size: 0.95rem;
        }
        .item-subtotal {
          font-weight: 800;
          color: #d62828;
          white-space: nowrap;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0 0;
          border-top: 2px solid #1a1a1a;
        }
        .total-row span {
          font-size: 0.85rem;
          font-weight: 800;
          color: #888;
          letter-spacing: 1.5px;
        }
        .total-row strong {
          font-size: 2rem;
          color: #d62828;
          font-weight: 900;
        }

        .modal-footer {
          padding: 18px 28px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          gap: 10px;
          justify-content: space-between;
        }
        .btn-del-big {
          background: white;
          color: #b91c1c;
          border: 1px solid #fecaca;
          padding: 12px 18px;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.85rem;
          font-family: inherit;
        }
        .btn-del-big:hover {
          background: #fef2f2;
        }
        .btn-wa {
          background: #25d366;
          color: white;
          padding: 12px 28px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 800;
          font-size: 0.9rem;
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.3);
        }
        .btn-wa:hover {
          background: #1fb955;
        }

        @media (max-width: 600px) {
          .item-row {
            grid-template-columns: 50px 1fr auto;
          }
          .item-subtotal {
            grid-column: 1 / -1;
            text-align: right;
          }
        }
      `}</style>
    </div>
  )
}
