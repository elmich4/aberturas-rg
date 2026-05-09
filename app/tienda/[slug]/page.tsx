import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import ProductoDetalleClient from './ProductoDetalleClient'

// ── Supabase server-side (no expone al browser) ──
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SITE_URL = 'https://aberturas-rg.vercel.app'

// ── ISR: revalidar cada 60 seg ──
// Productos nuevos se generan on-demand y se cachean automáticamente.
export const revalidate = 60
export const dynamicParams = true

// ── Pre-generar páginas de productos existentes al build ──
export async function generateStaticParams() {
  const { data } = await supabase
    .from('tienda_productos')
    .select('slug')
    .eq('activo', true)

  return (data || []).map(p => ({ slug: p.slug }))
}

// ── Helpers ──
async function getProducto(slug: string) {
  const { data, error } = await supabase
    .from('tienda_productos')
    .select('*, tienda_subcategorias(nombre)')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data
}

async function getVariantes(productoId: string) {
  const { data } = await supabase
    .from('tienda_producto_variantes')
    .select('*')
    .eq('producto_id', productoId)
    .eq('activo', true)
    .order('orden')

  return (data || []).map((v: any) => ({
    id: v.id,
    nombre: v.nombre,
    precio: Number(v.precio),
    orden: v.orden ?? 0,
  }))
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    maximumFractionDigits: 0,
  }).format(n)
}

// ── Metadata dinámica (título, descripción, OG image) ──
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const producto = await getProducto(slug)

  if (!producto) {
    return {
      title: 'Producto no encontrado',
    }
  }

  const titulo = producto.nombre
  const descripcion =
    producto.descripcion ||
    producto.descripcion_larga?.slice(0, 155) ||
    `${producto.nombre} — Comprá online en Aberturas RG Uruguay.`

  const ogImage = producto.imagen_url || `${SITE_URL}/og-image.jpg`
  const urlProducto = `${SITE_URL}/tienda/${producto.slug}`

  return {
    title: titulo,
    description: descripcion,
    alternates: {
      canonical: urlProducto,
    },
    openGraph: {
      title: `${titulo} — Aberturas RG`,
      description: descripcion,
      url: urlProducto,
      type: 'website',
      locale: 'es_UY',
      siteName: 'Aberturas RG',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: titulo,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${titulo} — Aberturas RG`,
      description: descripcion,
      images: [ogImage],
    },
  }
}

// ── Page (Server Component) ──
export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const producto = await getProducto(slug)

  if (!producto) {
    notFound()
  }

  const variantes = await getVariantes(producto.id)

  // Calcular precio mínimo para Schema.org
  const precioMin =
    variantes.length > 0
      ? Math.min(...variantes.map((v: any) => v.precio))
      : producto.precio

  // Schema.org — Product (ayuda a Google a mostrar precio en resultados)
  const schemaProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: producto.nombre,
    description:
      producto.descripcion ||
      producto.descripcion_larga?.slice(0, 300) ||
      producto.nombre,
    image: producto.imagen_url || undefined,
    url: `${SITE_URL}/tienda/${producto.slug}`,
    brand: {
      '@type': 'Brand',
      name: 'Aberturas RG',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'UYU',
      price: precioMin,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Aberturas RG',
      },
    },
    ...(producto.tienda_subcategorias?.nombre && {
      category: producto.tienda_subcategorias.nombre,
    }),
  }

  // Serializar los datos para pasarle al Client Component
  const productoData = {
    id: producto.id,
    nombre: producto.nombre,
    slug: producto.slug,
    descripcion: producto.descripcion,
    descripcion_larga: producto.descripcion_larga,
    precio: producto.precio,
    unidad: producto.unidad,
    imagen_url: producto.imagen_url,
    imagenes: Array.isArray(producto.imagenes) ? producto.imagenes : [],
    especificaciones: producto.especificaciones || {},
    subcategoriaNombre: producto.tienda_subcategorias?.nombre || 'General',
  }

  return (
    <>
      {/* Schema.org Product */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaProduct) }}
      />

      {/* Client Component con toda la interactividad */}
      <ProductoDetalleClient producto={productoData} variantes={variantes} />
    </>
  )
}
