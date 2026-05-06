'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function HeroSlider() {
  const [slides, setSlides] = useState<string[]>([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    supabase.storage.from('hero-slides').list('', { sortBy: { column: 'name', order: 'asc' } })
      .then(({ data }) => {
        if (!data?.length) return
        const urls = data
          .filter(f => f.name.match(/\.(jpg|jpeg|png|webp)$/i))
          .map(f => supabase.storage.from('hero-slides').getPublicUrl(f.name).data.publicUrl)
        setSlides(urls)
      })
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [slides.length])

  if (!slides.length) return null

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 0,
      overflow: 'hidden', borderRadius: 0,
    }}>
      {slides.map((url, i) => (
        <div key={url} style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'opacity 1s ease',
          opacity: i === current ? 1 : 0,
        }} />
      ))}
      {/* Overlay oscuro para que el texto sea legible */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(250,250,248,0.92) 0%, rgba(245,240,235,0.85) 50%, rgba(245,240,235,0.6) 100%)',
      }} />
      {/* Dots de navegación */}
      {slides.length > 1 && (
        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 6, zIndex: 2,
        }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{
              width: i === current ? 20 : 6, height: 6,
              borderRadius: 3, border: 'none', cursor: 'pointer',
              background: i === current ? '#D62828' : 'rgba(214,40,40,0.3)',
              transition: 'all 0.3s ease', padding: 0,
            }} />
          ))}
        </div>
      )}
    </div>
  )
}
