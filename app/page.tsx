import Image from "next/image";
import Link from "next/link";
import PublicLayout from "@/components/public/PublicLayout";

export default function Home() {
  return (
    <PublicLayout>
      <main className="relative min-h-screen w-full overflow-hidden bg-black">
        
        {/* HERO SECTION - El fondo que faltaba */}
        <section className="relative h-screen w-full flex items-center justify-center">
          {/* Imagen de fondo con overlay oscuro para que se lea el texto */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"
              alt="Aberturas de Aluminio de Lujo"
              fill
              className="object-cover opacity-60"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
          </div>

          {/* Contenido Principal */}
          <div className="relative z-10 container mx-auto px-6 text-center">
            <div className="inline-block mb-6">
              <span className="text-[#D62828] tracking-[6px] uppercase text-xs font-black bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                Calidad que perdura
              </span>
            </div>
            
            <h1 className="text-6xl md:text-9xl font-serif text-white mb-8 leading-none">
              Aberturas <span className="text-[#D62828] italic">RG</span>
            </h1>
            
            <p className="text-gray-200 max-w-2xl mx-auto text-lg md:text-2xl mb-12 font-light leading-relaxed">
              Soluciones premium en <span className="text-white font-medium">aluminio y PVC</span> para proyectos que exigen máxima eficiencia térmica y diseño de vanguardia.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link 
                href="/tienda" 
                className="w-full sm:w-auto bg-[#D62828] hover:bg-red-700 text-white px-12 py-5 rounded-2xl font-bold text-sm tracking-widest transition-all transform hover:scale-105 shadow-2xl shadow-red-600/30"
              >
                EXPLORAR CATÁLOGO
              </Link>
              <Link 
                href="#contacto" 
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-12 py-5 rounded-2xl font-bold text-sm tracking-widest transition-all"
              >
                PRESUPUESTO SIN CARGO
              </Link>
            </div>
          </div>

          {/* Indicador de scroll */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-1 h-12 bg-gradient-to-b from-[#D62828] to-transparent rounded-full" />
          </div>
        </section>

        {/* SECCIÓN DE PRODUCTOS DESTACADOS (LAYOUT GRID) */}
        <section className="py-32 bg-white relative z-10">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
              <div className="max-w-xl">
                <h2 className="text-4xl md:text-6xl font-serif text-black leading-tight">
                  Modelos que definen <br />
                  <span className="text-[#D62828] italic">estilo y confort</span>
                </h2>
              </div>
              <Link href="/tienda" className="group flex items-center gap-3 text-sm font-black tracking-widest uppercase border-b-2 border-black pb-2 hover:text-[#D62828] hover:border-[#D62828] transition-all">
                Ver todos los productos
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
            </div>

            {/* Grid de Productos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { title: "Serie 25 Corrediza", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070", tag: "Más Vendido" },
                { title: "Puerta de Seguridad", img: "https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?q=80&w=2070", tag: "Seguridad Pro" },
                { title: "Paño Fijo DVH", img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2069", tag: "Eficiencia Térmica" }
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
                    <h3 className="text-2xl font-medium tracking-tight text-gray-900 group-hover:text-[#D62828] transition-colors">{item.title}</h3>
                    <p className="text-gray-400 text-sm mt-2 font-light uppercase tracking-widest">Línea Alta Gama</p>
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