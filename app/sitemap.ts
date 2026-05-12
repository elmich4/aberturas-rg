import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aberturas-rg.vercel.app'

export default async function sitemap() {
  // Páginas estáticas
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${BASE_URL}/tienda`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${BASE_URL}/trabajos`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/contacto`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
  ]

  // Productos de la tienda
  const { data: productos } = await supabase
    .from('tienda_productos')
    .select('slug, updated_at')
    .eq('activo', true)

  const productPages = (productos || []).map(p => ({
    url: `${BASE_URL}/tienda/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Posts del blog
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('publicado', true)

  const blogPages = (posts || []).map(p => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...productPages, ...blogPages]
}
