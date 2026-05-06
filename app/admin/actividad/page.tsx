'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { useVendedor } from '@/lib/vendedor-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type LogEntry = {
  id: string; vendedor_nombre: string; accion: string; tabla: string
  descripcion: string; registro_id: string; created_at: string
  datos_antes: any; datos_despues: any
}

const ACCION_COLOR: Record<string, string> = {
  crear: '#6ec8a0', editar: '#F7B731', eliminar: '#D62828',
  login: '#2563eb', activar: '#6ec8a0', desactivar: '#888',
}
const TABLA_LABEL: Record<string, string> = {
  precios_calc: '💰 Precios', contenido: '🏠 Landing', tienda_productos: '🛍️ Tienda',
  vendedores: '👥 Usuarios', audit_log: '📋 Log',
}

export default function AdminActividadPage() {
  const { isAdmin, vendedor } = useVendedor()
  const router = useRouter()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroUsuario, setFiltroUsuario] = useState('')
  const [filtroTabla, setFiltroTabla] = useState('')
  const [filtroAccion, setFiltroAccion] = useState('')
  const [expandido, setExpandido] = useState<string | null>(null)
  const [pagina, setPagina] = useState(0)
  const POR_PAGINA = 50

  useEffect(() => {
    if (!isAdmin && vendedor) router.replace('/admin')
  }, [isAdmin, vendedor])

  const load = async () => {
    setLoading(true)
    let q = supabase.from('audit_log').select('*').order('created_at', { ascending: false }).range(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA - 1)
    if (filtroUsuario) q = q.ilike('vendedor_nombre', `%${filtroUsuario}%`)
    if (filtroTabla) q = q.eq('tabla', filtroTabla)
    if (filtroAccion) q = q.eq('accion', filtroAccion)
    const { data } = await q
    setLogs(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [pagina, filtroUsuario, filtroTabla, filtroAccion])

  const fmtFecha = (s: string) => {
    const d = new Date(s)
    return d.toLocaleDateString('es-UY') + ' ' + d.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })
  }

  const tablas = ['precios_calc', 'contenido', 'tienda_productos', 'vendedores']
  const acciones = ['crear', 'editar', 'eliminar', 'login', 'activar', 'desactivar']

  return (
    <div style={{ maxWidth: 1000, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#fff', margin: '0 0 4px' }}>
          📋 Log de Actividad
        </h1>
        <p style={{ fontSize: 13, color: '#666', margin: 0 }}>Registro de todos los cambios realizados en el sistema.</p>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="🔍 Buscar usuario..." value={filtroUsuario}
          onChange={e => { setFiltroUsuario(e.target.value); setPagina(0) }}
          style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 7, color: '#f0f0f0', fontSize: 13, padding: '7px 12px', outline: 'none', width: 180 }}
          onFocus={e => e.target.style.borderColor = '#F7B731'}
          onBlur={e => e.target.style.borderColor = '#2e2e2e'}
        />
        <select value={filtroTabla} onChange={e => { setFiltroTabla(e.target.value); setPagina(0) }}
          style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 7, color: filtroTabla ? '#f0f0f0' : '#555', fontSize: 13, padding: '7px 12px', outline: 'none', cursor: 'pointer' }}>
          <option value="">Todas las secciones</option>
          {tablas.map(t => <option key={t} value={t}>{TABLA_LABEL[t] || t}</option>)}
        </select>
        <select value={filtroAccion} onChange={e => { setFiltroAccion(e.target.value); setPagina(0) }}
          style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 7, color: filtroAccion ? '#f0f0f0' : '#555', fontSize: 13, padding: '7px 12px', outline: 'none', cursor: 'pointer' }}>
          <option value="">Todas las acciones</option>
          {acciones.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        {(filtroUsuario || filtroTabla || filtroAccion) && (
          <button onClick={() => { setFiltroUsuario(''); setFiltroTabla(''); setFiltroAccion(''); setPagina(0) }}
            style={{ background: 'transparent', border: '1px solid #333', borderRadius: 7, color: '#888', fontSize: 12, padding: '7px 12px', cursor: 'pointer' }}>
            ✕ Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla */}
      <div style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 12, overflow: 'hidden' }}>
        {loading
          ? <div style={{ padding: 32, textAlign: 'center', color: '#555' }}>Cargando...</div>
          : logs.length === 0
            ? <div style={{ padding: 32, textAlign: 'center', color: '#555' }}>No hay registros con estos filtros.</div>
            : <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #D62828' }}>
                    {['Fecha', 'Usuario', 'Acción', 'Sección', 'Descripción', ''].map(h => (
                      <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#555', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <>
                      <tr key={log.id} style={{ borderBottom: '1px solid #1e1e1e' }}
                        onClick={() => setExpandido(expandido === log.id ? null : log.id)}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#1e1e1e'}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                        style={{ borderBottom: '1px solid #1e1e1e', cursor: (log.datos_antes || log.datos_despues) ? 'pointer' : 'default' }}>
                        <td style={{ padding: '9px 14px', fontSize: 11, color: '#555', whiteSpace: 'nowrap' }}>{fmtFecha(log.created_at)}</td>
                        <td style={{ padding: '9px 14px', fontSize: 12, color: '#ccc', fontWeight: 600 }}>{log.vendedor_nombre || '—'}</td>
                        <td style={{ padding: '9px 14px' }}>
                          <span style={{ background: (ACCION_COLOR[log.accion] || '#888') + '22', color: ACCION_COLOR[log.accion] || '#888', border: `1px solid ${(ACCION_COLOR[log.accion] || '#888')}44`, borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                            {log.accion}
                          </span>
                        </td>
                        <td style={{ padding: '9px 14px', fontSize: 11, color: '#666' }}>{TABLA_LABEL[log.tabla] || log.tabla || '—'}</td>
                        <td style={{ padding: '9px 14px', fontSize: 12, color: '#aaa', maxWidth: 300 }}>{log.descripcion}</td>
                        <td style={{ padding: '9px 14px' }}>
                          {(log.datos_antes || log.datos_despues) && (
                            <span style={{ fontSize: 10, color: '#444' }}>{expandido === log.id ? '▲' : '▼'}</span>
                          )}
                        </td>
                      </tr>
                      {expandido === log.id && (log.datos_antes || log.datos_despues) && (
                        <tr key={`${log.id}-detail`}>
                          <td colSpan={6} style={{ padding: '0 14px 12px', background: '#141414' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '12px 0' }}>
                              {log.datos_antes && (
                                <div>
                                  <div style={{ fontSize: 10, fontWeight: 700, color: '#D62828', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Antes</div>
                                  <pre style={{ background: '#111', border: '1px solid #2e2e2e', borderRadius: 6, padding: 10, fontSize: 11, color: '#888', margin: 0, overflowX: 'auto', fontFamily: 'monospace' }}>
                                    {JSON.stringify(log.datos_antes, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.datos_despues && (
                                <div>
                                  <div style={{ fontSize: 10, fontWeight: 700, color: '#6ec8a0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Después</div>
                                  <pre style={{ background: '#111', border: '1px solid #2e2e2e', borderRadius: 6, padding: 10, fontSize: 11, color: '#aaa', margin: 0, overflowX: 'auto', fontFamily: 'monospace' }}>
                                    {JSON.stringify(log.datos_despues, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
        }
      </div>

      {/* Paginación */}
      {logs.length === POR_PAGINA && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
          {pagina > 0 && (
            <button onClick={() => setPagina(p => p - 1)}
              style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 7, color: '#888', fontSize: 13, padding: '7px 16px', cursor: 'pointer' }}>
              ← Anterior
            </button>
          )}
          <span style={{ fontSize: 12, color: '#555', padding: '7px 0' }}>Página {pagina + 1}</span>
          <button onClick={() => setPagina(p => p + 1)}
            style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 7, color: '#888', fontSize: 13, padding: '7px 16px', cursor: 'pointer' }}>
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}
