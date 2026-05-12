'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────────────────────
type Producto = {
  id: string; calculadora: string; clave: string; descripcion: string
  criterio: string; precio: number; ancho: number | null; alto: number | null
  unidad: string; activo: boolean; orden: number
}
type Perfil = { id: string; nombre: string; descripcion: string; activo: boolean; orden: number }
type PrecioPerfil = { id: string; perfil_id: string; producto_id: string; precio_override: number | null; pct_ajuste: number }

// ── Constants ──────────────────────────────────────────────────────────────
const CATS: Record<string, string> = {
  ventana_s20: '🪟 Serie 20', ventana_s25: '🪟 Serie 25',
  monoblock_s20: '🏠 Monoblock S20', monoblock_s25: '🏠 Monoblock S25',
  reja: '🔒 Rejas', persiana: '🎨 Persianas', mosquitero: '🦟 Mosquiteros',
  pvc_tablilla: '🏠 PVC — Tablillas', pvc_perfil: '🏠 PVC — Perfilería',
  yeso_placa: '🏗️ Yeso — Placas', yeso_perfil: '🏗️ Yeso — Perfilería',
  yeso_term: '🏗️ Yeso — Terminación', otros: '🔧 Otros'
}
const CRITERIOS = ['fijo', 'm2', 'ml']
const CRITERIO_LABEL: Record<string, string> = { fijo: 'Precio fijo', m2: 'Por m²', ml: 'Por ML (ancho+alto)' }
const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-UY')

const S = {
  panel: { background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 12, overflow: 'hidden' as const },
  sectionHead: { background: 'linear-gradient(135deg,#1e1e1e,#252525)', padding: '12px 18px', borderBottom: '2px solid #D62828', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, textTransform: 'uppercase' as const, letterSpacing: 1, color: '#fff' },
  inp: { background: '#111', border: '1px solid #2e2e2e', borderRadius: 7, color: '#f0f0f0', fontFamily: 'inherit', fontSize: 13, padding: '7px 10px', outline: 'none', width: '100%', boxSizing: 'border-box' as const },
  btn: (color = '#D62828', text = '#fff') => ({ background: color, color: text, border: 'none', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, textTransform: 'uppercase' as const, letterSpacing: 1, whiteSpace: 'nowrap' as const }),
  tag: (color: string) => ({ background: color + '22', color: color, border: `1px solid ${color}44`, borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' as const }),
}

export default function AdminPrecios() {
  const [tab, setTab] = useState<'productos' | 'perfiles'>('productos')
  const [productos, setProductos] = useState<Producto[]>([])
  const [perfiles, setPerfiles] = useState<Perfil[]>([])
  const [preciosPerfil, setPreciosPerfil] = useState<PrecioPerfil[]>([])
  const [loading, setLoading] = useState(true)
  const [catActiva, setCatActiva] = useState('ventana_s20')
  const [perfilActivo, setPerfilActivo] = useState<string>('')
  const [saving, setSaving] = useState<string | null>(null)

  // Modal nuevo producto
  const [modalProd, setModalProd] = useState(false)
  const [newProd, setNewProd] = useState({ calculadora: 'ventana_s20', clave: '', descripcion: '', criterio: 'fijo', precio: '', ancho: '', alto: '', unidad: 'u' })

  // Modal nuevo perfil
  const [modalPerfil, setModalPerfil] = useState(false)
  const [newPerfil, setNewPerfil] = useState({ nombre: '', descripcion: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: prods }, { data: perfs }, { data: pp }] = await Promise.all([
      supabase.from('precios_calc').select('*').order('calculadora').order('orden'),
      supabase.from('perfiles_precio').select('*').order('orden'),
      supabase.from('precios_perfil').select('*'),
    ])
    setProductos(prods || [])
    setPerfiles(perfs || [])
    setPreciosPerfil(pp || [])
    if (perfs?.length && !perfilActivo) setPerfilActivo(perfs[0].id)
    setLoading(false)
  }, [perfilActivo])

  useEffect(() => { load() }, [])

  // ── Precio efectivo para un producto en un perfil ──
  const getPrecioPerfil = (prodId: string, perfilId: string) => {
    return preciosPerfil.find(pp => pp.producto_id === prodId && pp.perfil_id === perfilId)
  }

  const calcPrecioFinal = (prod: Producto, pp: PrecioPerfil | undefined) => {
    if (!pp) return prod.precio
    if (pp.precio_override !== null && pp.precio_override !== undefined) return pp.precio_override
    return Math.round(prod.precio * (1 + (pp.pct_ajuste || 0) / 100))
  }

  // ── Guardar precio de perfil ──
  const savePrecioPerfil = async (prodId: string, perfilId: string, field: 'precio_override' | 'pct_ajuste', val: string) => {
    const key = `${prodId}-${perfilId}`
    setSaving(key)
    const existing = getPrecioPerfil(prodId, perfilId)
    const numVal = val === '' ? null : parseFloat(val)
    const data: any = { perfil_id: perfilId, producto_id: prodId }
    if (field === 'precio_override') data.precio_override = numVal
    else data.pct_ajuste = numVal || 0

    if (existing) {
      await supabase.from('precios_perfil').update(data).eq('id', existing.id)
    } else {
      await supabase.from('precios_perfil').insert(data)
    }
    await load()
    setSaving(null)
  }

  // ── Guardar precio base ──
  const savePrecioBase = async (prod: Producto, val: string) => {
    setSaving(prod.id)
    await supabase.from('precios_calc').update({ precio: parseFloat(val) || 0 }).eq('id', prod.id)
    await load()
    setSaving(null)
  }

  // ── Toggle activo ──
  const toggleActivo = async (prod: Producto) => {
    await supabase.from('precios_calc').update({ activo: !prod.activo }).eq('id', prod.id)
    setProductos(prev => prev.map(p => p.id === prod.id ? { ...p, activo: !p.activo } : p))
  }

  // ── Agregar producto ──
  const addProducto = async () => {
    if (!newProd.clave.trim()) return
    setSaving('new')
    await supabase.from('precios_calc').insert({
      calculadora: newProd.calculadora, clave: newProd.clave.trim(),
      descripcion: newProd.descripcion, criterio: newProd.criterio,
      precio: parseFloat(newProd.precio) || 0,
      ancho: newProd.ancho ? parseFloat(newProd.ancho) : null,
      alto: newProd.alto ? parseFloat(newProd.alto) : null,
      unidad: newProd.unidad, activo: true,
      orden: productos.filter(p => p.calculadora === newProd.calculadora).length + 1,
    })
    setModalProd(false)
    setNewProd({ calculadora: 'ventana_s20', clave: '', descripcion: '', criterio: 'fijo', precio: '', ancho: '', alto: '', unidad: 'u' })
    await load()
    setSaving(null)
  }

  // ── Agregar perfil ──
  const addPerfil = async () => {
    if (!newPerfil.nombre.trim()) return
    await supabase.from('perfiles_precio').insert({ nombre: newPerfil.nombre.trim(), descripcion: newPerfil.descripcion, orden: perfiles.length })
    setModalPerfil(false)
    setNewPerfil({ nombre: '', descripcion: '' })
    await load()
  }

  // ── Eliminar producto ──
  const deleteProducto = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    await supabase.from('precios_perfil').delete().eq('producto_id', id)
    await supabase.from('precios_calc').delete().eq('id', id)
    await load()
  }

  const prodsCat = productos.filter(p => p.calculadora === catActiva)
  const perfilObj = perfiles.find(p => p.id === perfilActivo)

  if (loading) return <div style={{ color: '#888', padding: 40 }}>Cargando precios...</div>

  return (
    <div style={{ maxWidth: 1100, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#fff', margin: '0 0 4px' }}>
            💰 Precios & Perfiles
          </h1>
          <p style={{ fontSize: 13, color: '#666', margin: 0 }}>Gestioná productos, medidas, criterios y precios por perfil de cliente.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setModalPerfil(true)} style={{ ...S.btn('transparent', '#888'), border: '1px solid #333' }}>+ Perfil</button>
          <button onClick={() => setModalProd(true)} style={S.btn()}>+ Producto</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #2e2e2e', paddingBottom: 0 }}>
        {(['productos', 'perfiles'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px',
            color: tab === t ? '#D62828' : '#666', fontWeight: tab === t ? 700 : 400,
            fontSize: 14, borderBottom: tab === t ? '2px solid #D62828' : '2px solid transparent',
            fontFamily: "'Barlow Condensed',sans-serif", textTransform: 'uppercase', letterSpacing: 1,
          }}>{t === 'productos' ? '📦 Productos' : '👥 Perfiles de precio'}</button>
        ))}
      </div>

      {/* ── TAB PRODUCTOS ── */}
      {tab === 'productos' && (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16 }}>

          {/* Sidebar categorías */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {Object.entries(CATS).map(([key, label]) => {
              const count = productos.filter(p => p.calculadora === key).length
              return (
                <button key={key} onClick={() => setCatActiva(key)} style={{
                  background: catActiva === key ? 'rgba(214,40,40,.15)' : 'transparent',
                  border: catActiva === key ? '1px solid rgba(214,40,40,.3)' : '1px solid transparent',
                  borderLeft: catActiva === key ? '3px solid #D62828' : '3px solid transparent',
                  borderRadius: 8, padding: '8px 12px', cursor: 'pointer', textAlign: 'left',
                  color: catActiva === key ? '#fff' : '#888', fontSize: 13,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span>{label}</span>
                  {count > 0 && <span style={{ fontSize: 10, color: '#555', background: '#222', borderRadius: 10, padding: '1px 6px' }}>{count}</span>}
                </button>
              )
            })}
          </div>

          {/* Tabla de productos */}
          <div style={S.panel}>
            <div style={S.sectionHead}>
              <span style={S.sectionTitle}>{CATS[catActiva]} — {prodsCat.length} productos</span>
              <button onClick={() => { setNewProd(p => ({ ...p, calculadora: catActiva })); setModalProd(true) }}
                style={{ ...S.btn('rgba(214,40,40,.2)', '#D62828'), border: '1px solid rgba(214,40,40,.3)' }}>+ Agregar</button>
            </div>

            {/* Selector de perfil para ver precios */}
            {perfiles.length > 0 && (
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>Ver precios para:</span>
                {perfiles.map(p => (
                  <button key={p.id} onClick={() => setPerfilActivo(p.id)} style={{
                    background: perfilActivo === p.id ? '#D62828' : 'transparent',
                    color: perfilActivo === p.id ? '#fff' : '#666',
                    border: `1px solid ${perfilActivo === p.id ? '#D62828' : '#333'}`,
                    borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  }}>{p.nombre}</button>
                ))}
              </div>
            )}

            <div style={{ overflowX: 'auto' as const }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2e2e2e' }}>
                    {['Producto', 'Criterio', 'Medida', 'Precio base', perfilObj ? `Precio ${perfilObj.nombre}` : 'Ajuste %', 'Final', ''].map(h => (
                      <th key={h} style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#555', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {prodsCat.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#555', fontSize: 13 }}>Sin productos en esta categoría</td></tr>
                  )}
                  {prodsCat.map(prod => {
                    const pp = getPrecioPerfil(prod.id, perfilActivo)
                    const precioFinal = calcPrecioFinal(prod, pp)
                    const changed = precioFinal !== prod.precio
                    return (
                      <tr key={prod.id} style={{ borderBottom: '1px solid #1e1e1e', opacity: prod.activo ? 1 : 0.4 }}>
                        <td style={{ padding: '8px 12px' }}>
                          <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{prod.clave}</div>
                          {prod.descripcion && <div style={{ fontSize: 11, color: '#555' }}>{prod.descripcion}</div>}
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={S.tag(prod.criterio === 'fijo' ? '#F7B731' : prod.criterio === 'm2' ? '#2563eb' : '#059669')}>
                            {CRITERIO_LABEL[prod.criterio] || prod.criterio}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', fontSize: 12, color: '#666' }}>
                          {prod.ancho && prod.alto ? `${prod.ancho}×${prod.alto}` : prod.unidad}
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <input
                            type="number" defaultValue={prod.precio}
                            onBlur={e => { if (e.target.value !== String(prod.precio)) savePrecioBase(prod, e.target.value) }}
                            style={{ ...S.inp, width: 90, textAlign: 'right' as const }}
                          />
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          {perfilActivo && (
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                              <input
                                type="number" placeholder="Override $"
                                defaultValue={pp?.precio_override ?? ''}
                                onBlur={e => savePrecioPerfil(prod.id, perfilActivo, 'precio_override', e.target.value)}
                                style={{ ...S.inp, width: 90, textAlign: 'right' as const }}
                                title="Precio fijo para este perfil (vacío = usar ajuste %)"
                              />
                              <span style={{ color: '#444', fontSize: 11 }}>o</span>
                              <input
                                type="number" placeholder="%"
                                defaultValue={pp?.pct_ajuste || ''}
                                onBlur={e => savePrecioPerfil(prod.id, perfilActivo, 'pct_ajuste', e.target.value)}
                                style={{ ...S.inp, width: 60, textAlign: 'right' as const }}
                                title="% de ajuste sobre precio base (ej: 15 = +15%)"
                              />
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: changed ? '#F7B731' : '#6ec8a0' }}>
                            {fmt(precioFinal)}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => toggleActivo(prod)} style={{ ...S.btn(prod.activo ? '#2e2e2e' : '#1a3a2a', prod.activo ? '#888' : '#6ec8a0'), padding: '4px 8px', fontSize: 11 }}>
                              {prod.activo ? 'Ocultar' : 'Activar'}
                            </button>
                            <button onClick={() => deleteProducto(prod.id)} style={{ ...S.btn('transparent', '#D62828'), border: '1px solid rgba(214,40,40,.3)', padding: '4px 8px', fontSize: 11 }}>
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB PERFILES ── */}
      {tab === 'perfiles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {perfiles.map(perfil => (
            <div key={perfil.id} style={S.panel}>
              <div style={S.sectionHead}>
                <div>
                  <span style={S.sectionTitle}>{perfil.nombre}</span>
                  {perfil.descripcion && <span style={{ fontSize: 12, color: '#666', marginLeft: 10 }}>{perfil.descripcion}</span>}
                </div>
                <span style={S.tag('#6ec8a0')}>{preciosPerfil.filter(pp => pp.perfil_id === perfil.id).length} overrides</span>
              </div>
              <div style={{ padding: '12px 18px' }}>
                <p style={{ fontSize: 12, color: '#555', margin: 0 }}>
                  Los precios con <span style={{ color: '#F7B731' }}>precio override</span> usan ese valor exacto.
                  Los que tienen <span style={{ color: '#059669' }}>% ajuste</span> se calculan sobre el precio base.
                  Los que no tienen ninguno usan el precio base directamente.
                </p>
              </div>
            </div>
          ))}
          {perfiles.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#555' }}>
              No hay perfiles creados. Hacé clic en "+ Perfil" para crear uno.
            </div>
          )}
        </div>
      )}

      {/* ── Modal nuevo producto ── */}
      {modalProd && (
        <div onClick={() => setModalProd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 14, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' as const }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #2e2e2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 16, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>Nuevo producto</span>
              <button onClick={() => setModalProd(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Categoría', field: 'calculadora', type: 'select', options: Object.entries(CATS).map(([v, l]) => ({ value: v, label: l })) },
                { label: 'Nombre / clave', field: 'clave', type: 'text', placeholder: 'ej: S20 1.60×1.80' },
                { label: 'Descripción (opcional)', field: 'descripcion', type: 'text', placeholder: 'ej: Ventana Serie 20' },
                { label: 'Criterio de cobro', field: 'criterio', type: 'select', options: CRITERIOS.map(c => ({ value: c, label: CRITERIO_LABEL[c] })) },
                { label: 'Precio base ($)', field: 'precio', type: 'number', placeholder: '0' },
                { label: 'Ancho (m) — para medidas fijas', field: 'ancho', type: 'number', placeholder: 'ej: 1.60' },
                { label: 'Alto (m) — para medidas fijas', field: 'alto', type: 'number', placeholder: 'ej: 1.80' },
                { label: 'Unidad', field: 'unidad', type: 'select', options: [{ value: 'u', label: 'Unidad (u)' }, { value: 'm²', label: 'Metro cuadrado (m²)' }, { value: 'ml', label: 'Metro lineal (ml)' }] },
              ].map(({ label, field, type, placeholder, options }: any) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#666', marginBottom: 5 }}>{label}</label>
                  {type === 'select'
                    ? <select value={(newProd as any)[field]} onChange={e => setNewProd(p => ({ ...p, [field]: e.target.value }))} style={{ ...S.inp }}>
                        {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    : <input type={type} placeholder={placeholder} value={(newProd as any)[field]} onChange={e => setNewProd(p => ({ ...p, [field]: e.target.value }))} style={S.inp} />
                  }
                </div>
              ))}

              {/* Info criterio */}
              <div style={{ background: '#111', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#555' }}>
                {newProd.criterio === 'fijo' && '💡 Precio fijo: el precio ingresado se cobra independientemente de la medida.'}
                {newProd.criterio === 'm2' && '💡 Por m²: precio × (ancho × alto). Mínimo 1.20m² para rejas y mosquiteros.'}
                {newProd.criterio === 'ml' && '💡 Por ML: precio × (ancho + alto). Usado para series de ventanas.'}
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button onClick={() => setModalProd(false)} style={{ ...S.btn('transparent', '#888'), border: '1px solid #333' }}>Cancelar</button>
                <button onClick={addProducto} disabled={saving === 'new'} style={S.btn()}>
                  {saving === 'new' ? 'Guardando...' : 'Agregar producto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal nuevo perfil ── */}
      {modalPerfil && (
        <div onClick={() => setModalPerfil(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 14, width: '100%', maxWidth: 400 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #2e2e2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 16, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>Nuevo perfil de precio</span>
              <button onClick={() => setModalPerfil(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#666', marginBottom: 5 }}>Nombre del perfil</label>
                <input type="text" placeholder="ej: Interior, Mayorista, Canelones..." value={newPerfil.nombre} onChange={e => setNewPerfil(p => ({ ...p, nombre: e.target.value }))} style={S.inp} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#666', marginBottom: 5 }}>Descripción (opcional)</label>
                <input type="text" placeholder="ej: Clientes fuera de Montevideo" value={newPerfil.descripcion} onChange={e => setNewPerfil(p => ({ ...p, descripcion: e.target.value }))} style={S.inp} />
              </div>
              <div style={{ background: '#111', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#555' }}>
                💡 Después de crear el perfil, podrás asignar precios específicos por producto en la tab Productos.
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setModalPerfil(false)} style={{ ...S.btn('transparent', '#888'), border: '1px solid #333' }}>Cancelar</button>
                <button onClick={addPerfil} style={S.btn()}>Crear perfil</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
