'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { generarSlug, generarSlugUnico } from '@/lib/slug'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BUCKET = 'tienda-productos'

type SpecRow = { key: string; value: string }

type VarianteRow = {
  id?: string                  // si existe en la BD
  _localId: string             // id estable en el cliente (para keys de React)
  nombre: string
  precio: number
  orden: number
}

type Producto = {
  id?: string
  nombre: string
  slug: string
  descripcion: string
  descripcion_larga: string
  precio: number
  precio_desde: number | null
  unidad: string
  imagen_url: string
  imagenes: string[]
  especificaciones: Record<string, string>
  destacado: boolean
  activo: boolean
  categoria_id: string | null
  subcategoria_id: string | null
  orden: number
}

const PRODUCTO_INICIAL: Producto = {
  nombre: '',
  slug: '',
  descripcion: '',
  descripcion_larga: '',
  precio: 0,
  precio_desde: null,
  unidad: 'unidad',
  imagen_url: '',
  imagenes: [],
  especificaciones: {},
  destacado: false,
  activo: true,
  categoria_id: null,
  subcategoria_id: null,
  orden: 0,
}

function nuevoLocalId() {
  return Math.random().toString(36).slice(2, 10)
}

export default function ProductoEditPage() {
  const params = useParams()
  const router = useRouter()
  const idParam = params.id as string
  const esNuevo = idParam === 'nuevo'

  const [producto, setProducto] = useState<Producto>(PRODUCTO_INICIAL)
  const [categorias, setCategorias] = useState<any[]>([])
  const [subcategorias, setSubcategorias] = useState<any[]>([])
  const [slugsExistentes, setSlugsExistentes] = useState<string[]>([])

  const [specs, setSpecs] = useState<SpecRow[]>([{ key: '', value: '' }])
  const [variantes, setVariantes] = useState<VarianteRow[]>([])
  const [slugManual, setSlugManual] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar producto + listas auxiliares
  useEffect(() => {
    cargarTodo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idParam])

  async function cargarTodo() {
    setLoading(true)
    setError(null)

    const [{ data: cats }, { data: subs }, { data: slugsRaw }] =
      await Promise.all([
        supabase.from('tienda_categorias').select('*').order('orden'),
        supabase.from('tienda_subcategorias').select('*').order('orden'),
        supabase.from('tienda_productos').select('id, slug'),
      ])

    setCategorias(cats || [])
    setSubcategorias(subs || [])

    if (esNuevo) {
      setProducto(PRODUCTO_INICIAL)
      setSpecs([{ key: '', value: '' }])
      setVariantes([])
      setSlugsExistentes((slugsRaw || []).map(r => r.slug).filter(Boolean))
      setLoading(false)
      return
    }

    // Editar existente
    const { data, error } = await supabase
      .from('tienda_productos')
      .select('*')
      .eq('id', idParam)
      .single()

    if (error || !data) {
      setError('No se encontró el producto')
      setLoading(false)
      return
    }

    // Cargar producto
    setProducto({
      ...PRODUCTO_INICIAL,
      ...data,
      imagenes: Array.isArray(data.imagenes) ? data.imagenes : [],
      especificaciones: data.especificaciones || {},
    })

    // Specs como filas editables
    const specsObj = data.especificaciones || {}
    const filas = Object.entries(specsObj).map(([k, v]) => ({
      key: k,
      value: String(v),
    }))
    setSpecs(filas.length > 0 ? filas : [{ key: '', value: '' }])

    // Variantes existentes
    const { data: variantesData } = await supabase
      .from('tienda_producto_variantes')
      .select('*')
      .eq('producto_id', data.id)
      .order('orden')

    setVariantes(
      (variantesData || []).map((v: any) => ({
        id: v.id,
        _localId: nuevoLocalId(),
        nombre: v.nombre,
        precio: Number(v.precio),
        orden: v.orden ?? 0,
      }))
    )

    // Slugs existentes (excluyendo el del producto que estamos editando)
    setSlugsExistentes(
      (slugsRaw || [])
        .filter(r => r.id !== data.id)
        .map(r => r.slug)
        .filter(Boolean)
    )

    setSlugManual(true) // si ya tiene slug guardado, no lo regenero al cambiar nombre
    setLoading(false)
  }

  // Subcategorías filtradas por categoría seleccionada
  const subcatsFiltradas = subcategorias.filter(
    s => s.categoria_id === producto.categoria_id
  )

  // Auto-slug al cambiar nombre (si el usuario no lo modificó manualmente)
  function handleNombreChange(v: string) {
    setProducto(p => {
      const nuevo = { ...p, nombre: v }
      if (!slugManual) {
        nuevo.slug = generarSlugUnico(v, slugsExistentes)
      }
      return nuevo
    })
  }

  function handleSlugChange(v: string) {
    setSlugManual(true)
    setProducto(p => ({ ...p, slug: generarSlug(v) }))
  }

  // ============ ESPECIFICACIONES ============
  function updateSpec(idx: number, field: 'key' | 'value', val: string) {
    setSpecs(prev => prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)))
  }
  function addSpec() {
    setSpecs(prev => [...prev, { key: '', value: '' }])
  }
  function removeSpec(idx: number) {
    setSpecs(prev => prev.filter((_, i) => i !== idx))
  }
  function specsToObject(): Record<string, string> {
    const obj: Record<string, string> = {}
    specs.forEach(s => {
      const k = s.key.trim()
      const v = s.value.trim()
      if (k && v) obj[k] = v
    })
    return obj
  }

  // ============ VARIANTES ============
  function addVariante() {
    setVariantes(prev => [
      ...prev,
      {
        _localId: nuevoLocalId(),
        nombre: '',
        precio: 0,
        orden: prev.length,
      },
    ])
  }
  function updateVariante(
    localId: string,
    field: 'nombre' | 'precio',
    val: string
  ) {
    setVariantes(prev =>
      prev.map(v => {
        if (v._localId !== localId) return v
        if (field === 'precio') {
          return { ...v, precio: Number(val) || 0 }
        }
        return { ...v, nombre: val }
      })
    )
  }
  function removeVariante(localId: string) {
    setVariantes(prev => prev.filter(v => v._localId !== localId))
  }
  function moverVariante(localId: string, dir: -1 | 1) {
    setVariantes(prev => {
      const idx = prev.findIndex(v => v._localId === localId)
      const nuevoIdx = idx + dir
      if (idx < 0 || nuevoIdx < 0 || nuevoIdx >= prev.length) return prev
      const arr = [...prev]
      ;[arr[idx], arr[nuevoIdx]] = [arr[nuevoIdx], arr[idx]]
      return arr
    })
  }

  // ============ IMAGENES ============
  async function uploadImagen(file: File): Promise<string | null> {
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`
    const path = `productos/${filename}`

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type })

    if (upErr) {
      console.error(upErr)
      return null
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  async function handleFiles(files: FileList | File[]) {
    setUploading(true)
    setError(null)
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    const subidas: string[] = []

    for (const f of arr) {
      const url = await uploadImagen(f)
      if (url) subidas.push(url)
    }

    if (subidas.length === 0 && arr.length > 0) {
      setError('No se pudieron subir las imágenes. Revisá las policies del bucket.')
    }

    setProducto(p => {
      const nuevas = [...p.imagenes, ...subidas]
      return {
        ...p,
        imagenes: nuevas,
        // Si no había imagen principal, usar la primera subida
        imagen_url: p.imagen_url || subidas[0] || '',
      }
    })

    setUploading(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files)
    }
  }

  function quitarImagen(url: string) {
    setProducto(p => {
      const nuevas = p.imagenes.filter(x => x !== url)
      return {
        ...p,
        imagenes: nuevas,
        imagen_url: p.imagen_url === url ? nuevas[0] || '' : p.imagen_url,
      }
    })
  }

  function setComoPrincipal(url: string) {
    setProducto(p => ({ ...p, imagen_url: url }))
  }

  function moverImagen(url: string, dir: -1 | 1) {
    setProducto(p => {
      const arr = [...p.imagenes]
      const idx = arr.indexOf(url)
      const nuevoIdx = idx + dir
      if (idx < 0 || nuevoIdx < 0 || nuevoIdx >= arr.length) return p
      ;[arr[idx], arr[nuevoIdx]] = [arr[nuevoIdx], arr[idx]]
      return { ...p, imagenes: arr }
    })
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ============ GUARDAR ============
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!producto.nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    if (!producto.slug.trim()) {
      setError('El slug es obligatorio')
      return
    }

    // Validar variantes: si hay alguna agregada, todas deben tener nombre
    const variantesValidas = variantes.filter(v => v.nombre.trim() !== '')
    const variantesIncompletas = variantes.some(
      v => v.nombre.trim() === '' && v.precio > 0
    )
    if (variantesIncompletas) {
      setError('Hay variantes con precio pero sin nombre. Completalas o eliminalas.')
      return
    }

    setSaving(true)

    const payload: any = {
      nombre: producto.nombre.trim(),
      slug: producto.slug.trim(),
      descripcion: producto.descripcion.trim() || null,
      descripcion_larga: producto.descripcion_larga.trim() || null,
      precio: producto.precio || 0,
      precio_desde: producto.precio_desde,
      unidad: producto.unidad.trim() || 'unidad',
      imagen_url: producto.imagen_url || null,
      imagenes: producto.imagenes,
      especificaciones: specsToObject(),
      destacado: producto.destacado,
      activo: producto.activo,
      categoria_id: producto.categoria_id,
      subcategoria_id: producto.subcategoria_id,
      orden: producto.orden || 0,
    }

    let result
    let productoId: string | null = null
    if (esNuevo) {
      result = await supabase
        .from('tienda_productos')
        .insert(payload)
        .select('id')
        .single()
      productoId = result.data?.id ?? null
    } else {
      result = await supabase
        .from('tienda_productos')
        .update(payload)
        .eq('id', idParam)
        .select('id')
        .single()
      productoId = idParam
    }

    if (result.error) {
      setSaving(false)
      setError('Error al guardar: ' + result.error.message)
      return
    }

    // ===== Sincronizar variantes (estrategia simple: borrar todas y reinsertar)
    // Es seguro porque no hay FK desde otras tablas hacia variantes; los items
    // del carrito viven en localStorage del cliente.
    if (productoId) {
      const { error: delErr } = await supabase
        .from('tienda_producto_variantes')
        .delete()
        .eq('producto_id', productoId)

      if (delErr) {
        setSaving(false)
        setError(
          'El producto se guardó pero falló al actualizar variantes: ' +
            delErr.message
        )
        return
      }

      if (variantesValidas.length > 0) {
        const insertPayload = variantesValidas.map((v, idx) => ({
          producto_id: productoId,
          nombre: v.nombre.trim(),
          precio: v.precio || 0,
          orden: idx,
          activo: true,
        }))

        const { error: insErr } = await supabase
          .from('tienda_producto_variantes')
          .insert(insertPayload)

        if (insErr) {
          setSaving(false)
          setError(
            'El producto se guardó pero falló al insertar variantes: ' +
              insErr.message
          )
          return
        }
      }
    }

    setSaving(false)
    router.push('/admin/tienda')
  }

  if (loading) {
    return <div className="loading">Cargando...</div>
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <Link href="/admin/tienda" className="btn-back">
          ← Volver al listado
        </Link>
        <h1>{esNuevo ? 'Nuevo producto' : `Editar: ${producto.nombre}`}</h1>
      </header>

      <form onSubmit={handleSubmit} className="form-grid">
        {/* COL IZQ */}
        <div className="col-main">
          <section className="card">
            <h2>Información básica</h2>

            <div className="row">
              <label>
                Nombre del producto *
                <input
                  type="text"
                  value={producto.nombre}
                  onChange={e => handleNombreChange(e.target.value)}
                  required
                  placeholder="Ej: Ventana Serie 20 — 1.20 x 1.50"
                />
              </label>
            </div>

            <div className="row">
              <label>
                Slug (URL amigable) *
                <input
                  type="text"
                  value={producto.slug}
                  onChange={e => handleSlugChange(e.target.value)}
                  required
                />
                <small>
                  Se autogenera al escribir el nombre. Editalo manualmente si
                  querés un slug distinto. URL final: <code>/tienda/{producto.slug || 'mi-producto'}</code>
                </small>
              </label>
            </div>

            <div className="row two-cols">
              <label>
                Categoría
                <select
                  value={producto.categoria_id || ''}
                  onChange={e =>
                    setProducto(p => ({
                      ...p,
                      categoria_id: e.target.value || null,
                      subcategoria_id: null, // resetear subcat
                    }))
                  }
                >
                  <option value="">— Sin categoría —</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Subcategoría
                <select
                  value={producto.subcategoria_id || ''}
                  onChange={e =>
                    setProducto(p => ({
                      ...p,
                      subcategoria_id: e.target.value || null,
                    }))
                  }
                  disabled={!producto.categoria_id}
                >
                  <option value="">— Sin subcategoría —</option>
                  {subcatsFiltradas.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="row">
              <label>
                Descripción corta (vista de listado)
                <textarea
                  rows={2}
                  value={producto.descripcion}
                  onChange={e =>
                    setProducto(p => ({ ...p, descripcion: e.target.value }))
                  }
                  placeholder="Resumen breve, una o dos líneas"
                />
              </label>
            </div>

            <div className="row">
              <label>
                Descripción larga (vista de detalle)
                <textarea
                  rows={6}
                  value={producto.descripcion_larga}
                  onChange={e =>
                    setProducto(p => ({
                      ...p,
                      descripcion_larga: e.target.value,
                    }))
                  }
                  placeholder="Descripción completa con detalles del producto"
                />
              </label>
            </div>
          </section>

          <section className="card">
            <h2>Imágenes</h2>
            <p className="hint">
              Arrastrá imágenes acá o hacé click. La primera de la lista es la
              principal (la que se ve en el catálogo). Podés cambiar el orden o
              elegir otra como principal.
            </p>

            <div
              className={`dropzone ${uploading ? 'uploading' : ''}`}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={e => {
                  if (e.target.files) handleFiles(e.target.files)
                  e.target.value = ''
                }}
              />
              {uploading ? (
                <span>Subiendo...</span>
              ) : (
                <>
                  <strong>📤 Subir imágenes</strong>
                  <small>
                    Arrastrá acá los archivos o hacé click para seleccionar
                  </small>
                </>
              )}
            </div>

            {producto.imagenes.length > 0 && (
              <div className="gallery">
                {producto.imagenes.map((url, idx) => (
                  <div
                    key={url}
                    className={`thumb ${
                      url === producto.imagen_url ? 'principal' : ''
                    }`}
                  >
                    <img src={url} alt={`Imagen ${idx + 1}`} />
                    {url === producto.imagen_url && (
                      <span className="tag-principal">PRINCIPAL</span>
                    )}
                    <div className="thumb-actions">
                      <button
                        type="button"
                        onClick={() => moverImagen(url, -1)}
                        disabled={idx === 0}
                        title="Mover izquierda"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => setComoPrincipal(url)}
                        title="Marcar principal"
                        disabled={url === producto.imagen_url}
                      >
                        ⭐
                      </button>
                      <button
                        type="button"
                        onClick={() => moverImagen(url, 1)}
                        disabled={idx === producto.imagenes.length - 1}
                        title="Mover derecha"
                      >
                        →
                      </button>
                      <button
                        type="button"
                        className="del"
                        onClick={() => quitarImagen(url)}
                        title="Quitar"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <h2>Variantes</h2>
            <p className="hint">
              Si el producto tiene distintas medidas, colores o versiones con
              precios diferentes, agregalas acá. El cliente debe elegir una al
              comprar. Si no agregás ninguna, se usa el precio principal.
            </p>

            {variantes.length === 0 ? (
              <div className="empty-variantes">
                Este producto no tiene variantes. El cliente comprará al precio
                principal.
              </div>
            ) : (
              <div className="variantes-list">
                <div className="variante-row variante-header">
                  <span>Nombre / Medida</span>
                  <span>Precio</span>
                  <span></span>
                </div>
                {variantes.map((v, idx) => (
                  <div key={v._localId} className="variante-row">
                    <input
                      type="text"
                      placeholder="Ej: 1.00 x 1.00"
                      value={v.nombre}
                      onChange={e =>
                        updateVariante(v._localId, 'nombre', e.target.value)
                      }
                    />
                    <input
                      type="number"
                      min={0}
                      step={1}
                      placeholder="0"
                      value={v.precio || ''}
                      onChange={e =>
                        updateVariante(v._localId, 'precio', e.target.value)
                      }
                    />
                    <div className="variante-actions">
                      <button
                        type="button"
                        onClick={() => moverVariante(v._localId, -1)}
                        disabled={idx === 0}
                        title="Subir"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moverVariante(v._localId, 1)}
                        disabled={idx === variantes.length - 1}
                        title="Bajar"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="del"
                        onClick={() => removeVariante(v._localId)}
                        title="Eliminar variante"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              className="btn-add-variante"
              onClick={addVariante}
            >
              + Agregar variante
            </button>
          </section>

          <section className="card">
            <h2>Especificaciones técnicas</h2>
            <p className="hint">
              Pares clave/valor que se muestran en la ficha técnica del
              producto. Ej: Material → PVC, Espesor → 20mm.
            </p>

            <div className="specs-list">
              {specs.map((s, i) => (
                <div key={i} className="spec-row">
                  <input
                    type="text"
                    placeholder="Clave (ej: Material)"
                    value={s.key}
                    onChange={e => updateSpec(i, 'key', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Valor (ej: PVC blanco)"
                    value={s.value}
                    onChange={e => updateSpec(i, 'value', e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-del-spec"
                    onClick={() => removeSpec(i)}
                    aria-label="Eliminar"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button type="button" className="btn-add-spec" onClick={addSpec}>
              + Agregar especificación
            </button>
          </section>
        </div>

        {/* COL DER */}
        <aside className="col-side">
          <section className="card sticky">
            <h2>Estado y precio</h2>

            <div className="row">
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={producto.activo}
                  onChange={e =>
                    setProducto(p => ({ ...p, activo: e.target.checked }))
                  }
                />
                Producto visible en la tienda
              </label>
            </div>

            <div className="row">
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={producto.destacado}
                  onChange={e =>
                    setProducto(p => ({ ...p, destacado: e.target.checked }))
                  }
                />
                Marcar como destacado ⭐
              </label>
            </div>

            <div className="row two-cols">
              <label>
                Precio
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={producto.precio}
                  onChange={e =>
                    setProducto(p => ({
                      ...p,
                      precio: Number(e.target.value),
                    }))
                  }
                />
              </label>

              <label>
                Unidad
                <input
                  type="text"
                  value={producto.unidad}
                  onChange={e =>
                    setProducto(p => ({ ...p, unidad: e.target.value }))
                  }
                  placeholder="m2, unidad, ml..."
                />
              </label>
            </div>

            <div className="row">
              <label>
                Precio "desde" (opcional)
                <input
                  type="number"
                  min={0}
                  value={producto.precio_desde ?? ''}
                  onChange={e =>
                    setProducto(p => ({
                      ...p,
                      precio_desde: e.target.value
                        ? Number(e.target.value)
                        : null,
                    }))
                  }
                  placeholder="Ej: 2500"
                />
                <small>
                  Si el producto tiene variantes, el listado calcula el "desde"
                  automáticamente con el precio menor. Este campo es solo para
                  forzar uno distinto.
                </small>
              </label>
            </div>

            <div className="row">
              <label>
                Orden de aparición
                <input
                  type="number"
                  value={producto.orden}
                  onChange={e =>
                    setProducto(p => ({
                      ...p,
                      orden: Number(e.target.value),
                    }))
                  }
                />
                <small>Menor = aparece primero en el listado</small>
              </label>
            </div>
          </section>

          {error && <div className="error-box">{error}</div>}

          <div className="actions-bar">
            <Link href="/admin/tienda" className="btn-cancel">
              Cancelar
            </Link>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Guardando...' : esNuevo ? 'Crear producto' : 'Guardar cambios'}
            </button>
          </div>
        </aside>
      </form>

      <style jsx>{`
        .admin-page {
          padding: 32px;
          max-width: 1400px;
          margin: 0 auto;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .loading {
          padding: 60px;
          text-align: center;
          color: #888;
        }
        .admin-header {
          margin-bottom: 24px;
        }
        .btn-back {
          color: #666;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 12px;
        }
        .btn-back:hover {
          color: #d62828;
        }
        h1 {
          margin: 0;
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 24px;
          align-items: start;
        }
        .col-main,
        .col-side {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .card {
          background: white;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          border: 1px solid #f0f0f0;
        }
        .card.sticky {
          position: sticky;
          top: 20px;
        }
        .card h2 {
          margin: 0 0 16px;
          font-size: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #555;
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 10px;
        }
        .hint {
          color: #888;
          font-size: 0.85rem;
          margin: -6px 0 14px;
          line-height: 1.5;
        }

        .row {
          margin-bottom: 14px;
        }
        .row.two-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        label {
          display: block;
          font-size: 0.85rem;
          font-weight: 700;
          color: #444;
        }
        label small {
          display: block;
          color: #999;
          font-weight: 400;
          font-size: 0.78rem;
          margin-top: 4px;
          line-height: 1.4;
        }
        label small code {
          background: #f5f5f5;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        input[type='text'],
        input[type='number'],
        input[type='search'],
        select,
        textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 0.92rem;
          font-family: inherit;
          margin-top: 6px;
          background: white;
        }
        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: #d62828;
        }
        textarea {
          resize: vertical;
          min-height: 60px;
        }
        select:disabled {
          background: #f5f5f5;
          color: #aaa;
        }

        .check-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.92rem;
          font-weight: 600;
          color: #333;
        }
        .check-label input {
          margin: 0;
          width: auto;
        }

        /* DROPZONE */
        .dropzone {
          border: 2px dashed #ddd;
          border-radius: 12px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: 0.2s;
          background: #fafafa;
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: center;
        }
        .dropzone:hover {
          border-color: #d62828;
          background: #fff;
        }
        .dropzone.uploading {
          opacity: 0.6;
          cursor: wait;
        }
        .dropzone strong {
          font-size: 1rem;
          color: #333;
        }
        .dropzone small {
          color: #888;
          font-size: 0.82rem;
        }

        .gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
          margin-top: 16px;
        }
        .thumb {
          position: relative;
          background: #fff;
          border: 2px solid #eee;
          border-radius: 10px;
          overflow: hidden;
          aspect-ratio: 1 / 1;
        }
        .thumb.principal {
          border-color: #d62828;
        }
        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .tag-principal {
          position: absolute;
          top: 6px;
          left: 6px;
          background: #d62828;
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 3px 6px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }
        .thumb-actions {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.65);
          display: flex;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .thumb:hover .thumb-actions {
          opacity: 1;
        }
        .thumb-actions button {
          flex: 1;
          background: none;
          border: none;
          color: white;
          padding: 8px 4px;
          cursor: pointer;
          font-size: 0.8rem;
        }
        .thumb-actions button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .thumb-actions button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
        }
        .thumb-actions .del:hover {
          background: #d62828;
        }

        /* VARIANTES */
        .empty-variantes {
          background: #fafafa;
          border: 1px dashed #e0e0e0;
          border-radius: 10px;
          padding: 16px;
          font-size: 0.85rem;
          color: #888;
          text-align: center;
        }
        .variantes-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 4px;
        }
        .variante-row {
          display: grid;
          grid-template-columns: 1.4fr 1fr 120px;
          gap: 8px;
          align-items: center;
        }
        .variante-row input {
          margin: 0;
        }
        .variante-header {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #999;
          padding: 0 4px;
        }
        .variante-actions {
          display: flex;
          gap: 4px;
          margin-top: 6px;
        }
        .variante-actions button {
          flex: 1;
          height: 36px;
          border: 1px solid #eee;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          color: #666;
        }
        .variante-actions button:hover:not(:disabled) {
          border-color: #ccc;
          color: #333;
        }
        .variante-actions button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .variante-actions .del:hover {
          background: #fee2e2;
          color: #b91c1c;
          border-color: #fecaca;
        }
        .btn-add-variante {
          margin-top: 12px;
          background: white;
          border: 1px dashed #ccc;
          padding: 10px;
          width: 100%;
          border-radius: 8px;
          font-size: 0.85rem;
          color: #666;
          cursor: pointer;
          font-weight: 600;
        }
        .btn-add-variante:hover {
          border-color: #d62828;
          color: #d62828;
        }

        /* SPECS */
        .specs-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .spec-row {
          display: grid;
          grid-template-columns: 1fr 1.3fr 36px;
          gap: 8px;
        }
        .spec-row input {
          margin: 0;
        }
        .btn-del-spec {
          width: 36px;
          height: 36px;
          border: 1px solid #eee;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.2rem;
          color: #999;
          margin-top: 6px;
        }
        .btn-del-spec:hover {
          background: #fee2e2;
          color: #b91c1c;
        }
        .btn-add-spec {
          margin-top: 12px;
          background: white;
          border: 1px dashed #ccc;
          padding: 10px;
          width: 100%;
          border-radius: 8px;
          font-size: 0.85rem;
          color: #666;
          cursor: pointer;
          font-weight: 600;
        }
        .btn-add-spec:hover {
          border-color: #d62828;
          color: #d62828;
        }

        /* ACCIONES */
        .actions-bar {
          display: flex;
          gap: 10px;
          padding: 16px;
          background: white;
          border-radius: 14px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          border: 1px solid #f0f0f0;
        }
        .btn-cancel {
          flex: 1;
          background: white;
          color: #666;
          border: 1px solid #ddd;
          padding: 12px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          text-align: center;
          font-size: 0.9rem;
        }
        .btn-cancel:hover {
          background: #fafafa;
        }
        .btn-save {
          flex: 1.5;
          background: #d62828;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
        }
        .btn-save:hover:not(:disabled) {
          background: #a51d1d;
        }
        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-box {
          background: #fef2f2;
          color: #b91c1c;
          padding: 12px 14px;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 600;
          border: 1px solid #fecaca;
        }

        @media (max-width: 1000px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .card.sticky {
            position: static;
          }
          .variante-row {
            grid-template-columns: 1fr 1fr;
          }
          .variante-actions {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </div>
  )
}
