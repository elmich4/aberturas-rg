'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type CartItem = {
  id: string         // id del producto en Supabase
  slug: string
  nombre: string
  precio: number
  unidad: string
  imagen_url: string
  cantidad: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'cantidad'>, cantidad?: number) => void
  removeItem: (id: string) => void
  updateCantidad: (id: string, cantidad: number) => void
  clearCart: () => void
  totalItems: number
  totalPrecio: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'rg_cart_v1'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Cargar de localStorage al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setItems(parsed)
      }
    } catch (e) {
      console.warn('No se pudo leer carrito de localStorage', e)
    }
    setHydrated(true)
  }, [])

  // Persistir cambios
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.warn('No se pudo guardar carrito en localStorage', e)
    }
  }, [items, hydrated])

  const addItem = (item: Omit<CartItem, 'cantidad'>, cantidad = 1) => {
    setItems(prev => {
      const existente = prev.find(i => i.id === item.id)
      if (existente) {
        return prev.map(i =>
          i.id === item.id ? { ...i, cantidad: i.cantidad + cantidad } : i
        )
      }
      return [...prev, { ...item, cantidad }]
    })
    setIsOpen(true) // abrir drawer al agregar
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const updateCantidad = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(id)
      return
    }
    setItems(prev => prev.map(i => (i.id === id ? { ...i, cantidad } : i)))
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0)
  const totalPrecio = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateCantidad,
        clearCart,
        totalItems,
        totalPrecio,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        toggleCart: () => setIsOpen(o => !o),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
