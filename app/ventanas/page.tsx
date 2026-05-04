'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useVendedor } from '@/lib/vendedor-auth'
import CalcWrapper from '@/components/CalcWrapper'

export default function VentanasPage() {
  const { vendedor, loading } = useVendedor()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !vendedor) router.replace('/login')
  }, [loading, vendedor])

  if (loading || !vendedor) return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontFamily: 'sans-serif' }}>
      Verificando acceso...
    </div>
  )

  return <CalcWrapper src="/calc-ventanas.html" title="Calculadora de Ventanas" icon="🪟" />
}
