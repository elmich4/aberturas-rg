'use client'
import { useState } from 'react'

const GOOGLE_PROFILE_URL = 'https://share.google/FC3IYu5QoVOJjHYa3'

const RESENAS = [
  {
    nombre: 'ro martinez',
    inicial: 'R',
    color: '#F7B731',
    estrellas: 5,
    tiempo: 'Hace un mes',
    texto: 'Tenían en stock las ventanas que necesitaba, rápido, buen precio, excelente.',
  },
  {
    nombre: 'Melany Moreno',
    inicial: 'M',
    color: '#2563eb',
    estrellas: 5,
    tiempo: 'Hace 3 meses',
    texto: 'Buenas tardes, la verdad exelente las placas OSB y puertas bien de bien, también el envío barato y la atención exelente, buena cordinacion, comunicación y el fletero 10/10, recomiendo 100% lo mejor es la puntualidad.',
  },
  {
    nombre: 'Dc Cd',
    inicial: 'D',
    color: '#059669',
    estrellas: 5,
    tiempo: 'Hace 4 meses',
    texto: 'Un éxito la compra! Super rápido, bueno asesoramiento, buena calidad de verdad muy contento recomiendo %100%. Muchas gracias!!!',
  },
  {
    nombre: 'Andrés Perez',
    inicial: 'A',
    color: '#D62828',
    estrellas: 5,
    tiempo: 'Hace 5 meses',
    texto: 'Excelente todo muchas gracias, muy buena atención.',
  },
  {
    nombre: 'Alejandra Diaz',
    inicial: 'AL',
    color: '#7c3aed',
    estrellas: 5,
    tiempo: 'Hace 6 meses',
    texto: 'Muy buena la atención, muy recomendable y ni q hablar los chicos q entregan los pedidos muy prolijos, la verdad muchas gracias una vez más.',
  },
  {
    nombre: 'Andrea Pintos González',
    inicial: 'AP',
    color: '#0891b2',
    estrellas: 5,
    tiempo: 'Hace 7 meses',
    texto: 'Hola soy Andrea y en el día de ayer compre una puerta ventana con rejas, me llegó en hora y tiempo acordado la miré de punta a punta y la verdad todo impecable muy agradecida con ellos. Muchas gracias.',
  },
  {
    nombre: 'Alexandra Suárez',
    inicial: 'AS',
    color: '#d97706',
    estrellas: 4,
    tiempo: 'Hace 7 meses',
    texto: 'Todo muy bien!! Compra segura y sin ningún problema! Altamente recomendado!',
  },
]

function Estrellas({ n }: { n: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= n ? '#F7B731' : '#ddd'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

export default function Resenas() {
  const [expandida, setExpandida] = useState<number | null>(null)
  const promedio = (RESENAS.reduce((s, r) => s + r.estrellas, 0) / RESENAS.length).toFixed(1)

  return (
    <section className="resenas-section">
      {/* Header */}
      <div className="resenas-header">
        <div className="resenas-header-left">
          <div className="google-badge">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Opiniones en Google
          </div>
          <div className="resenas-score">
            <span className="resenas-numero">{promedio}</span>
            <div>
              <Estrellas n={5} />
              <span className="resenas-count">+50 reseñas en Google</span>
            </div>
          </div>
        </div>
        <a
          href={GOOGLE_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-dejar-resena"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Dejar mi reseña
        </a>
      </div>

      {/* Cards */}
      <div className="resenas-grid">
        {RESENAS.map((r, i) => {
          const larga = r.texto.length > 120
          const abierta = expandida === i
          return (
            <div key={i} className="resena-card">
              <div className="resena-top">
                <div className="resena-avatar" style={{ background: r.color }}>{r.inicial}</div>
                <div className="resena-meta">
                  <span className="resena-nombre">{r.nombre}</span>
                  <span className="resena-tiempo">{r.tiempo}</span>
                </div>
                <div className="resena-google-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
              </div>
              <Estrellas n={r.estrellas} />
              <p className="resena-texto">
                {larga && !abierta ? r.texto.slice(0, 120) + '…' : r.texto}
                {larga && (
                  <button className="resena-ver-mas" onClick={() => setExpandida(abierta ? null : i)}>
                    {abierta ? ' ver menos' : ' ver más'}
                  </button>
                )}
              </p>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <div className="resenas-cta">
        <p>¿Ya compraste con nosotros? Tu opinión nos ayuda a seguir mejorando.</p>
        <a href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="btn-cta-google">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Escribir una reseña en Google
        </a>
      </div>

      <style jsx>{`
        .resenas-section {
          background: #f8f7f4;
          padding: 5rem 1.5rem;
        }

        .resenas-header {
          max-width: 1100px;
          margin: 0 auto 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .resenas-header-left { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }

        .google-badge {
          display: flex; align-items: center; gap: 6px;
          background: #fff;
          border: 1.5px solid #e8e4df;
          border-radius: 20px;
          padding: 5px 14px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #444;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        .resenas-score { display: flex; align-items: center; gap: 10px; }
        .resenas-numero {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1;
        }
        .resenas-count { font-size: 0.78rem; color: #888; display: block; margin-top: 3px; }

        .btn-dejar-resena {
          display: flex; align-items: center; gap: 7px;
          background: #1a1a1a;
          color: #fff;
          text-decoration: none;
          padding: 0.65rem 1.3rem;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 600;
          transition: background 0.15s, transform 0.1s;
          white-space: nowrap;
        }
        .btn-dejar-resena:hover { background: #D62828; transform: translateY(-1px); }

        .resenas-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 1rem;
        }

        .resena-card {
          background: #fff;
          border-radius: 14px;
          padding: 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          border: 1.5px solid #f0ede8;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .resena-card:hover {
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .resena-top { display: flex; align-items: center; gap: 0.7rem; }
        .resena-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem; font-weight: 700; color: #fff;
          flex-shrink: 0;
        }
        .resena-meta { flex: 1; min-width: 0; }
        .resena-nombre { display: block; font-size: 0.88rem; font-weight: 700; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .resena-tiempo { font-size: 0.75rem; color: #aaa; }
        .resena-google-icon { flex-shrink: 0; }

        .resena-texto {
          font-size: 0.875rem;
          color: #555;
          line-height: 1.6;
          margin: 0;
        }
        .resena-ver-mas {
          background: none; border: none; color: #D62828;
          font-size: 0.82rem; font-weight: 600; cursor: pointer;
          padding: 0; margin-left: 2px;
        }
        .resena-ver-mas:hover { text-decoration: underline; }

        .resenas-cta {
          max-width: 1100px;
          margin: 2.5rem auto 0;
          background: #1a1a1a;
          border-radius: 14px;
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .resenas-cta p { color: #aaa; font-size: 0.9rem; margin: 0; }

        .btn-cta-google {
          display: flex; align-items: center; gap: 8px;
          background: #fff;
          color: #1a1a1a;
          text-decoration: none;
          padding: 0.65rem 1.3rem;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 700;
          white-space: nowrap;
          transition: all 0.15s;
        }
        .btn-cta-google:hover { background: #f5f5f5; transform: translateY(-1px); }

        @media (max-width: 600px) {
          .resenas-header { flex-direction: column; align-items: flex-start; }
          .resenas-cta { flex-direction: column; text-align: center; }
          .btn-cta-google { width: 100%; justify-content: center; }
        }
      `}</style>
    </section>
  )
}
