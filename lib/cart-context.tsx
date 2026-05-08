'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type CartItem = {
  id: string                       // identificador único en el carrito (productoId + varianteId)
  productoId: string                // id real del producto en Supabase
  varianteId: string | null         // id de la variante elegida (null si el producto no tiene variantes)
  varianteNombre: string | null     // ej "1.00 x 1.00", "Negro"
  slug: string
  nombre: string
  precio: number
  unidad: string
  imagen_url: string
  cantidad: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'cantidad' | 'id'>, cantidad?: number) => void
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

// Bumpeo la versión del storage porque el modelo cambió y los items viejos
// no tienen productoId/varianteId. Si alguien tiene carrito viejo se descarta.
const STORAGE_KEY = 'rg_cart_v2'

function buildItemId(productoId: string, varianteId: string | null) {
  return varianteId ? `${productoId}::${varianteId}` : productoId
}

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
        if (Array.isArray(parsed)) {
          // Filtro defensivo: si por algún motivo hay items malformados, los descarto
          const validos = parsed.filter(
            (i: any) =>
              i &&
              typeof i.id === 'string' &&
              typeof i.productoId === 'string' &&
              typeof i.precio === 'number'
          )
          setItems(validos)
        }
      }
      // Limpiar versión vieja si existía
      localStorage.removeItem('rg_cart_v1')
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

  const addItem = (
    item: Omit<CartItem, 'cantidad' | 'id'>,
    cantidad = 1
  ) => {
    const itemId = buildItemId(item.productoId, item.varianteId)
    setItems(prev => {
      const existente = prev.find(i => i.id === itemId)
      if (existente) {
        return prev.map(i =>
          i.id === itemId ? { ...i, cantidad: i.cantidad + cantidad } : i
        )
      }
      return [...prev, { ...item, id: itemId, cantidad }]
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
