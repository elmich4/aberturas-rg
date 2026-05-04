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

  const CALCS = [...CALCS_PUBLICAS, ...(vendedor ? CALCS_VENDEDOR : [])]

  const injectCSS = (iframe: HTMLIFrameElement) => {
    try {
      const doc = iframe.contentDocument
      if (!doc) return
      const style = doc.createElement('style')
      if (!vendedor) {
        style.textContent = [
          '#user-bar { display: none !important; }',
          '.app-header { display: none !important; }',
          '.resumen-card-total { display: none !important; }',
          '.rct-val { display: none !important; }',
          '.rct-adj-wrap { display: none !important; }',
          '.simp-val { display: none !important; }',
          '.vista-interna-toggle { display: none !important; }',
          '#v-desglose-wrap { display: none !important; }',
          '.btn-wa { display: none !important; }',
          '.btn-img { display: none !important; }',
          '.btn-pdf { display: none !important; }',
          '.color-precio { display: none !important; }',
          'input[type="number"] { pointer-events: none !important; color: transparent !important; background: transparent !important; border-color: transparent !important; box-shadow: none !important; }',
        ].join('\n')
      } else {
        style.textContent = [
          '#user-bar { display: none !important; }',
          '.app-header { display: none !important; }',
        ].join('\n')
      }
      doc.head.appendChild(style)
    } catch {}
  }

  const handleSolicitarPresupuesto = () => {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement

    const sendWA = (texto: string) => {
      let msg = '¡Hola! Quisiera consultar precio para lo siguiente:\n\n'
      if (texto && texto.trim()) {
        msg += '🪟 *Ventanas:*\n' + texto
      } else {
        msg += '(Por favor indicanos qué ventanas necesitás)\n'
      }
      msg += '\n¿Me pueden dar un presupuesto? Muchas gracias.'
      window.open('https://wa.me/59897699854?text=' + encodeURIComponent(msg), '_blank')
    }

    // Intento 1: acceso directo (mismo origen)
    try {
      const iframeWin = iframe?.contentWindow as any
      if (typeof iframeWin?.rgGetCalcData === 'function') {
        const txt = iframeWin.rgGetCalcData()
        sendWA(txt)
        return
      }
    } catch {}

    // Intento 2: postMessage con timeout
    try {
      const iframeWin = iframe?.contentWindow
      if (!iframeWin) { sendWA(''); return }
      let responded = false
      const handler = (e: MessageEvent) => {
        if (e.data?.type !== 'rg:calcData') return
        responded = true
        window.removeEventListener('message', handler)
        sendWA(e.data.texto || '')
      }
      window.addEventListener('message', handler)
      setTimeout(() => {
        if (!responded) {
          window.removeEventListener('message', handler)
          sendWA('')
        }
      }, 2000)
      iframeWin.postMessage('rg:getCalcData', '*')
    } catch {
      sendWA('')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f0f0f', fontFamily: "'DM Sans', sans-serif" }}>

      <header style={{
        height: 52, flexShrink: 0, background: '#111', borderBottom: '1px solid #1e1e1e',
        display: 'flex', alignItems: 'center', padding: '0 12px', gap: 10, zIndex: 50,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg,#D62828,#A01E1E)', border: '2px solid #F7B731',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Bebas Neue',sans-serif", fontSize: 11, color: '#fff', letterSpacing: 2,
          }}>RG</div>
        </Link>

        <div style={{ width: 1, height: 24, background: '#2a2a2a', flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#F7B731', whiteSpace: 'nowrap' }}>{icon} {title}</span>

        <nav style={{ display: 'flex', gap: 2, marginLeft: 8, flex: 1, overflowX: 'auto' }}>
          {CALCS.map((c) => {
            const active = pathname === c.href
            const isVendorSection = c.href === '/presupuesto'
            return (
              <Link key={c.href} href={c.href} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 6, textDecoration: 'none',
                fontSize: 12, fontWeight: active ? 700 : 400,
                color: active ? '#111' : '#666',
                background: active ? '#F7B731' : 'transparent',
                whiteSpace: 'nowrap', flexShrink: 0, transition: 'all .15s',
                marginLeft: isVendorSection ? 8 : 0,
                borderLeft: isVendorSection ? '1px solid #2a2a2a' : 'none',
              }}>
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </Link>
            )
          })}
        </nav>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          {!vendedor ? (
            <button onClick={() => setLoginModal(true)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(247,183,49,0.12)', border: '1px solid rgba(247,183,49,0.3)',
              color: '#F7B731', borderRadius: 6, padding: '5px 12px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            }}>🔑 Vendedor</button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#6ec8a0', fontWeight: 600 }}>✓ {vendedor.nombre.split(' ')[0]}</span>
              <button onClick={logout} style={{
                background: 'rgba(214,40,40,0.15)', border: '1px solid rgba(214,40,40,0.3)',
                color: '#ff8888', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer',
              }}>Salir</button>
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

      <iframe
        key={iframeSrc}
        src={iframeSrc}
        title={title}
        style={{ flex: 1, border: 'none', width: '100%', display: 'block' }}
        allow="clipboard-write"
        onLoad={(e) => injectCSS(e.target as HTMLIFrameElement)}
      />

      {loginModal && <VendedorLoginModal onClose={() => setLoginModal(false)} />}

      {!vendedor && (
        <button
          onClick={handleSolicitarPresupuesto}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 100,
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#25D366', color: '#fff', border: 'none',
            padding: '12px 20px', borderRadius: 50,
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(37,211,102,.5)',
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
