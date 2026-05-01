'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

type Field = { seccion: string; clave: string; valor: string; label: string; tipo?: 'text' | 'textarea' }

const FIELDS: Field[] = [
  { seccion: 'hero', clave: 'badge',          label: 'Badge (etiqueta pequeña)',  tipo: 'text'     },
  { seccion: 'hero', clave: 'titulo_linea1',  label: 'Título línea 1',            tipo: 'text'     },
  { seccion: 'hero', clave: 'titulo_linea2',  label: 'Título línea 2 (en rojo)',  tipo: 'text'     },
  { seccion: 'hero', clave: 'subtitulo',      label: 'Subtítulo / descripción',   tipo: 'textarea' },
  { seccion: 'stats', clave: 'stat1_num',     label: 'Stat 1 — número',           tipo: 'text'     },
  { seccion: 'stats', clave: 'stat1_label',   label: 'Stat 1 — etiqueta',         tipo: 'text'     },
  { seccion: 'stats', clave: 'stat2_num',     label: 'Stat 2 — número',           tipo: 'text'     },
  { seccion: 'stats', clave: 'stat2_label',   label: 'Stat 2 — etiqueta',         tipo: 'text'     },
  { seccion: 'stats', clave: 'stat3_num',     label: 'Stat 3 — número',           tipo: 'text'     },
  { seccion: 'stats', clave: 'stat3_label',   label: 'Stat 3 — etiqueta',         tipo: 'text'     },
  { seccion: 'stats', clave: 'stat4_num',     label: 'Stat 4 — número',           tipo: 'text'     },
  { seccion: 'stats', clave: 'stat4_label',   label: 'Stat 4 — etiqueta',         tipo: 'text'     },
  { seccion: 'nosotros', clave: 'titulo',     label: 'Nosotros — título',         tipo: 'text'     },
  { seccion: 'nosotros', clave: 'subtitulo',  label: 'Nosotros — subtítulo',      tipo: 'textarea' },
  { seccion: 'nosotros', clave: 'historia_p1',label: 'Historia — párrafo 1',      tipo: 'textarea' },
  { seccion: 'nosotros', clave: 'historia_p2',label: 'Historia — párrafo 2',      tipo: 'textarea' },
]

const SECCIONES = ['hero', 'stats', 'nosotros']
const SECCION_LABELS: Record<string, string> = { hero: '🏠 Hero (portada)', stats: '📊 Estadísticas', nosotros: '👥 Página Nosotros' }

const INPUT_STYLE = { width: '100%', background: '#111', border: '1px solid #2e2e2e', borderRadius: 7, color: '#f0f0f0', fontFamily: 'inherit', fontSize: 14, padding: '9px 12px', outline: 'none', boxSizing: 'border-box' as const, transition: 'border-color .15s', resize: 'vertical' as const }

export default function AdminLanding() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('contenido').select('*')
      if (data) {
        const map: Record<string, string> = {}
        data.forEach((r: any) => { map[`${r.seccion}__${r.clave}`] = r.valor })
        // Merge with defaults from FIELDS
        FIELDS.forEach(f => { if (!map[`${f.seccion}__${f.clave}`]) map[`${f.seccion}__${f.clave}`] = f.valor || '' })
        setValues(map)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function saveField(seccion: string, clave: string) {
    const key = `${seccion}__${clave}`
    setSaving(key)
    await supabase.from('contenido').upsert({ seccion, clave, valor: values[key] || '', updated_at: new Date().toISOString() }, { onConflict: 'seccion,clave' })
    setSaving(null); setSaved(key)
    setTimeout(() => setSaved(null), 2000)
  }

  async function saveAll() {
    setSaving('all')
    const updates = FIELDS.map(f => ({ seccion: f.seccion, clave: f.clave, valor: values[`${f.seccion}__${f.clave}`] || '', updated_at: new Date().toISOString() }))
    await supabase.from('contenido').upsert(updates, { onConflict: 'seccion,clave' })
    setSaving(null); setSaved('all')
    setTimeout(() => setSaved(null), 2500)
  }

  if (loading) return <div style={{ color: '#888', padding: 40 }}>Cargando contenido...</div>

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#fff', margin: '0 0 4px' }}>🏠 Editar Landing</h1>
          <p style={{ fontSize: 13, color: '#666', margin: 0 }}>Los cambios se aplican al sitio público al guardar.</p>
        </div>
        <button onClick={saveAll} disabled={saving === 'all'} style={{ background: saving === 'all' ? '#333' : saved === 'all' ? '#1a3a2a' : '#D62828', color: saving === 'all' ? '#666' : saved === 'all' ? '#6ec8a0' : '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
          {saved === 'all' ? '✓ Todo guardado' : saving === 'all' ? 'Guardando...' : '💾 Guardar todo'}
        </button>
      </div>

      {/* Sections */}
      {SECCIONES.map(seccion => (
        <div key={seccion} style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 14, marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg,#1e1e1e,#252525)', padding: '14px 20px', borderBottom: '2px solid #D62828' }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1, color: '#fff' }}>{SECCION_LABELS[seccion]}</div>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {FIELDS.filter(f => f.seccion === seccion).map(f => {
              const key = `${f.seccion}__${f.clave}`
              const isSaving = saving === key
              const isSaved = saved === key
              return (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 6 }}>{f.label}</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    {f.tipo === 'textarea'
                      ? <textarea rows={3} value={values[key] || ''} onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                          style={{ ...INPUT_STYLE, minHeight: 80 }}
                          onFocus={e => e.target.style.borderColor = '#F7B731'}
                          onBlur={e => e.target.style.borderColor = '#2e2e2e'} />
                      : <input type="text" value={values[key] || ''} onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                          style={INPUT_STYLE}
                          onFocus={e => e.target.style.borderColor = '#F7B731'}
                          onBlur={e => e.target.style.borderColor = '#2e2e2e'}
                          onKeyDown={e => { if (e.key === 'Enter') saveField(f.seccion, f.clave) }} />
                    }
                    <button onClick={() => saveField(f.seccion, f.clave)} disabled={!!isSaving}
                      style={{ flexShrink: 0, background: isSaved ? '#1a3a2a' : 'transparent', color: isSaved ? '#6ec8a0' : '#888', border: `1px solid ${isSaved ? '#2a5a3a' : '#333'}`, borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>
                      {isSaved ? '✓' : isSaving ? '...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
