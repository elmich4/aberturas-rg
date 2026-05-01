'use client'
import { useAuth } from '@/lib/auth'
import { useEffect, useRef } from 'react'

export default function Page() {
  const { vendedor, perfilActivo } = useAuth()
  const perfil = perfilActivo
  const nombre = encodeURIComponent(perfil?.nombre || 'Aberturas RG')
  const tel = encodeURIComponent(perfil?.telefono || '097 699 854')
  const tipo = vendedor ? 'vendedor' : 'cliente'
  const src = `/calc-yeso.html?session=${tipo}&nombre=${nombre}&tel=${tel}`

  return (
    <iframe
      src={src}
      style={{
        width: '100%',
        height: '100svh',
        border: 'none',
        display: 'block',
      }}
      title="yeso"
    />
  )
}
