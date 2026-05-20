# Guía de Migración: WhatsApp → Checkout con Pedidos

## Resumen
Esta migración reemplaza el flujo de ventas por WhatsApp por un sistema de pedidos
integrado en la web. El cliente arma su carrito, completa un formulario con sus datos,
y el pedido queda guardado en Supabase. Vos lo gestionás desde /admin/pedidos.

---

## Paso 1: Ejecutar SQL en Supabase

1. Abrí Supabase → **SQL Editor**
2. Pegá el contenido de `migracion_pedidos.sql`
3. Ejecutá (Run)
4. Verificá que se crearon las tablas `pedidos` y `contacto_mensajes`

---

## Paso 2: Copiar archivos al proyecto

Copiá cada archivo a su ubicación en tu proyecto Next.js:

```
ARCHIVOS NUEVOS:
  checkout/page.tsx                → app/checkout/page.tsx
  checkout/confirmacion/page.tsx   → app/checkout/confirmacion/page.tsx
  api/pedidos/notificar/route.ts   → app/api/pedidos/notificar/route.ts
  api/contacto/route.ts            → app/api/contacto/route.ts
  admin/pedidos/page.tsx           → app/admin/pedidos/page.tsx

ARCHIVOS MODIFICADOS (reemplazan los existentes):
  CartDrawer.tsx                   → components/public/CartDrawer.tsx
  PublicLayout.tsx                 → components/public/PublicLayout.tsx
  contacto/page.tsx                → app/contacto/page.tsx
```

---

## Paso 3: Variables de entorno (Vercel)

Agregá estas variables en Vercel → Settings → Environment Variables:

```
RESEND_API_KEY=re_xxxxxxxxxxxx     (opcional, para notificaciones por email)
NOTIFY_EMAIL=tu-email@gmail.com     (el email donde recibís las notificaciones)
NEXT_PUBLIC_SITE_URL=https://aberturasrg.com.uy
```

### Configurar Resend (opcional pero recomendado):
1. Creá cuenta gratis en https://resend.com
2. Obtenés tu API Key (gratis hasta 100 emails/día)
3. Agregala como RESEND_API_KEY en Vercel
4. Sin Resend, los pedidos se guardan en Supabase igual — los ves desde /admin/pedidos

---

## Paso 4: Deploy

```bash
git add .
git commit -m "Migrar flujo de ventas de WhatsApp a checkout propio"
git push
```

Vercel hace deploy automático.

---

## Qué cambió

### CartDrawer.tsx
- ❌ Eliminado: botón "Enviar por WhatsApp"
- ❌ Eliminado: lógica de guardado en tienda_presupuestos + apertura de WA
- ✅ Nuevo: botón "Finalizar pedido →" que lleva a /checkout
- ✅ Título cambiado de "Mi presupuesto" a "Mi carrito"

### PublicLayout.tsx
- ❌ Eliminado: botón verde de WhatsApp en navbar (desktop y mobile)
- ❌ Eliminado: botón flotante de WhatsApp (esquina inferior derecha)
- ❌ Eliminado: botón verde de WA en footer
- ✅ Nuevo: botón de carrito con badge en navbar (desktop y mobile)
- ✅ Nuevo: link de teléfono en navbar (📞 097 699 854)
- ✅ Footer: WA reemplazado por botón "✉️ Contactanos" que va a /contacto

### contacto/page.tsx
- ❌ Eliminado: botón gigante de WhatsApp
- ❌ Eliminado: templates de mensajes WA
- ✅ Nuevo: formulario de contacto (nombre, teléfono, mensaje)
- ✅ Nuevo: sección de medios de pago aceptados
- ✅ Mantenido: cards de info (cobertura, horario) + link a tienda

### Archivos nuevos
- `/checkout/page.tsx` — formulario de checkout completo
- `/checkout/confirmacion/page.tsx` — confirmación post-pedido con número
- `/api/pedidos/notificar/route.ts` — envío de email cuando entra pedido
- `/api/contacto/route.ts` — guarda consulta + envía email
- `/admin/pedidos/page.tsx` — panel para gestionar pedidos

---

## Flujo del cliente (nuevo)

1. Navega la tienda, agrega productos al carrito
2. Abre el carrito → "Finalizar pedido →"
3. Completa: nombre, apellido, teléfono, dirección
4. Click "Confirmar pedido"
5. Pedido guardado en Supabase con estado "pendiente"
6. Ve página de confirmación con número de pedido
7. Vos recibís email + lo ves en /admin/pedidos
8. Lo contactás, coordinás pago (POS, transferencia, etc.) y entrega

---

## Notas importantes

- El archivo CartButton.tsx NO cambió — sigue igual
- La tabla tienda_presupuestos sigue existiendo, no se borró nada
- WhatsApp queda como dato de contacto en el footer (teléfono) pero
  ya no es el canal principal de ventas
- Los pedidos arrancan desde el código #1001 para diferenciarlos de presupuestos
