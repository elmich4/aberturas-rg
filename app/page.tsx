import Image from "next/image";
import Link from "next/link";
import PublicLayout from "@/components/public/PublicLayout";

export default function Home() {
  return (
    <PublicLayout>
      <main className="flex min-h-screen flex-col">
        {/* HERO SECTION */}
        <section className="relative h-[90vh] flex items-center justify-center bg-black overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"
            alt="Aberturas de Aluminio RG"
            fill
            className="object-cover opacity-50"
            priority
          />
          <div className="relative z-10 text-center px-4">
            <span className="text-primary tracking-[5px] uppercase text-sm font-bold mb-4 block animate-fade-in">
              Calidad que perdura
            </span>
            <h1 className="text-5xl md:text-8xl font-serif text-white mb-8">
              Aberturas <span className="text-primary italic">RG</span>
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg md:text-xl mb-10 font-light leading-relaxed">
              Soluciones premium en aluminio y PVC para proyectos que exigen lo mejor en diseño y eficiencia térmica.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/tienda" 
                className="bg-primary hover:bg-red-700 text-white px-10 py-4 rounded-full font-bold transition-all transform hover:scale-105"
              >
                VER CATÁLOGO
              </Link>
              <Link 
                href="#contacto" 
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-10 py-4 rounded-full font-bold transition-all"
              >
                SOLICITAR PRESUPUESTO
              </Link>
            </div>
          </div>
        </section>

        {/* SECCIÓN DE PRODUCTOS DESTACADOS */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-4xl md:text-5xl font-serif">Modelos <span className="text-primary text-3xl italic block md:inline md:ml-2">Destacados</span></h2>
              </div>
              <Link href="/tienda" className="text-sm font-bold tracking-widest hover:text-primary transition-colors border-b-2 border-black pb-1">
                VER TODO
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Ejemplo de Producto 1 */}
              <Link href="/tienda/ventana-serie-25" className="group">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
                  <div className="absolute top-0 left-0 right-0 bg-black/85 text-white text-[10px] tracking-[3px] py-3 text-center font-bold uppercase z-10 transition-colors group-hover:bg-primary">
                    OFERTA LIMITADA
                  </div>
                  <Image 
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070" 
                    alt="Serie 25" 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium tracking-tight">Ventana Corrediza Serie 25</h3>
                  <p className="text-gray-400 text-sm mt-1">Línea Alta Gama</p>
                </div>
              </Link>

              {/* Ejemplo de Producto 2 */}
              <Link href="/tienda/puerta-exterior-premium" className="group">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
                  <div className="absolute top-0 left-0 right-0 bg-black/85 text-white text-[10px] tracking-[3px] py-3 text-center font-bold uppercase z-10 transition-colors group-hover:bg-primary">
                    ENTREGA INMEDIATA
                  </div>
                  <Image 
                    src="