'use client'

import { useState, useCallback, useRef } from 'react'
import PublicLayout from '@/components/public/PublicLayout'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const WA_NUMBER = '59897699854'

type Item = { id: number; desc: string; cant: number; precio: number }
type Vendedor = { nombre: string; usuario: string; telefono?: string }

const CATALOG: Record<string, { n: string; p: number }[]> = {
  ventanas: [
    { n: 'Ventana Serie 20 (1.00×1.00)', p: 2990 },
    { n: 'Ventana Serie 20 (1.20×1.00)', p: 3290 },
    { n: 'Ventana Serie 20 (1.20×1.20)', p: 3790 },
    { n: 'Ventana Serie 20 (1.50×1.00)', p: 3890 },
    { n: 'Ventana Serie 20 (1.50×1.20)', p: 3990 },
    { n: 'Ventana Serie 20 (1.50×1.50)', p: 5350 },
    { n: 'Ventana Serie 20 (1.50×2.00)', p: 5990 },
    { n: 'Ventana Serie 25 (1.00×1.00)', p: 5490 },
    { n: 'Ventana Serie 25 (1.20×1.20)', p: 6590 },
    { n: 'Ventana Serie 25 (1.50×1.50)', p: 8190 },
    { n: 'Ventana Serie 25 (1.80×2.00)', p: 9590 },
    { n: 'Monoblock S20 (1.20×1.00)', p: 7590 },
    { n: 'Monoblock S20 (1.50×1.20)', p: 9490 },
    { n: 'Monoblock S20 (1.50×1.50)', p: 12490 },
    { n: 'Monoblock S20 (1.50×2.00)', p: 13490 },
    { n: 'Monoblock S25 (1.20×1.20)', p: 11990 },
    { n: 'Monoblock S25 (1.50×2.00)', p: 17890 },
    { n: 'Persiana (m²)', p: 4200 },
    { n: 'Reja varillas 12mm (m²)', p: 2500 },
    { n: 'Reja varillas 16mm (m²)', p: 3500 },
    { n: 'Puerta reja 0.80×2.00 – 12mm', p: 4990 },
    { n: 'Puerta reja 0.90×2.05 – 12mm', p: 6590 },
    { n: 'Puerta reja 1.00×2.05 – 12mm', p: 7580 },
    { n: 'Mosquitero (m²)', p: 1100 },
  ],
  pvc: [
    { n: 'Tablilla Blanco 6mm (ML)', p: 0 },
    { n: 'Tablilla Blanco 7mm (ML)', p: 0 },
    { n: 'Tablilla Blanco 8mm (ML)', p: 0 },
    { n: 'Tablilla Blanco 10mm (ML)', p: 0 },
    { n: 'Tablilla Color 7mm (ML)', p: 0 },
    { n: 'Perfil U / Terminación (ML)', p: 0 },
    { n: 'Unión H (6m)', p: 510 },
    { n: 'Montante 35mm (barra)', p: 0 },
    { n: 'Montante 70mm (barra)', p: 0 },
    { n: 'Solera 35mm (barra)', p: 0 },
    { n: 'Solera 70mm (barra)', p: 0 },
    { n: 'Esquinero (c/u)', p: 80 },
  ],
  yeso: [
    { n: 'Placa Durlock 10mm', p: 329 },
    { n: 'Placa Durlock 12.5mm', p: 0 },
    { n: 'Placa verde 12.5mm', p: 0 },
    { n: 'Montante 35mm', p: 0 },
    { n: 'Montante 70mm', p: 0 },
    { n: 'Solera 35mm', p: 0 },
    { n: 'Solera 70mm', p: 0 },
    { n: 'Omega 3m', p: 0 },
    { n: 'Masilla 7kg', p: 0 },
    { n: 'Masilla 16kg', p: 0 },
    { n: 'Masilla 25kg', p: 0 },
    { n: 'Cinta papel (rollo)', p: 0 },
    { n: 'Cinta red (rollo)', p: 0 },
  ],
  otros: [
    { n: 'Herraje ventana (juego)', p: 0 },
    { n: 'Vidrio 4mm (m²)', p: 0 },
    { n: 'Vidrio DVH (m²)', p: 0 },
    { n: 'Sellador / silicona (tubo)', p: 0 },
    { n: 'Mano de obra instalación (m²)', p: 0 },
    { n: 'Flete / traslado', p: 0 },
  ],
}

const CAT_LABELS: Record<string, string> = {
  ventanas: '🪟 Ventanas',
  pvc: '🏠 Cielorraso PVC',
  yeso: '🏗️ Yeso',
  otros: '🔧 Otros',
}

function fmt(n: number) { return '$' + Math.round(n).toLocaleString('es-UY') }
function escHtml(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }

export default function PresupuestoPage() {
  const [items, setItems] = useState<Item[]>([])
  const [titulo, setTitulo] = useState('')
  const [desc, setDesc] = useState('')
  const [nota, setNota] = useState('Válido por 7 días. Precios al contado.')
  const [busqueda, setBusqueda] = useState('')
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({ ventanas: true })
  const [libreDesc, setLibreDesc] = useState('')
  const [libreCant, setLibreCant] = useState(1)
  const [librePrecio, setLibrePrecio] = useState(0)
  const [exportando, setExportando] = useState(false)
  const idRef = useRef(1)

  const [vendedor, setVendedor] = useState<Vendedor | null>(null)
  const [loginModal, setLoginModal] = useState(false)
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const esVendedor = !!vendedor
  const telefono = vendedor?.telefono || '097 699 854'
  const nombrePerfil = vendedor?.nombre || 'Aberturas RG'
  const total = items.reduce((s, x) => s + x.cant * x.precio, 0)

  const handleLogin = async () => {
    setLoginLoading(true); setLoginError('')
    const { data, error } = await supabase.from('vendedores').select('*').eq("username", loginUser.trim()).eq("password", loginPass).single()
    setLoginLoading(false)
    if (error || !data) { setLoginError('Usuario o contraseña incorrectos'); return }
    setVendedor({ nombre: data.nombre, usuario: data.username, telefono: data.telefono })
    setLoginModal(false); setLoginUser(''); setLoginPass('')
  }

  const addItem = useCallback((desc: string, precio: number) => {
    setItems(prev => {
      const existe = prev.find(i => i.desc === desc)
      if (existe) return prev.map(i => i.desc === desc ? { ...i, cant: i.cant + 1 } : i)
      return [...prev, { id: idRef.current++, desc, cant: 1, precio }]
    })
  }, [])

  const updateItem = (id: number, field: 'cant' | 'precio', val: number) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i))
  const delItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id))
  const addLibre = () => {
    if (!libreDesc.trim()) return
    addItem(libreDesc.trim(), esVendedor ? librePrecio : 0)
    setLibreDesc(''); setLibrePrecio(0); setLibreCant(1)
  }
  const limpiar = () => { if (items.length > 0 && confirm('¿Limpiar todo?')) setItems([]) }

  const resultados = busqueda.length >= 2
    ? Object.entries(CATALOG).flatMap(([cat, arr]) =>
        arr.map((item, idx) => ({ cat, idx, item }))
          .filter(({ item }) => item.n.toLowerCase().includes(busqueda.toLowerCase()))
      ).slice(0, 12)
    : []

  const enviarWACliente = () => {
    if (items.length === 0) return
    const titulo_ = titulo.trim() || 'Consulta de presupuesto'
    let msg = `¡Hola! Quisiera consultar precio para los siguientes productos:\n\n`
    if (titulo_) msg += `📋 *${titulo_}*\n`
    if (desc) msg += `📍 ${desc}\n`
    msg += `\n`
    items.forEach(x => { msg += `• ${x.desc} — cantidad: ${x.cant}\n` })
    msg += `\n¿Me pueden dar un presupuesto? Muchas gracias.`
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const enviarWAVendedor = () => {
    if (items.length === 0) return
    const titulo_ = titulo.trim() || 'Presupuesto General'
    let msg = `🏠 *${titulo_}*\n`
    if (desc) msg += `📍 ${desc}\n`
    msg += `\n*Aberturas RG — ${nombrePerfil}*\n\n`
    items.filter(x => x.precio > 0).forEach(x => { msg += `• ${x.desc} ×${x.cant} — ${fmt(x.cant * x.precio)}\n` })
    items.filter(x => !x.precio).forEach(x => { msg += `• ${x.desc} (×${x.cant}) — a confirmar\n` })
    msg += `\n💰 *Total: ${fmt(total)}*\n📞 ${telefono}`
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const exportarImagen = async () => {
    if (items.length === 0) { alert('Agregá al menos un ítem'); return }
    setExportando(true)
    const titulo_ = titulo.trim() || 'Presupuesto General'
    const rows = items.filter(x => x.cant > 0).map((it, i) => `
      <tr style="border-bottom:1px solid #eee;${i%2===1?'background:#fafafa;':''}">
        <td style="padding:9px 10px;font-size:13px;">${escHtml(it.desc)}</td>
        <td style="padding:9px 10px;font-size:13px;text-align:right;color:#555;">${it.cant}</td>
        <td style="padding:9px 10px;font-size:13px;text-align:right;color:#555;">${it.precio>0?fmt(it.precio):'—'}</td>
        <td style="padding:9px 10px;font-size:13px;text-align:right;font-weight:600;">${it.precio>0?fmt(it.cant*it.precio):'—'}</td>
      </tr>`).join('')
    const wrapper = document.createElement('div')
    wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;width:540px;background:#fff;padding:32px;font-family:Arial,sans-serif;color:#111;z-index:-1;'
    wrapper.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:22px;padding-bottom:16px;border-bottom:3px solid #D62828;">
        <div style="width:52px;height:52px;background:#D62828;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;border:3px solid #F7B731;">RG</div>
        <div>
          <div style="font-size:20px;font-weight:800;text-transform:uppercase;color:#D62828;">Aberturas RG</div>
          <div style="font-size:12px;color:#666;margin-top:2px;">📞 ${escHtml(telefono)} · ${escHtml(nombrePerfil)}</div>
        </div>
      </div>
      <div style="font-size:22px;font-weight:800;margin-bottom:16px;">${escHtml(titulo_)}</div>
      ${desc?`<div style="font-size:12px;color:#666;margin-bottom:16px;">📍 ${escHtml(desc)}</div>`:''}
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#111;">
          <th style="color:#fff;font-size:11px;padding:8px 10px;text-align:left;">Descripción</th>
          <th style="color:#fff;font-size:11px;padding:8px 10px;text-align:right;">Cant.</th>
          <th style="color:#fff;font-size:11px;padding:8px 10px;text-align:right;">P.Unit.</th>
          <th style="color:#fff;font-size:11px;padding:8px 10px;text-align:right;">Subtotal</th>
        </tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr style="border-top:2px solid #111;">
          <td colspan="3" style="padding:12px 10px;font-weight:700;font-size:13px;color:#555;">TOTAL</td>
          <td style="padding:12px 10px;font-weight:800;font-size:24px;text-align:right;color:#D62828;">${fmt(total)}</td>
        </tr></tfoot>
      </table>
      <div style="margin-top:20px;padding-top:14px;border-top:1px solid #ddd;display:flex;justify-content:space-between;">
        <span style="font-size:13px;font-weight:700;color:#D62828;">📞 ${escHtml(telefono)}</span>
        <span style="font-size:11px;color:#999;">${escHtml(nota)}</span>
      </div>
      <div style="margin-top:12px;padding-top:10px;border-top:1px dashed #ddd;text-align:center;font-size:10px;color:#bbb;">
        Generado por <strong style="color:#D62828;">Aberturas RG</strong> · ${escHtml(telefono)}
      </div>`
    document.body.appendChild(wrapper)
    try {
      if (!(window as any).html2canvas) {
        await new Promise<void>((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';s.onload=()=>res();s.onerror=()=>rej();document.head.appendChild(s)})
      }
      const canvas = await (window as any).html2canvas(wrapper,{scale:2,backgroundColor:'#ffffff',useCORS:true,logging:false})
      document.body.removeChild(wrapper)
      canvas.toBlob(async(blob:Blob)=>{
        try{await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);alert('✅ Imagen copiada al portapapeles')}
        catch{const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='presupuesto-rg.png';a.click();URL.revokeObjectURL(url)}
        setExportando(false)
      })
    } catch {
      if(document.body.contains(wrapper))document.body.removeChild(wrapper)
      setExportando(false);alert('No se pudo generar la imagen.')
    }
  }

  return (
    <PublicLayout>
      <div className="pres-wrapper">
        <div className="pres-hero">
          <div className="pres-hero-topbar">
            <div className="pres-hero-inner">
              <h1>💰 {esVendedor ? `Panel Vendedor — ${nombrePerfil}` : 'Armá tu consulta'}</h1>
              <p>{esVendedor ? 'Modo vendedor · Precios visibles · Exportar con marca de agua' : 'Seleccioná los productos que necesitás y te enviamos el presupuesto por WhatsApp'}</p>
            </div>
            <div className="pres-hero-actions">
              {!esVendedor
                ? <button className="btn-login-vendedor" onClick={() => setLoginModal(true)}>🔑 Vendedor</button>
                : <button className="btn-logout-vendedor" onClick={() => setVendedor(null)}>↩ Salir</button>
              }
            </div>
          </div>
        </div>

        <div className="pres-body">
          <aside className="pres-sidebar">
            <div className="pres-search-wrap">
              <input type="text" placeholder="Buscar producto..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="pres-search" />
              {busqueda && (
                <div className="pres-search-results">
                  {resultados.length === 0
                    ? <div className="pres-no-results">Sin resultados</div>
                    : resultados.map(({cat,idx,item}) => (
                        <button key={`${cat}-${idx}`} className="pres-result-row" onClick={() => { addItem(item.n, item.p); setBusqueda('') }}>
                          <span>{item.n}</span>
                          {esVendedor && <span className="pres-result-price">{item.p > 0 ? fmt(item.p) : '—'}</span>}
                        </button>
                      ))
                  }
                </div>
              )}
            </div>
            {Object.entries(CAT_LABELS).map(([cat, label]) => (
              <div key={cat} className="pres-cat">
                <button className="pres-cat-header" onClick={() => setOpenCats(p => ({ ...p, [cat]: !p[cat] }))}>
                  <span>{label}</span><span>{openCats[cat] ? '▲' : '▼'}</span>
                </button>
                {openCats[cat] && (
                  <div className="pres-cat-items">
                    {CATALOG[cat].map((item, idx) => (
                      <button key={idx} className="pres-cat-item" onClick={() => addItem(item.n, item.p)}>
                        <span className="pres-item-name">{item.n}</span>
                        {esVendedor && <span className="pres-item-price">{item.p > 0 ? fmt(item.p) : <em>definir</em>}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pres-libre">
              <div className="pres-libre-title">+ Ítem libre</div>
              <input value={libreDesc} onChange={e => setLibreDesc(e.target.value)} placeholder="Descripción" className="pres-libre-input" />
              <div className="pres-libre-row">
                <input type="number" value={libreCant} onChange={e => setLibreCant(Number(e.target.value))} min={1} className="pres-libre-mini" />
                {esVendedor && <input type="number" value={librePrecio} onChange={e => setLibrePrecio(Number(e.target.value))} min={0} placeholder="Precio" className="pres-libre-input" />}
              </div>
              <button className="pres-libre-add" onClick={addLibre}>Agregar</button>
            </div>
          </aside>

          <main className="pres-main">
            <div className="pres-meta">
              <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título / referencia (ej: Casa García)" className="pres-meta-input pres-meta-titulo" />
              <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Dirección (opcional)" className="pres-meta-input" />
              {esVendedor && <input value={nota} onChange={e => setNota(e.target.value)} placeholder="Nota al pie" className="pres-meta-input" />}
            </div>

            {items.length === 0
              ? <div className="pres-empty"><span>📋</span><p>Hacé clic en cualquier producto para agregarlo a tu consulta</p></div>
              : <div className="pres-table-wrap">
                  <table className="pres-table">
                    <thead><tr>
                      <th>Producto</th><th>Cant.</th>
                      {esVendedor && <><th>Precio</th><th>Subtotal</th></>}
                      <th></th>
                    </tr></thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id}>
                          <td className="pres-td-desc">{item.desc}</td>
                          <td><input type="number" value={item.cant} min={1} onChange={e => updateItem(item.id,'cant',Number(e.target.value))} className="pres-td-input pres-td-cant" /></td>
                          {esVendedor && (<>
                            <td><input type="number" value={item.precio} min={0} onChange={e => updateItem(item.id,'precio',Number(e.target.value))} className="pres-td-input pres-td-precio" /></td>
                            <td className="pres-td-sub">{item.precio > 0 ? fmt(item.cant * item.precio) : '—'}</td>
                          </>)}
                          <td><button onClick={() => delItem(item.id)} className="pres-del">×</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            }

            <div className="pres-totales">
              <div className="pres-total-row">
                <span>{items.length} ítem{items.length !== 1 ? 's' : ''}</span>
                {esVendedor && <strong className="pres-total-amt">{fmt(total)}</strong>}
              </div>
              <div className="pres-actions">
                {items.length > 0 && <button className="pres-btn pres-btn-limpiar" onClick={limpiar}>🗑 Limpiar</button>}
                {esVendedor && <button className="pres-btn pres-btn-img" onClick={exportarImagen} disabled={exportando||items.length===0}>{exportando?'⏳ Generando...':'📸 Copiar imagen'}</button>}
                <button className="pres-btn pres-btn-wa" onClick={esVendedor ? enviarWAVendedor : enviarWACliente} disabled={items.length===0}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
                  {esVendedor ? 'Enviar por WhatsApp' : 'Solicitar presupuesto →'}
                </button>
              </div>
            </div>

            {!esVendedor && <div className="pres-cliente-info">✅ Tu consulta se enviará por WhatsApp con el listado de productos. Te respondemos con los precios a la brevedad.</div>}
            {esVendedor && <div className="pres-watermark-info">📸 La imagen exportada incluye marca de agua de <strong>Aberturas RG</strong>.</div>}
          </main>
        </div>

        {loginModal && (
          <div className="login-overlay" onClick={() => setLoginModal(false)}>
            <div className="login-modal" onClick={e => e.stopPropagation()}>
              <div className="login-header">
                <div className="login-logo">RG</div>
                <div><h3>Acceso vendedor</h3><p>Ingresá tus credenciales</p></div>
                <button className="login-close" onClick={() => setLoginModal(false)}>✕</button>
              </div>
              <div className="login-body">
                <div className="login-field">
                  <label>Usuario</label>
                  <input value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="tu usuario" autoComplete="username" onKeyDown={e => e.key==='Enter' && handleLogin()} />
                </div>
                <div className="login-field">
                  <label>Contraseña</label>
                  <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="••••••••" autoComplete="current-password" onKeyDown={e => e.key==='Enter' && handleLogin()} />
                </div>
                {loginError && <div className="login-error">{loginError}</div>}
                <button className="login-btn" onClick={handleLogin} disabled={loginLoading}>{loginLoading ? 'Verificando...' : 'Ingresar'}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .pres-wrapper { min-height: 100vh; background: #f8f7f4; }
        .pres-hero { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-bottom: 3px solid #D62828; padding: 1.5rem 1.5rem; }
        
        .pres-hero h1 { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(1.6rem, 4vw, 2.5rem); color: #fff; margin: 0 0 0.4rem; }
        .pres-hero p { color: #aaa; font-size: 0.9rem; margin: 0; }
        .pres-hero-topbar { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
        .pres-hero-inner { flex: 1; }
        .pres-hero-actions { flex-shrink: 0; }
        .btn-login-vendedor { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); font-size: 0.82rem; font-weight: 600; cursor: pointer; padding: 7px 14px; border-radius: 8px; transition: all 0.15s; white-space: nowrap; }
        .btn-login-vendedor:hover { background: rgba(255,255,255,0.15); color: #fff; border-color: rgba(255,255,255,0.4); }
        .btn-logout-vendedor { background: rgba(214,40,40,0.2); border: 1px solid rgba(214,40,40,0.4); color: #ff8888; font-size: 0.82rem; font-weight: 600; cursor: pointer; padding: 7px 14px; border-radius: 8px; transition: all 0.15s; white-space: nowrap; }
        .btn-logout-vendedor:hover { background: rgba(214,40,40,0.35); color: #fff; }
        .pres-body { max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; display: grid; grid-template-columns: 280px 1fr; gap: 1.5rem; }
        @media (max-width: 768px) { .pres-body { grid-template-columns: 1fr; } }
        .pres-sidebar { display: flex; flex-direction: column; gap: 0.8rem; max-height: calc(100vh - 120px); overflow-y: auto; position: sticky; top: 80px; }
        .pres-search-wrap { position: relative; }
        .pres-search { width: 100%; padding: 0.6rem 0.9rem; border: 1.5px solid #ddd; border-radius: 8px; font-size: 0.9rem; background: #fff; box-sizing: border-box; outline: none; }
        .pres-search:focus { border-color: #D62828; }
        .pres-search-results { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); z-index: 100; max-height: 300px; overflow-y: auto; }
        .pres-result-row { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.8rem; border: none; background: transparent; cursor: pointer; font-size: 0.82rem; text-align: left; transition: background 0.1s; }
        .pres-result-row:hover { background: #fff0f0; }
        .pres-result-price { color: #D62828; font-weight: 600; font-size: 0.78rem; }
        .pres-no-results { padding: 0.8rem; text-align: center; color: #aaa; font-size: 0.85rem; }
        .pres-cat { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .pres-cat-header { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0.7rem 0.9rem; border: none; background: transparent; cursor: pointer; font-size: 0.88rem; font-weight: 600; color: #333; transition: background 0.15s; }
        .pres-cat-header:hover { background: #fff0f0; }
        .pres-cat-items { border-top: 1px solid #f5f5f5; }
        .pres-cat-item { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0.45rem 0.9rem; border: none; background: transparent; cursor: pointer; text-align: left; font-size: 0.8rem; color: #444; transition: background 0.1s; }
        .pres-cat-item:hover { background: #fff5f5; }
        .pres-item-name { flex: 1; }
        .pres-item-price { color: #D62828; font-weight: 600; font-size: 0.75rem; margin-left: 0.5rem; white-space: nowrap; }
        .pres-item-price em { color: #aaa; font-style: normal; }
        .pres-libre { background: #fff; border-radius: 10px; padding: 0.8rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 0.4rem; }
        .pres-libre-title { font-size: 0.82rem; font-weight: 600; color: #555; }
        .pres-libre-input, .pres-libre-mini { padding: 0.5rem 0.7rem; border: 1.5px solid #e0e0e0; border-radius: 7px; font-size: 0.85rem; outline: none; width: 100%; box-sizing: border-box; }
        .pres-libre-mini { width: 60px; }
        .pres-libre-row { display: flex; gap: 0.4rem; }
        .pres-libre-row .pres-libre-input { flex: 1; }
        .pres-libre-add { background: #D62828; color: #fff; border: none; padding: 0.45rem; border-radius: 7px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .pres-libre-add:hover { background: #b52020; }
        .pres-main { display: flex; flex-direction: column; gap: 1rem; }
        .pres-meta { display: flex; flex-direction: column; gap: 0.5rem; }
        .pres-meta-input { padding: 0.6rem 0.9rem; border: 1.5px solid #e0e0e0; border-radius: 8px; font-size: 0.9rem; outline: none; font-family: inherit; }
        .pres-meta-input:focus { border-color: #D62828; }
        .pres-meta-titulo { font-size: 1rem; font-weight: 500; }
        .pres-empty { background: #fff; border-radius: 12px; padding: 3rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.8rem; color: #888; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .pres-empty span { font-size: 2.5rem; }
        .pres-table-wrap { background: #fff; border-radius: 12px; overflow-x: auto; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .pres-table { width: 100%; border-collapse: collapse; }
        .pres-table th { text-align: left; padding: 0.7rem 0.9rem; font-size: 0.78rem; font-weight: 700; color: #fff; background: #1a1a1a; text-transform: uppercase; letter-spacing: 0.05em; }
        .pres-table td { padding: 0.65rem 0.9rem; border-bottom: 1px solid #f5f5f5; font-size: 0.88rem; }
        .pres-table tr:last-child td { border-bottom: none; }
        .pres-td-desc { color: #333; }
        .pres-td-sub { font-weight: 700; color: #D62828; text-align: right; }
        .pres-td-input { padding: 0.35rem 0.5rem; border: 1.5px solid #e0e0e0; border-radius: 6px; font-size: 0.85rem; outline: none; }
        .pres-td-input:focus { border-color: #D62828; }
        .pres-td-cant { width: 55px; }
        .pres-td-precio { width: 90px; }
        .pres-del { background: none; border: none; color: #ccc; font-size: 1.1rem; cursor: pointer; padding: 0 0.3rem; transition: color 0.1s; }
        .pres-del:hover { color: #D62828; }
        .pres-totales { background: #fff; border-radius: 12px; padding: 1.2rem 1.4rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .pres-total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .pres-total-row span { color: #888; font-size: 0.88rem; }
        .pres-total-amt { font-size: 1.8rem; color: #D62828; font-family: 'Playfair Display', serif; }
        .pres-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }
        .pres-btn { padding: 0.6rem 1.1rem; border-radius: 9px; font-size: 0.88rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; display: flex; align-items: center; gap: 0.4rem; }
        .pres-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .pres-btn-limpiar { background: #f5f5f5; color: #666; }
        .pres-btn-limpiar:hover:not(:disabled) { background: #ffe5e5; color: #D62828; }
        .pres-btn-img { background: #1a1a1a; color: #F7B731; }
        .pres-btn-img:hover:not(:disabled) { background: #333; }
        .pres-btn-wa { background: #25D366; color: #fff; flex: 1; justify-content: center; }
        .pres-btn-wa:hover:not(:disabled) { background: #1da851; }
        .pres-cliente-info { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 0.7rem 1rem; font-size: 0.85rem; color: #166534; }
        .pres-watermark-info { background: #fff8e1; border: 1px solid #F7B731; border-radius: 8px; padding: 0.6rem 1rem; font-size: 0.82rem; color: #666; }
        .pres-watermark-info strong { color: #D62828; }
        .login-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .login-modal { background: #fff; border-radius: 16px; width: 100%; max-width: 380px; box-shadow: 0 24px 60px rgba(0,0,0,0.3); animation: slideUp 0.2s ease; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .login-header { display: flex; align-items: center; gap: 1rem; padding: 1.2rem 1.5rem; border-bottom: 1px solid #f0f0f0; }
        .login-logo { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg,#D62828,#A01E1E); border: 2px solid #F7B731; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; color: #fff; letter-spacing: 1px; flex-shrink: 0; }
        .login-header h3 { margin: 0 0 2px; font-size: 1rem; color: #1a1a1a; }
        .login-header p { margin: 0; font-size: 0.78rem; color: #888; }
        .login-close { margin-left: auto; background: none; border: none; font-size: 1rem; cursor: pointer; color: #aaa; padding: 4px; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
        .login-close:hover { background: #f0f0f0; }
        .login-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .login-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .login-field label { font-size: 0.82rem; font-weight: 600; color: #555; }
        .login-field input { padding: 0.65rem 0.9rem; border: 1.5px solid #e0e0e0; border-radius: 8px; font-size: 0.9rem; outline: none; font-family: inherit; transition: border-color 0.15s; }
        .login-field input:focus { border-color: #D62828; }
        .login-error { background: #fff0f0; border: 1px solid #fca5a5; color: #D62828; font-size: 0.82rem; padding: 0.5rem 0.8rem; border-radius: 7px; }
        .login-btn { background: #D62828; color: #fff; border: none; padding: 0.75rem; border-radius: 9px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: background 0.15s; }
        .login-btn:hover:not(:disabled) { background: #b52020; }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </PublicLayout>
  )
}
