'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditarPost() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('blog_posts').select('*').eq('id', id).single()
      setPost(data); setLoading(false)
    }
    load()
  }, [id])

  async function save() {
    setSaving(true)
    await supabase.from('blog_posts').update({ ...post, updated_at: new Date().toISOString() }).eq('id', id)
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500)
  }

  const INPUT = { background: '#111', border: '1px solid #2e2e2e', borderRadius: 7, color: '#f0f0f0', fontFamily: 'inherit', fontSize: 14, padding: '9px 12px', outline: 'none', width: '100%', boxSizing: 'border-box' as const, transition: 'border-color .15s' }

  if (loading) return <div style={{ color: '#888', padding: 40 }}>Cargando post...</div>
  if (!post) return <div style={{ color: '#e07070', padding: 40 }}>Post no encontrado.</div>

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/admin/blog" style={{ color: '#888', textDecoration: 'none', fontSize: 13 }}>← Blog</Link>
          <span style={{ color: '#333' }}>/</span>
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{post.titulo}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"
            style={{ background: 'transparent', color: '#888', border: '1px solid #333', borderRadius: 7, padding: '9px 16px', textDecoration: 'none', fontSize: 13 }}>
            👁️ Preview
          </a>
          <button onClick={save} disabled={saving} style={{ background: saved ? '#1a3a2a' : '#D62828', color: saved ? '#6ec8a0' : '#fff', border: 'none', borderRadius: 7, padding: '9px 20px', cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
            {saved ? '✓ Guardado' : saving ? 'Guardando...' : '💾 Guardar'}
          </button>
        </div>
      </div>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 5 }}>Título *</label>
            <input value={post.titulo} onChange={e => setPost((p: any) => ({ ...p, titulo: e.target.value }))} style={INPUT}
              onFocus={e => e.target.style.borderColor = '#F7B731'} onBlur={e => e.target.style.borderColor = '#2e2e2e'} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 5 }}>Categoría</label>
            <select value={post.categoria} onChange={e => setPost((p: any) => ({ ...p, categoria: e.target.value }))} style={{ ...INPUT, width: 140 }}>
              {['Ventanas','Cielorraso','Yeso','Rejas','Guías','Novedades'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 5 }}>Emoji</label>
            <input value={post.emoji} onChange={e => setPost((p: any) => ({ ...p, emoji: e.target.value }))} style={{ ...INPUT, width: 70, textAlign: 'center', fontSize: 20 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 5 }}>Estado</label>
            <select value={post.publicado ? 'publicado' : 'borrador'} onChange={e => setPost((p: any) => ({ ...p, publicado: e.target.value === 'publicado' }))} style={{ ...INPUT, width: 130, color: post.publicado ? '#6ec8a0' : '#F7B731' }}>
              <option value="borrador">○ Borrador</option>
              <option value="publicado">✓ Publicado</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 5 }}>Extracto (resumen para la lista)</label>
          <textarea rows={2} value={post.extracto} onChange={e => setPost((p: any) => ({ ...p, extracto: e.target.value }))}
            style={{ ...INPUT, resize: 'vertical' as const }}
            onFocus={e => e.target.style.borderColor = '#F7B731'} onBlur={e => e.target.style.borderColor = '#2e2e2e'} />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#888' }}>Contenido (Markdown)</label>
            <span style={{ fontSize: 11, color: '#555' }}>Soporta ## Títulos, **negrita**, - listas, tablas</span>
          </div>
          <textarea rows={24} value={post.contenido} onChange={e => setPost((p: any) => ({ ...p, contenido: e.target.value }))}
            style={{ ...INPUT, resize: 'vertical' as const, fontFamily: "'Courier New', monospace", lineHeight: 1.6, minHeight: 400 }}
            onFocus={e => e.target.style.borderColor = '#F7B731'} onBlur={e => e.target.style.borderColor = '#2e2e2e'} />
        </div>

        <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
          <button onClick={save} disabled={saving} style={{ background: saved ? '#1a3a2a' : '#D62828', color: saved ? '#6ec8a0' : '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 15, textTransform: 'uppercase', letterSpacing: 1 }}>
            {saved ? '✓ Guardado' : saving ? 'Guardando...' : '💾 Guardar cambios'}
          </button>
          <Link href="/admin/blog" style={{ background: 'transparent', color: '#888', border: '1px solid #333', borderRadius: 8, padding: '12px 20px', textDecoration: 'none', fontSize: 14 }}>
            ← Volver al blog
          </Link>
        </div>
      </div>
    </div>
  )
}
