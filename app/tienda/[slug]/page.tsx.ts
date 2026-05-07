import { createClient } from '@supabase/supabase-js'
import PublicLayout from '@/components/public/PublicLayout'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props {
  params: { slug: string }
}

// SEO Dinámico para Google y Redes Sociales
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: p } = await supabase
    .from('tienda_productos')
    .select('nombre, descripcion, imagen_url')
    .eq('slug', params.slug)
    .single()

  if (!p) return { title: 'Producto no encontrado' }

  return {
    title: `${p.nombre} | Aberturas RG`,
    description: p.descripcion || `Adquiere tu ${p.nombre} en Aberturas RG. Calidad garantizada.`,
    openGraph: {
      title: p.nombre,
      description: p.descripcion || '',
      images: [p.imagen_url || ''],
      type: 'website',
    },
  }
}

export default async function ProductoPage({ params }: Props) {
  const { data: p } = await supabase
    .from('tienda_productos')
    .select('*, tienda_subcategorias(nombre)')
    .eq('slug', params.slug)
    .single()

  if (!p) notFound()

  const fmt = (n: number) => new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(n)

  return (
    <PublicLayout>
      <div className="product-view">
        <div className="container">
          <div className="product-grid">
            <div className="image-side">
              <img src={p.imagen_url || '/placeholder.png'} alt={p.nombre} />
            </div>
            <div className="info-side">
              <nav className="breadcrumb">Tienda / {p.tienda_subcategorias?.nombre}</nav>
              <h1>{p.nombre}</h1>
              <p className="price">{fmt(p.precio)} <small>/ {p.unidad}</small></p>
              <div className="description">
                <h3>Descripción</h3>
                <p>{p.descripcion_larga || p.descripcion}</p>
              </div>
              <a 
                href={`https://wa.me/59897699854?text=${encodeURIComponent(`Hola! Me interesa el producto: ${p.nombre}`)}`}
                target="_blank"
                className="btn-wa-direct"
              >
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>

        <style jsx>{`
          .product-view { padding: 120px 20px 80px; background: #fdfcf9; min-height: 100vh; }
          .container { max-width: 1100px; margin: 0 auto; }
          .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; }
          .image-side img { width: 100%; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
          .breadcrumb { font-size: 0.8rem; color: #999; text-transform: uppercase; margin-bottom: 10px; }
          h1 { font-family: 'Playfair Display', serif; font-size: 3rem; margin: 0; }
          .price { font-size: 2rem; color: #D62828; font-weight: 800; margin: 20px 0; }
          .description h3 { font-size: 1rem; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .btn-wa-direct { 
            display: inline-block; background: #25D366; color: white; padding: 15px 30px; 
            border-radius: 50px; text-decoration: none; font-weight: 700; margin-top: 30px;
          }
          @media (max-width: 800px) { .product-grid { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    </PublicLayout>
  )
}