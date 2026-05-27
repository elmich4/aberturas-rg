'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* ── Tipos ── */
interface OrdenProduccion {
  id: string
  cliente: string
  telefono: string | null
  direccion_obra: string | null
  descripcion: string
  material: string
  color: string | null
  medidas: string | null
  cantidad: number
  fecha_ingreso: string
  fecha_estimada_egreso: string | null
  fecha_egreso_real: string | null
  estado: 'ingresado' | 'en_produccion' | 'terminado' | 'entregado'
  prioridad: 'baja' | 'normal' | 'urgente'
  notas: string | null
  monto: number | null
  created_at: string
  updated_at: string
}

type EstadoOrden = OrdenProduccion['estado']
type PrioridadOrden = OrdenProduccion['prioridad']

/* ── Constantes ── */
const ESTADOS: { value: EstadoOrden; label: string; color: string; icon: string }[] = [
  { value: 'ingresado', label: 'Ingresado', color: '#3B82F6', icon: '📥' },
  { value: 'en_produccion', label: 'En Producción', color: '#F59E0B', icon: '🔨' },
  { value: 'terminado', label: 'Terminado', color: '#10B981', icon: '✅' },
  { value: 'entregado', label: 'Entregado', color: '#6B7280', icon: '🚚' },
]

const PRIORIDADES: { value: PrioridadOrden; label: string; color: string }[] = [
  { value: 'baja', label: 'Baja', color: '#94A3B8' },
  { value: 'normal', label: 'Normal', color: '#3B82F6' },
  { value: 'urgente', label: 'Urgente', color: '#EF4444' },
]

const MATERIALES = ['aluminio', 'pvc', 'chapa', 'otro']

const ESTADO_ORDEN: EstadoOrden[] = ['ingresado', 'en_produccion', 'terminado', 'entregado']

const EMPTY_FORM = {
  cliente: '',
  telefono: '',
  direccion_obra: '',
  descripcion: '',
  material: 'aluminio',
  color: '',
  medidas: '',
  cantidad: 1,
  fecha_estimada_egreso: '',
  prioridad: 'normal' as PrioridadOrden,
  notas: '',
  monto: '',
}

/* ── Helpers ── */
function calcCountdown(fechaEstimada: string | null): { text: string; status: 'ok' | 'warning' | 'danger' | 'done' | 'none' } {
  if (!fechaEstimada) return { text: 'Sin fecha', status: 'none' }
  const now = new Date()
  const target = new Date(fechaEstimada)
  const diff = target.getTime() - now.getTime()

  if (diff <= 0) {
    const diasPasados = Math.abs(Math.ceil(diff / (1000 * 60 * 60 * 24)))
    return { text: `Vencido hace ${diasPasados}d`, status: 'danger' }
  }

  const dias = Math.floor(diff / (1000 * 60 * 60 * 24))
  const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (dias === 0) return { text: `${horas}h restantes`, status: 'danger' }
  if (dias <= 2) return { text: `${dias}d ${horas}h`, status: 'warning' }
  return { text: `${dias}d ${horas}h`, status: 'ok' }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-UY', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('es-UY', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/* ══════════════════════════════════════════════════════
   Componente principal
   ══════════════════════════════════════════════════════ */
export default function ProduccionPage() {
  const [ordenes, setOrdenes] = useState<OrdenProduccion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState<EstadoOrden | 'todos'>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [selectedOrden, setSelectedOrden] = useState<OrdenProduccion | null>(null)
  const [, setTick] = useState(0) // for countdown refresh

  /* ── Countdown ticker ── */
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000) // update every minute
    return () => clearInterval(interval)
  }, [])

  /* ── Fetch órdenes ── */
  const fetchOrdenes = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('ordenes_produccion')
      .select('*')
      .order('fecha_ingreso', { ascending: false })

    if (!error && data) setOrdenes(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchOrdenes() }, [fetchOrdenes])

  /* ── Guardar (crear/editar) ── */
  const handleSave = async () => {
    if (!form.cliente.trim() || !form.descripcion.trim()) return
    setSaving(true)

    const payload = {
      cliente: form.cliente.trim(),
      telefono: form.telefono.trim() || null,
      direccion_obra: form.direccion_obra.trim() || null,
      descripcion: form.descripcion.trim(),
      material: form.material,
      color: form.color.trim() || null,
      medidas: form.medidas.trim() || null,
      cantidad: form.cantidad || 1,
      fecha_estimada_egreso: form.fecha_estimada_egreso || null,
      prioridad: form.prioridad,
      notas: form.notas.trim() || null,
      monto: form.monto ? parseFloat(form.monto) : null,
    }

    if (editingId) {
      await supabase.from('ordenes_produccion').update(payload).eq('id', editingId)
    } else {
      await supabase.from('ordenes_produccion').insert(payload)
    }

    setSaving(false)
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    fetchOrdenes()
  }

  /* ── Cambiar estado ── */
  const cambiarEstado = async (id: string, nuevoEstado: EstadoOrden) => {
    const updateData: Record<string, unknown> = { estado: nuevoEstado }
    if (nuevoEstado === 'entregado') {
      updateData.fecha_egreso_real = new Date().toISOString()
    }
    await supabase.from('ordenes_produccion').update(updateData).eq('id', id)
    fetchOrdenes()
    if (selectedOrden?.id === id) {
      setSelectedOrden(prev => prev ? { ...prev, estado: nuevoEstado, ...(nuevoEstado === 'entregado' ? { fecha_egreso_real: new Date().toISOString() } : {}) } : null)
    }
  }

  /* ── Eliminar ── */
  const eliminarOrden = async (id: string) => {
    if (!confirm('¿Seguro que querés eliminar esta orden?')) return
    await supabase.from('ordenes_produccion').delete().eq('id', id)
    setSelectedOrden(null)
    fetchOrdenes()
  }

  /* ── Editar ── */
  const editarOrden = (orden: OrdenProduccion) => {
    setForm({
      cliente: orden.cliente,
      telefono: orden.telefono || '',
      direccion_obra: orden.direccion_obra || '',
      descripcion: orden.descripcion,
      material: orden.material,
      color: orden.color || '',
      medidas: orden.medidas || '',
      cantidad: orden.cantidad,
      fecha_estimada_egreso: orden.fecha_estimada_egreso ? orden.fecha_estimada_egreso.slice(0, 10) : '',
      prioridad: orden.prioridad,
      notas: orden.notas || '',
      monto: orden.monto ? String(orden.monto) : '',
    })
    setEditingId(orden.id)
    setShowForm(true)
    setSelectedOrden(null)
  }

  /* ── Siguiente estado ── */
  const siguienteEstado = (estado: EstadoOrden): EstadoOrden | null => {
    const idx = ESTADO_ORDEN.indexOf(estado)
    return idx < ESTADO_ORDEN.length - 1 ? ESTADO_ORDEN[idx + 1] : null
  }

  /* ── Filtrado ── */
  const ordenesFiltradas = ordenes.filter(o => {
    if (filtroEstado !== 'todos' && o.estado !== filtroEstado) return false
    if (busqueda) {
      const q = busqueda.toLowerCase()
      return (
        o.cliente.toLowerCase().includes(q) ||
        o.descripcion.toLowerCase().includes(q) ||
        (o.telefono && o.telefono.includes(q)) ||
        o.id.slice(0, 8).includes(q)
      )
    }
    return true
  })

  /* ── Contadores por estado ── */
  const contadores = ESTADOS.map(e => ({
    ...e,
    count: ordenes.filter(o => o.estado === e.value).length,
  }))

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <style>{`
        .prod-page { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        
        /* ── Header ── */
        .prod-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .prod-title { font-size: 24px; font-weight: 700; color: #111; display: flex; align-items: center; gap: 10px; }
        .prod-btn-new {
          background: #D62828; color: white; border: none; padding: 10px 20px;
          border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          transition: background 0.15s;
        }
        .prod-btn-new:hover { background: #b91c1c; }
        
        /* ── Stats cards ── */
        .prod-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        @media (max-width: 768px) { .prod-stats { grid-template-columns: repeat(2, 1fr); } }
        .prod-stat-card {
          background: white; border-radius: 12px; padding: 16px; border: 1px solid #e5e7eb;
          cursor: pointer; transition: all 0.15s; position: relative; overflow: hidden;
        }
        .prod-stat-card:hover { border-color: #d1d5db; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .prod-stat-card.active { border-color: currentColor; box-shadow: 0 0 0 1px currentColor; }
        .prod-stat-count { font-size: 28px; font-weight: 800; }
        .prod-stat-label { font-size: 13px; color: #6b7280; margin-top: 2px; }
        .prod-stat-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; }

        /* ── Search + filter ── */
        .prod-toolbar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
        .prod-search {
          flex: 1; min-width: 200px; padding: 10px 14px; border: 1px solid #d1d5db;
          border-radius: 8px; font-size: 14px; outline: none;
        }
        .prod-search:focus { border-color: #D62828; box-shadow: 0 0 0 2px rgba(214,40,40,0.1); }
        .prod-filter-btn {
          padding: 8px 14px; border: 1px solid #d1d5db; border-radius: 8px;
          background: white; font-size: 13px; cursor: pointer; transition: all 0.15s;
        }
        .prod-filter-btn:hover { background: #f3f4f6; }
        .prod-filter-btn.active { background: #111; color: white; border-color: #111; }

        /* ── Table ── */
        .prod-table-wrap { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow-x: auto; }
        .prod-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .prod-table th {
          text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;
          border-bottom: 1px solid #e5e7eb; background: #fafafa;
        }
        .prod-table td { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
        .prod-table tr:last-child td { border-bottom: none; }
        .prod-table tr:hover td { background: #fafafa; }
        .prod-table tr { cursor: pointer; }

        /* ── Badges ── */
        .prod-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
          white-space: nowrap;
        }
        .prod-prioridad-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }

        /* ── Countdown ── */
        .prod-countdown { font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 4px; }
        .prod-countdown.ok { color: #10B981; }
        .prod-countdown.warning { color: #F59E0B; }
        .prod-countdown.danger { color: #EF4444; }
        .prod-countdown.done { color: #6B7280; }
        .prod-countdown.none { color: #9CA3AF; font-weight: 400; }

        /* ── Avanzar estado ── */
        .prod-advance-btn {
          padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
          border: none; cursor: pointer; transition: all 0.15s; white-space: nowrap;
        }
        .prod-advance-btn:hover { filter: brightness(0.9); }

        /* ── Modal ── */
        .prod-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000;
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .prod-modal {
          background: white; border-radius: 16px; max-width: 640px; width: 100%;
          max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        .prod-modal-header {
          padding: 20px 24px; border-bottom: 1px solid #e5e7eb;
          display: flex; align-items: center; justify-content: space-between;
        }
        .prod-modal-title { font-size: 18px; font-weight: 700; }
        .prod-modal-close {
          width: 32px; height: 32px; border-radius: 8px; border: none; background: #f3f4f6;
          font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .prod-modal-close:hover { background: #e5e7eb; }
        .prod-modal-body { padding: 24px; }
        .prod-modal-footer { padding: 16px 24px; border-top: 1px solid #e5e7eb; display: flex; gap: 10px; justify-content: flex-end; }

        /* ── Form ── */
        .prod-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 640px) { .prod-form-grid { grid-template-columns: 1fr; } }
        .prod-form-full { grid-column: 1 / -1; }
        .prod-form-label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px; }
        .prod-form-input {
          width: 100%; padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 8px;
          font-size: 14px; outline: none; box-sizing: border-box;
        }
        .prod-form-input:focus { border-color: #D62828; box-shadow: 0 0 0 2px rgba(214,40,40,0.1); }
        .prod-form-textarea { resize: vertical; min-height: 70px; font-family: inherit; }
        .prod-form-select { appearance: auto; background: white; }

        /* ── Detail modal ── */
        .prod-detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
        .prod-detail-row:last-child { border-bottom: none; }
        .prod-detail-label { width: 140px; font-size: 13px; color: #6b7280; flex-shrink: 0; }
        .prod-detail-value { font-size: 14px; color: #111; font-weight: 500; flex: 1; }

        /* ── Progress bar ── */
        .prod-progress { display: flex; align-items: center; gap: 0; margin: 16px 0; }
        .prod-progress-step {
          flex: 1; text-align: center; padding: 8px 4px; font-size: 11px; font-weight: 600;
          position: relative; color: #9ca3af;
        }
        .prod-progress-step.active { color: white; }
        .prod-progress-step .prod-progress-bar {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: 0; z-index: -1;
        }
        .prod-progress-step:first-child .prod-progress-bar { border-radius: 8px 0 0 8px; }
        .prod-progress-step:last-child .prod-progress-bar { border-radius: 0 8px 8px 0; }

        /* ── Empty state ── */
        .prod-empty {
          text-align: center; padding: 60px 20px; color: #9ca3af;
        }
        .prod-empty-icon { font-size: 48px; margin-bottom: 12px; }
        .prod-empty-text { font-size: 16px; font-weight: 500; }
        .prod-empty-sub { font-size: 14px; margin-top: 6px; }

        /* ── Mobile table ── */
        @media (max-width: 768px) {
          .prod-table th:nth-child(n+5), .prod-table td:nth-child(n+5) { display: none; }
          .prod-table th, .prod-table td { padding: 10px 12px; font-size: 13px; }
        }
      `}</style>

      <div className="prod-page">
        {/* ── Header ── */}
        <div className="prod-header">
          <h1 className="prod-title">🏭 Órdenes de Producción</h1>
          <button className="prod-btn-new" onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }}>
            ＋ Nueva Orden
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="prod-stats">
          {contadores.map(e => (
            <div
              key={e.value}
              className={`prod-stat-card ${filtroEstado === e.value ? 'active' : ''}`}
              style={{ color: e.color }}
              onClick={() => setFiltroEstado(filtroEstado === e.value ? 'todos' : e.value)}
            >
              <div className="prod-stat-count" style={{ color: e.color }}>{e.count}</div>
              <div className="prod-stat-label">{e.icon} {e.label}</div>
              <div className="prod-stat-bar" style={{ background: e.color }} />
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="prod-toolbar">
          <input
            className="prod-search"
            placeholder="Buscar por cliente, descripción, teléfono o #ID..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <button
            className={`prod-filter-btn ${filtroEstado === 'todos' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('todos')}
          >
            Todos ({ordenes.length})
          </button>
        </div>

        {/* ── Tabla ── */}
        {loading ? (
          <div className="prod-empty">
            <div className="prod-empty-icon">⏳</div>
            <div className="prod-empty-text">Cargando órdenes...</div>
          </div>
        ) : ordenesFiltradas.length === 0 ? (
          <div className="prod-empty">
            <div className="prod-empty-icon">📋</div>
            <div className="prod-empty-text">
              {busqueda || filtroEstado !== 'todos' ? 'No hay órdenes con ese filtro' : 'No hay órdenes de producción'}
            </div>
            <div className="prod-empty-sub">
              {!busqueda && filtroEstado === 'todos' && 'Creá la primera con el botón "+ Nueva Orden"'}
            </div>
          </div>
        ) : (
          <div className="prod-table-wrap">
            <table className="prod-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Countdown</th>
                  <th>Prioridad</th>
                  <th>Ingreso</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ordenesFiltradas.map(orden => {
                  const countdown = orden.estado === 'entregado'
                    ? { text: 'Entregado', status: 'done' as const }
                    : calcCountdown(orden.fecha_estimada_egreso)
                  const estadoInfo = ESTADOS.find(e => e.value === orden.estado)!
                  const prioridadInfo = PRIORIDADES.find(p => p.value === orden.prioridad)!
                  const next = siguienteEstado(orden.estado)

                  return (
                    <tr key={orden.id} onClick={() => setSelectedOrden(orden)}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#9ca3af' }}>
                        {orden.id.slice(0, 8)}
                      </td>
                      <td style={{ fontWeight: 600 }}>{orden.cliente}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {orden.descripcion}
                      </td>
                      <td>
                        <span
                          className="prod-badge"
                          style={{ background: `${estadoInfo.color}18`, color: estadoInfo.color }}
                        >
                          {estadoInfo.icon} {estadoInfo.label}
                        </span>
                      </td>
                      <td>
                        <span className={`prod-countdown ${countdown.status}`}>
                          {countdown.status === 'danger' && countdown.text.includes('Vencido') && '⚠️ '}
                          {countdown.status === 'warning' && '⏰ '}
                          {countdown.status === 'ok' && '🕐 '}
                          {countdown.text}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="prod-prioridad-dot" style={{ background: prioridadInfo.color }} />
                          {prioridadInfo.label}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: '#6b7280' }}>{formatDate(orden.fecha_ingreso)}</td>
                      <td onClick={e => e.stopPropagation()}>
                        {next && (
                          <button
                            className="prod-advance-btn"
                            style={{
                              background: `${ESTADOS.find(e => e.value === next)!.color}18`,
                              color: ESTADOS.find(e => e.value === next)!.color,
                            }}
                            onClick={() => cambiarEstado(orden.id, next)}
                          >
                            → {ESTADOS.find(e => e.value === next)!.label}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ══════════════════════════════════════════
            Modal: Nueva / Editar Orden
            ══════════════════════════════════════════ */}
        {showForm && (
          <div className="prod-modal-overlay" onClick={() => { setShowForm(false); setEditingId(null); }}>
            <div className="prod-modal" onClick={e => e.stopPropagation()}>
              <div className="prod-modal-header">
                <span className="prod-modal-title">
                  {editingId ? '✏️ Editar Orden' : '➕ Nueva Orden de Producción'}
                </span>
                <button className="prod-modal-close" onClick={() => { setShowForm(false); setEditingId(null); }}>✕</button>
              </div>
              <div className="prod-modal-body">
                <div className="prod-form-grid">
                  {/* Cliente */}
                  <div>
                    <label className="prod-form-label">Cliente *</label>
                    <input
                      className="prod-form-input"
                      value={form.cliente}
                      onChange={e => setForm({ ...form, cliente: e.target.value })}
                      placeholder="Nombre del cliente"
                    />
                  </div>
                  {/* Teléfono */}
                  <div>
                    <label className="prod-form-label">Teléfono</label>
                    <input
                      className="prod-form-input"
                      value={form.telefono}
                      onChange={e => setForm({ ...form, telefono: e.target.value })}
                      placeholder="099 123 456"
                    />
                  </div>
                  {/* Dirección obra */}
                  <div className="prod-form-full">
                    <label className="prod-form-label">Dirección de obra</label>
                    <input
                      className="prod-form-input"
                      value={form.direccion_obra}
                      onChange={e => setForm({ ...form, direccion_obra: e.target.value })}
                      placeholder="Dirección donde se instala"
                    />
                  </div>
                  {/* Descripción */}
                  <div className="prod-form-full">
                    <label className="prod-form-label">Descripción del trabajo *</label>
                    <textarea
                      className="prod-form-input prod-form-textarea"
                      value={form.descripcion}
                      onChange={e => setForm({ ...form, descripcion: e.target.value })}
                      placeholder="Ej: 2 ventanas corredizas 1.50x1.10 + 1 puerta balcón 2.00x2.10"
                    />
                  </div>
                  {/* Material */}
                  <div>
                    <label className="prod-form-label">Material</label>
                    <select
                      className="prod-form-input prod-form-select"
                      value={form.material}
                      onChange={e => setForm({ ...form, material: e.target.value })}
                    >
                      {MATERIALES.map(m => (
                        <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  {/* Color */}
                  <div>
                    <label className="prod-form-label">Color</label>
                    <input
                      className="prod-form-input"
                      value={form.color}
                      onChange={e => setForm({ ...form, color: e.target.value })}
                      placeholder="Ej: blanco, negro, gris"
                    />
                  </div>
                  {/* Medidas */}
                  <div>
                    <label className="prod-form-label">Medidas</label>
                    <input
                      className="prod-form-input"
                      value={form.medidas}
                      onChange={e => setForm({ ...form, medidas: e.target.value })}
                      placeholder="Ej: 1.50x1.10"
                    />
                  </div>
                  {/* Cantidad */}
                  <div>
                    <label className="prod-form-label">Cantidad</label>
                    <input
                      className="prod-form-input"
                      type="number"
                      min={1}
                      value={form.cantidad}
                      onChange={e => setForm({ ...form, cantidad: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  {/* Fecha estimada egreso */}
                  <div>
                    <label className="prod-form-label">📅 Fecha estimada de egreso</label>
                    <input
                      className="prod-form-input"
                      type="date"
                      value={form.fecha_estimada_egreso}
                      onChange={e => setForm({ ...form, fecha_estimada_egreso: e.target.value })}
                    />
                  </div>
                  {/* Prioridad */}
                  <div>
                    <label className="prod-form-label">Prioridad</label>
                    <select
                      className="prod-form-input prod-form-select"
                      value={form.prioridad}
                      onChange={e => setForm({ ...form, prioridad: e.target.value as PrioridadOrden })}
                    >
                      {PRIORIDADES.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  {/* Monto */}
                  <div>
                    <label className="prod-form-label">Monto ($)</label>
                    <input
                      className="prod-form-input"
                      type="number"
                      step="0.01"
                      value={form.monto}
                      onChange={e => setForm({ ...form, monto: e.target.value })}
                      placeholder="Opcional"
                    />
                  </div>
                  {/* Notas */}
                  <div className="prod-form-full">
                    <label className="prod-form-label">Notas internas</label>
                    <textarea
                      className="prod-form-input prod-form-textarea"
                      value={form.notas}
                      onChange={e => setForm({ ...form, notas: e.target.value })}
                      placeholder="Notas para uso interno..."
                    />
                  </div>
                </div>
              </div>
              <div className="prod-modal-footer">
                <button
                  className="prod-filter-btn"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                >
                  Cancelar
                </button>
                <button
                  className="prod-btn-new"
                  onClick={handleSave}
                  disabled={saving || !form.cliente.trim() || !form.descripcion.trim()}
                  style={{ opacity: saving || !form.cliente.trim() || !form.descripcion.trim() ? 0.5 : 1 }}
                >
                  {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear Orden'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            Modal: Detalle de Orden
            ══════════════════════════════════════════ */}
        {selectedOrden && (
          <div className="prod-modal-overlay" onClick={() => setSelectedOrden(null)}>
            <div className="prod-modal" onClick={e => e.stopPropagation()}>
              <div className="prod-modal-header">
                <span className="prod-modal-title">
                  📋 Orden #{selectedOrden.id.slice(0, 8)}
                </span>
                <button className="prod-modal-close" onClick={() => setSelectedOrden(null)}>✕</button>
              </div>
              <div className="prod-modal-body">
                {/* Barra de progreso */}
                <div className="prod-progress">
                  {ESTADOS.map((e, i) => {
                    const currentIdx = ESTADO_ORDEN.indexOf(selectedOrden.estado)
                    const isActive = i <= currentIdx
                    return (
                      <div key={e.value} className={`prod-progress-step ${isActive ? 'active' : ''}`}>
                        <div
                          className="prod-progress-bar"
                          style={{ background: isActive ? e.color : '#f3f4f6' }}
                        />
                        <span style={{ position: 'relative', zIndex: 1 }}>
                          {e.icon} {e.label}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Countdown grande */}
                {selectedOrden.estado !== 'entregado' && selectedOrden.fecha_estimada_egreso && (() => {
                  const cd = calcCountdown(selectedOrden.fecha_estimada_egreso)
                  return (
                    <div style={{
                      textAlign: 'center', padding: '16px', margin: '12px 0',
                      borderRadius: 12,
                      background: cd.status === 'danger' ? '#FEF2F2'
                        : cd.status === 'warning' ? '#FFFBEB'
                        : cd.status === 'ok' ? '#F0FDF4' : '#F9FAFB',
                    }}>
                      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Tiempo restante</div>
                      <div className={`prod-countdown ${cd.status}`} style={{ fontSize: 22, justifyContent: 'center' }}>
                        {cd.status === 'danger' && '⚠️ '}{cd.text}
                      </div>
                    </div>
                  )
                })()}

                {/* Datos */}
                <div style={{ marginTop: 16 }}>
                  <div className="prod-detail-row">
                    <span className="prod-detail-label">Cliente</span>
                    <span className="prod-detail-value">{selectedOrden.cliente}</span>
                  </div>
                  {selectedOrden.telefono && (
                    <div className="prod-detail-row">
                      <span className="prod-detail-label">Teléfono</span>
                      <span className="prod-detail-value">
                        <a href={`tel:${selectedOrden.telefono}`} style={{ color: '#D62828', textDecoration: 'none' }}>
                          📞 {selectedOrden.telefono}
                        </a>
                      </span>
                    </div>
                  )}
                  {selectedOrden.direccion_obra && (
                    <div className="prod-detail-row">
                      <span className="prod-detail-label">Dirección obra</span>
                      <span className="prod-detail-value">{selectedOrden.direccion_obra}</span>
                    </div>
                  )}
                  <div className="prod-detail-row">
                    <span className="prod-detail-label">Descripción</span>
                    <span className="prod-detail-value" style={{ whiteSpace: 'pre-wrap' }}>{selectedOrden.descripcion}</span>
                  </div>
                  <div className="prod-detail-row">
                    <span className="prod-detail-label">Material</span>
                    <span className="prod-detail-value" style={{ textTransform: 'capitalize' }}>{selectedOrden.material}</span>
                  </div>
                  {selectedOrden.color && (
                    <div className="prod-detail-row">
                      <span className="prod-detail-label">Color</span>
                      <span className="prod-detail-value">{selectedOrden.color}</span>
                    </div>
                  )}
                  {selectedOrden.medidas && (
                    <div className="prod-detail-row">
                      <span className="prod-detail-label">Medidas</span>
                      <span className="prod-detail-value">{selectedOrden.medidas}</span>
                    </div>
                  )}
                  <div className="prod-detail-row">
                    <span className="prod-detail-label">Cantidad</span>
                    <span className="prod-detail-value">{selectedOrden.cantidad}</span>
                  </div>
                  <div className="prod-detail-row">
                    <span className="prod-detail-label">Fecha ingreso</span>
                    <span className="prod-detail-value">{formatDateTime(selectedOrden.fecha_ingreso)}</span>
                  </div>
                  {selectedOrden.fecha_estimada_egreso && (
                    <div className="prod-detail-row">
                      <span className="prod-detail-label">Egreso estimado</span>
                      <span className="prod-detail-value">{formatDate(selectedOrden.fecha_estimada_egreso)}</span>
                    </div>
                  )}
                  {selectedOrden.fecha_egreso_real && (
                    <div className="prod-detail-row">
                      <span className="prod-detail-label">Egreso real</span>
                      <span className="prod-detail-value" style={{ color: '#10B981' }}>
                        ✅ {formatDateTime(selectedOrden.fecha_egreso_real)}
                      </span>
                    </div>
                  )}
                  <div className="prod-detail-row">
                    <span className="prod-detail-label">Prioridad</span>
                    <span className="prod-detail-value">
                      <span className="prod-prioridad-dot" style={{ background: PRIORIDADES.find(p => p.value === selectedOrden.prioridad)!.color, marginRight: 6 }} />
                      {PRIORIDADES.find(p => p.value === selectedOrden.prioridad)!.label}
                    </span>
                  </div>
                  {selectedOrden.monto && (
                    <div className="prod-detail-row">
                      <span className="prod-detail-label">Monto</span>
                      <span className="prod-detail-value" style={{ fontWeight: 700 }}>
                        $ {Number(selectedOrden.monto).toLocaleString('es-UY')}
                      </span>
                    </div>
                  )}
                  {selectedOrden.notas && (
                    <div className="prod-detail-row">
                      <span className="prod-detail-label">Notas</span>
                      <span className="prod-detail-value" style={{ whiteSpace: 'pre-wrap', color: '#6b7280' }}>
                        {selectedOrden.notas}
                      </span>
                    </div>
                  )}
                </div>

                {/* Cambiar estado */}
                <div style={{ marginTop: 20 }}>
                  <label className="prod-form-label">Cambiar estado</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                    {ESTADOS.map(e => (
                      <button
                        key={e.value}
                        className="prod-advance-btn"
                        style={{
                          background: selectedOrden.estado === e.value ? e.color : `${e.color}18`,
                          color: selectedOrden.estado === e.value ? 'white' : e.color,
                          padding: '6px 14px',
                          fontSize: 13,
                        }}
                        onClick={() => cambiarEstado(selectedOrden.id, e.value)}
                      >
                        {e.icon} {e.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="prod-modal-footer">
                <button
                  className="prod-filter-btn"
                  style={{ color: '#EF4444', borderColor: '#FCA5A5' }}
                  onClick={() => eliminarOrden(selectedOrden.id)}
                >
                  🗑️ Eliminar
                </button>
                <button
                  className="prod-filter-btn"
                  onClick={() => editarOrden(selectedOrden)}
                >
                  ✏️ Editar
                </button>
                <button className="prod-filter-btn" onClick={() => setSelectedOrden(null)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
