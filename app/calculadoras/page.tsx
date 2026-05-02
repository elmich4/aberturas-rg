'use client'
import Link from 'next/link'
import PublicLayout from '@/components/public/PublicLayout'

const CALCS = [
  {
    href: '/ventanas',
    icon: '🪟',
    title: 'Ventanas & Aberturas',
    desc: 'Serie 20, Serie 25, Módena, Colonial, Guillotina. Con persiana, reja y mosquitero. Precio por medida exacta.',
    tags: ['Serie 20', 'Serie 25', 'Monoblock', 'Rejas', 'Persianas'],
    color: '#D62828',
  },
  {
    href: '/cielorraso',
    icon: '🏠',
    title: 'Cielorraso PVC',
    desc: 'Calcula tablillas, perfilería, fijaciones e insulación. Optimización de placa incluida.',
    tags: ['Tablilla 6–10mm', 'Perfilería', 'Insulación', 'Accesorios'],
    color: '#2563eb',
  },
  {
    href: '/yeso',
    icon: '🏗️',
    title: 'Yeso / Durlock',
    desc: 'Cielorraso, tabique y revestimiento Omega. Placas, perfiles, masilla y cintas.',
    tags: ['Cielorraso', 'Tabique', 'Omega', 'Durlock'],
    color: '#7c3aed',
  },
  {
    href: '/presupuesto',
    icon: '💰',
    title: 'Presupuesto General',
    desc: 'Armá un presupuesto combinado con todos los productos. Exportá con marca de agua o enviá por WhatsApp.',
    tags: ['Multi-producto', 'Exportar PNG', 'WhatsApp', 'Marca de agua'],
    color: '#059669',
  },
  {
    href: '/mapa',
    icon: '📍',
    title: 'Mapa de Fletes',
    desc: 'Consultá el costo de entrega según tu zona en Montevideo y alrededores.',
    tags: ['Montevideo', 'Interior', 'Zonas', 'Entrega'],
    color: '#d97706',
  },
]

export default function CalculadorasPage() {
  return (
    <PublicLayout>
      <div className="hub-wrapper">
        <div className="hub-hero">
          <div className="hub-hero-inner">
            <div className="hub-hero-badge">🧮 Calculadoras</div>
            <h1>Calculá tu presupuesto<br /><span>al instante</span></h1>
            <p>Herramientas gratuitas para cotizar ventanas, cielorrasos, yeso y más.<br />Sin registrarte. Sin esperar.</p>
          </div>
        </div>

        <div className="hub-body">
          <div className="hub-grid">
            {CALCS.map(calc => (
              <Link key={calc.href} href={calc.href} className="calc-card" style={{ '--accent': calc.color } as React.CSSProperties}>
                <div className="calc-card-top">
                  <div className="calc-icon">{calc.icon}</div>
                  <div className="calc-arrow">→</div>
                </div>
                <h2>{calc.title}</h2>
                <p>{calc.desc}</p>
                <div className="calc-tags">
                  {calc.tags.map(tag => (
                    <span key={tag} className="calc-tag">{tag}</span>
                  ))}
                </div>
                <div className="calc-cta">Abrir calculadora →</div>
              </Link>
            ))}
          </div>

          <div className="hub-note">
            <div className="hub-note-inner">
              <span>¿Necesitás una medida especial o un presupuesto definitivo?</span>
              <a href="https://wa.me/59897699854?text=Hola%2C%20quiero%20consultar%20un%20presupuesto" target="_blank" rel="noopener noreferrer">
                Escribinos por WhatsApp 📱
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hub-wrapper { min-height: 100vh; background: #f8f7f4; }
        .hub-hero {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
          padding: 4rem 1.5rem 3.5rem;
          position: relative; overflow: hidden;
        }
        .hub-hero::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #D62828, #F7B731, #D62828);
        }
        .hub-hero-inner { max-width: 700px; margin: 0 auto; text-align: center; }
        .hub-hero-badge {
          display: inline-block; background: rgba(247,183,49,0.15);
          border: 1px solid rgba(247,183,49,0.3); color: #F7B731;
          font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; padding: 4px 14px; border-radius: 20px; margin-bottom: 1.2rem;
        }
        .hub-hero h1 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2.2rem, 6vw, 4rem); color: #fff;
          margin: 0 0 1rem; line-height: 1.1; letter-spacing: -0.02em;
        }
        .hub-hero h1 span { color: #D62828; }
        .hub-hero p { color: #999; font-size: 1rem; line-height: 1.7; margin: 0; }
        .hub-body { max-width: 1100px; margin: 0 auto; padding: 3rem 1.5rem 4rem; }
        .hub-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.2rem; margin-bottom: 2.5rem;
        }
        .calc-card {
          display: flex; flex-direction: column; background: #fff;
          border-radius: 16px; padding: 1.5rem; text-decoration: none;
          border: 2px solid transparent; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          transition: all 0.2s; position: relative; overflow: hidden;
        }
        .calc-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: var(--accent); opacity: 0; transition: opacity 0.2s;
        }
        .calc-card:hover { border-color: var(--accent); transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
        .calc-card:hover::before { opacity: 1; }
        .calc-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .calc-icon { font-size: 2.2rem; line-height: 1; }
        .calc-arrow { font-size: 1.2rem; color: #ccc; transition: all 0.2s; }
        .calc-card:hover .calc-arrow { color: var(--accent); transform: translateX(4px); }
        .calc-card h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 1.2rem; color: #1a1a1a; margin: 0 0 0.5rem; line-height: 1.3; }
        .calc-card p { font-size: 0.875rem; color: #666; line-height: 1.6; margin: 0 0 1rem; flex: 1; }
        .calc-tags { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-bottom: 1.2rem; }
        .calc-tag {
          font-size: 0.72rem; font-weight: 600; color: var(--accent);
          background: color-mix(in srgb, var(--accent) 8%, transparent);
          padding: 2px 8px; border-radius: 20px;
          border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
        }
        .calc-cta { font-size: 0.85rem; font-weight: 700; color: var(--accent); margin-top: auto; opacity: 0; transform: translateY(4px); transition: all 0.2s; }
        .calc-card:hover .calc-cta { opacity: 1; transform: translateY(0); }
        .hub-note { background: #1a1a1a; border-radius: 14px; padding: 1.2rem 1.8rem; }
        .hub-note-inner { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
        .hub-note-inner span { color: #aaa; font-size: 0.9rem; }
        .hub-note-inner a { background: #25D366; color: #fff; text-decoration: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-size: 0.88rem; font-weight: 700; white-space: nowrap; transition: background 0.15s; }
        .hub-note-inner a:hover { background: #1da851; }
        @media (max-width: 600px) {
          .hub-grid { grid-template-columns: 1fr; }
          .hub-note-inner { flex-direction: column; text-align: center; }
          .hub-note-inner a { width: 100%; text-align: center; }
        }
      `}</style>
    </PublicLayout>
  )
}
