'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import PublicLayout from '@/components/public/PublicLayout'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const WA_NUMBER = '59897699854'

type Categoria = { id: string; nombre: string; slug: string; orden: number }
type Subcategoria = { id: string; categoria_id: string; nombre: string; slug: string; orden: number }
type Producto = {
  id: string
  subcategoria_id: string | null
  nombre: string
  slug: string
  descripcion: string | null
  precio: number
  unidad: string
  imagen_url: string | null
  activo: boolean
  orden: number
}
type ItemCarrito = { 
  producto: Producto
  cantidad: number 
  precioFinal: number 
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(n)
}

export default function TiendaPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [catActiva, setCatActiva] = useState<string>('todas')
  const [loading, setLoading] = useState(true)
  
  // Estados para Carrito y Persistencia
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const [presupuestoId, setPresupuestoId] = useState<string | null>(null)
  const [presupuestoCodigo, setPresupuestoCodigo] = useState<number | null>(null)

  useEffect(() => {
    async function cargar() {
      const [{ data: cats }, { data: subs }, { data: prods }] = await Promise.all([
        supabase.from('tienda_categorias').select('*').order('orden'),
        supabase.from('tienda_subcategorias').select('*').order('orden'),
        supabase.from('tienda_productos').select('*').eq('activo', true).order('orden'),
      ])
      setCategorias(cats || [])
      setSubcategorias(subs || [])
      setProductos(prods || [])
      
      const saved = localStorage.getItem('rg_cart')
      if (saved) setCarrito(JSON.parse(saved))
      
      setLoading(false)
    }
    cargar()
  }, [])

  // Persistencia de presupuesto en Supabase
  useEffect(() => {
    localStorage.setItem('rg_cart', JSON.stringify(carrito))
    
    const guardarPresupuesto = async () => {
      if (carrito.length === 0) return

      const total = carrito.reduce((acc, i) => acc + i.precioFinal * i.cantidad, 0)
      const dataToSave = { items: carrito, total: total }

      if (presupuestoId) {
        await supabase.from('tienda_presupuestos').update(dataToSave).eq('id', presupuestoId)
      } else {
        const { data } = await supabase.from('tienda_presupuestos').insert([dataToSave]).select().single()
        if (data) {
          setPresupuestoId(data.id)
          setPresupuestoCodigo(data.codigo)
        }
      }
    }

    const timer = setTimeout(guardarPresupuesto, 1500)
    return () => clearTimeout(timer)
  }, [carrito, presupuestoId])

  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      if (catActiva === 'todas') return true
      const sub = subcategorias.find(s => s.id === p.subcategoria_id)
      return sub?.categoria_id === catActiva
    })
  }, [productos, catActiva, subcategorias])

  const cambiarCantidad = (id: string, delta: number) => {
    setCarrito(prev => prev.map(i => 
      i.producto.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i
    ).filter(i => i.cantidad > 0))
  }

  const totalCarrito = carrito.reduce((acc, i) => acc + i.precioFinal * i.cantidad, 0)
  const cantidadTotal = carrito.reduce((acc, i) => acc + i.cantidad, 0)

  const enviarWA = () => {
    const lineas = carrito.map(i => `• ${i.cantidad}x ${i.producto.nombre} — ${fmt(i.precioFinal * i.cantidad)}`).join('\n')
    const ref = presupuestoCodigo ? `\n\n*REF: #${presupuestoCodigo}*` : ''
    const msg = `¡Hola! Me interesa presupuesto por:\n\n${lineas}\n\n*Total estimado: ${fmt(totalCarrito)}*${ref}`
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <PublicLayout>
      <div className="tienda-wrapper">
        <header className="tienda-header">
          <div className="container">
            <span className="badge">PRODUCTOS PREMIUM</span>
            <h1>Catálogo <span className="highlight">RG</span></h1>
          </div>