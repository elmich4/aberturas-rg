'use client'

import { useRouter } from 'next/navigation'
import PublicLayout from '@/components/public/PublicLayout'

export default function ProductoNotFound() {
  const router = useRouter()

  return (
    <PublicLayout>
      <div
        style={{
          padding: '150px 20px',
          textAlign: 'center',
          minHeight: '60vh',
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2rem',
            marginBottom: 16,
            color: '#1a1a1a',
          }}
        >
          Producto no encontrado
        </h2>
        <p style={{ color: '#888', marginBottom: 24 }}>
          Este producto no existe o fue dado de baja.
        </p>
        <button
          onClick={() => router.push('/tienda')}
          style={{
            background: '#d62828',
            color: 'white',
            border: 'none',
            padding: '12px 28px',
            borderRadius: 50,
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Volver a la tienda
        </button>
      </div>
    </PublicLayout>
  )
}
