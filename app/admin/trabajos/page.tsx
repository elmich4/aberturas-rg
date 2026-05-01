'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Trabajo = { id: string; titulo: string; descripcion: string; categoria: string; imagen_url: string; activo: boolean; orden: number }

const CATS = ['Ventanas', 'Cielorraso PVC', 'Yeso', 'Rejas', 'Persianas', 'Monoblock']
const INPUT = { background: '#111', border: '1px solid #2e2e2e', borderRadius: 6, color: '#f0f0f0', fontFamily: 'inherit', fontSize: 13, padding: '7px 10px', outline: 'none', width: '100%', boxSizing: 'border-box' as const }

export default function AdminTrabajos() {
  const [items, setItems] = useState<Trabajo[]>([])
  const [loading, setLoading] = useState(true)
  const [nuevo, setNuevo] = useState({ titulo: '', descripcion: '', categoria: 'Ventanas', imagen_url: '' })
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)

  async function load() {
    const { data } = await supabase.from('trabajos').select('*').order('orden')
    setItems(data || []); setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function add() {
    if (!nuevo.titulo.trim()) return
    setAdding(true)
    const orden = items.length
    await supabase.from('trabajos').insert({ ...nuevo, orden, activo: true })
    await load(); setAdding(false); setShowForm(false)
    setNuevo({ titulo: '', descripcion: '', categoria: 'Ventanas', imagen_url: '' })
  }

  async function updateItem(id: string, patch: Partial<Trabajo>) {
    setSavingId(id)
    setItems(prev => prev.map(x => x.id === id ? { ...x, ...patch } : x))
    await supabase.from('trabajos').update({ ...patch }).eq('id', id)
    setSavingId(null)
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar este trabajo?')) return
    await supabase.from('trabajos').delete().eq('id', id)
    setItems(p => p.filter(x => x.id !== id))
  }

  return (
    <div style={{ maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#fff', margin: '0 0 4px' }}>🖼️ Galería de trabajos</h1>
          <p style={{ fontSize: 13, color: '#666', margin: 0 }}>{items.length} proyectos · <span style={{ color: '#6ec8a0' }}>{items.filter(i => i.activo).length} visibles</span></p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: '#D62828', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
          + Agregar trabajo
        </button>
      </div>

      {/* New item form */}
      {showForm && (
        <div style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1, color: '#fff', marginBottom: 16 }}>Nuevo trabajo</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 5 }}>Título *</label>
              <input value={nuevo.titulo} onChange={e => setNuevo(n => ({ ...n, titulo: e.target.value }))} placeholder="Ej: Ventanas S25 — Pocitos" style={INPUT} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 5 }}>Categoría</label>
              <select value={nuevo.categoria} onChange={e => setNuevo(n => ({ ...n, categoria: e.target.value }))} style={INPUT}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 5 }}>URL de la imagen</label>
            <input value={nuevo.imagen_url} onChange={e => setNuevo(n => ({ ...n, imagen_url: e.target.value }))}
              placeholder="https://... (subi la foto a Google Photos, ImgBB, etc. y pegá el enlace directo)"
              style={INPUT} />
            <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>Consejo: usá <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" style={{ color: '#D62828' }}>imgbb.com</a> para subir gratis y obtener el enlace directo.</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 5 }}>Descripción</label>
            <input value={nuevo.descripcion} onChange={e => setNuevo(n => ({ ...n, descripcion: e.target.value }))} placeholder="Descripción breve del trabajo" style={INPUT} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={add} disabled={adding || !nuevo.titulo.trim()}
              style={{ background: adding ? '#333' : '#D62828', color: '#fff', border: 'none', borderRadius: 7, padding: '9px 18px', cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
              {adding ? 'Agregando...' : 'Agregar'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ background: 'transparent', color: '#888', border: '1px solid #333', borderRadius: 7, padding: '9px 16px', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? <div style={{ color: '#888' }}>Cargando...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {items.map(item => (
            <div key={item.id} style={{ background: '#1a1a1a', border: `1px solid ${item.activo ? '#2e2e2e' : '#1e1e1e'}`, borderRadius: 12, overflow: 'hidden', opacity: item.activo ? 1 : 0.5 }}>
              {/* Image preview */}
              <div style={{ aspectRatio: '4/3' as any, background: '#111', overflow: 'hidden', position: 'relative' }}>
                {item.imagen_url
                  ? <img src={item.imagen_url} alt={item.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 48 }}>🖼️</div>
                }
                {/* Toggle visible */}
                <button onClick={() => updateItem(item.id, { activo: !item.activo })}
                  style={{ position: 'absolute', top: 8, right: 8, background: item.activo ? 'rgba(110,200,160,0.9)' : 'rgba(80,80,80,0.9)', color: '#fff', border: 'none', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                  {item.activo ? '✓ Visible' : '○ Oculto'}
                </button>
              </div>
              <div style={{ padding: 14 }}>
                <input value={item.titulo} onChange={e => setItems(p => p.map(x => x.id === item.id ? { ...x, titulo: e.target.value } : x))}
                  style={{ ...INPUT, fontWeight: 600, fontSize: 14, marginBottom: 6 }} />
                <input value={item.imagen_url} onChange={e => setItems(p => p.map(x => x.id === item.id ? { ...x, imagen_url: e.target.value } : x))}
                  placeholder="URL de imagen..." style={{ ...INPUT, fontSize: 11, color: '#888', marginBottom: 8 }} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <select value={item.categoria} onChange={e => setItems(p => p.map(x => x.id === item.id ? { ...x, categoria: e.target.value } : x))}
                    style={{ ...INPUT, flex: 1, fontSize: 12 }}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <button onClick={() => updateItem(item.id, { titulo: item.titulo, imagen_url: item.imagen_url, categoria: item.categoria, descripcion: item.descripcion })}
                    disabled={savingId === item.id}
                    style={{ background: '#1e3a2a', color: '#6ec8a0', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                    {savingId === item.id ? '...' : '💾'}
                  </button>
                  <button onClick={() => remove(item.id)}
                    style={{ background: 'transparent', color: '#555', border: '1px solid #2a2a2a', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
