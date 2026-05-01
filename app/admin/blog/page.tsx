'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Post = { id: string; slug: string; titulo: string; categoria: string; emoji: string; publicado: boolean; created_at: string }

function slugify(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [nuevo, setNuevo] = useState({ titulo: '', categoria: 'Ventanas', emoji: '📝', extracto: '', contenido: '' })
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  async function load() {
    const { data } = await supabase.from('blog_posts').select('id,slug,titulo,categoria,emoji,publicado,created_at').order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function createPost() {
    if (!nuevo.titulo.trim()) return
    setCreating(true)
    const slug = slugify(nuevo.titulo)
    const { data } = await supabase.from('blog_posts').insert({ ...nuevo, slug, publicado: false }).select('id').single()
    setCreating(false)
    if (data) router.push(`/admin/blog/editar/${data.id}`)
  }

  async function togglePublicado(id: string, val: boolean) {
    await supabase.from('blog_posts').update({ publicado: val }).eq('id', id)
    setPosts(p => p.map(x => x.id === id ? { ...x, publicado: val } : x))
  }

  async function deletePost(id: string, titulo: string) {
    if (!confirm(`¿Borrar "${titulo}"? Esta acción no se puede deshacer.`)) return
    await supabase.from('blog_posts').delete().eq('id', id)
    setPosts(p => p.filter(x => x.id !== id))
  }

  const INPUT = { background: '#111', border: '1px solid #2e2e2e', borderRadius: 7, color: '#f0f0f0', fontFamily: 'inherit', fontSize: 14, padding: '9px 12px', outline: 'none', width: '100%', boxSizing: 'border-box' as const }

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#fff', margin: '0 0 4px' }}>📝 Blog</h1>
          <p style={{ fontSize: 13, color: '#666', margin: 0 }}>{posts.length} posts · {posts.filter(p => p.publicado).length} publicados</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: '#D62828', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
          + Nuevo post
        </button>
      </div>

      {/* New post form */}
      {showForm && (
        <div style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1, color: '#fff', marginBottom: 18 }}>Nuevo post</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 5 }}>Título *</label>
              <input value={nuevo.titulo} onChange={e => setNuevo(n => ({ ...n, titulo: e.target.value }))} placeholder="Ej: Cómo elegir la ventana correcta" style={INPUT} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 5 }}>Categoría</label>
              <select value={nuevo.categoria} onChange={e => setNuevo(n => ({ ...n, categoria: e.target.value }))}
                style={{ ...INPUT, width: 140 }}>
                {['Ventanas','Cielorraso','Yeso','Rejas','Guías','Novedades'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 5 }}>Emoji</label>
              <input value={nuevo.emoji} onChange={e => setNuevo(n => ({ ...n, emoji: e.target.value }))} style={{ ...INPUT, width: 70, textAlign: 'center', fontSize: 20 }} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 5 }}>Extracto (resumen)</label>
            <textarea rows={2} value={nuevo.extracto} onChange={e => setNuevo(n => ({ ...n, extracto: e.target.value }))} placeholder="Descripción corta que aparece en la lista del blog..." style={{ ...INPUT, resize: 'vertical' as const }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={createPost} disabled={creating || !nuevo.titulo.trim()}
              style={{ background: creating ? '#333' : '#D62828', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 20px', cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
              {creating ? 'Creando...' : 'Crear y editar →'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ background: 'transparent', color: '#888', border: '1px solid #333', borderRadius: 7, padding: '10px 16px', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Posts list */}
      {loading ? <div style={{ color: '#888' }}>Cargando...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {posts.length === 0 && <div style={{ color: '#555', padding: 24, textAlign: 'center', background: '#1a1a1a', borderRadius: 12 }}>No hay posts todavía. Creá el primero.</div>}
          {posts.map(post => (
            <div key={post.id} style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{post.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f0', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.titulo}</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ background: 'rgba(214,40,40,0.12)', color: '#D62828', borderRadius: 4, padding: '1px 7px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{post.categoria}</span>
                  <span style={{ fontSize: 11, color: '#555' }}>{new Date(post.created_at).toLocaleDateString('es-UY')}</span>
                  <span style={{ fontSize: 11, color: '#444' }}>/{post.slug}</span>
                </div>
              </div>
              {/* Publicado toggle */}
              <button onClick={() => togglePublicado(post.id, !post.publicado)}
                style={{ background: post.publicado ? 'rgba(110,200,160,0.15)' : '#111', color: post.publicado ? '#6ec8a0' : '#555', border: `1px solid ${post.publicado ? '#2a5a3a' : '#333'}`, borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                {post.publicado ? '✓ Publicado' : '○ Borrador'}
              </button>
              <Link href={`/admin/blog/editar/${post.id}`} style={{ background: 'transparent', color: '#888', border: '1px solid #333', borderRadius: 6, padding: '5px 12px', textDecoration: 'none', fontSize: 12, whiteSpace: 'nowrap' }}>
                ✏️ Editar
              </Link>
              <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" style={{ background: 'transparent', color: '#555', border: '1px solid #2a2a2a', borderRadius: 6, padding: '5px 10px', textDecoration: 'none', fontSize: 12 }}>
                👁️
              </a>
              <button onClick={() => deletePost(post.id, post.titulo)} style={{ background: 'transparent', color: '#555', border: '1px solid #2a2a2a', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12 }}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
