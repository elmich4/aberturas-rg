'use client'
import PublicLayout from '@/components/public/PublicLayout'
import Link from 'next/link'
import { POSTS } from '@/lib/posts'
import { useParams } from 'next/navigation'

export default function PostPage() {
  const params = useParams()
  const slug = params?.slug as string
  const post = POSTS.find(p => p.slug === slug)
  const otrosPosts = POSTS.filter(p => p.slug !== slug).slice(0, 3)

  if (!post) {
    return (
      <PublicLayout>
        <div style={{ padding: '120px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>404</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, marginBottom: 20 }}>Artículo no encontrado</h1>
          <Link href="/blog" style={{ color: '#D62828', textDecoration: 'none', fontWeight: 700 }}>← Volver al blog</Link>
        </div>
      </PublicLayout>
    )
  }

  // Simple markdown-like renderer
  function renderContent(md: string) {
    const lines = md.trim().split('\n')
    const elements: React.ReactNode[] = []
    let i = 0

    while (i < lines.length) {
      const line = lines[i].trim()
      if (!line) { i++; continue }

      if (line.startsWith('## ')) {
        elements.push(<h2 key={i} style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1a1a1a', margin: '40px 0 16px', lineHeight: 1.2 }}>{line.slice(3)}</h2>)
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={i} style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#1a1a1a', margin: '28px 0 12px' }}>{line.slice(4)}</h3>)
      } else if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(<p key={i} style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '16px 0 8px' }}>{line.slice(2, -2)}</p>)
      } else if (line.startsWith('- ')) {
        const listItems: string[] = []
        while (i < lines.length && lines[i].trim().startsWith('- ')) {
          listItems.push(lines[i].trim().slice(2))
          i++
        }
        elements.push(
          <ul key={`ul-${i}`} style={{ paddingLeft: 24, margin: '8px 0 16px' }}>
            {listItems.map((item, j) => (
              <li key={j} style={{ fontSize: 15, color: '#555', lineHeight: 1.8, marginBottom: 4 }}>{item.replace(/\*\*(.*?)\*\*/g, '$1')}</li>
            ))}
          </ul>
        )
        continue
      } else if (line.startsWith('| ')) {
        // Table
        const rows: string[][] = []
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          if (!lines[i].includes('---')) {
            rows.push(lines[i].split('|').map(c => c.trim()).filter(Boolean))
          }
          i++
        }
        elements.push(
          <div key={`table-${i}`} style={{ overflowX: 'auto', margin: '16px 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#1a1a1a' }}>
                  {rows[0]?.map((cell, j) => <th key={j} style={{ padding: '10px 16px', color: '#fff', textAlign: 'left', fontWeight: 700 }}>{cell}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, ri) => (
                  <tr key={ri} style={{ borderBottom: '1px solid #ede8e2', background: ri % 2 === 0 ? '#FAFAF8' : '#fff' }}>
                    {row.map((cell, ci) => <td key={ci} style={{ padding: '10px 16px', color: '#555' }}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        continue
      } else if (line.match(/^\d+\./)) {
        const items: string[] = []
        while (i < lines.length && lines[i].trim().match(/^\d+\./)) {
          items.push(lines[i].trim().replace(/^\d+\.\s*/, ''))
          i++
        }
        elements.push(
          <ol key={`ol-${i}`} style={{ paddingLeft: 24, margin: '8px 0 16px' }}>
            {items.map((item, j) => <li key={j} style={{ fontSize: 15, color: '#555', lineHeight: 1.8, marginBottom: 6 }}>{item}</li>)}
          </ol>
        )
        continue
      } else {
        elements.push(<p key={i} style={{ fontSize: 16, color: '#444', lineHeight: 1.85, margin: '0 0 16px' }}>{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>)
      }
      i++
    }
    return elements
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section style={{ padding: '60px 24px 48px', background: 'linear-gradient(135deg,#FAFAF8,#f5f0eb)', borderBottom: '1px solid #ede8e2' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <Link href="/blog" style={{ fontSize: 13, color: '#888', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>← Novedades</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ background: 'rgba(214,40,40,0.08)', color: '#D62828', borderRadius: 4, padding: '3px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{post.categoria}</span>
            <span style={{ fontSize: 13, color: '#aaa' }}>{post.fecha}</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#1a1a1a', margin: '0 0 16px', lineHeight: 1.15 }}>{post.titulo}</h1>
          <p style={{ fontSize: 17, color: '#666', lineHeight: 1.8 }}>{post.extracto}</p>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '56px 24px 80px', background: '#fff' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          {renderContent(post.contenido)}

          {/* CTA inline */}
          <div style={{ background: 'linear-gradient(135deg,#1a1a1a,#2a1818)', borderRadius: 16, padding: 28, marginTop: 48, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 6 }}>¿Listo para presupuestar?</div>
              <div style={{ fontSize: 14, color: '#aaa' }}>Usá nuestra calculadora y obtené el precio en 2 minutos.</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href="/ventanas" style={{ background: '#D62828', color: '#fff', borderRadius: 8, padding: '10px 18px', textDecoration: 'none', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>Calcular →</Link>
              <a href="https://wa.me/59897699854" target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: '#fff', borderRadius: 8, padding: '10px 18px', textDecoration: 'none', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>💬 WA</a>
            </div>
          </div>
        </div>
      </section>

      {/* Other posts */}
      {otrosPosts.length > 0 && (
        <section style={{ padding: '0 24px 80px', background: '#fff' }}>
          <div style={{ maxWidth: 780, margin: '0 auto' }}>
            <div style={{ borderTop: '1px solid #ede8e2', paddingTop: 48 }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 28 }}>Seguí leyendo</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
                {otrosPosts.map(p => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} style={{ textDecoration: 'none', display: 'block', background: '#FAFAF8', borderRadius: 12, border: '1px solid #ede8e2', padding: 20, transition: 'border-color .15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = '#D62828'}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = '#ede8e2'}>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>{p.emoji}</div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 6, lineHeight: 1.3 }}>{p.titulo}</div>
                    <div style={{ fontSize: 12, color: '#D62828', fontWeight: 600 }}>Leer →</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </PublicLayout>
  )
}
