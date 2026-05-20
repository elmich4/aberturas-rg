import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { codigo, nombre, apellido, telefono, direccion, notas, items, total } = body

    const resendKey = process.env.RESEND_API_KEY
    const notifyEmail = process.env.NOTIFY_EMAIL

    if (!resendKey || !notifyEmail) {
      console.warn('Email no configurado — pedido guardado solo en Supabase')
      return NextResponse.json({ ok: true, email: false })
    }

    const lineasItems = items
      .map(
        (i: any) =>
          `• ${i.nombre}${i.varianteNombre ? ` (${i.varianteNombre})` : ''} x${i.cantidad} — $${(i.subtotal || i.precio * i.cantidad).toLocaleString('es-UY')}`
      )
      .join('\n')

    const totalFmt = `$${Number(total).toLocaleString('es-UY')}`

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: 'Aberturas RG <onboarding@resend.dev>',
        to: [notifyEmail],
        subject: `🛒 Nuevo pedido #${codigo} — ${nombre} ${apellido}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#111;color:white;padding:24px;border-radius:12px 12px 0 0;">
              <h1 style="margin:0;font-size:22px;">Nuevo pedido #${codigo}</h1>
            </div>
            <div style="padding:24px;background:#f9f9f9;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
              <h3 style="color:#d62828;margin-top:0;">Datos del cliente</h3>
              <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                <tr><td style="padding:6px 0;color:#888;width:120px;">Nombre</td><td style="padding:6px 0;font-weight:600;">${nombre} ${apellido}</td></tr>
                <tr><td style="padding:6px 0;color:#888;">Teléfono</td><td style="padding:6px 0;font-weight:600;">${telefono}</td></tr>
                <tr><td style="padding:6px 0;color:#888;">Dirección</td><td style="padding:6px 0;font-weight:600;">${direccion}</td></tr>
                ${notas ? `<tr><td style="padding:6px 0;color:#888;">Notas</td><td style="padding:6px 0;">${notas}</td></tr>` : ''}
              </table>
              <h3 style="color:#d62828;">Productos</h3>
              <pre style="background:white;padding:16px;border-radius:8px;border:1px solid #eee;font-size:14px;line-height:1.8;white-space:pre-wrap;">${lineasItems}</pre>
              <div style="margin-top:16px;padding:16px;background:white;border-radius:8px;border:1px solid #eee;text-align:right;">
                <span style="font-size:14px;color:#888;">Total: </span>
                <strong style="font-size:22px;color:#d62828;">${totalFmt}</strong>
              </div>
              <div style="margin-top:24px;text-align:center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://aberturasrg.com.uy'}/admin/pedidos" style="display:inline-block;background:#111;color:white;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:600;font-size:14px;">
                  Ver en panel de admin →
                </a>
              </div>
            </div>
          </div>
        `,
      }),
    })

    if (!emailRes.ok) {
      const errBody = await emailRes.text()
      console.error('Error enviando email:', errBody)
      return NextResponse.json({ ok: true, email: false, error: errBody })
    }

    return NextResponse.json({ ok: true, email: true })
  } catch (e: any) {
    console.error('Error en /api/pedidos/notificar:', e)
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
