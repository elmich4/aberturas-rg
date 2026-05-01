'use client'

import { useState, useCallback, useRef } from 'react'
import PublicLayout from '@/components/public/PublicLayout'
import { useAuth } from '@/lib/auth'

// ── Tipos ──────────────────────────────────────────────────────────────────
type Item = { id: number; desc: string; cant: number; precio: number }

// ── Catálogo de productos ──────────────────────────────────────────────────
const CATALOG: Record<string, { n: string; p: number; ed?: boolean }[]> = {
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
    { n: 'Tablilla Blanco 6mm (ML)', p: 0, ed: true },
    { n: 'Tablilla Blanco 7mm (ML)', p: 0, ed: true },
    { n: 'Tablilla Blanco 8mm (ML)', p: 0, ed: true },
    { n: 'Tablilla Blanco 10mm (ML)', p: 0, ed: true },
    { n: 'Tablilla Color 7mm (ML)', p: 0, ed: true },
    { n: 'Perfil U / Terminación (ML)', p: 0, ed: true },
    { n: 'Unión H (6m)', p: 510 },
    { n: 'Montante 35mm (barra)', p: 0, ed: true },
    { n: 'Montante 70mm (barra)', p: 0, ed: true },
    { n: 'Solera 35mm (barra)', p: 0, ed: true },
    { n: 'Solera 70mm (barra)', p: 0, ed: true },
    { n: 'Tornillo T1 (c/u)', p: 0, ed: true },
    { n: 'Fijación 8mm (c/u)', p: 0, ed: true },
    { n: 'Lana de vidrio (rollo 18m²)', p: 0, ed: true },
    { n: 'Guata aluminizada (rollo 15m²)', p: 0, ed: true },
    { n: 'Esquinero (c/u)', p: 80 },
  ],
  yeso: [
    { n: 'Placa Durlock 10mm', p: 329 },
    { n: 'Placa Durlock 12.5mm', p: 0, ed: true },
    { n: 'Placa verde 12.5mm', p: 0, ed: true },
    { n: 'Montante 35mm', p: 0, ed: true },
    { n: 'Montante 70mm', p: 0, ed: true },
    { n: 'Solera 35mm', p: 0, ed: true },
    { n: 'Solera 70mm', p: 0, ed: true },
    { n: 'Omega 3m', p: 0, ed: true },
    { n: 'Tornillos T1 (bolsa 100u)', p: 0, ed: true },
    { n: 'Tornillos T2 (bolsa 100u)', p: 0, ed: true },
    { n: 'Fijaciones c/taco (bolsa)', p: 0, ed: true },
    { n: 'Masilla 7kg', p: 0, ed: true },
    { n: 'Masilla 16kg', p: 0, ed: true },
    { n: 'Masilla 25kg', p: 0, ed: true },
    { n: 'Cinta papel (rollo)', p: 0, ed: true },
    { n: 'Cinta red (rollo)', p: 0, ed: true },
    { n: 'Lana de vidrio (18m²)', p: 0, ed: true },
    { n: 'Guata aluminizada (15m²)', p: 0, ed: true },
  ],
  otros: [
    { n: 'Herraje ventana (juego)', p: 0, ed: true },
    { n: 'Vidrio 4mm (m²)', p: 0, ed: true },
    { n: 'Vidrio DVH (m²)', p: 0, ed: true },
    { n: 'Sellador / silicona (tubo)', p: 0, ed: true },
    { n: 'Mano de obra instalación (m²)', p: 0, ed: true },
    { n: 'Flete / traslado', p: 0, ed: true },
  ],
}

const CAT_LABELS: Record<string, string> = {
  ventanas: '🪟 Ventanas',
  pvc: '🏠 Cielorraso PVC',
  yeso: '🏗️ Yeso',
  otros: '🔧 Otros',
}

const WA_NUMBER = '59897699854'

function fmt(n: number) {
  return '$' + Math.round(n).toLocaleString('es-UY')
}

function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export default function PresupuestoPage() {
  const { perfilActivo, session } = useAuth()
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

  const total = items.reduce((s, x) => s + x.cant * x.precio, 0)
  const telefono = perfilActivo?.telefono || '097 699 854'
  const nombrePerfil = perfilActivo?.nombre || 'Aberturas RG'

  const addItem = useCallback((desc: string, precio: number) => {
    setItems(prev => {
      const existe = prev.find(i => i.desc === desc)
      if (existe) return prev.map(i => i.desc === desc ? { ...i, cant: i.cant + 1 } : i)
      return [...prev, { id: idRef.current++, desc, cant: 1, precio }]
    })
  }, [])

  const updateItem = (id: number, field: 'cant' | 'precio', val: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i))
  }

  const delItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id))

  const addLibre = () => {
    if (!libreDesc.trim()) return
    addItem(libreDesc.trim(), librePrecio)
    setLibreDesc('')
    setLibrePrecio(0)
    setLibreCant(1)
  }

  const limpiar = () => {
    if (items.length > 0 && confirm('¿Limpiar todo el presupuesto?')) setItems([])
  }

  // Búsqueda
  const resultados = busqueda.length >= 2
    ? Object.entries(CATALOG).flatMap(([cat, arr]) =>
        arr.map((item, idx) => ({ cat, idx, item }))
          .filter(({ item }) => item.n.toLowerCase().includes(busqueda.toLowerCase()))
      ).slice(0, 12)
    : []

  // ── Exportar imagen con marca de agua ──────────────────────────────────
  const exportarImagen = async () => {
    if (items.length === 0) { alert('Agregá al menos un ítem antes de exportar.'); return }
    setExportando(true)

    const titulo_ = titulo.trim() || 'Presupuesto General'
    const itemsFiltrados = items.filter(x => x.cant > 0)
    const total_ = itemsFiltrados.reduce((s, x) => s + x.cant * x.precio, 0)

    const rows = itemsFiltrados.map((it, i) => {
      const sub = it.cant * it.precio
      return `<tr style="border-bottom:1px solid #eee;${i % 2 === 1 ? 'background:#fafafa;' : ''}">
        <td style="padding:9px 10px;font-size:13px;">${escHtml(it.desc)}</td>
        <td style="padding:9px 10px;font-size:13px;text-align:right;color:#555;">${it.cant}</td>
        <td style="padding:9px 10px;font-size:13px;text-align:right;color:#555;">${it.precio > 0 ? fmt(it.precio) : '—'}</td>
        <td style="padding:9px 10px;font-size:13px;text-align:right;font-weight:600;">${sub > 0 ? fmt(sub) : '—'}</td>
      </tr>`
    }).join('')

    const wrapper = document.createElement('div')
    wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;width:540px;background:#fff;padding:32px;font-family:Arial,Helvetica,sans-serif;color:#111;z-index:-1;'

    // ← MARCA DE AGUA INTEGRADA en el HTML del presupuesto
    wrapper.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:22px;padding-bottom:16px;border-bottom:3px solid #D62828;">
        <div style="width:52px;height:52px;background:#D62828;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;border:3px solid #F7B731;flex-shrink:0;">RG</div>
        <div>
          <div style="font-size:20px;font-weight:800;text-transform:uppercase;color:#D62828;">Aberturas RG</div>
          <div style="font-size:12px;color:#666;margin-top:2px;">📞 ${escHtml(telefono)} · ${escHtml(nombrePerfil)}</div>
        </div>
        <div style="margin-left:auto;text-align:right;">
          <div style="font-size:11px;color:#999;background:#f5f5f5;padding:4px 10px;border-radius:20px;border:1px solid #eee;">Presupuesto Oficial</div>
        </div>
      </div>

      <div style="font-size:22px;font-weight:800;color:#111;margin-bottom:${desc ? '4' : '16'}px;">${escHtml(titulo_)}</div>
      ${desc ? `<div style="font-size:12px;color:#666;margin-bottom:16px;">📍 ${escHtml(desc)}</div>` : ''}

      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#111;">
          <th style="color:#fff;font-size:11px;padding:8px 10px;text-align:left;">Descripción</th>
          <th style="color:#fff;font-size:11px;padding:8px 10px;text-align:right;">Cant.</th>
          <th style="color:#fff;font-size:11px;padding:8px 10px;text-align:right;">P.Unit.</th>
          <th style="color:#fff;font-size:11px;padding:8px 10px;text-align:right;">Subtotal</th>
        </tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr style="border-top:2px solid #111;">
          <td colspan="3" style="padding:12px 10px;font-weight:700;font-size:13px;text-transform:uppercase;color:#555;">TOTAL</td>
          <td style="padding:12px 10px;font-weight:800;font-size:24px;text-align:right;color:#D62828;">${fmt(total_)}</td>
        </tr></tfoot>
      </table>

      <div style="margin-top:20px;padding-top:14px;border-top:1px solid #ddd;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:13px;font-weight:700;color:#D62828;">📞 ${escHtml(telefono)}</span>
        <span style="font-size:11px;color:#999;">${escHtml(nota)}</span>
      </div>

      <!-- Marca de agua al pie -->
      <div style="margin-top:12px;padding-top:10px;border-top:1px dashed #ddd;display:flex;align-items:center;justify-content:center;gap:6px;">
        <div style="width:18px;height:18px;background:#D62828;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:900;color:#fff;">RG</div>
        <span style="font-size:10px;color:#bbb;">Generado por <strong style="color:#D62828;">Aberturas RG</strong> · ${escHtml(telefono)} · aberturas-rg.vercel.app</span>
      </div>
    `

    document.body.appendChild(wrapper)
    try {
      if (!(window as any).html2canvas) {
        await new Promise<void>((res, rej) => {
          const s = document.createElement('script')
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
          s.onload = () => res()
          s.onerror = () => rej()
          document.head.appendChild(s)
        })
      }
      const canvas = await (window as any).html2canvas(wrapper, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false })
      document.body.removeChild(wrapper)
      canvas.toBlob(async (blob: Blob) => {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
          alert('✅ Imagen copiada al portapapeles')
        } catch {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url; a.download = 'presupuesto-aberturas-rg.png'; a.click()
          URL.revokeObjectURL(url)
        }
        setExportando(false)
      })
    } catch {
      if (document.body.contains(wrapper)) document.body.removeChild(wrapper)
      setExportando(false)
      alert('No se pudo generar la imagen.')
    }
  }

  const enviarWA = () => {
    if (items.length === 0) return
    const titulo_ = titulo.trim() || 'Presupuesto General'
    const withPrice = items.filter(x => x.precio > 0)
    const withoutPrice = items.filter(x => !x.precio)
    let msg = `🏠 *${titulo_}*\n`
    if (desc) msg += `📍 ${desc}\n`
    msg += `\n*Aberturas RG*\n`
    if (withPrice.length) {
      msg += `\n`
      withPrice.forEach(x => { msg += `• ${x.desc} ×${x.cant} — ${fmt(x.cant * x.precio)}\n` })
    }
    if (withoutPrice.length) {
      msg += `\nSin precio definido:\n`
      withoutPrice.forEach(x => { msg += `• ${x.desc} (×${x.cant})\n` })
    }
    msg += `\n💰 *Total estimado: ${fmt(total)}*\n`
    msg += `\n📞 ${telefono} · ${nombrePerfil}`
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <PublicLayout>
      <div className="pres-wrapper">
        <div className="pres-hero">
          <div className="pres-hero-inner">
            <h1>💰 Calculadora de Presupuesto</h1>
            <p>Armá tu lista, exportá como imagen con marca de agua o enviá por WhatsApp</p>
          </div>
        </div>

        <div className="pres-body">
          {/* Panel izquierdo: catálogo */}
          <aside className="pres-sidebar">
            {/* Buscador */}
            <div className="pres-search-wrap">
              <input
                type="text"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="pres-search"
              />
              {busqueda && (
                <div className="pres-search-results">
                  {resultados.length === 0
                    ? <div className="pres-no-results">Sin resultados</div>
                    : resultados.map(({ cat, idx, item }) => (
                        <button key={`${cat}-${idx}`} className="pres-result-row" onClick={() => { addItem(item.n, item.p); setBusqueda('') }}>
                          <span>{item.n}</span>
                          <span className="pres-result-price">{item.p > 0 ? fmt(item.p) : '—'}</span>
                        </button>
                      ))
                  }
                </div>
              )}
            </div>

            {/* Catálogo por categorías */}
            {Object.entries(CAT_LABELS).map(([cat, label]) => (
              <div key={cat} className="pres-cat">
                <button className="pres-cat-header" onClick={() => setOpenCats(p => ({ ...p, [cat]: !p[cat] }))}>
                  <span>{label}</span>
                  <span>{openCats[cat] ? '▲' : '▼'}</span>
                </button>
                {openCats[cat] && (
                  <div className="pres-cat-items">
                    {CATALOG[cat].map((item, idx) => (
                      <button key={idx} className="pres-cat-item" onClick={() => addItem(item.n, item.p)}>
                        <span className="pres-item-name">{item.n}</span>
                        <span className="pres-item-price">{item.p > 0 ? fmt(item.p) : <em>definir</em>}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Ítem libre */}
            <div className="pres-libre">
              <div className="pres-libre-title">+ Ítem libre</div>
              <input value={libreDesc} onChange={e => setLibreDesc(e.target.value)} placeholder="Descripción" className="pres-libre-input" />
              <div className="pres-libre-row">
                <input type="number" value={libreCant} onChange={e => setLibreCant(Number(e.target.value))} min={1} className="pres-libre-mini" />
                <input type="number" value={librePrecio} onChange={e => setLibrePrecio(Number(e.target.value))} min={0} placeholder="Precio" className="pres-libre-input" />
              </div>
              <button className="pres-libre-add" onClick={addLibre}>Agregar</button>
            </div>
          </aside>

          {/* Panel derecho: tabla + totales */}
          <main className="pres-main">
            {/* Datos del presupuesto */}
            <div className="pres-meta">
              <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título del presupuesto (ej: Casa Sra. García)" className="pres-meta-input pres-meta-titulo" />
              <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Dirección / referencia (opcional)" className="pres-meta-input" />
              <input value={nota} onChange={e => setNota(e.target.value)} placeholder="Nota al pie" className="pres-meta-input" />
            </div>

            {/* Tabla de ítems */}
            {items.length === 0
              ? <div className="pres-empty">
                  <span>📋</span>
                  <p>Hacé clic en cualquier producto del catálogo para agregarlo al presupuesto</p>
                </div>
              : <div className="pres-table-wrap">
                  <table className="pres-table">
                    <thead>
                      <tr>
                        <th>Descripción</th>
                        <th>Cant.</th>
                        <th>P.Unit.</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id}>
                          <td className="pres-td-desc">{item.desc}</td>
                          <td>
                            <input type="number" value={item.cant} min={1} onChange={e => updateItem(item.id, 'cant', Number(e.target.value))} className="pres-td-input pres-td-cant" />
                          </td>
                          <td>
                            <input type="number" value={item.precio} min={0} onChange={e => updateItem(item.id, 'precio', Number(e.target.value))} className="pres-td-input pres-td-precio" />
                          </td>
                          <td className="pres-td-sub">{item.precio > 0 ? fmt(item.cant * item.precio) : '—'}</td>
                          <td>
                            <button onClick={() => delItem(item.id)} className="pres-del">×</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            }

            {/* Totales y acciones */}
            <div className="pres-totales">
              <div className="pres-total-row">
                <span>{items.length} ítem{items.length !== 1 ? 's' : ''}</span>
                <strong className="pres-total-amt">{fmt(total)}</strong>
              </div>
              <div className="pres-actions">
                {items.length > 0 && (
                  <button className="pres-btn pres-btn-limpiar" onClick={limpiar}>🗑 Limpiar</button>
                )}
                <button className="pres-btn pres-btn-img" onClick={exportarImagen} disabled={exportando || items.length === 0}>
                  {exportando ? '⏳ Generando...' : '📸 Copiar imagen'}
                </button>
                <button className="pres-btn pres-btn-wa" onClick={enviarWA} disabled={items.length === 0}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                  </svg>
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Info marca de agua */}
            <div className="pres-watermark-info">
              📸 La imagen exportada incluye marca de agua de <strong>Aberturas RG</strong> y el número de contacto.
            </div>
          </main>
        </div>
      </div>

      <style jsx>{`
        .pres-wrapper { min-height: 100vh; background: #f8f7f4; }

        .pres-hero {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          border-bottom: 3px solid #D62828;
          padding: 2.5rem 1.5rem 2rem;
        }
        .pres-hero-inner { max-width: 1200px; margin: 0 auto; }
        .pres-hero h1 { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(1.8rem, 4vw, 2.8rem); color: #fff; margin: 0 0 0.4rem; }
        .pres-hero p { color: #aaa; font-size: 0.9rem; margin: 0; }

        .pres-body {
          max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem;
          display: grid; grid-template-columns: 280px 1fr; gap: 1.5rem;
        }
        @media (max-width: 768px) { .pres-body { grid-template-columns: 1fr; } }

        /* Sidebar */
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

        /* Main */
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

        .pres-watermark-info { background: #fff8e1; border: 1px solid #F7B731; border-radius: 8px; padding: 0.6rem 1rem; font-size: 0.82rem; color: #666; }
        .pres-watermark-info strong { color: #D62828; }
      `}</style>
    </PublicLayout>
  )
}
