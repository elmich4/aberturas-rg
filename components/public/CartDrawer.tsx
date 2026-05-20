'use client'

import Link from 'next/link'
import { useCart, CartItem } from '@/lib/cart-context'

function fmt(n: number) {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    maximumFractionDigits: 0,
  }).format(n)
}

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateCantidad,
    clearCart,
    totalItems,
    totalPrecio,
  } = useCart()

  return (
    <>
      <div
        className={`overlay ${isOpen ? 'visible' : ''}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      <aside className={`drawer ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
        <header className="drawer-header">
          <h2>Mi carrito</h2>
          <button className="close-btn" onClick={closeCart} aria-label="Cerrar">
            ×
          </button>
        </header>

        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🛒</div>
              <p>Tu carrito está vacío</p>
              <small>Agregá productos desde el catálogo</small>
            </div>
          ) : (
            <ul className="items">
              {items.map(item => (
                <CartLine
                  key={item.id}
                  item={item}
                  onRemove={() => removeItem(item.id)}
                  onUpdate={n => updateCantidad(item.id, n)}
                />
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="drawer-footer">
            <div className="totales">
              <div className="row">
                <span>Productos</span>
                <span>{totalItems}</span>
              </div>
              <div className="row total">
                <span>Total</span>
                <strong>{fmt(totalPrecio)}</strong>
              </div>
            </div>

            <Link
              href="/checkout"
              className="btn-checkout"
              onClick={closeCart}
            >
              Finalizar pedido →
            </Link>

            <button className="btn-vaciar" onClick={clearCart}>
              Vaciar carrito
            </button>

            <p className="disclaimer">
              Los precios pueden variar según medidas finales y disponibilidad.
              Te confirmamos al contactarte.
            </p>
          </footer>
        )}
      </aside>

      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 998;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        .overlay.visible {
          opacity: 1;
          pointer-events: auto;
        }

        .drawer {
          position: fixed;
          top: 0;
          right: 0;
          width: 100%;
          max-width: 420px;
          height: 100vh;
          background: white;
          z-index: 999;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.3s ease;
          box-shadow: -10px 0 40px rgba(0, 0, 0, 0.15);
        }
        .drawer.open {
          transform: translateX(0);
        }

        .drawer-header {
          padding: 24px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .drawer-header h2 {
          margin: 0;
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #666;
          width: 36px;
          height: 36px;
          line-height: 1;
          padding: 0;
          border-radius: 50%;
        }
        .close-btn:hover {
          background: #f5f5f5;
        }

        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px 24px;
        }

        .empty {
          text-align: center;
          padding: 60px 20px;
          color: #999;
        }
        .empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }
        .empty p {
          font-weight: 600;
          margin: 0 0 8px;
          color: #555;
        }
        .empty small {
          font-size: 0.85rem;
        }

        .items {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .drawer-footer {
          padding: 20px 24px 28px;
          border-top: 1px solid #eee;
          background: #fafafa;
        }
        .totales {
          margin-bottom: 16px;
        }
        .totales .row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 0.95rem;
          color: #555;
        }
        .totales .row.total {
          font-size: 1.2rem;
          color: #111;
          padding-top: 12px;
          border-top: 1px solid #e5e5e5;
          margin-top: 4px;
        }
        .totales .row.total strong {
          color: #d62828;
          font-size: 1.4rem;
        }

        .drawer-footer :global(.btn-checkout) {
          display: block;
          width: 100%;
          background: #d62828;
          color: white;
          padding: 16px;
          border: none;
          border-radius: 50px;
          font-weight: 800;
          font-size: 1.05rem;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(214, 40, 40, 0.3);
          transition: 0.2s;
          text-align: center;
          text-decoration: none;
        }
        .drawer-footer :global(.btn-checkout:hover) {
          background: #a51d1d;
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(214, 40, 40, 0.4);
        }

        .btn-vaciar {
          width: 100%;
          background: none;
          color: #999;
          padding: 12px;
          border: none;
          font-size: 0.85rem;
          cursor: pointer;
          margin-top: 8px;
          text-decoration: underline;
        }
        .btn-vaciar:hover {
          color: #d62828;
        }

        .disclaimer {
          font-size: 0.75rem;
          color: #999;
          margin: 12px 0 0;
          text-align: center;
          line-height: 1.5;
        }
      `}</style>
    </>
  )
}

function CartLine({
  item,
  onRemove,
  onUpdate,
}: {
  item: CartItem
  onRemove: () => void
  onUpdate: (n: number) => void
}) {
  return (
    <li className="line">
      <div className="thumb-wrap">
        <img src={item.imagen_url || '/placeholder.png'} alt={item.nombre} />
      </div>
      <div className="info">
        <h4>{item.nombre}</h4>
        {item.varianteNombre && (
          <span className="variante-tag">{item.varianteNombre}</span>
        )}
        <p className="precio-unit">
          {fmt(item.precio)} <small>/ {item.unidad}</small>
        </p>
        <div className="controls">
          <button onClick={() => onUpdate(item.cantidad - 1)} aria-label="Restar">
            −
          </button>
          <span>{item.cantidad}</span>
          <button onClick={() => onUpdate(item.cantidad + 1)} aria-label="Sumar">
            +
          </button>
          <button className="del" onClick={onRemove} aria-label="Eliminar">
            🗑
          </button>
        </div>
      </div>
      <div className="subtotal">{fmt(item.precio * item.cantidad)}</div>

      <style jsx>{`
        .line {
          display: grid;
          grid-template-columns: 70px 1fr auto;
          gap: 12px;
          padding: 12px;
          background: white;
          border-radius: 14px;
          border: 1px solid #f0f0f0;
        }
        .thumb-wrap {
          width: 70px;
          height: 70px;
          background: #f5f5f5;
          border-radius: 12px;
          overflow: hidden;
          padding: 4px;
        }
        .thumb-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
          display: block;
        }
        .info h4 {
          margin: 0 0 4px;
          font-size: 0.95rem;
          color: #111;
          line-height: 1.3;
        }
        .variante-tag {
          display: inline-block;
          background: #fef2f2;
          color: #d62828;
          padding: 2px 8px;
          border-radius: 50px;
          font-size: 0.7rem;
          font-weight: 700;
          margin-bottom: 6px;
          letter-spacing: 0.3px;
        }
        .precio-unit {
          font-size: 0.8rem;
          color: #888;
          margin: 0 0 8px;
        }
        .controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .controls button {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.9rem;
        }
        .controls button:hover {
          background: #f5f5f5;
        }
        .controls span {
          min-width: 24px;
          text-align: center;
          font-weight: 700;
        }
        .controls .del {
          margin-left: auto;
          border-color: transparent;
          color: #999;
          font-size: 0.8rem;
        }
        .controls .del:hover {
          background: #fef2f2;
          color: #d62828;
        }
        .subtotal {
          font-weight: 800;
          color: #d62828;
          align-self: center;
          font-size: 0.95rem;
          white-space: nowrap;
        }
      `}</style>
    </li>
  )
}
