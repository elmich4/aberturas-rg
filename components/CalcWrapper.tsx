'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useVendedor } from '@/lib/vendedor-auth'
import VendedorLoginModal from '@/components/VendedorLoginModal'

type Props = { src: string; title: string; icon: string }

const CALCS_PUBLICAS = [
  { href: '/ventanas',   icon: '🪟', label: 'Ventanas'   },
  { href: '/cielorraso', icon: '🏠', label: 'Cielorraso' },
  { href: '/yeso',       icon: '🏗️', label: 'Yeso'       },
]
const CALCS_VENDEDOR = [
  { href: '/presupuesto', icon: '💰', label: 'Presupuesto' },
  { href: '/mapa',        icon: '📍', label: 'Mapa fletes' },
]

export default function CalcWrapper({ src, title, icon }: Props) {
  const pathname = usePathname()
  const { vendedor, logout } = useVendedor()
  const [loginModal, setLoginModal] = useState(false)

  const iframeSrc = vendedor
    ? `${src}?session=vendedor&nombre=${encodeURIComponent(vendedor.nombre)}&tel=${encodeURIComponent(vendedor.telefono || '097699854')}`
    : src

  const injectCSS = (iframe: HTMLIFrameElement) => {
    try {
      const doc = iframe.contentDocument
      if (!doc) return
      const style = doc.createElement('style')

      if (!vendedor) {
        // Modo cliente: ocultar todos los precios y totales
        style.textContent = `
          #user-bar { display: none !important; }
          .app-header { display: none !important; }

          /* Ocultar precios en resumen */
          .resumen-card-total { display: none !important; }
          .rct-val { display: none !important; }
          .simp-val { visibility: hidden !important; }
          .simp-fila .simp-val { display: none !important; }

          /* Ocultar totales y valores en cards */
          .rct-adj-wrap { display: none !important; }
          input[type=number].precio-inp { display: none !important; }

          /* Ocultar columnas de precio en tablas de ítems adicionales */
          .xtra-row input[type=number]:last-of-type { display: none !important; }

          /* Ocultar botones de exportar imagen/PDF (solo vendedor) */
          button[onclick*="copiarImagen"],
          button[onclick*="exportarPDF"],
          button[onclick*="guardar"],
          button[onclick*="historial"],
          .btn-copiar-img, .btn-exportar-pdf, .btn-guardar, .btn-historial,
          [class*="copiar-imagen"], [class*="exportar-pdf"] { display: none !important; }

          /* Reemplazar valores de precio con texto */
          .vista-interna-toggle { display: none !important; }

          /* Ocultar el botón WA interno — usamos el nuestro */
          button[onclick*="copiarWA"], button[onclick*="whatsapp"],
          .btn-wa, .btn-wp, [class*="whatsapp"], [class*="-wa"] { display: none !important; }
        `
      } else {
        // Modo vendedor: solo ocultar header propio
        style.textContent = `
          #user-bar { display: none !important; }
          .app-header { display: none !important; }
        `
      }
      doc.head.appendChild(style)
    } catch {}
  }

  const CALCS = [...CALCS_PUBLICAS, ...(vendedor ? CALCS_VENDEDOR : [])]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f0f0f', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Top bar ── */}
      <header style={{
        height: 52, flexShrink: 0,
        background: '#111', borderBottom: '1px solid #1e1e1e',
        display: 'flex', alignItems: 'center',
        padding: '0 12px', gap: 10, zIndex: 50,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg,#D62828,#A01E1E)',
            border: '2px solid #F7B731',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Bebas Neue',sans-serif", fontSize: 11, color: '#fff', letterSpacing: 2,
          }}>RG</div>
        </Link>

        <div style={{ width: 1, height: 24, background: '#2a2a2a', flexShrink: 0 }} />

        <span style={{ fontSize: 13, fontWeight: 700, color: '#F7B731', whiteSpace: 'nowrap' }}>
          {icon} {title}
        </span>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 2, marginLeft: 8, flex: 1, overflowX: 'auto' }}>
          {CALCS.map(c => {
            const active = pathname === c.href
            return (
              <Link key={c.href} href={c.href} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 6, textDecoration: 'none',
                fontSize: 12, fontWeight: active ? 700 : 400,
                color: active ? '#111' : c.href === '/presupuesto' || c.href === '/mapa' ? '#aaa' : '#666',
                background: active ? '#F7B731' : 'transparent',
                whiteSpace: 'nowrap', flexShrink: 0, transition: 'all .15s',
                borderLeft: (c.href === '/presupuesto') ? '1px solid #2a2a2a' : 'none',
                marginLeft: (c.href === '/presupuesto') ? 4 : 0,
                paddingLeft: (c.href === '/presupuesto') ? 14 : undefined,
              }}>
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Derecha: login/logout + WA */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          {!vendedor ? (
            <button
              onClick={() => setLoginModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(247,183,49,0.12)',
                border: '1px solid rgba(247,183,49,0.3)',
                color: '#F7B731',
                borderRadius: 6, padding: '5px 12px',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all .15s',
              }}
            >
              🔑 Vendedor
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#6ec8a0', fontWeight: 600 }}>✓ {vendedor.nombre.split(' ')[0]}</span>
              <button
                onClick={logout}
                style={{
                  background: 'rgba(214,40,40,0.15)', border: '1px solid rgba(214,40,40,0.3)',
                  color: '#ff8888', borderRadius: 6, padding: '4px 10px',
                  fontSize: 11, cursor: 'pointer', transition: 'all .15s',
                }}
              >
                Salir
              </button>
            </div>
          )}

          <a href="https://wa.me/59897699854" target="_blank" rel="noopener noreferrer" style={{
            width: 30, height: 30, borderRadius: '50%', background: '#25D366',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
            </svg>
          </a>
        </div>
      </header>

      {/* ── iframe ── */}
      <iframe
        key={iframeSrc}
        src={iframeSrc}
        title={title}
        style={{ flex: 1, border: 'none', width: '100%', display: 'block' }}
        allow="clipboard-write"
        onLoad={(e) => injectCSS(e.target as HTMLIFrameElement)}
      />

      {loginModal && <VendedorLoginModal onClose={() => setLoginModal(false)} />}

      {/* Botón WA flotante — solo modo cliente */}
      {!vendedor && (
        <button
          onClick={() => {
            // Intentar leer los datos calculados del iframe
            let msg = '¡Hola! Quisiera consultar precio para los siguientes productos:\n\n'
            try {
              const iframeWin = (document.querySelector('iframe') as HTMLIFrameElement)?.contentWindow as any
              // Ventanas
              if (iframeWin?.v_ultimosGrupos?.length) {
                const grupos = iframeWin.v_ultimosGrupos
                const filas = iframeWin.v_buildResumenFilas?.(grupos) || []
                msg += '🪟 *Ventanas:*\n'
                let lastMedida = ''
                filas.forEach((f: any) => {
                  const medida = (f.itemPrefix || '') + f.medida
                  if (medida !== lastMedida) { msg += `📐 ${medida}\n`; lastMedida = medida }
                  const nombre = f.lineas?.[0]?.texto || ''
                  const extras = (f.lineas || []).slice(1).filter((l: any) => l.valor !== 'Incluido' && l.valor !== '—')
                  msg += `• ${nombre}${extras.length ? ' + ' + extras.map((l: any) => l.texto).join(' + ') : ''}\n`
                })
                if (grupos[0]?.cant > 1) msg += `Cantidad: ${grupos[0].cant} unidades\n`
              }
              // PVC
              if (iframeWin?._pvcLastCalc) {
                const c = iframeWin._pvcLastCalc
                msg += `🏠 *Cielorraso PVC:* ${c.largo || ''}m × ${c.ancho || ''}m\n`
              }
              // Yeso
              if (iframeWin?._yLastCalc) {
                const c = iframeWin._yLastCalc
                msg += `🏗️ *Yeso/Durlock:* ${c.largo || ''}m × ${c.ancho || ''}m\n`
              }
            } catch {}

            if (msg === '¡Hola! Quisiera consultar precio para los siguientes productos:\n\n') {
              msg += '(Completá los datos en la calculadora antes de enviar)\n'
            }
            msg += '\n¿Me pueden dar un presupuesto? Muchas gracias.'
            window.open(`https://wa.me/59897699854?text=${encodeURIComponent(msg)}`, '_blank')
          }}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 100,
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#25D366', color: '#fff', border: 'none',
            padding: '12px 20px', borderRadius: 50,
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(37,211,102,.5)',
            transition: 'transform .15s, box-shadow .15s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.transform = 'translateY(-2px)'
            el.style.boxShadow = '0 8px 28px rgba(37,211,102,.6)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.transform = 'translateY(0)'
            el.style.boxShadow = '0 4px 20px rgba(37,211,102,.5)'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
          </svg>
          Solicitar presupuesto
        </button>
      )}
    </div>
  )
}
