'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useVendedor } from '@/lib/vendedor-auth'
import PublicLayout from '@/components/public/PublicLayout'
import { supabase } from '@/lib/supabase'

const WA = '59897699854'
const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-UY')
const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')

type Item = { id: number; desc: string; cant: number; precio: number; unidad: string }
type Prod = { id: string; calculadora: string; clave: string; descripcion: string; precio: number; unidad: string; criterio: string }

// Categorías cargadas dinámicamente desde Supabase
type Categoria = { clave: string; label: string; orden: number }

export default function PresupuestoPage() {
  const { vendedor } = useVendedor()
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [productos, setProductos] = useState<Prod[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loadingProds, setLoadingProds] = useState(true)
  const [titulo, setTitulo] = useState('')
  const [desc, setDesc] = useState('')
  const [nota, setNota] = useState('Válido por 7 días. Precios al contado.')
  const [busqueda, setBusqueda] = useState('')
  const [openCats, setOpenCats] = useState<Record<string,boolean>>({ ventana_s20: true })
  const [libreDesc, setLibreDesc] = useState('')
  const [librePrecio, setLibrePrecio] = useState('')
  const [exportando, setExportando] = useState(false)
  const idRef = useRef(1)

  const total = items.reduce((s, x) => s + x.cant * x.precio, 0)
  const telefono = vendedor?.telefono || '097 699 854'
  const nombrePerfil = vendedor?.nombre || 'Aberturas RG'

  // ── Cargar productos y categorías desde Supabase ──────────────────────
  useEffect(() => {
    Promise.all([
      supabase.from('precios_calc').select('*').eq('activo', true).order('calculadora').order('orden'),
      supabase.from('presupuesto_categorias').select('*').eq('activo', true).order('orden')
    ]).then(([{ data: prods }, { data: cats }]) => {
      setProductos(prods || [])
      setCategorias(cats || [])
      setLoadingProds(false)
    })
  }, [])

  // Solo mostrar categorías que tienen productos
  const catsConProductos = categorias.filter(cat =>
    productos.some(p => p.calculadora === cat.clave)
  )

  // Búsqueda
  const resultados = busqueda.length >= 2
    ? productos.filter(p => p.clave.toLowerCase().includes(busqueda.toLowerCase())).slice(0, 15)
    : []

  // ── Items ──────────────────────────────────────────────────────────────
  const addItem = useCallback((desc: string, precio: number, unidad: string) => {
    setItems(prev => {
      const existe = prev.find(i => i.desc === desc)
      if (existe) return prev.map(i => i.desc === desc ? { ...i, cant: i.cant + 1 } : i)
      return [...prev, { id: idRef.current++, desc, cant: 1, precio, unidad }]
    })
  }, [])

  const updateItem = (id: number, field: 'cant' | 'precio', val: number) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i))
  const delItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id))
  const limpiar = () => { if (items.length > 0 && confirm('¿Limpiar todo?')) setItems([]) }

  // ── Exportar imagen ──────────────────────────────────────────────────
  const exportarImagen = async () => {
    if (items.length === 0) { alert('Agregá ítems primero'); return }
    setExportando(true)
    const titulo_ = titulo.trim() || 'Presupuesto General'
    const rows = items.filter(x => x.cant > 0).map((it, i) => `
      <tr style="border-bottom:1px solid #eee;${i%2===1?'background:#fafafa;':''}">
        <td style="padding:8px 10px;font-size:12px;">${esc(it.desc)}</td>
        <td style="padding:8px 10px;font-size:12px;text-align:center;color:#555;">${it.cant} ${it.unidad}</td>
        <td style="padding:8px 10px;font-size:12px;text-align:right;color:#555;">${it.precio>0?fmt(it.precio):'—'}</td>
        <td style="padding:8px 10px;font-size:12px;text-align:right;font-weight:600;">${it.precio>0?fmt(it.cant*it.precio):'—'}</td>
      </tr>`).join('')
    const wrapper = document.createElement('div')
    wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;width:560px;background:#fff;padding:32px;font-family:Arial,sans-serif;color:#111;z-index:-1;'
    wrapper.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;padding-bottom:14px;border-bottom:3px solid #D62828;">
        <div style="width:48px;height:48px;background:#D62828;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#fff;border:3px solid #F7B731;">RG</div>
        <div>
          <div style="font-size:18px;font-weight:800;text-transform:uppercase;color:#D62828;">Aberturas RG</div>
          <div style="font-size:11px;color:#666;">📞 ${esc(telefono)} · ${esc(nombrePerfil)}</div>
        </div>
      </div>
      <div style="font-size:20px;font-weight:800;margin-bottom:${desc?'4':'14'}px;">${esc(titulo_)}</div>
      ${desc?`<div style="font-size:11px;color:#666;margin-bottom:14px;">📍 ${esc(desc)}</div>`:''}
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#111;">
          <th style="color:#fff;font-size:10px;padding:7px 10px;text-align:left;">Descripción</th>
          <th style="color:#fff;font-size:10px;padding:7px 10px;text-align:center;">Cant.</th>
          <th style="color:#fff;font-size:10px;padding:7px 10px;text-align:right;">P.Unit.</th>
          <th style="color:#fff;font-size:10px;padding:7px 10px;text-align:right;">Subtotal</th>
        </tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr style="border-top:2px solid #111;">
          <td colspan="3" style="padding:10px;font-weight:700;font-size:12px;color:#555;">TOTAL</td>
          <td style="padding:10px;font-weight:800;font-size:22px;text-align:right;color:#D62828;">${fmt(total)}</td>
        </tr></tfoot>
      </table>
      <div style="margin-top:16px;padding-top:12px;border-top:1px solid #ddd;display:flex;justify-content:space-between;">
        <span style="font-size:12px;font-weight:700;color:#D62828;">📞 ${esc(telefono)}</span>
        <span style="font-size:10px;color:#999;">${esc(nota)}</span>
      </div>
      <div style="margin-top:10px;padding-top:8px;border-top:1px dashed #eee;text-align:center;font-size:9px;color:#bbb;">
        Generado por <strong style="color:#D62828;">Aberturas RG</strong> · ${esc(telefono)}
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
      setExportando(false);alert('Error al generar imagen.')
    }
  }

  const enviarWA = () => {
    if (items.length === 0) return
    const titulo_ = titulo.trim() || 'Presupuesto'
    let msg = `🏠 *${titulo_}*\n`
    if (desc) msg += `📍 ${desc}\n`
    msg += `\n*Aberturas RG — ${nombrePerfil}*\n\n`
    items.filter(x => x.precio > 0).forEach(x => { msg += `• ${x.desc} ×${x.cant} ${x.unidad} — ${fmt(x.cant * x.precio)}\n` })
    items.filter(x => !x.precio).forEach(x => { msg += `• ${x.desc} ×${x.cant} — a confirmar\n` })
    msg += `\n💰 *Total: ${fmt(total)}*\n📞 ${telefono}`
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <PublicLayout>
      <div className="pres-wrapper">
        <div className="pres-hero">
          <div className="pres-hero-inner">
            <h1>💰 Presupuesto — {nombrePerfil}</h1>
            <p>Modo vendedor · Precios desde Supabase · Exportar con marca de agua</p>
          </div>
          <button className="btn-logout" onClick={() => router.push('/')}>← Inicio</button>
        </div>

        <div className="pres-body">
          {/* Sidebar */}
          <aside className="pres-sidebar">
            {/* Buscador */}
            <div className="pres-search-wrap">
              <input type="text" placeholder="Buscar producto..." value={busqueda}
                onChange={e => setBusqueda(e.target.value)} className="pres-search" />
              {busqueda && (
                <div className="pres-search-results">
                  {resultados.length === 0
                    ? <div className="pres-no-results">Sin resultados</div>
                    : resultados.map(p => (
                        <button key={p.id} className="pres-result-row"
                          onClick={() => { addItem(p.clave, p.precio, p.unidad); setBusqueda('') }}>
                          <span>{p.clave}</span>
                          <span className="pres-result-price">{p.precio > 0 ? fmt(p.precio) : '—'}</span>
                        </button>
                      ))
                  }
                </div>
              )}
            </div>

            {/* Catálogo por categorías */}
            {loadingProds
              ? <div style={{ padding: '1rem', color: '#aaa', fontSize: '0.85rem', textAlign: 'center' }}>Cargando productos...</div>
              : catsConProductos.map(cat => (
                  <div key={cat.clave} className="pres-cat">
                    <button className="pres-cat-header"
                      onClick={() => setOpenCats(p => ({ ...p, [cat.clave]: !p[cat.clave] }))}>
                      <span style={{ fontSize: '0.82rem' }}>{cat.label}</span>
                      <span>{openCats[cat.clave] ? '▲' : '▼'}</span>
                    </button>
                    {openCats[cat.clave] && (
                      <div className="pres-cat-items">
                        {productos.filter(p => p.calculadora === cat.clave).map(prod => (
                          <button key={prod.id} className="pres-cat-item"
                            onClick={() => addItem(prod.clave, prod.precio, prod.unidad)}>
                            <span className="pres-item-name">{prod.clave}</span>
                            <span className="pres-item-price">
                              {prod.precio > 0 ? fmt(prod.precio) : <em>definir</em>}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
            }

            {/* Ítem libre */}
            <div className="pres-libre">
              <div className="pres-libre-title">+ Ítem libre</div>
              <input value={libreDesc} onChange={e => setLibreDesc(e.target.value)}
                placeholder="Descripción" className="pres-libre-input"
                onKeyDown={e => { if (e.key === 'Enter' && libreDesc.trim()) { addItem(libreDesc.trim(), parseFloat(librePrecio)||0, 'u'); setLibreDesc(''); setLibrePrecio('') }}} />
              <input type="number" value={librePrecio} onChange={e => setLibrePrecio(e.target.value)}
                min={0} placeholder="Precio $" className="pres-libre-input" />
              <button className="pres-libre-add" onClick={() => {
                if (!libreDesc.trim()) return
                addItem(libreDesc.trim(), parseFloat(librePrecio)||0, 'u')
                setLibreDesc(''); setLibrePrecio('')
              }}>Agregar</button>
            </div>
          </aside>

          {/* Main */}
          <main className="pres-main">
            <div className="pres-meta">
              <input value={titulo} onChange={e => setTitulo(e.target.value)}
                placeholder="Título (ej: Casa Sra. García — Av. Italia)" className="pres-meta-input pres-meta-titulo" />
              <input value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="Dirección / referencia (opcional)" className="pres-meta-input" />
              <input value={nota} onChange={e => setNota(e.target.value)}
                placeholder="Nota al pie" className="pres-meta-input" />
            </div>

            {items.length === 0
              ? <div className="pres-empty"><span>📋</span><p>Tocá un producto del catálogo para agregarlo</p></div>
              : <div className="pres-table-wrap">
                  <table className="pres-table">
                    <thead><tr>
                      <th>Descripción</th><th>Cant.</th><th>Unidad</th><th>Precio</th><th>Subtotal</th><th></th>
                    </tr></thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id}>
                          <td className="pres-td-desc">{item.desc}</td>
                          <td>
                            <input type="number" value={item.cant} min={1}
                              onChange={e => updateItem(item.id,'cant',Number(e.target.value))}
                              className="pres-td-input pres-td-cant" />
                          </td>
                          <td style={{fontSize:'0.78rem',color:'#888'}}>{item.unidad}</td>
                          <td>
                            <input type="number" value={item.precio||''} min={0}
                              onChange={e => updateItem(item.id,'precio',Number(e.target.value))}
                              className="pres-td-input pres-td-precio" />
                          </td>
                          <td className="pres-td-sub">{item.precio > 0 ? fmt(item.cant * item.precio) : '—'}</td>
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
                <strong className="pres-total-amt">{fmt(total)}</strong>
              </div>
              <div className="pres-actions">
                {items.length > 0 && <button className="pres-btn pres-btn-limpiar" onClick={limpiar}>🗑 Limpiar</button>}
                <button className="pres-btn pres-btn-img" onClick={exportarImagen}
                  disabled={exportando||items.length===0}>
                  {exportando?'⏳ Generando...':'📸 Copiar imagen'}
                </button>
                <button className="pres-btn pres-btn-wa" onClick={enviarWA} disabled={items.length===0}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                  </svg>
                  Enviar por WA
                </button>
              </div>
            </div>

            <div className="pres-watermark-info">
              📸 Imagen con marca de agua · 
              <a href="/admin/precios" style={{color:'#D62828',textDecoration:'none',fontWeight:600}}> ✏️ Editar productos y precios →</a>
            </div>
          </main>
        </div>
      </div>

      <style jsx>{`
        .pres-wrapper { min-height: 100vh; background: #f8f7f4; }
        .pres-hero { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-bottom: 3px solid #D62828; padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
        .pres-hero-inner h1 { font-family: 'Playfair Display', serif; font-size: clamp(1.4rem, 3vw, 2rem); color: #fff; margin: 0 0 0.3rem; }
        .pres-hero-inner p { color: #aaa; font-size: 0.85rem; margin: 0; }
        .btn-logout { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #aaa; font-size: 0.82rem; cursor: pointer; padding: 6px 12px; border-radius: 7px; white-space: nowrap; transition: all .15s; }
        .btn-logout:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .pres-body { max-width: 1300px; margin: 0 auto; padding: 1.5rem; display: grid; grid-template-columns: 300px 1fr; gap: 1.5rem; }
        @media (max-width: 900px) { .pres-body { grid-template-columns: 1fr; } }
        .pres-sidebar { display: flex; flex-direction: column; gap: 0.6rem; max-height: calc(100vh - 100px); overflow-y: auto; position: sticky; top: 70px; }
        .pres-search-wrap { position: relative; }
        .pres-search { width: 100%; padding: 0.6rem 0.9rem; border: 1.5px solid #ddd; border-radius: 8px; font-size: 0.88rem; background: #fff; box-sizing: border-box; outline: none; }
        .pres-search:focus { border-color: #D62828; }
        .pres-search-results { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,.1); z-index: 100; max-height: 320px; overflow-y: auto; }
        .pres-result-row { width: 100%; display: flex; justify-content: space-between; padding: 0.5rem 0.8rem; border: none; background: transparent; cursor: pointer; font-size: 0.8rem; text-align: left; }
        .pres-result-row:hover { background: #fff0f0; }
        .pres-result-price { color: #D62828; font-weight: 600; font-size: 0.75rem; flex-shrink: 0; margin-left: 0.5rem; }
        .pres-no-results { padding: 0.8rem; text-align: center; color: #aaa; font-size: 0.82rem; }
        .pres-cat { background: #fff; border-radius: 9px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.05); }
        .pres-cat-header { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.8rem; border: none; background: transparent; cursor: pointer; font-size: 0.82rem; font-weight: 600; color: #333; transition: background .15s; }
        .pres-cat-header:hover { background: #fff0f0; }
        .pres-cat-items { border-top: 1px solid #f5f5f5; }
        .pres-cat-item { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0.38rem 0.8rem; border: none; background: transparent; cursor: pointer; text-align: left; font-size: 0.77rem; color: #444; transition: background .1s; }
        .pres-cat-item:hover { background: #fff5f5; }
        .pres-item-name { flex: 1; }
        .pres-item-price { color: #D62828; font-weight: 600; font-size: 0.72rem; margin-left: 0.4rem; white-space: nowrap; }
        .pres-item-price em { color: #bbb; font-style: normal; }
        .pres-libre { background: #fff; border-radius: 9px; padding: 0.75rem; box-shadow: 0 1px 4px rgba(0,0,0,.05); display: flex; flex-direction: column; gap: 0.4rem; }
        .pres-libre-title { font-size: 0.8rem; font-weight: 600; color: #555; }
        .pres-libre-input { padding: 0.45rem 0.65rem; border: 1.5px solid #e0e0e0; border-radius: 7px; font-size: 0.83rem; outline: none; width: 100%; box-sizing: border-box; font-family: inherit; }
        .pres-libre-add { background: #D62828; color: #fff; border: none; padding: 0.4rem; border-radius: 7px; font-size: 0.83rem; font-weight: 600; cursor: pointer; }
        .pres-libre-add:hover { background: #b52020; }
        .pres-main { display: flex; flex-direction: column; gap: 1rem; }
        .pres-meta { display: flex; flex-direction: column; gap: 0.4rem; }
        .pres-meta-input { padding: 0.55rem 0.85rem; border: 1.5px solid #e0e0e0; border-radius: 8px; font-size: 0.88rem; outline: none; font-family: inherit; }
        .pres-meta-input:focus { border-color: #D62828; }
        .pres-meta-titulo { font-size: 0.95rem; font-weight: 500; }
        .pres-empty { background: #fff; border-radius: 12px; padding: 3rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.8rem; color: #888; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
        .pres-empty span { font-size: 2.5rem; }
        .pres-table-wrap { background: #fff; border-radius: 12px; overflow-x: auto; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
        .pres-table { width: 100%; border-collapse: collapse; }
        .pres-table th { text-align: left; padding: 0.65rem 0.85rem; font-size: 0.75rem; font-weight: 700; color: #fff; background: #1a1a1a; text-transform: uppercase; letter-spacing: .05em; }
        .pres-table td { padding: 0.55rem 0.85rem; border-bottom: 1px solid #f5f5f5; font-size: 0.85rem; }
        .pres-table tr:last-child td { border-bottom: none; }
        .pres-td-desc { color: #333; }
        .pres-td-sub { font-weight: 700; color: #D62828; text-align: right; }
        .pres-td-input { padding: 0.3rem 0.45rem; border: 1.5px solid #e0e0e0; border-radius: 6px; font-size: 0.82rem; outline: none; }
        .pres-td-input:focus { border-color: #D62828; }
        .pres-td-cant { width: 50px; }
        .pres-td-precio { width: 85px; }
        .pres-del { background: none; border: none; color: #ccc; font-size: 1rem; cursor: pointer; padding: 0 0.3rem; }
        .pres-del:hover { color: #D62828; }
        .pres-totales { background: #fff; border-radius: 12px; padding: 1.1rem 1.3rem; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
        .pres-total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.9rem; }
        .pres-total-row span { color: #888; font-size: 0.85rem; }
        .pres-total-amt { font-size: 1.7rem; color: #D62828; font-family: 'Playfair Display', serif; }
        .pres-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .pres-btn { padding: 0.55rem 1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; display: flex; align-items: center; gap: 0.4rem; transition: all .15s; }
        .pres-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .pres-btn-limpiar { background: #f5f5f5; color: #666; }
        .pres-btn-limpiar:hover:not(:disabled) { background: #ffe5e5; color: #D62828; }
        .pres-btn-img { background: #1a1a1a; color: #F7B731; }
        .pres-btn-img:hover:not(:disabled) { background: #333; }
        .pres-btn-wa { background: #25D366; color: #fff; flex: 1; justify-content: center; }
        .pres-btn-wa:hover:not(:disabled) { background: #1da851; }
        .pres-watermark-info { background: #fff8e1; border: 1px solid #F7B731; border-radius: 8px; padding: 0.55rem 0.9rem; font-size: 0.82rem; color: #666; }
      `}</style>
    </PublicLayout>
  )
}
