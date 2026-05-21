'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Pedido = {
  id: string
  codigo: number
  nombre: string
  apellido: string
  telefono: string
  direccion: string
  tipo_envio: string
  cedula: string | null
  localidad: string | null
  departamento: string | null
  agencia_carga: string | null
  ubicacion_lat: number | null
  ubicacion_lng: number | null
  medio_pago: string
  recargo_porcentaje: number
  recargo_monto: number
  notas: string | null
  notas_admin: string | null
  items: any[]
  total: number
  estado: string
  created_at: string
  updated_at: string
}

const ESTADOS = ['pendiente', 'contactado', 'confirmado', 'entregado', 'cancelado']

const ESTADO_COLORES: Record<string, { bg: string; color: string }> = {
  pendiente: { bg: '#fef3c7', color: '#92400e' },
  contactado: { bg: '#dbeafe', color: '#1e40af' },
  confirmado: { bg: '#d1fae5', color: '#065f46' },
  entregado: { bg: '#f0fdf4', color: '#166534' },
  cancelado: { bg: '#fef2f2', color: '#991b1b' },
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    maximumFractionDigits: 0,
  }).format(n)
}

function fechaCorta(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
    ' ' + d.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })
}

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [expandido, setExpandido] = useState<string | null>(null)
  const [actualizando, setActualizando] = useState<string | null>(null)
  // Estado para edición
  const [editando, setEditando] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Pedido>>({})
  const [guardando, setGuardando] = useState(false)
  // Estado para notas admin
  const [editandoNota, setEditandoNota] = useState<string | null>(null)
  const [notaTemp, setNotaTemp] = useState('')

  useEffect(() => {
    cargarPedidos()
  }, [])

  async function cargarPedidos() {
    setLoading(true)
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setPedidos(data)
    setLoading(false)
  }

  async function cambiarEstado(id: string, nuevoEstado: string) {
    setActualizando(id)
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      setPedidos(prev =>
        prev.map(p => (p.id === id ? { ...p, estado: nuevoEstado, updated_at: new Date().toISOString() } : p))
      )
    }
    setActualizando(null)
  }

  function empezarEdicion(p: Pedido) {
    setEditando(p.id)
    setEditData({
      nombre: p.nombre,
      apellido: p.apellido,
      telefono: p.telefono,
      direccion: p.direccion,
      cedula: p.cedula || '',
      localidad: p.localidad || '',
      departamento: p.departamento || '',
      agencia_carga: p.agencia_carga || '',
    })
  }

  function cancelarEdicion() {
    setEditando(null)
    setEditData({})
  }

  async function guardarEdicion(id: string) {
    setGuardando(true)
    const updates: any = {
      nombre: editData.nombre,
      apellido: editData.apellido,
      telefono: editData.telefono,
      direccion: editData.direccion,
      updated_at: new Date().toISOString(),
    }
    // Solo incluir campos de interior si aplica
    const pedido = pedidos.find(p => p.id === id)
    if (pedido?.tipo_envio === 'interior') {
      updates.cedula = editData.cedula || null
      updates.localidad = editData.localidad || null
      updates.departamento = editData.departamento || null
      updates.agencia_carga = editData.agencia_carga || null
    }

    const { error } = await supabase
      .from('pedidos')
      .update(updates)
      .eq('id', id)

    if (!error) {
      setPedidos(prev =>
        prev.map(p => (p.id === id ? { ...p, ...updates } : p))
      )
      setEditando(null)
      setEditData({})
    }
    setGuardando(false)
  }

  function empezarEditarNota(p: Pedido) {
    setEditandoNota(p.id)
    setNotaTemp(p.notas_admin || '')
  }

  async function guardarNota(id: string) {
    setGuardando(true)
    const { error } = await supabase
      .from('pedidos')
      .update({ notas_admin: notaTemp || null, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      setPedidos(prev =>
        prev.map(p => (p.id === id ? { ...p, notas_admin: notaTemp || null, updated_at: new Date().toISOString() } : p))
      )
    }
    setEditandoNota(null)
    setNotaTemp('')
    setGuardando(false)
  }

  const pedidosFiltrados = filtroEstado === 'todos'
    ? pedidos
    : pedidos.filter(p => p.estado === filtroEstado)

  const contadorPorEstado = ESTADOS.reduce((acc, e) => {
    acc[e] = pedidos.filter(p => p.estado === e).length
    return acc
  }, {} as Record<string, number>)

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px', border: '1.5px solid #ddd',
    borderRadius: 8, fontSize: 13, fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box', background: '#fafafa',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: '#111', color: 'white', padding: '24px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Link href="/admin" style={{ color: '#888', textDecoration: 'none', fontSize: 13 }}>← Panel admin</Link>
            <h1 style={{ margin: '4px 0 0', fontSize: 24, fontFamily: "'Playfair Display', serif" }}>Pedidos</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#888' }}>{pedidos.length} pedidos</span>
            <button
              onClick={cargarPedidos}
              style={{
                background: '#333', color: 'white', border: 'none', borderRadius: 8,
                padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              🔄 Actualizar
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
        {/* Filtros de estado */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          <button
            onClick={() => setFiltroEstado('todos')}
            style={{
              padding: '8px 16px', borderRadius: 50, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700,
              background: filtroEstado === 'todos' ? '#111' : 'white',
              color: filtroEstado === 'todos' ? 'white' : '#555',
            }}
          >
            Todos ({pedidos.length})
          </button>
          {ESTADOS.map(e => (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              style={{
                padding: '8px 16px', borderRadius: 50, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700,
                background: filtroEstado === e ? ESTADO_COLORES[e].bg : 'white',
                color: filtroEstado === e ? ESTADO_COLORES[e].color : '#888',
              }}
            >
              {e.charAt(0).toUpperCase() + e.slice(1)} ({contadorPorEstado[e] || 0})
            </button>
          ))}
        </div>

        {/* Lista de pedidos */}
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#999' }}>Cargando pedidos...</div>
        ) : pedidosFiltrados.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#999' }}>
            {filtroEstado === 'todos' ? 'No hay pedidos aún.' : `No hay pedidos con estado "${filtroEstado}".`}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pedidosFiltrados.map(p => {
              const abierto = expandido === p.id
              const colores = ESTADO_COLORES[p.estado] || ESTADO_COLORES.pendiente
              const enEdicion = editando === p.id

              return (
                <div key={p.id} style={{
                  background: 'white', borderRadius: 16, border: '1px solid #eee',
                  overflow: 'hidden', transition: 'box-shadow 0.2s',
                  boxShadow: abierto ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
                }}>
                  {/* Row principal */}
                  <div
                    onClick={() => { setExpandido(abierto ? null : p.id); if (abierto) cancelarEdicion() }}
                    style={{
                      padding: '16px 20px', cursor: 'pointer',
                      display: 'grid', gridTemplateColumns: '80px 1fr 1fr 120px 100px 30px',
                      gap: 12, alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 800, color: '#d62828', fontSize: 15 }}>#{p.codigo}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{p.nombre} {p.apellido}</span>
                    <span style={{ fontSize: 13, color: '#888' }}>{fechaCorta(p.created_at)}</span>
                    <span style={{ fontWeight: 800, fontSize: 15, color: '#1a1a1a' }}>{fmt(p.total)}</span>
                    <span style={{
                      display: 'inline-block', padding: '4px 12px', borderRadius: 50,
                      fontSize: 12, fontWeight: 700, textAlign: 'center',
                      background: colores.bg, color: colores.color,
                    }}>
                      {p.estado}
                    </span>
                    <span style={{ color: '#ccc', fontSize: 16, textAlign: 'center', transition: 'transform 0.2s', transform: abierto ? 'rotate(180deg)' : 'none' }}>▼</span>
                  </div>

                  {/* Detalle expandible */}
                  {abierto && (
                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f0f0f0' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 16 }}>

                        {/* Datos cliente — modo lectura o edición */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#999' }}>Cliente</div>
                            {!enEdicion ? (
                              <button
                                onClick={() => empezarEdicion(p)}
                                style={{
                                  background: '#f5f5f5', border: 'none', borderRadius: 6,
                                  padding: '4px 10px', fontSize: 12, fontWeight: 600,
                                  color: '#555', cursor: 'pointer',
                                }}
                              >
                                ✏️ Editar
                              </button>
                            ) : (
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  onClick={() => guardarEdicion(p.id)}
                                  disabled={guardando}
                                  style={{
                                    background: '#16a34a', color: 'white', border: 'none', borderRadius: 6,
                                    padding: '4px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                    opacity: guardando ? 0.6 : 1,
                                  }}
                                >
                                  {guardando ? '...' : '✓ Guardar'}
                                </button>
                                <button
                                  onClick={cancelarEdicion}
                                  style={{
                                    background: '#f5f5f5', border: 'none', borderRadius: 6,
                                    padding: '4px 10px', fontSize: 12, fontWeight: 600,
                                    color: '#999', cursor: 'pointer',
                                  }}
                                >
                                  Cancelar
                                </button>
                              </div>
                            )}
                          </div>

                          {enEdicion ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <div>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 3 }}>Nombre</div>
                                  <input style={inputStyle} value={editData.nombre || ''} onChange={e => setEditData({ ...editData, nombre: e.target.value })} />
                                </div>
                                <div>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 3 }}>Apellido</div>
                                  <input style={inputStyle} value={editData.apellido || ''} onChange={e => setEditData({ ...editData, apellido: e.target.value })} />
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 3 }}>Teléfono</div>
                                <input style={inputStyle} value={editData.telefono || ''} onChange={e => setEditData({ ...editData, telefono: e.target.value })} />
                              </div>
                              <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 3 }}>Dirección</div>
                                <input style={inputStyle} value={editData.direccion || ''} onChange={e => setEditData({ ...editData, direccion: e.target.value })} />
                              </div>
                              {p.tipo_envio === 'interior' && (
                                <>
                                  <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 3 }}>Cédula</div>
                                    <input style={inputStyle} value={editData.cedula || ''} onChange={e => setEditData({ ...editData, cedula: e.target.value })} />
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    <div>
                                      <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 3 }}>Localidad</div>
                                      <input style={inputStyle} value={editData.localidad || ''} onChange={e => setEditData({ ...editData, localidad: e.target.value })} />
                                    </div>
                                    <div>
                                      <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 3 }}>Departamento</div>
                                      <input style={inputStyle} value={editData.departamento || ''} onChange={e => setEditData({ ...editData, departamento: e.target.value })} />
                                    </div>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 3 }}>Agencia de carga</div>
                                    <input style={inputStyle} value={editData.agencia_carga || ''} onChange={e => setEditData({ ...editData, agencia_carga: e.target.value })} />
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <>
                              <div style={{ fontSize: 14, marginBottom: 6 }}><strong>Nombre:</strong> {p.nombre} {p.apellido}</div>
                              <div style={{ fontSize: 14, marginBottom: 6 }}><strong>Teléfono:</strong> <a href={`tel:${p.telefono}`} style={{ color: '#d62828' }}>{p.telefono}</a></div>
                              <div style={{ fontSize: 14, marginBottom: 6 }}><strong>Dirección:</strong> {p.direccion}</div>
                              <div style={{ fontSize: 14, marginBottom: 6 }}>
                                <strong>Envío:</strong>{' '}
                                <span style={{
                                  display: 'inline-block', padding: '2px 10px', borderRadius: 50,
                                  fontSize: 12, fontWeight: 700,
                                  background: p.tipo_envio === 'interior' ? '#ede9fe' : '#dbeafe',
                                  color: p.tipo_envio === 'interior' ? '#6d28d9' : '#1e40af',
                                }}>
                                  {p.tipo_envio === 'interior' ? '🚚 Interior' : '🏙️ Montevideo'}
                                </span>
                              </div>
                              {p.tipo_envio === 'interior' && (
                                <div style={{
                                  background: '#fafaf8', border: '1px solid #ede8e2', borderRadius: 10,
                                  padding: '10px 14px', marginBottom: 6, fontSize: 13,
                                }}>
                                  {p.cedula && <div style={{ marginBottom: 4 }}><strong>C.I.:</strong> {p.cedula}</div>}
                                  {p.localidad && <div style={{ marginBottom: 4 }}><strong>Localidad:</strong> {p.localidad}</div>}
                                  {p.departamento && <div style={{ marginBottom: 4 }}><strong>Departamento:</strong> {p.departamento}</div>}
                                  {p.agencia_carga && <div><strong>Agencia:</strong> {p.agencia_carga}</div>}
                                </div>
                              )}
                              {p.ubicacion_lat && p.ubicacion_lng && (
                                <div style={{ fontSize: 14, marginBottom: 6 }}>
                                  <a
                                    href={`https://www.google.com/maps?q=${p.ubicacion_lat},${p.ubicacion_lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', gap: 6,
                                      background: '#f0fdf4', color: '#166534', padding: '6px 14px',
                                      borderRadius: 50, fontSize: 13, fontWeight: 700,
                                      textDecoration: 'none', border: '1px solid #bbf7d0',
                                    }}
                                  >
                                    📍 Ver ubicación en Google Maps
                                  </a>
                                </div>
                              )}
                              {p.notas && <div style={{ fontSize: 14, marginBottom: 6 }}><strong>Notas del cliente:</strong> {p.notas}</div>}
                              <div style={{ fontSize: 14, marginBottom: 6 }}>
                                <strong>Medio de pago:</strong> {p.medio_pago || '—'}
                                {p.recargo_porcentaje > 0 && (
                                  <span style={{
                                    marginLeft: 8, display: 'inline-block',
                                    background: '#fef3c7', color: '#92400e',
                                    padding: '2px 8px', borderRadius: 50,
                                    fontSize: 12, fontWeight: 700,
                                  }}>
                                    +{p.recargo_porcentaje}% ({fmt(p.recargo_monto)})
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Columna derecha: estado + notas admin */}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#999', marginBottom: 10 }}>Cambiar estado</div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                            {ESTADOS.map(e => {
                              const c = ESTADO_COLORES[e]
                              const activo = p.estado === e
                              return (
                                <button
                                  key={e}
                                  onClick={() => cambiarEstado(p.id, e)}
                                  disabled={activo || actualizando === p.id}
                                  style={{
                                    padding: '6px 14px', borderRadius: 50, border: 'none',
                                    cursor: activo ? 'default' : 'pointer',
                                    fontSize: 12, fontWeight: 700,
                                    background: activo ? c.bg : '#f5f5f5',
                                    color: activo ? c.color : '#999',
                                    opacity: actualizando === p.id ? 0.5 : 1,
                                    outline: activo ? `2px solid ${c.color}` : 'none',
                                    outlineOffset: 2,
                                  }}
                                >
                                  {e}
                                </button>
                              )
                            })}
                          </div>

                          {/* Notas internas del admin */}
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#999', marginBottom: 8 }}>Notas internas</div>
                          {editandoNota === p.id ? (
                            <div>
                              <textarea
                                value={notaTemp}
                                onChange={e => setNotaTemp(e.target.value)}
                                placeholder="Notas internas sobre este pedido... (no las ve el cliente)"
                                rows={3}
                                style={{
                                  width: '100%', padding: '10px 12px', border: '1.5px solid #ddd',
                                  borderRadius: 10, fontSize: 13, fontFamily: 'inherit',
                                  outline: 'none', boxSizing: 'border-box', resize: 'vertical',
                                  background: '#fffef5',
                                }}
                              />
                              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                                <button
                                  onClick={() => guardarNota(p.id)}
                                  disabled={guardando}
                                  style={{
                                    background: '#16a34a', color: 'white', border: 'none', borderRadius: 6,
                                    padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                    opacity: guardando ? 0.6 : 1,
                                  }}
                                >
                                  {guardando ? '...' : '✓ Guardar nota'}
                                </button>
                                <button
                                  onClick={() => setEditandoNota(null)}
                                  style={{
                                    background: '#f5f5f5', border: 'none', borderRadius: 6,
                                    padding: '6px 12px', fontSize: 12, color: '#999', cursor: 'pointer',
                                  }}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => empezarEditarNota(p)}
                              style={{
                                padding: '12px 14px',
                                background: p.notas_admin ? '#fffef5' : '#fafafa',
                                border: `1.5px ${p.notas_admin ? 'solid #fde68a' : 'dashed #e0e0e0'}`,
                                borderRadius: 10,
                                fontSize: 13,
                                color: p.notas_admin ? '#1a1a1a' : '#bbb',
                                cursor: 'pointer',
                                lineHeight: 1.5,
                                whiteSpace: 'pre-wrap',
                                minHeight: 44,
                                transition: 'border-color 0.15s',
                              }}
                            >
                              {p.notas_admin || '+ Agregar nota interna...'}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Items del pedido */}
                      <div style={{ marginTop: 20 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#999', marginBottom: 10 }}>Productos</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {(p.items || []).map((item: any, idx: number) => (
                            <div key={idx} style={{
                              display: 'grid', gridTemplateColumns: '50px 1fr auto',
                              gap: 10, alignItems: 'center',
                              padding: 10, background: '#fafafa', borderRadius: 10,
                            }}>
                              <div style={{ width: 50, height: 50, borderRadius: 8, overflow: 'hidden', background: '#eee' }}>
                                <img src={item.imagen_url || '/placeholder.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>{item.nombre}</div>
                                {item.varianteNombre && <div style={{ fontSize: 12, color: '#d62828' }}>{item.varianteNombre}</div>}
                                <div style={{ fontSize: 12, color: '#888' }}>x{item.cantidad} · {fmt(item.precio)}/{item.unidad || 'u'}</div>
                              </div>
                              <div style={{ fontWeight: 800, color: '#d62828', fontSize: 15 }}>{fmt(item.subtotal || item.precio * item.cantidad)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
