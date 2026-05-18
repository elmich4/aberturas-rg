import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const ua = request.headers.get('user-agent') || ''
  
  // Detect Facebook/Meta bots
  const isFacebookBot = /facebookexternalhit|Facebot|FacebookBot/i.test(ua)
  
  if (isFacebookBot) {
    const url = request.nextUrl.clone()
    const fullUrl = url.href
    
    // Serve minimal HTML with meta tags for Facebook
    const html = `<!DOCTYPE html>
<html lang="es-UY">
<head>
  <meta charset="utf-8" />
  <title>Aberturas RG — Ventanas y Puertas a Medida en Uruguay</title>
  <meta name="description" content="Ventanas, puertas, rejas y cielorrasos a medida en Uruguay. Serie 20 y 25, PVC, Durlock. Instalación profesional en Montevideo y todo el país. Presupuesto online al instante." />
  <meta name="facebook-domain-verification" content="86aynmxqawa9biur2us8u7iyb8n43u" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="es_UY" />
  <meta property="og:url" content="${fullUrl}" />
  <meta property="og:site_name" content="Aberturas RG" />
  <meta property="og:title" content="Aberturas RG — Ventanas y Puertas a Medida en Uruguay" />
  <meta property="og:description" content="Ventanas, puertas, rejas y cielorrasos a medida en Uruguay. Serie 20 y 25, PVC, Durlock. Instalación profesional en Montevideo y todo el país. Presupuesto online al instante." />
  <meta property="og:image" content="https://www.aberturasrg.com.uy/og-image.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Aberturas RG — Ventanas y Puertas a Medida en Uruguay" />
  <link rel="canonical" href="https://www.aberturasrg.com.uy/" />
</head>
<body></body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/tienda/:path*', '/trabajos', '/blog', '/contacto'],
}
