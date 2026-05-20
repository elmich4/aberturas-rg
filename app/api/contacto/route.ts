import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { nombre, telefono, mensaje } = await req.json()

    if (!nombre?.trim() || !telefono?.trim() || !mensaje?.trim()) {
      return NextResponse.json({ ok: false, error: 'Faltan campos' }, { status: 400 })
    }

    // Guardar en Supabase
    await supabase.from('contacto_mensajes').insert({
      nombre,
      telefono,
      mensaje,
    })

    // Enviar email si está configurado
    const resendKey = process.env.RESEND_API_KEY
    const notifyEmail = process.env.NOTIFY_EMAIL

    if (resendKey && notifyEmail) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: 'Aberturas RG <onboarding@resend.dev>',
          to: [notifyEmail],
          subject: `✉️ Nueva consulta de ${nombre}`,
          html: `
            <div style="font-family:sans-serif;max-width:500px;margin:0 auto;">
              <div style="background:#111;color:white;padding:20px;border-radius:12px 12px 0 0;">
                <h2 style="margin:0;font-size:18px;">Nueva consulta web</h2>
              </div>
              <div style="padding:20px;background:#f9f9f9;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
                <p><strong>Nombre:</strong> ${nombre}</p>
                <p><strong>Teléfono:</strong> ${telefono}</p>
                <p><strong>Mensaje:</strong></p>
                <div style="background:white;padding:14px;border-radius:8px;border:1px solid #eee;white-space:pre-wrap;">${mensaje}</div>
              </div>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Error en /api/contacto:', e)
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
