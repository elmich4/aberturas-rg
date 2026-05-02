'use client'
import PublicLayout from '@/components/public/PublicLayout'

export default function PrivacidadPage() {
  return (
    <PublicLayout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '4rem 1.5rem', fontFamily: "'DM Sans', sans-serif", color: '#333', lineHeight: 1.8 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', color: '#1a1a1a', marginBottom: '0.5rem' }}>
          Política de Privacidad
        </h1>
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
          Última actualización: mayo de 2025 · Aberturas RG · Montevideo, Uruguay
        </p>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: '#1a1a1a', marginBottom: '0.8rem' }}>1. Información que recopilamos</h2>
          <p>Aberturas RG recopila información que usted nos proporciona directamente, como nombre, número de teléfono y consultas enviadas a través de WhatsApp o formularios de contacto. También recopilamos datos de uso anónimos para mejorar nuestros servicios.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: '#1a1a1a', marginBottom: '0.8rem' }}>2. Uso de la información</h2>
          <p>Utilizamos la información recopilada para:</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>Responder consultas y coordinar presupuestos</li>
            <li>Mejorar nuestros productos y servicios</li>
            <li>Enviar información relevante sobre nuestros productos cuando usted lo solicite</li>
            <li>Cumplir con obligaciones legales</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: '#1a1a1a', marginBottom: '0.8rem' }}>3. Cookies y publicidad</h2>
          <p>Este sitio puede utilizar cookies propias y de terceros para mejorar la experiencia de navegación y mostrar publicidad relevante a través de Google AdSense. Google utiliza cookies para mostrar anuncios basados en visitas previas a este sitio y a otros sitios web.</p>
          <p style={{ marginTop: '0.8rem' }}>Puede optar por no recibir publicidad personalizada visitando <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#D62828' }}>Configuración de anuncios de Google</a>.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: '#1a1a1a', marginBottom: '0.8rem' }}>4. Compartir información</h2>
          <p>No vendemos, intercambiamos ni transferimos información personal a terceros, salvo cuando sea necesario para prestar nuestros servicios o cuando lo exija la ley. Los datos de uso pueden ser compartidos con Google Analytics para análisis estadístico.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: '#1a1a1a', marginBottom: '0.8rem' }}>5. Seguridad</h2>
          <p>Implementamos medidas de seguridad apropiadas para proteger su información personal. Este sitio opera bajo protocolo HTTPS.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: '#1a1a1a', marginBottom: '0.8rem' }}>6. Sus derechos</h2>
          <p>Tiene derecho a acceder, corregir o eliminar su información personal. Para ejercer estos derechos, contáctenos por WhatsApp al <strong>097 699 854</strong> o por correo electrónico.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: '#1a1a1a', marginBottom: '0.8rem' }}>7. Cambios a esta política</h2>
          <p>Podemos actualizar esta política de privacidad periódicamente. Le notificaremos cualquier cambio publicando la nueva política en esta página.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: '#1a1a1a', marginBottom: '0.8rem' }}>8. Contacto</h2>
          <p>Si tiene preguntas sobre esta política de privacidad, contáctenos:</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li><strong>Empresa:</strong> Aberturas RG</li>
            <li><strong>Teléfono:</strong> 097 699 854</li>
            <li><strong>WhatsApp:</strong> <a href="https://wa.me/59897699854" style={{ color: '#D62828' }}>wa.me/59897699854</a></li>
            <li><strong>Ubicación:</strong> Montevideo, Uruguay</li>
          </ul>
        </section>

        <div style={{ marginTop: '3rem', padding: '1.2rem 1.5rem', background: '#f8f7f4', borderRadius: '10px', fontSize: '0.85rem', color: '#888', borderLeft: '3px solid #D62828' }}>
          Esta política de privacidad cumple con la Ley N° 18.331 de Protección de Datos Personales de Uruguay.
        </div>
      </div>
    </PublicLayout>
  )
}
