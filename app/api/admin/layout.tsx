'use client'
import { useAuth } from '@/lib/auth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const MENU_BASE = [
  { href: '/admin',              icon: '📊', label: 'Dashboard'    },
  { href: '/admin/landing',      icon: '🏠', label: 'Landing'      },
  { href: '/admin/blog',         icon: '📝', label: 'Blog'         },
  { href: '/admin/trabajos',     icon: '🖼️', label: 'Trabajos'     },
  { href: '/admin/slides',       icon: '🎞️', label: 'Hero Slider'  },
  { href: '/admin/precios',      icon: '💰', label: 'Precios'      },
  { href: '/admin/tienda',       icon: '🛍️', label: 'Tienda'       },
  { href: '/admin/presupuestos', icon: '📋', label: 'Presupuestos', badgeKey: 'presupuestosPendientes' },
  { href: '/admin/categorias',   icon: '🗂️', label: 'Categorías'   },
  { href: '/admin/anuncios',     icon: '📢', label: 'Anuncios'     },
]
const MENU_ADMIN = [
  { href: '/admin/usuarios',  icon: '👥', label: 'Usuarios'  },
  { href: '/admin/actividad', icon: '📋', label: 'Actividad' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Si estamos en /admin/login, renderizar solo el children sin sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return <AdminShell>{children}</AdminShell>
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const { vendedor, loading, logout, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [presupuestosPendientes, setPresupuestosPendientes] = useState<number>(0)

  useEffect(() => {
    if (!loading && !vendedor) router.push('/login')
  }, [loading, vendedor])

  // Contador de presupuestos pendientes para el badge del menú
  useEffect(() => {
    if (!vendedor) return
    let cancelled = false
    async function cargarConteo() {
      const { count } = await supabase
        .from('tienda_presupuestos')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente')
      if (!cancelled) setPresupuestosPendientes(count || 0)
    }
    cargarConteo()
    const interval = setInterval(cargarConteo, 30000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [vendedor, pathname])

  if (loading || !vendedor) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'sans-serif' }}>
        Verificando acceso...
      </div>
    )
  }

  const badges: Record<string, number> = {
    presupuestosPendientes,
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0f0f0f', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ width: 220, flexShrink: 0, background: '#111', borderRight: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #1e1e1e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="RG" style={{ width: 34, height: 34, objectFit: 'contain', flexShrink: 0 }} />
            <div>
              <div className="label" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, color: '#fff' }}>Panel Admin</div>
              <div className="label" style={{ fontSize: 10, color: '#D62828', fontWeight: 600 }}>Aberturas RG</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {MENU_BASE.map(item => {
            const active = pathname === item.href
            const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0
            return (
              <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', background: active ? 'rgba(214,40,40,0.15)' : 'transparent', color: active ? '#fff' : '#888', borderLeft: active ? '3px solid #D62828' : '3px solid transparent', fontSize: 14, fontWeight: active ? 600 : 400, transition: 'all .15s' }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span className="label" style={{ flex: 1 }}>{item.label}</span>
                {badgeCount > 0 && (
                  <span style={{
                    background: '#D62828',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: 50,
                    minWidth: 18,
                    textAlign: 'center',
                  }}>
                    {badgeCount}
                  </span>
                )}
              </Link>
            )
          })}

          {/* Sección admin — solo admins */}
          {isAdmin && (
            <>
              <div style={{ borderTop: '1px solid #1e1e1e', marginTop: 8, paddingTop: 8 }}>
                <div className="label" style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#D62828', padding: '4px 12px 6px' }}>⭐ Admin</div>
              </div>
              {MENU_ADMIN.map(item => {
                const active = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', background: active ? 'rgba(214,40,40,0.15)' : 'transparent', color: active ? '#fff' : '#888', borderLeft: active ? '3px solid #D62828' : '3px solid transparent', fontSize: 14, fontWeight: active ? 600 : 400, transition: 'all .15s' }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <span className="label">{item.label}</span>
                  </Link>
                )
              })}
            </>
          )}

          <div style={{ flex: 1 }} />

          {/* Links externos */}
          <div style={{ borderTop: '1px solid #1e1e1e', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Link href="/" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', textDecoration: 'none', color: '#555', fontSize: 12 }}>
              🌐 <span className="label">Ver sitio →</span>
            </Link>
            <Link href="/ventanas" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', textDecoration: 'none', color: '#555', fontSize: 12 }}>
              🧮 <span className="label">Calculadoras →</span>
            </Link>
          </div>
        </nav>

        {/* User */}
        <div className="user-section" style={{ padding: '12px 16px', borderTop: '1px solid #1e1e1e' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>👤 {vendedor.nombre}</div>
          <div style={{ fontSize: 10, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, color: isAdmin ? '#D62828' : '#F7B731', fontWeight: 700 }}>
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
