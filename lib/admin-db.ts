/**
 * Helper para operaciones de escritura del admin.
 * En vez de escribir directo a Supabase con la anon key,
 * pasa por /api/admin/db que usa la service_role key en el servidor.
 *
 * Uso:
 *   import { adminDB } from '@/lib/admin-db'
 *
 *   // Insert
 *   const { data, error } = await adminDB.insert('tienda_productos', payload)
 *   const { data, error } = await adminDB.insert('tienda_productos', payload, 'id')
 *
 *   // Update
 *   const { data, error } = await adminDB.update('tienda_productos', payload, { id: '...' })
 *
 *   // Delete
 *   const { data, error } = await adminDB.delete('tienda_productos', { id: '...' })
 *
 *   // Delete con múltiples condiciones
 *   const { data, error } = await adminDB.delete('tienda_producto_variantes', { producto_id: '...' })
 */

type AdminResult = {
  data: any
  error: string | null
}

async function callAPI(body: Record<string, any>): Promise<AdminResult> {
  try {
    const res = await fetch('/api/admin/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!res.ok) {
      return { data: null, error: json.error || 'Error desconocido' }
    }
    return { data: json.data, error: null }
  } catch (err: any) {
    return { data: null, error: err.message || 'Error de red' }
  }
}

export const adminDB = {
  async insert(table: string, data: any, select?: string): Promise<AdminResult> {
    return callAPI({ action: 'insert', table, data, select })
  },

  async update(table: string, data: any, match: Record<string, string>, select?: string): Promise<AdminResult> {
    return callAPI({ action: 'update', table, data, match, select })
  },

  async delete(table: string, match: Record<string, string>): Promise<AdminResult> {
    return callAPI({ action: 'delete', table, match })
  },

  async upsert(table: string, data: any, select?: string): Promise<AdminResult> {
    return callAPI({ action: 'upsert', table, data, select })
  },
}
