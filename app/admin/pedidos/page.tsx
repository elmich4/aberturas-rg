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
  notas: string | null
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

  const pedidosFiltrados = filtroEstado === 'todos'
    ? pedidos
    : pedidos.filter(p => p.estado === filtroEstado)

  const contadorPorEstado = ESTADOS.reduce((acc, e) => {
    acc[e] = pedidos.filter(p => p.estado === e).length
    return acc
  }, {} as Record<string, number>)

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

              return (
                <div key={p.id} style={{
                  background: 'white', borderRadius: 16, border: '1px solid #eee',
                  overflow: 'hidden', transition: 'box-shadow 0.2s',
                  boxShadow: abierto ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
                }}>
                  {/* Row principal */}
                  <div
                    onClick={() => setExpandido(abierto ? null : p.id)}
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
                        {/* Datos cliente */}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#999', marginBottom: 10 }}>Cliente</div>
                          <div style={{ fontSize: 14, marginBottom: 6 }}><strong>Nombre:</strong> {p.nombre} {p.apellido}</div>
                          <div style={{ fontSize: 14, marginBottom: 6 }}><strong>Teléfono:</strong> <a href={`tel:${p.telefono}`} style={{ color: '#d62828' }}>{p.telefono}</a></div>
                          <div style={{ fontSize: 14, marginBottom: 6 }}><strong>Dirección:</strong> {p.direccion}</div>
                          {p.notas && <div style={{ fontSize: 14, marginBottom: 6 }}><strong>Notas:</strong> {p.notas}</div>}
                        </div>

                        {/* Cambiar estado */}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#999', marginBottom: 10 }}>Cambiar estado</div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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
