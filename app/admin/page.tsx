'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ posts: 0, trabajos: 0, presupuestos: 0 })

  useEffect(() => {
    async function load() {
      const [p, t, pr] = await Promise.all([
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('trabajos').select('id', { count: 'exact', head: true }),
        supabase.from('presupuestos').select('id', { count: 'exact', head: true }),
      ])
      setStats({ posts: p.count || 0, trabajos: t.count || 0, presupuestos: pr.count || 0 })
    }
    load()
  }, [])

  const CARDS = [
    { icon: '🏠', title: 'Landing', desc: 'Editá textos del hero, stats, servicios y proceso', href: '/admin/landing', color: '#D62828' },
    { icon: '📝', title: 'Blog', desc: `${stats.posts} posts publicados`, href: '/admin/blog', color: '#2196F3' },
    { icon: '🖼️', title: 'Trabajos', desc: `${stats.trabajos} proyectos en galería`, href: '/admin/trabajos', color: '#9C27B0' },
    { icon: '💰', title: 'Precios', desc: 'Actualizá precios de todas las calculadoras', href: '/admin/precios', color: '#F7B731' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#fff', margin: '0 0 6px' }}>Panel de administración</h1>
        <p style={{ fontSize: 14, color: '#666', margin: 0 }}>Gestioná el contenido del sitio web de Aberturas RG.</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Posts publicados', val: stats.posts, icon: '📝' },
          { label: 'Trabajos en galería', val: stats.trabajos, icon: '🖼️' },
          { label: 'Presupuestos guardados', val: stats.presupuestos, icon: '📋' },
        ].map(s => (
          <div key={s.label} style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: '#D62828', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick access cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
        {CARDS.map(c => (
          <Link key={c.href} href={c.href} style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{ background: '#1a1a1a', border: `1px solid #2e2e2e`, borderRadius: 14, padding: 24, transition: 'all .15s', cursor: 'pointer' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = c.color; el.style.background = '#1e1e1e' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#2e2e2e'; el.style.background = '#1a1a1a' }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{c.icon}</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 18, textTransform: 'uppercase', letterSpacing: 1, color: '#fff', marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: '#888' }}>{c.desc}</div>
              <div style={{ marginTop: 14, fontSize: 13, color: c.color, fontWeight: 600 }}>Editar →</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
