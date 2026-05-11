import Image from "next/image";
import Link from "next/link";
import PublicLayout from "@/components/public/PublicLayout";

const CATEGORIAS = [
  { nombre: "Ventanas", slug: "ventanas", d: "M10 10h44v44H10zM32 10v44M10 32h44M21 16v10M43 16v10M21 38v10M43 38v10" },
  { nombre: "Puertas Exteriores", slug: "puertas-exteriores", d: "M14 6h36v52H14zM41 32a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM20 12h10v16H20zM34 12h10v16H34zM8 58h48" },
  { nombre: "Puertas Interiores", slug: "puertas-interiores", d: "M16 6h32v52H16zM40 32a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM16 6v52M8 58h48" },
  { nombre: "PVC", slug: "pvc", d: "M10 10h44v44H10zM17 17h30v30H17zM10 10l7 7M54 10l-7 7M10 54l7-7M54 54l-7-7" },
  { nombre: "Placas de Yeso", slug: "placas-de-yeso", d: "M8 14h48v36H8zM8 26h48M8 38h48M24 14v36M40 14v36" },
  { nombre: "Perfilería", slug: "perfileria", d: "M10 10h8v44h-8zM24 10h6v44h-6zM36 10h10v44H36zM52 10h4v44h-4zM6 54h52" },
];

export default function Home() {
  return (
    <PublicLayout>
      <main>

        {/* ── SECCIÓN 1: BÚSQUEDA + CATEGORÍAS ── */}
        <section style={{ background: '#FAFAF8', paddingTop: 48, paddingBottom: 64 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>

            <h1 style={{
              textAlign: 'center',
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(28px, 5vw, 48px)',
              color: '#1a1a1a',
              marginBottom: 32,
              fontWeight: 700,
              lineHeight: 1.2,
            }}>
              ¿Qué estás{' '}
              <span style={{ color: '#D62828', fontStyle: 'italic' }}>buscando?</span>
            </h1>

            {/* Buscador */}
            <div style={{ maxWidth: 600, margin: '0 auto 48px', position: 'relative' }}>
              <form action="/tienda" method="get" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <input
                  type="text"
                  name="q"
                  placeholder="Buscar productos..."
                  style={{
                    width: '100%',
                    padding: '14px 56px 14px 20px',
                    borderRadius: 12,
                    border: '1px solid #ddd',
                    background: '#fff',
                    fontSize: 15,
                    fontFamily: "'DM Sans', sans-serif",
                    outline: 'none',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                    WebkitAppearance: 'none',
                    appearance: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    position: 'absolute',
                    right: 6,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 40,
                    height: 40,
                    background: '#D62828',
                    border: 'none',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Categorías */}
            <div className="home-cats-grid">
              {CATEGORIAS.map((cat) => (
                <Link key={cat.slug} href={`/tienda?categoria=${cat.slug}`}>
                  <div className="home-cat-item">
                    <div className="home-cat-circle">
                      <svg
                        width="42"
                        height="42"
                        viewBox="0 0 64 64"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ display: 'block' }}
                      >
                        <path
                          d={cat.d}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span className="home-cat-name">{cat.nombre}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 2: HERO VISUAL ── */}
        <section style={{ position: 'relative', height: '70vh', minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"
              alt="Aberturas de Aluminio de Lujo"
              fill
              style={{ objectFit: 'cover', opacity: 0.5 }}
              priority
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent 50%, rgba(0,0,0,0.7))' }} />
          </div>

          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 20px', maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 20 }}>
              <span style={{
                color: '#D62828', letterSpacing: 6, textTransform: 'uppercase', fontSize: 11,
                fontWeight: 900, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)',
                padding: '8px 16px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)',
                display: 'inline-block',
              }}>
                Calidad que perdura
              </span>
            </div>

            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(40px, 8vw, 80px)',
              color: '#fff', marginBottom: 24, lineHeight: 1, fontWeight: 700,
            }}>
              Aberturas <span style={{ color: '#D62828', fontStyle: 'italic' }}>RG</span>
            </h2>

            <p style={{
              color: '#ccc', maxWidth: 600, margin: '0 auto 40px',
              fontSize: 'clamp(16px, 2.5vw, 22px)', fontWeight: 300, lineHeight: 1.6,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Soluciones premium en <span style={{ color: '#fff', fontWeight: 500 }}>aluminio y PVC</span> para proyectos que exigen máxima eficiencia térmica y diseño de vanguardia.
            </p>

            <div className="hero-btns" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
              <Link href="/tienda" style={{
                background: '#D62828', color: '#fff', padding: '16px 40px', borderRadius: 14,
                fontWeight: 700, fontSize: 13, letterSpacing: 2,
                textTransform: 'uppercase', boxShadow: '0 8px 30px rgba(214,40,40,0.3)',
                display: 'inline-block',
              }}>
                Explorar catálogo
              </Link>
              <Link href="/contacto" style={{
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
                padding: '16px 40px', borderRadius: 14, fontWeight: 700, fontSize: 13,
                letterSpacing: 2, textTransform: 'uppercase', display: 'inline-block',
              }}>
                Presupuesto sin cargo
              </Link>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: PRODUCTOS DESTACADOS ── */}
        <section style={{ padding: '80px 0 100px', background: '#fff' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 60, flexWrap: 'wrap', gap: 20 }}>
              <div style={{ maxWidth: 500 }}>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(30px, 5vw, 52px)',
                  color: '#1a1a1a', lineHeight: 1.15, fontWeight: 700,
                }}>
                  Modelos que definen<br />
                  <span style={{ color: '#D62828', fontStyle: 'italic' }}>estilo y confort</span>
                </h2>
              </div>
              <Link href="/tienda" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 12,
                fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase',
                borderBottom: '2px solid #1a1a1a', paddingBottom: 8, color: '#1a1a1a',
              }}>
                Ver todos los productos
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            <div className="home-products-grid">
              {[
                { title: "Serie 25 Corrediza", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070", tag: "Más Vendido" },
                { title: "Puerta de Seguridad", img: "https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?q=80&w=2070", tag: "Seguridad Pro" },
                { title: "Paño Fijo DVH", img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2069", tag: "Eficiencia Térmica" },
              ].map((item, idx) => (
                <Link href="/tienda" key={idx}>
                  <div className="home-product-card">
                    <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden', borderRadius: 20, background: '#f5f5f5', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
                      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 20 }}>
                        <span style={{
                          background: '#111', color: '#fff', fontSize: 9, fontWeight: 900,
                          letterSpacing: 2, padding: '6px 14px', borderRadius: 20, textTransform: 'uppercase',
                          display: 'inline-block',
                        }}>
                          {item.tag}
                        </span>
                      </div>
                      <Image src={item.img} alt={item.title} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div style={{ marginTop: 24 }}>
                      <h3 style={{ fontSize: 22, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>{item.title}</h3>
                      <p style={{ color: '#999', fontSize: 12, marginTop: 6, fontWeight: 300, textTransform: 'uppercase', letterSpacing: 2 }}>Línea Alta Gama</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        /* ── HOME: Categorías grid ── */
        .home-cats-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
          max-width: 800px;
          margin: 0 auto;
        }
        .home-cat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-align: center;
          cursor: pointer;
        }
        .home-cat-circle {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: rgba(214, 40, 40, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          transition: all 0.3s ease;
        }
        .home-cat-item:hover .home-cat-circle {
          background: rgba(214, 40, 40, 0.16);
          color: #D62828;
          transform: scale(1.08);
        }
        .home-cat-name {
          font-size: 13px;
          font-weight: 600;
          color: #444;
          line-height: 1.3;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.3s;
        }
        .home-cat-item:hover .home-cat-name {
          color: #D62828;
        }

        /* ── HOME: Products grid ── */
        .home-products-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }
        .home-product-card {
          cursor: pointer;
        }
        .home-product-card:hover h3 {
          color: #D62828 !important;
        }

        /* ── HOME: Responsive ── */
        @media (max-width: 768px) {
          .home-cats-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 20px !important;
          }
          .home-cat-circle {
            width: 72px !important;
            height: 72px !important;
          }
          .home-cat-circle svg {
            width: 34px !important;
            height: 34px !important;
          }
          .home-products-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </PublicLayout>
  );
}
