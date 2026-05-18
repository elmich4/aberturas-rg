import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aberturasrg.com.uy'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
      {
        userAgent: 'Facebot',
        allow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/login'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
