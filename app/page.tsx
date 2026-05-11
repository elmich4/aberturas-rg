import Image from "next/image";
import Link from "next/link";
import PublicLayout from "@/components/public/PublicLayout";

const CATEGORIAS = [
  {
    nombre: "Ventanas",
    slug: "ventanas",
    icono: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="44" height="44">
        <rect x="10" y="10" width="44" height="44" rx="3" />
        <line x1="32" y1="10" x2="32" y2="54" />
        <line x1="10" y1="32" x2="54" y2="32" />
        <line x1="21" y1="16" x2="21" y2="26" />
        <line x1="43" y1="16" x2="43" y2="26" />
        <line x1="21" y1="38" x2="21" y2="48" />
        <line x1="43" y1="38" x2="43" y2="48" />
      </svg>
    ),
  },
  {
    nombre: "Puertas Exteriores",
    slug: "puertas-exteriores",
    icono: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="44" height="44">
        <rect x="14" y="6" width="36" height="52" rx="2" />
        <circle cx="41" cy="34" r="2.5" />
        <rect x="20" y="12" width="10" height="16" rx="1" />
        <rect x="34" y="12" width="10" height="16" rx="1" />
        <line x1="8" y1="58" x2="56" y2="58" />
      </svg>
    ),
  },
  {
    nombre: "Puertas Interiores",
    slug: "puertas-interiores",
    icono: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="44" height="44">
        <rect x="16" y="6" width="32" height="52" rx="2" />
        <circle cx="40" cy="34" r="2.5" />
        <line x1="16" y1="6" x2="16" y2="58" />
        <line x1="8" y1="58" x2="56" y2="58" />
        <line x1="26" y1="14" x2="26" y2="50" strokeDasharray="4 3" />
      </svg>
    ),
  },
  {
    nombre: "PVC",
    slug: "pvc",
    icono: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="44" height="44">
        <rect x="10" y="10" width="44" height="44" rx="3" />
        <rect x="17" y="17" width="30" height="30" rx="2" />
        <line x1="10" y1="10" x2="17" y2="17" />
        <line x1="54" y1="10" x2="47" y2="17" />
        <line x1="10" y1="54" x2="17" y2="47" />
        <line x1="54" y1="54" x2="47" y2="47" />
      </svg>
    ),
  },
  {
    nombre: "Placas de Yeso",
    slug: "placas-de-yeso",
    icono: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="44" height="44">
        <rect x="8" y="14" width="48" height="36" rx="2" />
        <line x1="8" y1="26" x2="56" y2="26" />
        <line x1="8" y1="38" x2="56" y2="38" />
        <line x1="24" y1="14" x2="24" y2="50" />
        <line x1="40" y1="14" x2="40" y2="50" />
      </svg>
    ),
  },
  {
    nombre: "Perfilería",
    slug: "perfileria",
    icono: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="44" height="44">
        <rect x="10" y="10" width="8" height="44" rx="1" />
        <rect x="24" y="10" width="6" height="44" rx="1" />
        <rect x="36" y="10" width="10" height="44" rx="1" />
        <rect x="52" y="10" width="4" height="44" rx="1" />
        <line x1="6" y1="54" x2="58" y2="54" />
      </svg>
    ),
  },
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

            <form
              action="/tienda"
              method="get"
              style={{
                maxWidth: 600,
                margin: '0 auto 48px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
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
                }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: 6,
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
                <svg width="18" height="18" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            <div className="categorias-grid">
              {CATEGORIAS.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/tienda?categoria=${cat.slug}`}
                  className="cat-link"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                    textDecoration: 'none',
                    textAlign: 'center',
                  }}
                >
                  <div
                    className="cat-circle"
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: '50%',
                      background: 'rgba(214, 40, 40, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#666',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {cat.icono}
                  </div>
                  <span
                    className="cat-label"
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#444',
                      lineHeight: 1.3,
                      fontFamily: "'DM Sans', sans-serif",
                      transition: 'color 0.3s',
                    }}
                  >
                    {cat.nombre}
                  </span>
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
                color: '#D62828',
                letterSpacing: 6,
                textTransform: 'uppercase',
                fontSize: 11,
                fontWeight: 900,
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(12px)',
                padding: '8px 16px',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'inline-block',
              }}>
                Calidad que perdura
              </span>
            </div>

            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(40px, 8vw, 80px)',
              color: '#fff',
              marginBottom: 24,
              lineHeight: 1,
              fontWeight: 700,
            }}>
              Aberturas <span style={{ color: '#D62828', fontStyle: 'italic' }}>RG</span>
            </h2>

            <p style={{
              color: '#ccc',
              maxWidth: 600,
              margin: '0 auto 40px',
              fontSize: 'clamp(16px, 2.5vw, 22px)',
              fontWeight: 300,
              lineHeight: 1.6,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Soluciones premium en <span style={{ color: '#fff', fontWeight: 500 }}>aluminio y PVC</span> para proyectos que exigen máxima eficiencia térmica y diseño de vanguardia.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
              <Link href="/tienda" style={{
                background: '#D62828', color: '#fff', padding: '16px 40px', borderRadius: 14,
                fontWeight: 700, fontSize: 13, letterSpacing: 2, textDecoration: 'none',
                textTransform: 'uppercase', boxShadow: '0 8px 30px rgba(214,40,40,0.3)',
              }}>
                Explorar catálogo
              </Link>
              <Link href="/contacto" style={{
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
                padding: '16px 40px', borderRadius: 14, fontWeight: 700, fontSize: 13,
                letterSpacing: 2, textDecoration: 'none', textTransform: 'uppercase',
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
                display: 'flex', alignItems: 'center', gap: 10, fontSize: 12,
                fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase',
                borderBottom: '2px solid #1a1a1a', paddingBottom: 8,
                textDecoration: 'none', color: '#1a1a1a',
              }}>
                Ver todos los productos
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            <div className="productos-grid">
              {[
                { title: "Serie 25 Corrediza", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070", tag: "Más Vendido" },
                { title: "Puerta de Seguridad", img: "https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?q=80&w=2070", tag: "Seguridad Pro" },
                { title: "Paño Fijo DVH", img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2069", tag: "Eficiencia Térmica" },
              ].map((item, idx) => (
                <Link href="/tienda" key={idx} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden', borderRadius: 20, background: '#f5f5f5', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
                    <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 20 }}>
                      <span style={{
                        background: '#111', color: '#fff', fontSize: 9, fontWeight: 900,
                        letterSpacing: 2, padding: '6px 14px', borderRadius: 20, textTransform: 'uppercase',
                      }}>
                        {item.tag}
                      </span>
                    </div>
                    <Image src={item.img} alt={item.title} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div style={{ marginTop: 24 }}>
                    <h3 style={{ fontSize: 22, fontWeight: 500, color: '#1a1a1a' }}>{item.title}</h3>
                    <p style={{ color: '#999', fontSize: 12, marginTop: 6, fontWeight: 300, textTransform: 'uppercase', letterSpacing: 2 }}>Línea Alta Gama</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        .categorias-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
          max-width: 800px;
          margin: 0 auto;
        }
        .cat-link:hover .cat-circle {
          background: rgba(214, 40, 40, 0.15) !important;
          color: #D62828 !important;
          transform: scale(1.08);
        }
        .cat-link:hover .cat-label {
          color: #D62828 !important;
        }
        .productos-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }
        @media (max-width: 768px) {
          .categorias-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 20px !important;
          }
          .cat-circle {
            width: 72px !important;
            height: 72px !important;
          }
          .cat-circle svg {
            width: 36px !important;
            height: 36px !important;
          }
          .productos-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </PublicLayout>
  );
}
