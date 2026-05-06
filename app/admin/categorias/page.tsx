'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Categoria = { id: string; clave: string; label: string; orden: number; activo: boolean }

const S = {
  inp: { background: '#111', border: '1px solid #2e2e2e', borderRadius: 7, color: '#f0f0f0', fontFamily: 'inherit', fontSize: 13, padding: '8px 12px', outline: 'none', width: '100%', boxSizing: 'border-box' as const },
  btn: (bg = '#D62828', color = '#fff') => ({ background: bg, color, border: 'none', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, textTransform: 'uppercase' as const, letterSpacing: 1, whiteSpace: 'nowrap' as const }),
}

export default function AdminCategoriasPage() {
  const [cats, setCats] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [newCat, setNewCat] = useState({ clave: '', label: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [prodCount, setProdCount] = useState<Record<string, number>>({})

  const load = async () => {
    setLoading(true)
    const [{ data: catsData }, { data: prods }] = await Promise.all([
      supabase.from('presupuesto_categorias').select('*').order('orden'),
      supabase.from('precios_calc').select('calculadora').eq('activo', true)
    ])
    setCats(catsData || [])
    // Count products per category
    const counts: Record<string, number> = {}
    prods?.forEach((p: any) => { counts[p.calculadora] = (counts[p.calculadora] || 0) + 1 })
    setProdCount(counts)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const saveLabel = async (cat: Categoria) => {
    setSaving(cat.id)
    await supabase.from('presupuesto_categorias').update({ label: editLabel }).eq('id', cat.id)
    setEditId(null)
    await load()
    setSaving(null)
  }

  const toggleActivo = async (cat: Categoria) => {
    await supabase.from('presupuesto_categorias').update({ activo: !cat.activo }).eq('id', cat.id)
    load()
  }

  const moveUp = async (cat: Categoria, idx: number) => {
    if (idx === 0) return
    const prev = cats[idx - 1]
    await Promise.all([
      supabase.from('presupuesto_categorias').update({ orden: prev.orden }).eq('id', cat.id),
      supabase.from('presupuesto_categorias').update({ orden: cat.orden }).eq('id', prev.id),
    ])
    load()
  }

  const moveDown = async (cat: Categoria, idx: number) => {
    if (idx === cats.length - 1) return
    const next = cats[idx + 1]
    await Promise.all([
      supabase.from('presupuesto_categorias').update({ orden: next.orden }).eq('id', cat.id),
      supabase.from('presupuesto_categorias').update({ orden: cat.orden }).eq('id', next.id),
    ])
    load()
  }

  const addCat = async () => {
    if (!newCat.clave.trim() || !newCat.label.trim()) return
    setSaving('new')
    const maxOrden = Math.max(...cats.map(c => c.orden), 0)
    await supabase.from('presupuesto_categorias').insert({
      clave: newCat.clave.trim().toLowerCase().replace(/\s+/g, '_'),
      label: newCat.label.trim(),
      orden: maxOrden + 1,
      activo: true
    })
    setNewCat({ clave: '', label: '' })
    await load()
    setSaving(null)
  }

  const deleteCat = async (cat: Categoria) => {
    const count = prodCount[cat.clave] || 0
    if (count > 0) {
      alert(`No se puede eliminar — tiene ${count} producto${count !== 1 ? 's' : ''} asociados. Desactivala o reasigná los productos primero.`)
      return
    }
    if (!confirm(`¿Eliminar la categoría "${cat.label}"?`)) return
    await supabase.from('presupuesto_categorias').delete().eq('id', cat.id)
    load()
  }

  if (loading) return <div style={{ color: '#888', padding: 40 }}>Cargando categorías...</div>

  return (
    <div style={{ maxWidth: 800, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#fff', margin: '0 0 4px' }}>
            🗂️ Categorías del Presupuesto
          </h1>
          <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
            Organizá cómo se agrupan los productos en la calculadora de presupuesto.
          </p>
        </div>
      </div>

      {/* Lista de categorías */}
      <div style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ background: 'linear-gradient(135deg,#1e1e1e,#252525)', padding: '12px 18px', borderBottom: '2px solid #D62828', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, color: '#fff' }}>
            {cats.length} categorías
          </span>
          <span style={{ fontSize: 11, color: '#555' }}>Arrastrar orden con ↑↓</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2e2e2e' }}>
              {['Orden', 'Clave', 'Etiqueta visible', 'Productos', 'Estado', ''].map(h => (
                <th key={h} style={{ padding: '8px 14px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#555', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cats.map((cat, idx) => (
              <tr key={cat.id} style={{ borderBottom: '1px solid #1a1a1a', opacity: cat.activo ? 1 : 0.45 }}>
                {/* Orden */}
                <td style={{ padding: '8px 14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <button onClick={() => moveUp(cat, idx)} disabled={idx === 0}
                      style={{ background: 'none', border: 'none', color: idx === 0 ? '#333' : '#666', cursor: idx === 0 ? 'default' : 'pointer', fontSize: 12, padding: '1px 4px' }}>▲</button>
                    <span style={{ fontSize: 11, color: '#444', textAlign: 'center' }}>{cat.orden}</span>
                    <button onClick={() => moveDown(cat, idx)} disabled={idx === cats.length - 1}
                      style={{ background: 'none', border: 'none', color: idx === cats.length - 1 ? '#333' : '#666', cursor: idx === cats.length - 1 ? 'default' : 'pointer', fontSize: 12, padding: '1px 4px' }}>▼</button>
                  </div>
                </td>
                {/* Clave */}
                <td style={{ padding: '8px 14px' }}>
                  <code style={{ fontSize: 11, color: '#F7B731', background: 'rgba(247,183,49,0.1)', padding: '2px 6px', borderRadius: 4 }}>{cat.clave}</code>
                </td>
                {/* Label editable */}
                <td style={{ padding: '8px 14px' }}>
                  {editId === cat.id
                    ? <div style={{ display: 'flex', gap: 6 }}>
                        <input value={editLabel} onChange={e => setEditLabel(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveLabel(cat); if (e.key === 'Escape') setEditId(null) }}
                          style={{ ...S.inp, width: 200 }} autoFocus />
                        <button onClick={() => saveLabel(cat)} disabled={saving === cat.id}
                          style={{ ...S.btn(), padding: '6px 10px', fontSize: 12 }}>✓</button>
                        <button onClick={() => setEditId(null)}
                          style={{ ...S.btn('transparent', '#888'), border: '1px solid #333', padding: '6px 10px', fontSize: 12 }}>✕</button>
                      </div>
                    : <span style={{ fontSize: 13, color: '#fff', cursor: 'pointer' }}
                        onClick={() => { setEditId(cat.id); setEditLabel(cat.label) }}
                        title="Clic para editar">
                        {cat.label} <span style={{ fontSize: 10, color: '#444' }}>✏️</span>
                      </span>
                  }
                </td>
                {/* Productos */}
                <td style={{ padding: '8px 14px' }}>
                  <span style={{ fontSize: 12, color: prodCount[cat.clave] ? '#6ec8a0' : '#555' }}>
                    {prodCount[cat.clave] || 0} prod.
                  </span>
                </td>
                {/* Estado */}
                <td style={{ padding: '8px 14px' }}>
                  <button onClick={() => toggleActivo(cat)} style={{
                    background: cat.activo ? 'rgba(110,200,160,0.1)' : 'rgba(128,128,128,0.1)',
                    border: `1px solid ${cat.activo ? 'rgba(110,200,160,0.3)' : 'rgba(128,128,128,0.3)'}`,
                    color: cat.activo ? '#6ec8a0' : '#666',
                    borderRadius: 20, padding: '2px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                  }}>
                    {cat.activo ? '● Visible' : '○ Oculta'}
                  </button>
                </td>
                {/* Acciones */}
                <td style={{ padding: '8px 14px' }}>
                  <button onClick={() => deleteCat(cat)}
                    style={{ ...S.btn('transparent', '#D62828'), border: '1px solid rgba(214,40,40,.3)', padding: '4px 8px', fontSize: 11 }}
                    title={prodCount[cat.clave] ? `Tiene ${prodCount[cat.clave]} productos` : 'Eliminar'}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Agregar nueva categoría */}
      <div style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg,#1e1e1e,#252525)', padding: '12px 18px', borderBottom: '2px solid #D62828' }}>
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, color: '#fff' }}>+ Nueva categoría</span>
        </div>
        <div style={{ padding: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#666', marginBottom: 6 }}>Clave interna</label>
            <input value={newCat.clave} onChange={e => setNewCat(p => ({ ...p, clave: e.target.value }))}
              placeholder="ej: puerta_blindada" style={S.inp} />
            <div style={{ fontSize: 10, color: '#444', marginTop: 3 }}>Sin espacios, solo letras y _</div>
          </div>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#666', marginBottom: 6 }}>Etiqueta visible</label>
            <input value={newCat.label} onChange={e => setNewCat(p => ({ ...p, label: e.target.value }))}
              placeholder="ej: 🔐 Puertas Blindadas"
              onKeyDown={e => e.key === 'Enter' && addCat()}
              style={S.inp} />
          </div>
          <button onClick={addCat} disabled={saving === 'new' || !newCat.clave || !newCat.label}
            style={{ ...S.btn(), opacity: (!newCat.clave || !newCat.label) ? 0.5 : 1 }}>
            {saving === 'new' ? 'Guardando...' : 'Agregar'}
          </button>
        </div>
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ background: '#111', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#555' }}>
            💡 La clave interna conecta la categoría con los productos en <code style={{ color: '#F7B731' }}>precios_calc.calculadora</code>. Una vez creada la categoría, los productos con esa clave aparecen automáticamente.
          </div>
        </div>
      </div>
    </div>
  )
}
