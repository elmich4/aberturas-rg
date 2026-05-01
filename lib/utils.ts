// ── Formatting ──
export function fmt(n: number) {
  return '$' + Math.round(n).toLocaleString('es-UY')
}

export function fmtNum(n: number, dec = 2) {
  return n.toLocaleString('es-UY', { maximumFractionDigits: dec })
}

// ── WhatsApp ──
export function enviarWA(phone: string, msg: string) {
  const clean = phone.replace(/\D/g, '')
  const num = clean.startsWith('598') ? clean : '598' + clean
  window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(msg), '_blank')
}

// ── Save presupuesto ──
export async function guardarPresupuesto(data: {
  vendedor_id?: string | null
  tipo: string
  titulo?: string
  cliente?: string
  datos: Record<string, unknown>
  total?: number
  perfil_nombre?: string
  perfil_telefono?: string
}) {
  try {
    const res = await fetch('/api/presupuestos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.presupuesto
  } catch { return null }
}

// ── Copy image to clipboard ──
export async function copiarImagen(el: HTMLElement): Promise<boolean> {
  try {
    // Dynamically import html2canvas
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(el, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    })
    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'))
    if (!blob) return false
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      return true
    } catch {
      // Fallback: download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'presupuesto-rg.png'; a.click()
      URL.revokeObjectURL(url)
      return true
    }
  } catch { return false }
}
