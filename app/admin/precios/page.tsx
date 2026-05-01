'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Precio = { id: string; calculadora: string; clave: string; descripcion: string; precio: number; unidad: string; activo: boolean; orden: number }

const CALC_LABELS: Record<string, string> = {
  ventanas: '🪟 Ventanas',
  pvc: '🏠 Cielorraso PVC',
  yeso: '🧱 Yeso / Durlock',
}

export default function AdminPrecios() {
  const [precios, setPrecios] = useState<Precio[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [tab, setTab] = useState('ventanas')

  async function load() {
    const { data } = await supabase.from('precios_calc').select('*').order('calculadora').order('orden')
    setPrecios(data || []); setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function savePrice(id: string, precio: number, descripcion: string) {
    setSaving(id)
    await supabase.from('precios_calc').update({ precio, descripcion, updated_at: new Date().toISOString() }).eq('id', id)
    setSaving(null); setSaved(id); setTimeout(() => setSaved(null), 1500)
  }

  async function saveAll(calculadora: string) {
    setSaving('all_' + calculadora)
    const items = precios.filter(p => p.calculadora === calculadora)
    await Promise.all(items.map(p => supabase.from('precios_calc').update({ precio: p.precio, descripcion: p.descripcion, updated_at: new Date().toISOString() }).eq('id', p.id)))
    setSaving(null); setSaved('all_' + calculadora); setTimeout(() => setSaved(null), 2000)
  }

  function updateLocal(id: string, field: 'precio' | 'descripcion', value: any) {
    setPrecios(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const filtered = precios.filter(p => p.calculadora === tab)

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#fff', margin: '0 0 4px' }}>💰 Precios de calculadoras</h1>
        <p style={{ fontSize: 13, color: '#666', margin: 0 }}>Los cambios se aplican inmediatamente a todas las calculadoras.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {Object.entries(CALC_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: tab === key ? '#D62828' : '#1a1a1a',
            color: tab === key ? '#fff' : '#888',
            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13,
            textTransform: 'uppercase', letterSpacing: 1,
            border: tab === key ? 'none' : '1px solid #2e2e2e',
          }}>{label}</button>
        ))}
      </div>

      {loading ? <div style={{ color: '#888' }}>Cargando precios...</div> : (
        <>
          {/* Save all button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button onClick={() => saveAll(tab)} disabled={saving === 'all_' + tab}
              style={{ background: saved === 'all_' + tab ? '#1a3a2a' : '#D62828', color: saved === 'all_' + tab ? '#6ec8a0' : '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
              {saved === 'all_' + tab ? '✓ Todo guardado' : saving === 'all_' + tab ? 'Guardando...' : '💾 Guardar todos'}
            </button>
          </div>

          {/* Price table */}
          <div style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 14, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#111', borderBottom: '1px solid #2e2e2e' }}>
                  {['Descripción', 'Unidad', 'Precio ($)', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: h === 'Precio ($)' || h === '' ? 'right' : 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#666' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #1e1e1e' }}>
                    <td style={{ padding: '8px 16px' }}>
                      <input value={p.descripcion} onChange={e => updateLocal(p.id, 'descripcion', e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: '#e0e0e0', fontFamily: 'inherit', fontSize: 13, outline: 'none', width: '100%', padding: '2px 0' }}
                        onFocus={e => { e.target.style.borderBottom = '1px solid #F7B731' }}
                        onBlur={e => { e.target.style.borderBottom = 'none' }} />
                    </td>
                    <td style={{ padding: '8px 16px', color: '#666', fontSize: 12, textAlign: 'center', whiteSpace: 'nowrap' }}>{p.unidad}</td>
                    <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                      <input type="number" value={p.precio} onChange={e => updateLocal(p.id, 'precio', parseFloat(e.target.value) || 0)}
                        style={{ background: '#0f0f0f', border: `1px solid ${saved === p.id ? '#2a5a3a' : '#2a2a2a'}`, borderRadius: 5, color: saved === p.id ? '#6ec8a0' : '#F7B731', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 700, padding: '4px 10px', outline: 'none', textAlign: 'right', width: 110 }}
                        onKeyDown={e => { if (e.key === 'Enter') savePrice(p.id, p.precio, p.descripcion) }} />
                    </td>
                    <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                      <button onClick={() => savePrice(p.id, p.precio, p.descripcion)} disabled={saving === p.id}
                        style={{ background: saved === p.id ? '#1a3a2a' : 'transparent', color: saved === p.id ? '#6ec8a0' : '#666', border: `1px solid ${saved === p.id ? '#2a5a3a' : '#2a2a2a'}`, borderRadius: 5, padding: '4px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {saved === p.id ? '✓' : saving === p.id ? '...' : 'Guardar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: '#555' }}>
            💡 Tip: presioná Enter en el campo de precio para guardar rápido. Los precios se aplican a las calculadoras en tiempo real.
          </div>
        </>
      )}
    </div>
  )
}
