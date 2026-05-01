'use client'
import PublicLayout from '@/components/public/PublicLayout'
import Link from 'next/link'
import { POSTS } from '@/lib/posts'

export default function BlogPage() {
  return (
    <PublicLayout>

      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', background: 'linear-gradient(135deg,#FAFAF8,#f5f0eb)', borderBottom: '1px solid #ede8e2' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: '#D62828', marginBottom: 16 }}>Novedades & Guías</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(36px,5vw,56px)', fontWeight: 900, color: '#1a1a1a', margin: '0 0 20px', lineHeight: 1.1 }}>
            Todo sobre<br /><em style={{ color: '#D62828' }}>aberturas y construcción</em>
          </h1>
          <p style={{ fontSize: 17, color: '#666', lineHeight: 1.8 }}>
            Guías prácticas, comparativas y consejos de nuestros especialistas para que tomes la mejor decisión.
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section style={{ padding: '60px 24px 80px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Featured post */}
          <Link href={`/blog/${POSTS[0].slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 48 }}>
            <div style={{
              background: 'linear-gradient(135deg,#1a1a1a,#2a1818)',
              borderRadius: 20, overflow: 'hidden', padding: '48px',
              display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'center',
              transition: 'transform .2s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.01)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'}
            >
              <div>
                <div style={{ display: 'inline-block', background: '#D62828', color: '#fff', borderRadius: 4, padding: '3px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>{POSTS[0].categoria}</div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(24px,3vw,36px)', fontWeight: 700, color: '#fff', margin: '0 0 16px', lineHeight: 1.2 }}>{POSTS[0].titulo}</h2>
                <p style={{ fontSize: 15, color: '#aaa', lineHeight: 1.7, marginBottom: 20 }}>{POSTS[0].extracto}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 13, color: '#666' }}>{POSTS[0].fecha}</span>
                  <span style={{ color: '#F7B731', fontWeight: 700, fontSize: 14 }}>Leer artículo →</span>
                </div>
              </div>
              <div style={{ fontSize: 80, opacity: 0.6 }}>{POSTS[0].emoji}</div>
            </div>
          </Link>

          {/* Rest of posts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 28 }}>
            {POSTS.slice(1).map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  background: '#FAFAF8', borderRadius: 16, border: '1px solid #ede8e2',
                  overflow: 'hidden', height: '100%',
                  transition: 'all .2s',
                }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 12px 32px rgba(0,0,0,.08)'; el.style.borderColor = '#D62828' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; el.style.borderColor = '#ede8e2' }}
                >
                  {/* Post header */}
                  <div style={{ background: 'linear-gradient(135deg,#f5f0eb,#ede8e2)', padding: '28px 24px', textAlign: 'center', fontSize: 48, borderBottom: '1px solid #ede8e2' }}>
                    {post.emoji}
                  </div>
                  <div style={{ padding: 24 }}>
                    <div style={{ display: 'inline-block', background: 'rgba(214,40,40,0.08)', color: '#D62828', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>{post.categoria}</div>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: '0 0 10px', lineHeight: 1.3 }}>{post.titulo}</h3>
                    <p style={{ fontSize: 13, color: '#777', lineHeight: 1.7, marginBottom: 16 }}>{post.extracto}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#aaa' }}>{post.fecha}</span>
                      <span style={{ color: '#D62828', fontWeight: 700, fontSize: 13 }}>Leer →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </PublicLayout>
  )
}
