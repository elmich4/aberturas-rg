'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

type Slide = { name: string; url: string; size: number; created_at: string }

export default function AdminSlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.storage.from('hero-slides').list('', {
      sortBy: { column: 'name', order: 'asc' }
    })
    if (data) {
      const files = data.filter(f => f.name.match(/\.(jpg|jpeg|png|webp)$/i))
      const slides = files.map(f => ({
        name: f.name,
        url: supabase.storage.from('hero-slides').getPublicUrl(f.name).data.publicUrl,
        size: f.metadata?.size || 0,
        created_at: f.created_at || '',
      }))
      setSlides(slides)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const upload = async (files: FileList) => {
    setUploading(true)
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      // Nombre con timestamp para mantener orden
      const ext = file.name.split('.').pop()
      const name = `slide_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      await supabase.storage.from('hero-slides').upload(name, file, {
        cacheControl: '3600', upsert: false
      })
    }
    await load()
    setUploading(false)
  }

  const deleteSlide = async (name: string) => {
    if (!confirm(`¿Eliminar "${name}" del slider?`)) return
    setDeleting(name)
    await supabase.storage.from('hero-slides').remove([name])
    await load()
    setDeleting(null)
  }

  const formatSize = (bytes: number) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div style={{ maxWidth: 900, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#fff', margin: '0 0 4px' }}>
            🖼️ Slider del Hero
          </h1>
          <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
            Las imágenes se muestran como fondo del hero en el inicio. Se rotan automáticamente cada 5 segundos.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={e => e.target.files && upload(e.target.files)} style={{ display: 'none' }} />
          <button onClick={() => inputRef.current?.click()} disabled={uploading}
            style={{ background: uploading ? '#333' : '#D62828', color: uploading ? '#666' : '#fff', border: 'none', borderRadius: 7, padding: '8px 18px', cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
            {uploading ? '⏳ Subiendo...' : '+ Subir imágenes'}
          </button>
        </div>
      </div>

      {/* Zona de drag & drop */}
      <div
        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#D62828' }}
        onDragLeave={e => { e.currentTarget.style.borderColor = '#2e2e2e' }}
        onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#2e2e2e'; e.dataTransfer.files && upload(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed #2e2e2e', borderRadius: 12, padding: '24px',
          textAlign: 'center', cursor: 'pointer', marginBottom: 24,
          transition: 'border-color .2s', color: '#555', fontSize: 13,
        }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
        <div>Arrastrá imágenes acá o hacé clic para seleccionar</div>
        <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>JPG, PNG, WEBP · Recomendado: 1920×1080px</div>
      </div>

      {/* Grid de slides */}
      {loading
        ? <div style={{ color: '#555', padding: 32, textAlign: 'center' }}>Cargando imágenes...</div>
        : slides.length === 0
          ? <div style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 12, padding: 48, textAlign: 'center', color: '#555' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🖼️</div>
              <div style={{ fontSize: 14 }}>No hay imágenes en el slider todavía.</div>
              <div style={{ fontSize: 12, marginTop: 6, color: '#444' }}>Subí la primera imagen para que aparezca como fondo del hero.</div>
            </div>
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {slides.map((slide, idx) => (
                <div key={slide.name} style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 12, overflow: 'hidden' }}>
                  {/* Preview */}
                  <div style={{ position: 'relative', height: 160, background: '#111' }}>
                    <img src={slide.url} alt={slide.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: '2px 8px', fontSize: 11, color: '#fff' }}>
                      #{idx + 1}
                    </div>
                  </div>
                  {/* Info */}
                  <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slide.name}</div>
                      <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{formatSize(slide.size)}</div>
                    </div>
                    <button onClick={() => deleteSlide(slide.name)} disabled={deleting === slide.name}
                      style={{ background: 'rgba(214,40,40,0.1)', border: '1px solid rgba(214,40,40,0.3)', color: '#D62828', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12, flexShrink: 0 }}>
                      {deleting === slide.name ? '...' : '🗑 Eliminar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
      }

      {slides.length > 0 && (
        <div style={{ marginTop: 20, background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '12px 16px', fontSize: 12, color: '#555' }}>
          💡 Las imágenes se muestran en orden alfabético por nombre. Para controlar el orden, los nombres comienzan con <code style={{ color: '#F7B731' }}>slide_[timestamp]</code> automáticamente.
        </div>
      )}
    </div>
  )
}
