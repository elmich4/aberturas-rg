'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import PublicLayout from '@/components/public/PublicLayout'
import Link from 'next/link'

function ConfirmacionContent() {
  const searchParams = useSearchParams()
  const codigo = searchParams.get('codigo')

  return (
    <PublicLayout>
      <section className="confirm-section">
        <div className="confirm-box">
          <div className="check-circle">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1>¡Pedido confirmado!</h1>

          {codigo && (
            <div className="codigo-box">
              <span className="codigo-label">N° de pedido</span>
              <span className="codigo">#{codigo}</span>
            </div>
          )}

          <p className="msg">
            Tu pedido fue registrado correctamente. Nos vamos a comunicar con vos 
            por teléfono para coordinar el pago y la entrega.
          </p>

          <div className="pasos">
            <div className="paso">
              <div className="paso-num">1</div>
              <div>
                <strong>Pedido registrado</strong>
                <p>Recibimos tu pedido y lo estamos revisando</p>
              </div>
            </div>
            <div className="paso">
              <div className="paso-num">2</div>
              <div>
                <strong>Te contactamos</strong>
                <p>Te llamamos para confirmar detalles y coordinar el pago</p>
              </div>
            </div>
            <div className="paso">
              <div className="paso-num">3</div>
              <div>
                <strong>Entrega</strong>
                <p>Coordinamos fecha y horario de entrega o retiro</p>
              </div>
            </div>
          </div>

          <div className="actions">
            <Link href="/tienda" className="btn-primary">
              Seguir comprando
            </Link>
            <Link href="/" className="btn-secondary">
              Ir al inicio
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .confirm-section {
          padding: 100px 24px 120px;
          background: #f9f9f9;
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .confirm-box {
          max-width: 520px;
          margin: 0 auto;
          text-align: center;
          background: white;
          border-radius: 24px;
          padding: 48px 36px;
          border: 1px solid #eee;
          box-shadow: 0 10px 40px rgba(0,0,0,0.06);
        }
        .check-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #f0fdf4;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          border: 2px solid #bbf7d0;
        }
        .confirm-box h1 {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          color: #1a1a1a;
          margin: 0 0 20px;
        }

        .codigo-box {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          background: #fafafa;
          border: 1.5px solid #e5e5e5;
          border-radius: 14px;
          padding: 12px 28px;
          margin-bottom: 24px;
        }
        .codigo-label {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #999;
        }
        .codigo {
          font-size: 1.8rem;
          font-weight: 900;
          color: #d62828;
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 1px;
        }

        .msg {
          font-size: 1rem;
          color: #666;
          line-height: 1.7;
          margin: 0 0 32px;
        }

        .pasos {
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }
        .paso {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }
        .paso-num {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #111;
          color: white;
          font-weight: 800;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .paso strong {
          display: block;
          font-size: 0.92rem;
          color: #1a1a1a;
          margin-bottom: 2px;
        }
        .paso p {
          font-size: 0.83rem;
          color: #888;
          margin: 0;
          line-height: 1.5;
        }

        .actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .actions :global(.btn-primary) {
          background: #d62828;
          color: white;
          padding: 14px 28px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.95rem;
          transition: 0.2s;
        }
        .actions :global(.btn-primary:hover) {
          background: #a51d1d;
          transform: translateY(-2px);
        }
        .actions :global(.btn-secondary) {
          background: transparent;
          color: #555;
          padding: 14px 28px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          border: 1.5px solid #ddd;
          transition: 0.2s;
        }
        .actions :global(.btn-secondary:hover) {
          border-color: #999;
          color: #1a1a1a;
        }
      `}</style>
    </PublicLayout>
  )
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={
      <PublicLayout>
        <div style={{ padding: 120, textAlign: 'center', color: '#999' }}>Cargando...</div>
      </PublicLayout>
    }>
      <ConfirmacionContent />
    </Suspense>
  )
}
