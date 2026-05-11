'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Anuncio = {
  id: string
  texto: string
  link: string | null
  activo: boolean
  orden: number
  created_at: string
}

const NUEVO: Omit<Anuncio, 'id' | 'created_at'> = {
  texto: '',
  link: null,
  activo: true,
  orden: 0,
}

export default function AdminAnunciosPage() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Modal
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState<Anuncio | null>(null)
  const [form, setForm] = useState(NUEVO)

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    setLoading(true)
    const { data, error } = await supabase
      .from('anuncios_barra')
      .select('*')
      .order('orden')
    if (error) {
      setError('Error al cargar: ' + error.message)
    } else {
      setAnuncios(data || [])
    }
    setLoading(false)
  }

  function abrirNuevo() {
    setEditando(null)
    setForm({ ...NUEVO, orden: anuncios.length })
    setModal(true)
    setError(null)
    setSuccess(null)
  }

  function abrirEditar(a: Anuncio) {
    setEditando(a)
    setForm({ texto: a.texto, link: a.link, activo: a.activo, orden: a.orden })
    setModal(true)
    setError(null)
    setSuccess(null)
  }

  async function guardar() {
    if (!form.texto.trim()) {
      setError('El texto es obligatorio')
      return
    }
    setSaving(true)
    setError(null)

    const payload = {
      texto: form.texto.trim(),
      link: form.link?.trim() || null,
      activo: form.activo,
      orden: form.orden,
    }

    let result
    if (editando) {
      result = await supabase
        .from('anuncios_barra')
        .update(payload)
        .eq('id', editando.id)
    } else {
      result = await supabase
        .from('anuncios_barra')
        .insert(payload)
    }

    setSaving(false)

    if (result.error) {
      setError('Error al guardar: ' + result.error.message)
      return
    }

    setModal(false)
    setSuccess(editando ? 'Anuncio actualizado' : 'Anuncio creado')
    setTimeout(() => setSuccess(null), 3000)
    cargar()
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este anuncio?')) return
    const { error } = await supabase.from('anuncios_barra').delete().eq('id', id)
    if (error) {
      setError('Error al eliminar: ' + error.message)
    } else {
      setSuccess('Anuncio eliminado')
      setTimeout(() => setSuccess(null), 3000)
      cargar()
    }
  }

  async function toggleActivo(a: Anuncio) {
    await supabase
      .from('anuncios_barra')
      .update({ activo: !a.activo })
      .eq('id', a.id)
    cargar()
  }

  async function mover(a: Anuncio, dir: -1 | 1) {
    const idx = anuncios.findIndex(x => x.id === a.id)
    const nuevoIdx = idx + dir
    if (nuevoIdx < 0 || nuevoIdx >= anuncios.length) return

    const otro = anuncios[nuevoIdx]
    await Promise.all([
      supabase.from('anuncios_barra').update({ orden: otro.orden }).eq('id', a.id),
      supabase.from('anuncios_barra').update({ orden: a.orden }).eq('id', otro.id),
    ])
    cargar()
  }

  if (loading) {
    return <div style={{ padding: 60, textAlign: 'center', color: '#888' }}>Cargando...</div>
  }

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
          ← Volver al admin
        </Link>
        <h1 style={{ margin: '8px 0 4px', fontFamily: "'Playfair Display', serif", fontSize: '2rem' }}>
          Barra de anuncios
        </h1>
        <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>
          Los anuncios activos se muestran arriba del menú, rotando automáticamente cada 4 segundos.
        </p>
      </div>

      {/* Mensajes */}
      {success && (
        <div style={{ background: '#f0fdf4', color: '#166534', padding: '12px 14px', borderRadius: 8, fontSize: '0.88rem', fontWeight: 600, border: '1px solid #bbf7d0', marginBottom: 16 }}>
          ✅ {success}
        </div>
      )}
      {error && !modal && (
        <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px 14px', borderRadius: 8, fontSize: '0.88rem', fontWeight: 600, border: '1px solid #fecaca', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Preview */}
      {anuncios.filter(a => a.activo).length > 0 && (
        <div style={{ background: '#111', borderRadius: 10, padding: '10px 20px', marginBottom: 24, textAlign: 'center' }}>
          <span style={{ color: '#666', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700 }}>Preview</span>
          <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 4 }}>
            {anuncios.filter(a => a.activo)[0]?.texto}
          </div>
        </div>
      )}

      {/* Botón nuevo */}
      <button
        onClick={abrirNuevo}
        style={{
          background: '#D62828', color: '#fff', border: 'none', padding: '12px 24px',
          borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', marginBottom: 20,
        }}
      >
        + Nuevo anuncio
      </button>

      {/* Lista */}
      {anuncios.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#999', background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📢</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>No hay anuncios todavía</div>
          <div style={{ fontSize: '0.85rem' }}>Creá el primero para que aparezca en la barra superior del sitio.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {anuncios.map((a, idx) => (
            <div
              key={a.id}
              style={{
                background: '#fff',
                border: '1px solid #f0f0f0',
                borderRadius: 12,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                opacity: a.activo ? 1 : 0.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              {/* Orden */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button
                  onClick={() => mover(a, -1)}
                  disabled={idx === 0}
                  style={{ background: 'none', border: '1px solid #eee', borderRadius: 4, cursor: idx === 0 ? 'not-allowed' : 'pointer', padding: '2px 6px', fontSize: 12, opacity: idx === 0 ? 0.3 : 1 }}
                >↑</button>
                <button
                  onClick={() => mover(a, 1)}
                  disabled={idx === anuncios.length - 1}
                  style={{ background: 'none', border: '1px solid #eee', borderRadius: 4, cursor: idx === anuncios.length - 1 ? 'not-allowed' : 'pointer', padding: '2px 6px', fontSize: 12, opacity: idx === anuncios.length - 1 ? 0.3 : 1 }}
                >↓</button>
              </div>

              {/* Contenido */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.texto}
                </div>
                {a.link && (
                  <div style={{ fontSize: '0.78rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    🔗 {a.link}
                  </div>
                )}
              </div>

              {/* Estado */}
              <button
                onClick={() => toggleActivo(a)}
                style={{
                  background: a.activo ? '#f0fdf4' : '#fef2f2',
                  color: a.activo ? '#166534' : '#b91c1c',
                  border: `1px solid ${a.activo ? '#bbf7d0' : '#fecaca'}`,
                  borderRadius: 20,
                  padding: '4px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {a.activo ? 'Activo' : 'Inactivo'}
              </button>

              {/* Acciones */}
              <button
                onClick={() => abrirEditar(a)}
                style={{ background: 'none', border: '1px solid #eee', borderRadius: 6, padding: '6px 12px', fontSize: '0.82rem', cursor: 'pointer', color: '#555', fontWeight: 600 }}
              >
                Editar
              </button>
              <button
                onClick={() => eliminar(a.id)}
                style={{ background: 'none', border: '1px solid #fecaca', borderRadius: 6, padding: '6px 12px', fontSize: '0.82rem', cursor: 'pointer', color: '#b91c1c', fontWeight: 600 }}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 500, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
          >
            <h2 style={{ margin: '0 0 20px', fontFamily: "'Playfair Display', serif", fontSize: '1.4rem' }}>
              {editando ? 'Editar anuncio' : 'Nuevo anuncio'}
            </h2>

            {error && (
              <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px 12px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, border: '1px solid #fecaca', marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#444', marginBottom: 6 }}>
                Texto del anuncio *
              </label>
              <input
                type="text"
                value={form.texto}
                onChange={e => setForm(f => ({ ...f, texto: e.target.value }))}
                placeholder="Ej: ENVÍO GRATIS A TODO EL PAÍS EN COMPRAS MAYORES A $5.000"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: '0.92rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
              <small style={{ color: '#999', fontSize: '0.78rem', marginTop: 4, display: 'block' }}>
                Se muestra en mayúsculas automáticamente en la barra.
              </small>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#444', marginBottom: 6 }}>
                Link (opcional)
              </label>
              <input
                type="text"
                value={form.link || ''}
                onChange={e => setForm(f => ({ ...f, link: e.target.value || null }))}
                placeholder="Ej: /tienda o https://wa.me/59897699854"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: '0.92rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
              <small style={{ color: '#999', fontSize: '0.78rem', marginTop: 4, display: 'block' }}>
                Si ponés un link, el anuncio se vuelve clickeable con una flecha →
              </small>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.92rem', fontWeight: 600, color: '#333', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
                  style={{ width: 'auto' }}
                />
                Anuncio activo (visible en el sitio)
              </label>
            </div>

            {/* Preview mini */}
            {form.texto.trim() && (
              <div style={{ background: '#111', borderRadius: 8, padding: '10px 16px', marginBottom: 24, textAlign: 'center' }}>
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  {form.texto}
                  {form.link && <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>→</span>}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setModal(false)}
                style={{ flex: 1, background: '#fff', color: '#666', border: '1px solid #ddd', padding: 12, borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={saving}
                style={{ flex: 1.5, background: '#D62828', color: '#fff', border: 'none', padding: 12, borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear anuncio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
