'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Usuario = {
  id: string; nombre: string; username: string; telefono: string
  rol: string; activo: boolean; created_at: string; password?: string
}

const S = {
  inp: { background: '#111', border: '1px solid #2e2e2e', borderRadius: 7, color: '#f0f0f0', fontFamily: 'inherit', fontSize: 13, padding: '8px 12px', outline: 'none', width: '100%', boxSizing: 'border-box' as const },
  btn: (bg = '#D62828', color = '#fff') => ({ background: bg, color, border: 'none', borderRadius: 7, padding: '8px 16px', cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, textTransform: 'uppercase' as const, letterSpacing: 1, whiteSpace: 'nowrap' as const, transition: 'opacity .15s' }),
}

export default function AdminUsuariosPage() {
  const { vendedor, isAdmin } = useAuth()
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nombre: '', username: '', password: '', telefono: '', rol: 'vendedor' })
  const [error, setError] = useState('')

  // Solo admins
  useEffect(() => {
    if (!isAdmin && vendedor) router.replace('/admin')
  }, [isAdmin, vendedor])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('vendedores').select('id,nombre,username,telefono,rol,activo,created_at').order('created_at')
    setUsuarios(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const abrirNuevo = () => {
    setEditando(null)
    setForm({ nombre: '', username: '', password: '', telefono: '', rol: 'vendedor' })
    setError('')
    setModal(true)
  }

  const abrirEditar = (u: Usuario) => {
    setEditando(u)
    setForm({ nombre: u.nombre, username: u.username, password: '', telefono: u.telefono || '', rol: u.rol || 'vendedor' })
    setError('')
    setModal(true)
  }

  const guardar = async () => {
    if (!form.nombre.trim() || !form.username.trim()) { setError('Nombre y usuario son obligatorios'); return }
    if (!editando && !form.password.trim()) { setError('La contraseña es obligatoria para usuarios nuevos'); return }
    setSaving(true); setError('')

    if (editando) {
      const upd: any = { nombre: form.nombre.trim(), username: form.username.trim(), telefono: form.telefono.trim(), rol: form.rol }
      if (form.password.trim()) upd.password = form.password.trim()
      const { error: err } = await supabase.from('vendedores').update(upd).eq('id', editando.id)
      if (err) { setError('Error al guardar'); setSaving(false); return }
      await supabase.from('audit_log').insert({ vendedor_id: vendedor?.id, vendedor_nombre: vendedor?.nombre, accion: 'editar', tabla: 'vendedores', registro_id: editando.id, descripcion: `Editó usuario ${form.nombre} (${form.rol})`, datos_antes: { nombre: editando.nombre, rol: editando.rol }, datos_despues: { nombre: form.nombre, rol: form.rol } })
    } else {
      // Verificar que no exista el username
      const { data: existe } = await supabase.from('vendedores').select('id').eq('username', form.username.trim()).single()
      if (existe) { setError('Ese nombre de usuario ya existe'); setSaving(false); return }
      const { error: err } = await supabase.from('vendedores').insert({
        nombre: form.nombre.trim(), username: form.username.trim(),
        password: form.password.trim(), telefono: form.telefono.trim(),
        rol: form.rol, activo: true,
      })
      if (err) { setError('Error al crear usuario'); setSaving(false); return }
      await supabase.from('audit_log').insert({ vendedor_id: vendedor?.id, vendedor_nombre: vendedor?.nombre, accion: 'crear', tabla: 'vendedores', descripcion: `Creó usuario ${form.nombre} con rol ${form.rol}` })
    }
    setSaving(false); setModal(false); load()
  }

  const toggleActivo = async (u: Usuario) => {
    const nuevoEstado = !u.activo
    await supabase.from('vendedores').update({ activo: nuevoEstado }).eq('id', u.id)
    await supabase.from('audit_log').insert({ vendedor_id: vendedor?.id, vendedor_nombre: vendedor?.nombre, accion: nuevoEstado ? 'activar' : 'desactivar', tabla: 'vendedores', registro_id: u.id, descripcion: `${nuevoEstado ? 'Activó' : 'Desactivó'} usuario ${u.nombre}` })
    load()
  }

  const eliminar = async (u: Usuario) => {
    if (u.id === vendedor?.id) { alert('No podés eliminar tu propio usuario'); return }
    if (!confirm(`¿Eliminar a ${u.nombre}? Esta acción no se puede deshacer.`)) return
    await supabase.from('audit_log').update({ vendedor_id: null }).eq('vendedor_id', u.id)
    await supabase.from('vendedores').delete().eq('id', u.id)
    await supabase.from('audit_log').insert({ vendedor_id: vendedor?.id, vendedor_nombre: vendedor?.nombre, accion: 'eliminar', tabla: 'vendedores', descripcion: `Eliminó usuario ${u.nombre}` })
    load()
  }

  const ROL_COLOR: Record<string, string> = { admin: '#D62828', vendedor: '#F7B731' }

  if (loading) return <div style={{ color: '#888', padding: 40 }}>Cargando usuarios...</div>

  return (
    <div style={{ maxWidth: 900, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#fff', margin: '0 0 4px' }}>
            👥 Usuarios
          </h1>
          <p style={{ fontSize: 13, color: '#666', margin: 0 }}>{usuarios.length} usuarios registrados · Solo admins pueden gestionar usuarios</p>
        </div>
        <button onClick={abrirNuevo} style={S.btn()}>+ Nuevo usuario</button>
      </div>

      {/* Tabla */}
      <div style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #D62828' }}>
              {['Usuario', 'Nombre', 'Teléfono', 'Rol', 'Estado', 'Creado', ''].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#555', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #1e1e1e', opacity: u.activo ? 1 : 0.5 }}>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, fontFamily: 'monospace' }}>@{u.username}</div>
                  {u.id === vendedor?.id && <div style={{ fontSize: 10, color: '#6ec8a0' }}>• Sos vos</div>}
                </td>
                <td style={{ padding: '10px 14px', fontSize: 13, color: '#ccc' }}>{u.nombre}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#666' }}>{u.telefono || '—'}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ background: (ROL_COLOR[u.rol] || '#888') + '22', color: ROL_COLOR[u.rol] || '#888', border: `1px solid ${(ROL_COLOR[u.rol] || '#888')}44`, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                    {u.rol || 'vendedor'}
                  </span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 11, color: u.activo ? '#6ec8a0' : '#888' }}>
                    {u.activo ? '● Activo' : '○ Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 11, color: '#555' }}>
                  {new Date(u.created_at).toLocaleDateString('es-UY')}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => abrirEditar(u)} style={{ ...S.btn('#2e2e2e', '#aaa'), padding: '5px 10px', fontSize: 12 }}>Editar</button>
                    {u.id !== vendedor?.id && (
                      <button onClick={() => toggleActivo(u)} style={{ ...S.btn(u.activo ? '#2a2a1a' : '#1a2a1a', u.activo ? '#aaa' : '#6ec8a0'), padding: '5px 10px', fontSize: 12, border: `1px solid ${u.activo ? '#3a3a2a' : '#2a4a2a'}` }}>
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    )}
                    {u.id !== vendedor?.id && u.rol !== 'admin' && (
                      <button onClick={() => eliminar(u)} style={{ ...S.btn('transparent', '#D62828'), border: '1px solid rgba(214,40,40,.3)', padding: '5px 10px', fontSize: 12 }}>✕</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div onClick={() => setModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 14, width: '100%', maxWidth: 440 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #2e2e2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 16, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>
                {editando ? 'Editar usuario' : 'Nuevo usuario'}
              </span>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Nombre completo', field: 'nombre', placeholder: 'ej: Juan Pérez' },
                { label: 'Usuario (login)', field: 'username', placeholder: 'ej: juan' },
                { label: editando ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña', field: 'password', placeholder: '••••••••', type: 'password' },
                { label: 'Teléfono (opcional)', field: 'telefono', placeholder: 'ej: 099 123 456' },
              ].map(({ label, field, placeholder, type }) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#666', marginBottom: 5 }}>{label}</label>
                  <input type={type || 'text'} placeholder={placeholder} value={(form as any)[field]}
                    onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} style={S.inp}
                    onFocus={e => { e.target.style.borderColor = '#F7B731' }}
                    onBlur={e => { e.target.style.borderColor = '#2e2e2e' }} />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#666', marginBottom: 5 }}>Rol</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[{ value: 'vendedor', label: '🛒 Vendedor', desc: 'Accede a calculadoras y presupuesto' }, { value: 'admin', label: '⚙️ Admin', desc: 'Accede a todo el panel' }].map(r => (
                    <button key={r.value} onClick={() => setForm(p => ({ ...p, rol: r.value }))} style={{
                      flex: 1, background: form.rol === r.value ? 'rgba(214,40,40,.15)' : '#111',
                      border: `1px solid ${form.rol === r.value ? '#D62828' : '#2e2e2e'}`,
                      borderRadius: 8, padding: '10px 12px', cursor: 'pointer', textAlign: 'left',
                      color: form.rol === r.value ? '#fff' : '#666', transition: 'all .15s',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{r.label}</div>
                      <div style={{ fontSize: 11, marginTop: 2, opacity: 0.7 }}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {error && <div style={{ background: 'rgba(214,40,40,.15)', border: '1px solid rgba(214,40,40,.3)', color: '#ff8888', fontSize: 13, padding: '8px 12px', borderRadius: 7 }}>{error}</div>}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button onClick={() => setModal(false)} style={{ ...S.btn('transparent', '#888'), border: '1px solid #333' }}>Cancelar</button>
                <button onClick={guardar} disabled={saving} style={S.btn()}>
                  {saving ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear usuario'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
}
