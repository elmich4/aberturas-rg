'use client'
import { useVendedor } from '@/lib/vendedor-auth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

const MENU_BASE = [
  { href: '/admin',          icon: '📊', label: 'Dashboard'  },
  { href: '/admin/landing',  icon: '🏠', label: 'Landing'    },
  { href: '/admin/blog',     icon: '📝', label: 'Blog'       },
  { href: '/admin/trabajos', icon: '🖼️', label: 'Trabajos'   },
  { href: '/admin/precios',  icon: '💰', label: 'Precios'    },
  { href: '/admin/tienda',   icon: '🛍️', label: 'Tienda'     },
]
const MENU_ADMIN = [
  { href: '/admin/usuarios',  icon: '👥', label: 'Usuarios'  },
  { href: '/admin/actividad', icon: '📋', label: 'Actividad' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { vendedor, loading, logout, isAdmin } = useVendedor()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !vendedor) router.push('/login')
  }, [loading, vendedor])

  if (loading || !vendedor) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'sans-serif' }}>
        Verificando acceso...
      </div>
    )
  }

  const MENU = [...MENU_BASE, ...(isAdmin ? MENU_ADMIN : [])]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0f0f0f', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width: 220, flexShrink: 0, background: '#111', borderRight: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #1e1e1e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#D62828,#A01E1E)', border: '2px solid #F7B731', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, color: '#fff', letterSpacing: 2, flexShrink: 0 }}>RG</div>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, color: '#fff' }}>Panel Admin</div>
              <div style={{ fontSize: 10, color: '#D62828', fontWeight: 600 }}>Aberturas RG</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {MENU.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', background: active ? 'rgba(214,40,40,0.15)' : 'transparent', color: active ? '#fff' : '#888', borderLeft: active ? '3px solid #D62828' : '3px solid transparent', fontSize: 14, fontWeight: active ? 600 : 400, transition: 'all .15s' }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}

          {/* Separador para sección admin */}
          {isAdmin && (
            <div style={{ borderTop: '1px solid #1e1e1e', marginTop: 4, paddingTop: 4 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#D62828', padding: '6px 12px' }}>Admin</div>
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* Links externos */}
          <div style={{ borderTop: '1px solid #1e1e1e', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Link href="/" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', textDecoration: 'none', color: '#555', fontSize: 12 }}>
              🌐 Ver sitio →
            </Link>
            <Link href="/ventanas" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', textDecoration: 'none', color: '#555', fontSize: 12 }}>
              🧮 Calculadoras →
            </Link>
          </div>
        </nav>

        {/* User */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #1e1e1e' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>👤 {vendedor.nombre}</div>
          <div style={{ fontSize: 10, color: '#D62828', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            {isAdmin ? '⭐ Admin' : 'Vendedor'}
          </div>
          <button onClick={() => { logout(); router.push('/login') }}
            style={{ width: '100%', background: 'transparent', border: '1px solid #2e2e2e', borderRadius: 6, color: '#666', fontSize: 12, padding: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
        {children}
      </main>
    </div>
  )
}
