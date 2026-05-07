'use client'

import { useCart } from '@/lib/cart-context'

export default function CartButton() {
  const { totalItems, openCart } = useCart()

  if (totalItems === 0) return null

  return (
    <button className="cart-fab" onClick={openCart} aria-label="Abrir carrito">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      <span className="badge">{totalItems}</span>

      <style jsx>{`
        .cart-fab {
          position: fixed;
          bottom: 100px;
          right: 24px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #111;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          z-index: 990;
          transition: transform 0.2s;
        }
        .cart-fab:hover {
          transform: scale(1.05);
          background: #d62828;
        }
        .badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #d62828;
          color: white;
          font-size: 0.75rem;
          font-weight: 800;
          min-width: 22px;
          height: 22px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 6px;
          border: 2px solid white;
        }
        .cart-fab:hover .badge {
          background: #111;
        }
      `}</style>
    </button>
  )
}
