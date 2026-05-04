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
    // Cargar productos activos
    const { data: prods } = await supabase
      .from('precios_calc')
      .select('*')
      .eq('activo', true)
      .order('orden')

    if (!prods?.length) return null

    // Cargar ajustes de perfil si hay perfilId
    let ppMap: Record<string, { precio_override: number | null; pct_ajuste: number }> = {}
    if (perfilId) {
      const { data: pp } = await supabase
        .from('precios_perfil')
        .select('*')
        .eq('perfil_id', perfilId)
      pp?.forEach((p: any) => { ppMap[p.producto_id] = p })
    }

    // Cargar perfiles para el selector de vendedor
    const { data: perfiles } = await supabase
      .from('perfiles_precio')
      .select('*')
      .eq('activo', true)
      .order('orden')

    // Función para obtener precio efectivo
    const getPrice = (prod: any) => {
      const pp = ppMap[prod.id]
      if (!pp) return prod.precio
      if (pp.precio_override !== null && pp.precio_override !== undefined) return pp.precio_override
      return Math.round(prod.precio * (1 + (pp.pct_ajuste || 0) / 100))
    }

    // Construir tablas de medidas estándar
    const bycat = (cat: string) => prods.filter((p: any) => p.calculadora === cat)

    const toEst = (cat: string) =>
      bycat(cat)
        .filter((p: any) => p.ancho && p.alto)
        .map((p: any) => ({ a: p.ancho, h: p.alto, p: getPrice(p), n: p.descripcion || '' }))

    // Precios de reja, persiana, mosquitero
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

    // Agregar perfiles para selector de vendedor
    if (perfiles?.length) {
      payload.perfiles = perfiles.map((p: any) => ({
        nombre: p.nombre,
        telefono: vendedor?.telefono || '097 699 854',
        perfil_id: p.id,
      }))
    }

    return payload
  }

  // ── Enviar precios al iframe ──────────────────────────────────────────
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
    // Esperar un momento para que VP esté inicializado, luego enviar precios
    setTimeout(() => sendPrices(iframe), 500)
  }

  // Cuando cambia el vendedor, reenviar precios
  useEffect(() => {
    if (iframeRef.current && pricesLoaded) {
      sendPrices(iframeRef.current)
    }
  }, [vendedor])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f0f0f', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Top bar */}
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

        {/* Indicador de precios cargados */}
        {pricesLoaded && (
          <span style={{ fontSize: 10, color: '#6ec8a0', background: 'rgba(110,200,160,0.1)', border: '1px solid rgba(110,200,160,0.2)', borderRadius: 10, padding: '2px 8px' }}>
            ✓ Precios actualizados
          </span>
        )}

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

      {/* iframe */}
      <iframe
        ref={iframeRef}
        key={iframeSrc}
        src={iframeSrc}
        title={title}
        style={{ flex: 1, border: 'none', width: '100%', display: 'block' }}
        allow="clipboard-write"
        onLoad={(e) => onIframeLoad(e.target as HTMLIFrameElement)}
      />

      {loginModal && <VendedorLoginModal onClose={() => setLoginModal(false)} />}
    </div>
  )
}
