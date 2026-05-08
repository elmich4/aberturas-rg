/**
 * Convierte un texto en un slug URL-friendly.
 * Ej: "Ventana Serie 20 — 1.20 x 1.50" → "ventana-serie-20-1-20-x-1-50"
 */
export function generarSlug(texto: string): string {
  if (!texto) return ''
  return texto
    .toString()
    .normalize('NFD')                    // separar acentos
    .replace(/[\u0300-\u036f]/g, '')     // quitar acentos
    .toLowerCase()
    .trim()
    .replace(/[ñ]/g, 'n')                // ñ → n (por si acaso)
    .replace(/[^a-z0-9\s-]/g, '')        // quitar caracteres especiales
    .replace(/\s+/g, '-')                // espacios → guiones
    .replace(/-+/g, '-')                 // múltiples guiones → uno solo
    .replace(/^-|-$/g, '')               // sin guiones al inicio/final
}

/**
 * Garantiza un slug único. Si ya existe, le agrega -2, -3, etc.
 * Recibe la lista de slugs ya tomados (excluyendo el del producto que se edita).
 */
export function generarSlugUnico(base: string, slugsExistentes: string[]): string {
  const slugBase = generarSlug(base)
  if (!slugsExistentes.includes(slugBase)) return slugBase

  let n = 2
  while (slugsExistentes.includes(`${slugBase}-${n}`)) {
    n++
  }
  return `${slugBase}-${n}`
}
