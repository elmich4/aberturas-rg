import Image from "next/image";
import Link from "next/link";
import PublicLayout from "@/components/public/PublicLayout";

const CATEGORIAS = [
  {
    nombre: "Ventanas",
    slug: "ventanas",
    icono: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 md:w-12 md:h-12">
        <rect x="8" y="8" width="48" height="48" rx="3" />
        <line x1="32" y1="8" x2="32" y2="56" />
        <line x1="8" y1="32" x2="56" y2="32" />
        <line x1="20" y1="14" x2="20" y2="26" />
        <line x1="44" y1="14" x2="44" y2="26" />
        <line x1="20" y1="38" x2="20" y2="50" />
        <line x1="44" y1="38" x2="44" y2="50" />
      </svg>
    ),
  },
  {
    nombre: "Puertas Exteriores",
    slug: "puertas-exteriores",
    icono: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 md:w-12 md:h-12">
        <rect x="14" y="6" width="36" height="52" rx="2" />
        <circle cx="40" cy="34" r="2.5" />
        <line x1="14" y1="6" x2="14" y2="58" />
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
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 md:w-12 md:h-12">
        <rect x="16" y="6" width="32" height="52" rx="2" />
        <circle cx="40" cy="34" r="2.5" />
        <line x1="16" y1="6" x2="16" y2="58" />
        <line x1="8" y1="58" x2="56" y2="58" />
        <path d="M24 14 L24 50" strokeDasharray="4 3" />
      </svg>
    ),
  },
  {
    nombre: "PVC",
    slug: "pvc",
    icono: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 md:w-12 md:h-12">
        <rect x="10" y="10" width="44" height="44" rx="3" />
        <rect x="16" y="16" width="32" height="32" rx="2" />
        <line x1="10" y1="10" x2="16" y2="16" />
        <line x1="54" y1="10" x2="48" y2="16" />
        <line x1="10" y1="54" x2="16" y2="48" />
        <line x1="54" y1="54" x2="48" y2="48" />
        <path d="M28 28 L36 36 M36 28 L28 36" opacity="0.4" />
      </svg>
    ),
  },
  {
    nombre: "Placas de Yeso",
    slug: "placas-de-yeso",
    icono: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 md:w-12 md:h-12">
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
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 md:w-12 md:h-12">
        <rect x="10" y="8" width="8" height="48" rx="1" />
        <rect x="24" y="8" width="6" height="48" rx="1" />
        <rect x="36" y="8" width="10" height="48" rx="1" />
        <rect x="52" y="8" width="4" height="48" rx="1" />
        <line x1="6" y1="56" x2="58" y2="56" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <PublicLayout>
      <main className="relative w-full overflow-hidden">

        {/* ── SECCIÓN 1: BÚSQUEDA + CATEGORÍAS ── */}
        <section className="bg-[#FAFAF8] pt-12 pb-16 md:pt-16 md:pb-20">
          <div className="container mx-auto px-6">

            {/* Título */}
            <div className="text-center mb-8 md:mb-10">
              <h1 className="text-3xl md:text-5xl font-serif text-black leading-tight">
                ¿Qué estás{" "}
                <span className="text-[#D62828] italic">buscando?</span>
              </h1>
            </div>

            {/* Buscador */}
            <div className="max-w-2xl mx-auto mb-12 md:mb-16">
              <form
                action="/tienda"
                method="get"
                className="relative flex items-center"
              >
                <input
                  type="text"
                  name="q"
                  placeholder="Buscar productos..."
                  className="w-full py-4 px-6 pr-14 rounded-xl border border-gray-200 bg-white text-base focus:outline-none focus:border-[#D62828] focus:ring-2 focus:ring-[#D62828]/10 shadow-sm transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 w-10 h-10 bg-[#D62828] hover:bg-red-700 text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Categorías en iconos */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-8 max-w-4xl mx-auto">
              {CATEGORIAS.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/tienda?categoria=${cat.slug}`}
                  className="group flex flex-col items-center gap-3 text-center"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#D62828]/8 group-hover:bg-[#D62828]/15 flex items-center justify-center text-[#555] group-hover:text-[#D62828] transition-all duration-300 group-hover:scale-105">
                    {cat.icono}
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-gray-700 group-hover:text-[#D62828] transition-colors leading-tight">
                    {cat.nombre}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 2: HERO VISUAL ── */}
        <section className="relative h-[70vh] md:h-[80vh] w-full flex items-center justify-center bg-black">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"
              alt="Aberturas de Aluminio de Lujo"
              fill
              className="object-cover opacity-50"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
          </div>

          <div className="relative z-10 container mx-auto px-6 text-center">
            <div className="inline-block mb-6">
              <span className="text-[#D62828] tracking-[6px] uppercase text-xs font-black bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                Calidad que perdura
              </span>
            </div>

            <h2 className="text-5xl md:text-8xl font-serif text-white mb-8 leading-none">
              Aberturas <span className="text-[#D62828] italic">RG</span>
            </h2>

            <p className="text-gray-200 max-w-2xl mx-auto text-lg md:text-2xl mb-12 font-light leading-relaxed">
              Soluciones premium en{" "}
              <span className="text-white font-medium">aluminio y PVC</span>{" "}
              para proyectos que exigen máxima eficiencia térmica y diseño de vanguardia.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link
                href="/tienda"
                className="w-full sm:w-auto bg-[#D62828] hover:bg-red-700 text-white px-12 py-5 rounded-2xl font-bold text-sm tracking-widest transition-all transform hover:scale-105 shadow-2xl shadow-red-600/30"
              >
                EXPLORAR CATÁLOGO
              </Link>
              <Link
                href="/contacto"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-12 py-5 rounded-2xl font-bold text-sm tracking-widest transition-all"
              >
                PRESUPUESTO SIN CARGO
              </Link>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: PRODUCTOS DESTACADOS ── */}
        <section className="py-24 md:py-32 bg-white relative z-10">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-20 gap-6">
              <div className="max-w-xl">
                <h2 className="text-4xl md:text-6xl font-serif text-black leading-tight">
                  Modelos que definen <br />
                  <span className="text-[#D62828] italic">estilo y confort</span>
                </h2>
              </div>
              <Link
                href="/tienda"
                className="group flex items-center gap-3 text-sm font-black tracking-widest uppercase border-b-2 border-black pb-2 hover:text-[#D62828] hover:border-[#D62828] transition-all"
              >
                Ver todos los productos
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  title: "Serie 25 Corrediza",
                  img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070",
                  tag: "Más Vendido",
                },
                {
                  title: "Puerta de Seguridad",
                  img: "https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?q=80&w=2070",
                  tag: "Seguridad Pro",
                },
                {
                  title: "Paño Fijo DVH",
                  img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2069",
                  tag: "Eficiencia Térmica",
                },
              ].map((item, idx) => (
                <Link href="/tienda" key={idx} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gray-100 shadow-lg">
                    <div className="absolute top-6 left-6 z-20">
                      <span className="bg-black text-white text-[9px] font-black tracking-[2px] py-2 px-4 rounded-full uppercase group-hover:bg-[#D62828] transition-colors">
                        {item.tag}
                      </span>
                    </div>
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="mt-8">
                    <h3 className="text-2xl font-medium tracking-tight text-gray-900 group-hover:text-[#D62828] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-2 font-light uppercase tracking-widest">
                      Línea Alta Gama
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
