import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { VendedorProvider } from '@/lib/vendedor-auth'
import { CartProvider } from '@/lib/cart-context'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aberturasrg.com.uy'
const SITE_NAME = 'Aberturas RG'
const SITE_DESC = 'Ventanas, puertas, rejas y cielorrasos a medida en Uruguay. Serie 20 y 25, PVC, Durlock. Instalación profesional en Montevideo y todo el país. Presupuesto online al instante.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Aberturas RG — Ventanas y Puertas a Medida en Uruguay',
    template: '%s · Aberturas RG Uruguay',
  },
  description: SITE_DESC,
  keywords: [
    'aberturas uruguay', 'ventanas pvc uruguay', 'ventanas aluminio montevideo',
    'puertas a medida uruguay', 'rejas seguridad montevideo', 'cielorraso pvc uruguay',
    'durlock montevideo', 'yeso uruguay', 'ventanas serie 20', 'ventanas serie 25',
    'aberturas montevideo', 'presupuesto ventanas uruguay', 'instalacion ventanas uruguay',
    'aberturas rg', 'mejor precio ventanas uruguay',
  ],
  authors: [{ name: 'Aberturas RG', url: SITE_URL }],
  creator: 'Aberturas RG',
  publisher: 'Aberturas RG',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_UY',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Aberturas RG — Ventanas y Puertas a Medida en Uruguay',
    description: SITE_DESC,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Aberturas RG — Ventanas y Puertas a Medida en Uruguay',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aberturas RG — Ventanas y Puertas a Medida en Uruguay',
    description: SITE_DESC,
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: 'ri0bDIRFHRtR75xf-FfkDqiCwpLJEuCviCtplg2rVlk',
  },
  category: 'business',
}

// Schema.org — Negocio local (muy importante para SEO local Uruguay)
const schemaLocalBusiness = {
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  name: 'Aberturas RG',
  description: SITE_DESC,
  url: SITE_URL,
  telephone: '+598-097-699-854',
  email: 'contacto@aberturasrg.com.uy',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Montevideo',
    addressCountry: 'UY',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -34.9011,
    longitude: -56.1645,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
  ],
  priceRange: '$$',
  currenciesAccepted: 'UYU',
  paymentAccepted: 'Cash, Transfer',
  areaServed: {
    '@type': 'Country',
    name: 'Uruguay',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Productos y servicios',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Ventanas PVC y Aluminio a medida' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Puertas a medida' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Rejas de seguridad' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Cielorraso PVC' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Yeso y Durlock' } },
    ],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '50',
    bestRating: '5',
  },
  sameAs: [
    'https://share.google/FC3IYu5QoVOJjHYa3',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-UY">
      <head>
        {/* Fuentes */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@400;500;600&family=Barlow+Condensed:wght@600;700&family=Bebas+Neue&display=swap" rel="stylesheet" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Schema.org negocio local */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaLocalBusiness) }}
        />

        {/* Google AdSense — descomentar cuando tengas cuenta aprobada */}
        {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossOrigin="anonymous" /> */}
      </head>
      <body>
        <AuthProvider>
          <VendedorProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </VendedorProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
