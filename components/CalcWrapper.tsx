'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useVendedor } from '@/lib/vendedor-auth'
import VendedorLoginModal from '@/components/VendedorLoginModal'
import { supabase } from '@/lib/supabase'

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
  const [pricesLoaded, setPricesLoaded] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const iframeSrc = vendedor
    ? `${src}?session=vendedor&nombre=${encodeURIComponent(vendedor.nombre)}&tel=${encodeURIComponent(vendedor.telefono || '097699854')}`
    : src

  const CALCS = [...CALCS_PUBLICAS, ...(vendedor ? CALCS_VENDEDOR : [])]

  // ── Cargar precios desde Supabase ──────────────────────────────────────
  const buildPricePayload = async (perfilId?: string) => {
    const { data: prods } = await supabase
      .from('precios_calc')
      .select('*')
      .eq('activo', true)
      .order('orden')

    if (!prods?.length) return null

    let ppMap: Record<string, { precio_override: number | null; pct_ajuste: number }> = {}
    if (perfilId) {
      const { data: pp } = await supabase
        .from('precios_perfil')
        .select('*')
        .eq('perfil_id', perfilId)
      pp?.forEach((p: any) => { ppMap[p.producto_id] = p })
    }

    const { data: perfiles } = await supabase
      .from('perfiles_precio')
      .select('*')
      .eq('activo', true)
      .order('orden')

    const getPrice = (prod: any) => {
      const pp = ppMap[prod.id]
      if (!pp) return prod.precio
      if (pp.precio_override !== null && pp.precio_override !== undefined) return pp.precio_override
      return Math.round(prod.precio * (1 + (pp.pct_ajuste || 0) / 100))
    }

    const bycat = (cat: string) => prods.filter((p: any) => p.calculadora === cat)
    const toEst = (cat: string) =>
      bycat(cat)
        .filter((p: any) => p.ancho && p.alto)
        .map((p: any) => ({ a: p.ancho, h: p.alto, p: getPrice(p), n: p.descripcion || '' }))

    const reja12 = bycat('reja').find((p: any) => p.clave?.includes('12'))
    const reja16 = bycat('reja').find((p: any) => p.clave?.includes('16'))
    const persS = bycat('persiana')
    const mosqS = bycat('mosquitero')

    const payload: any = {
      est_ventana_s20:   toEst('ventana_s20'),
      est_ventana_s25:   toEst('ventana_s25'),
      est_monoblock_s20: toEst('monoblock_s20'),
      est_monoblock_s25: toEst('monoblock_s25'),
      reja_12mm: reja12 ? getPrice(reja12) : 2500,
      reja_16mm: reja16 ? getPrice(reja16) : 3500,
      m_s20: mosqS.find((p: any) => p.clave?.includes('S20')) ? getPrice(mosqS.find((p: any) => p.clave?.includes('S20'))) : 1100,
      m_s25: mosqS.find((p: any) => p.clave?.includes('S25')) ? getPrice(mosqS.find((p: any) => p.clave?.includes('S25'))) : 1650,
      p_pvc: persS.find((p: any) => p.clave?.toLowerCase().includes('pvc')) ? getPrice(persS.find((p: any) => p.clave?.toLowerCase().includes('pvc'))) : 4200,
      p_alb: persS.find((p: any) => p.clave?.toLowerCase().includes('std')) ? getPrice(persS.find((p: any) => p.clave?.toLowerCase().includes('std'))) : 4900,
      p_alm: persS.find((p: any) => p.clave?.toLowerCase().includes('laminado')) ? getPrice(persS.find((p: any) => p.clave?.toLowerCase().includes('laminado'))) : 6400,
      p_imm: persS.find((p: any) => p.clave?.toLowerCase().includes('madera')) ? getPrice(persS.find((p: any) => p.clave?.toLowerCase().includes('madera'))) : 8900,
    }

    if (perfiles?.length) {
      payload.perfiles = perfiles.map((p: any) => ({
        nombre: p.nombre,
        telefono: p.telefono || '097 699 854',
        perfil_id: p.id,
      }))
    }

    return payload
  }

  const sendPrices = async (iframe: HTMLIFrameElement, perfilId?: string) => {
    const payload = await buildPricePayload(perfilId)
    if (!payload) return
    try {
      iframe.contentWindow?.postMessage({ type: 'rg:setPrices', ...payload }, '*')
      setPricesLoaded(true)
    } catch {}
  }

  const injectCSS = (iframe: HTMLIFrameElement) => {
    try {
      const doc = iframe.contentDocument
      if (!doc) return
      const style = doc.createElement('style')
      style.textContent = [
        '#user-bar { display: none !important; }',
        '.app-header { display: none !important; }',
        '#cliente-wa-bar { display: none !important; }',
      ].join('\n')
      doc.head.appendChild(style)
    } catch {}
  }

  const onIframeLoad = (iframe: HTMLIFrameElement) => {
    injectCSS(iframe)
    setTimeout(() => sendPrices(iframe), 500)
  }

  useEffect(() => {
    if (iframeRef.current && pricesLoaded) {
      sendPrices(iframeRef.current)
    }
  }, [vendedor])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f0f0f', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Top bar (primera fila) ── */}
      <header className="calc-header">
        <Link href="/" className="calc-logo">
          <div className="calc-logo-circle">RG</div>
        </Link>

        <div className="calc-divider" />
        <span className="calc-title">{icon} {title}</span>

        {pricesLoaded && (
          <span className="calc-prices-badge">✓ Precios</span>
        )}

        <div style={{ flex: 1 }} />

        <div className="calc-user-area">
          {!vendedor ? (
            <button onClick={() => setLoginModal(true)} className="calc-btn-vendedor">🔑 Vendedor</button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="calc-vendedor-name">✓ {vendedor.nombre.split(' ')[0]}</span>
              <button onClick={logout} className="calc-btn-logout">Salir</button>
            </div>
          )}
        </div>
      </header>

      {/* ── Tabs de navegación (segunda fila) ── */}
      <nav className="calc-tabs">
        {CALCS.map((c) => {
          const active = pathname === c.href
          return (
            <Link key={c.href} href={c.href} className={`calc-tab ${active ? 'active' : ''}`}>
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* ── iframe ── */}
      <iframe
        ref={iframeRef}
        key={iframeSrc}
        src={iframeSrc}
        title={title}
        className="calc-iframe"
        allow="clipboard-write"
        onLoad={(e) => onIframeLoad(e.target as HTMLIFrameElement)}
      />

      {loginModal && <VendedorLoginModal onClose={() => setLoginModal(false)} />}

      <style jsx>{`
        .calc-header {
          height: 48px;
          flex-shrink: 0;
          background: #111;
          border-bottom: 1px solid #1e1e1e;
          display: flex;
          align-items: center;
          padding: 0 10px;
          gap: 8px;
          z-index: 50;
        }
        .calc-logo {
          text-decoration: none;
          flex-shrink: 0;
        }
        .calc-logo-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #D62828, #A01E1E);
          border: 2px solid #F7B731;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 10px;
          color: #fff;
          letter-spacing: 2px;
        }
        .calc-divider {
          width: 1px;
          height: 20px;
          background: #2a2a2a;
          flex-shrink: 0;
        }
        .calc-title {
          font-size: 13px;
          font-weight: 700;
          color: #F7B731;
          white-space: nowrap;
        }
        .calc-prices-badge {
          font-size: 10px;
          color: #6ec8a0;
          background: rgba(110, 200, 160, 0.1);
          border: 1px solid rgba(110, 200, 160, 0.2);
          border-radius: 10px;
          padding: 2px 8px;
          white-space: nowrap;
        }

        .calc-user-area {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .calc-btn-vendedor {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(247, 183, 49, 0.12);
          border: 1px solid rgba(247, 183, 49, 0.3);
          color: #F7B731;
          border-radius: 6px;
          padding: 5px 10px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          font-family: inherit;
        }
        .calc-vendedor-name {
          font-size: 11px;
          color: #6ec8a0;
          font-weight: 600;
        }
        .calc-btn-logout {
          background: rgba(214, 40, 40, 0.15);
          border: 1px solid rgba(214, 40, 40, 0.3);
          color: #ff8888;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 11px;
          cursor: pointer;
          font-family: inherit;
        }

        /* ── Tabs en fila separada ── */
        .calc-tabs {
          display: flex;
          gap: 2px;
          padding: 6px 10px;
          background: #0f0f0f;
          border-bottom: 1px solid #1e1e1e;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          flex-shrink: 0;
          scrollbar-width: none;
        }
        .calc-tabs::-webkit-scrollbar {
          display: none;
        }
        .calc-tab {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 14px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          color: #777;
          background: transparent;
          white-space: nowrap;
          flex-shrink: 0;
          transition: all 0.15s;
        }
        .calc-tab:hover {
          color: #aaa;
          background: rgba(255, 255, 255, 0.05);
        }
        .calc-tab.active {
          color: #111;
          background: #F7B731;
          font-weight: 700;
        }

        /* ── iframe ── */
        .calc-iframe {
          flex: 1;
          border: none;
          width: 100%;
          display: block;
        }

        /* ── Mobile adjustments ── */
        @media (max-width: 640px) {
          .calc-header {
            height: 44px;
            padding: 0 8px;
            gap: 6px;
          }
          .calc-title {
            font-size: 12px;
          }
          .calc-prices-badge {
            display: none;
          }
          .calc-tabs {
            padding: 4px 8px;
            gap: 4px;
          }
          .calc-tab {
            padding: 6px 12px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  )
}
