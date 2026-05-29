'use client';

import { useEffect, useMemo, useState } from 'react';
// ⚠️ Ajustá este import si tu cliente de Supabase vive en otra ruta
// (ej. '@/lib/supabaseClient' o '@/utils/supabase'). Es la única línea a tocar.
import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
type Estado =
  | 'retira_local'
  | 'sin_fecha'
  | 'programado'
  | 'en_viaje'
  | 'entregado'
  | 'entregado_resuelto';

interface Envio {
  id: string;
  numero_orden: string | null;
  nombre_cliente: string;
  celular: string | null;
  fecha_programada: string | null; // 'YYYY-MM-DD'
  hora: string | null;
  direccion: string | null;
  maps_link: string | null;
  mercaderia: string[] | null;
  estado: Estado;
  notas: string | null;
  created_at: string;
}

interface Categoria {
  id: string;
  nombre: string;
  orden: number;
  activo: boolean;
}

// ---------------------------------------------------------------------------
// Config de estados (orden, etiqueta, color)
// ---------------------------------------------------------------------------
const ESTADOS: { key: Estado; label: string; color: string }[] = [
  { key: 'retira_local', label: 'Retira en el local', color: '#7c3aed' },
  { key: 'sin_fecha', label: 'Sin fecha de entrega', color: '#94a3b8' },
  { key: 'programado', label: 'Programado', color: '#2563eb' },
  { key: 'en_viaje', label: 'En viaje', color: '#d97706' },
  { key: 'entregado', label: 'Entregado', color: '#16a34a' },
  { key: 'entregado_resuelto', label: 'Entregado y resuelto', color: '#0f766e' },
];

const estadoInfo = (e: Estado) =>
  ESTADOS.find((x) => x.key === e) || ESTADOS[1];

// ---------------------------------------------------------------------------
// Helpers de fecha (en horario local)
// ---------------------------------------------------------------------------
const toISODate = (d: Date) => {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
};
const HOY = toISODate(new Date());
const MANANA = toISODate(new Date(Date.now() + 86400000));

const fmtFecha = (iso: string | null) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

// Link a Google Maps: usa el link pegado o arma uno con la dirección
const mapsHref = (e: Envio) => {
  if (e.maps_link && e.maps_link.trim()) return e.maps_link.trim();
  if (e.direccion && e.direccion.trim())
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      e.direccion.trim()
    )}`;
  return null;
};

// ---------------------------------------------------------------------------
// Formulario vacío
// ---------------------------------------------------------------------------
const formVacio = () => ({
  id: '' as string,
  numero_orden: '',
  nombre_cliente: '',
  celular: '',
  fecha_programada: '',
  hora: '',
  direccion: '',
  maps_link: '',
  mercaderia: [] as string[],
  estado: 'sin_fecha' as Estado,
  notas: '',
});

// ===========================================================================
// Componente
// ===========================================================================
export default function EnviosAdminPage() {
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<Estado | 'todos'>('todos');
  const [filtroDia, setFiltroDia] = useState<string>(''); // '' = todos

  // Modales
  const [modalForm, setModalForm] = useState(false);
  const [modalCat, setModalCat] = useState(false);
  const [form, setForm] = useState(formVacio());
  const [guardando, setGuardando] = useState(false);

  // Alta de categoría
  const [nuevaCat, setNuevaCat] = useState('');

  // -------------------------------------------------------------------------
  // Carga inicial
  // -------------------------------------------------------------------------
  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    setCargando(true);
    await Promise.all([cargarEnvios(), cargarCategorias()]);
    setCargando(false);
  }

  async function cargarEnvios() {
    const { data, error } = await supabase
      .from('envios')
      .select('*')
      .order('fecha_programada', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (!error && data) setEnvios(data as Envio[]);
  }

  async function cargarCategorias() {
    const { data, error } = await supabase
      .from('envio_categorias')
      .select('*')
      .order('orden', { ascending: true });
    if (!error && data) setCategorias(data as Categoria[]);
  }

  // -------------------------------------------------------------------------
  // Guardar / editar / borrar envío
  // -------------------------------------------------------------------------
  async function guardarEnvio() {
    if (!form.nombre_cliente.trim()) {
      alert('Poné al menos el nombre del cliente.');
      return;
    }
    setGuardando(true);

    const payload = {
      numero_orden: form.numero_orden.trim() || null,
      nombre_cliente: form.nombre_cliente.trim(),
      celular: form.celular.trim() || null,
      fecha_programada: form.fecha_programada || null,
      hora: form.hora.trim() || null,
      direccion: form.direccion.trim() || null,
      maps_link: form.maps_link.trim() || null,
      mercaderia: form.mercaderia,
      estado: form.estado,
      notas: form.notas.trim() || null,
    };

    let error;
    if (form.id) {
      ({ error } = await supabase.from('envios').update(payload).eq('id', form.id));
    } else {
      ({ error } = await supabase.from('envios').insert(payload));
    }

    setGuardando(false);
    if (error) {
      alert('Error al guardar: ' + error.message);
      return;
    }
    setModalForm(false);
    setForm(formVacio());
    cargarEnvios();
  }

  function editar(e: Envio) {
    setForm({
      id: e.id,
      numero_orden: e.numero_orden || '',
      nombre_cliente: e.nombre_cliente || '',
      celular: e.celular || '',
      fecha_programada: e.fecha_programada || '',
      hora: e.hora || '',
      direccion: e.direccion || '',
      maps_link: e.maps_link || '',
      mercaderia: e.mercaderia || [],
      estado: e.estado,
      notas: e.notas || '',
    });
    setModalForm(true);
  }

  async function borrar(id: string) {
    if (!confirm('¿Eliminar este envío? No se puede deshacer.')) return;
    const { error } = await supabase.from('envios').delete().eq('id', id);
    if (error) {
      alert('Error al eliminar: ' + error.message);
      return;
    }
    cargarEnvios();
  }

  async function cambiarEstado(id: string, estado: Estado) {
    const { error } = await supabase.from('envios').update({ estado }).eq('id', id);
    if (!error) {
      setEnvios((prev) => prev.map((e) => (e.id === id ? { ...e, estado } : e)));
    }
  }

  // -------------------------------------------------------------------------
  // Categorías
  // -------------------------------------------------------------------------
  async function agregarCategoria(nombre: string) {
    const n = nombre.trim();
    if (!n) return;
    if (categorias.some((c) => c.nombre.toLowerCase() === n.toLowerCase())) {
      alert('Esa categoría ya existe.');
      return;
    }
    const orden = (categorias.at(-1)?.orden || 0) + 1;
    const { error } = await supabase
      .from('envio_categorias')
      .insert({ nombre: n, orden });
    if (error) {
      alert('Error: ' + error.message);
      return;
    }
    setNuevaCat('');
    await cargarCategorias();
  }

  async function toggleCategoria(c: Categoria) {
    const { error } = await supabase
      .from('envio_categorias')
      .update({ activo: !c.activo })
      .eq('id', c.id);
    if (!error) cargarCategorias();
  }

  async function borrarCategoria(c: Categoria) {
    if (!confirm(`¿Eliminar la categoría "${c.nombre}"?`)) return;
    const { error } = await supabase.from('envio_categorias').delete().eq('id', c.id);
    if (!error) cargarCategorias();
  }

  function toggleMercaderiaForm(nombre: string) {
    setForm((f) => ({
      ...f,
      mercaderia: f.mercaderia.includes(nombre)
        ? f.mercaderia.filter((m) => m !== nombre)
        : [...f.mercaderia, nombre],
    }));
  }

  // -------------------------------------------------------------------------
  // Filtrado
  // -------------------------------------------------------------------------
  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return envios.filter((e) => {
      if (filtroEstado !== 'todos' && e.estado !== filtroEstado) return false;
      if (filtroDia && e.fecha_programada !== filtroDia) return false;
      if (q) {
        const blob = [
          e.numero_orden,
          e.nombre_cliente,
          e.celular,
          e.direccion,
          (e.mercaderia || []).join(' '),
        ]
          .join(' ')
          .toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [envios, busqueda, filtroEstado, filtroDia]);

  const conteoPorEstado = useMemo(() => {
    const c: Record<string, number> = {};
    envios.forEach((e) => (c[e.estado] = (c[e.estado] || 0) + 1));
    return c;
  }, [envios]);

  const catsActivas = categorias.filter((c) => c.activo);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="env">
      {/* Encabezado */}
      <div className="head">
        <div>
          <h1>📦 Envíos</h1>
          <p>Carga manual de envíos, programación por día y seguimiento de estados.</p>
        </div>
        <div className="head-btns">
          <button className="btn ghost" onClick={() => setModalCat(true)}>
            Categorías
          </button>
          <button
            className="btn primary"
            onClick={() => {
              setForm(formVacio());
              setModalForm(true);
            }}
          >
            + Nuevo envío
          </button>
        </div>
      </div>

      {/* Chips de estado (filtran) */}
      <div className="chips">
        <button
          className={`chip ${filtroEstado === 'todos' ? 'on' : ''}`}
          onClick={() => setFiltroEstado('todos')}
        >
          Todos <span className="n">{envios.length}</span>
        </button>
        {ESTADOS.map((s) => (
          <button
            key={s.key}
            className={`chip ${filtroEstado === s.key ? 'on' : ''}`}
            style={
              filtroEstado === s.key
                ? { background: s.color, borderColor: s.color, color: '#fff' }
                : { borderColor: s.color, color: s.color }
            }
            onClick={() => setFiltroEstado(s.key)}
          >
            {s.label} <span className="n">{conteoPorEstado[s.key] || 0}</span>
          </button>
        ))}
      </div>

      {/* Filtros: día + búsqueda */}
      <div className="filtros">
        <div className="dia">
          <span className="lbl">Día:</span>
          <button
            className={`btn sm ${filtroDia === '' ? 'on' : ''}`}
            onClick={() => setFiltroDia('')}
          >
            Todos
          </button>
          <button
            className={`btn sm ${filtroDia === HOY ? 'on' : ''}`}
            onClick={() => setFiltroDia(HOY)}
          >
            Hoy
          </button>
          <button
            className={`btn sm ${filtroDia === MANANA ? 'on' : ''}`}
            onClick={() => setFiltroDia(MANANA)}
          >
            Mañana
          </button>
          <input
            type="date"
            value={filtroDia}
            onChange={(e) => setFiltroDia(e.target.value)}
          />
        </div>
        <input
          className="buscador"
          placeholder="Buscar por orden, cliente, celular, dirección…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {filtroDia && (
        <p className="resumen-dia">
          Mostrando <b>{filtrados.length}</b> envío(s) para el{' '}
          <b>{fmtFecha(filtroDia)}</b>.
        </p>
      )}

      {/* Listado */}
      {cargando ? (
        <p className="vacio">Cargando…</p>
      ) : filtrados.length === 0 ? (
        <p className="vacio">No hay envíos para los filtros seleccionados.</p>
      ) : (
        <div className="tabla-wrap">
          <table>
            <thead>
              <tr>
                <th>Orden</th>
                <th>Cliente</th>
                <th>Día</th>
                <th>Mercadería</th>
                <th>Dirección</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((e) => {
                const info = estadoInfo(e.estado);
                const href = mapsHref(e);
                return (
                  <tr key={e.id}>
                    <td className="orden">{e.numero_orden || '—'}</td>
                    <td>
                      <div className="cli">{e.nombre_cliente}</div>
                      {e.celular && (
                        <a className="tel" href={`tel:${e.celular}`}>
                          {e.celular}
                        </a>
                      )}
                    </td>
                    <td>
                      {fmtFecha(e.fecha_programada)}
                      {e.hora && <div className="hora">{e.hora}</div>}
                    </td>
                    <td>
                      <div className="tags">
                        {(e.mercaderia || []).length ? (
                          (e.mercaderia || []).map((m) => (
                            <span key={m} className="tag">
                              {m}
                            </span>
                          ))
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </div>
                    </td>
                    <td className="dir">
                      {e.direccion || (e.maps_link ? 'Ver ubicación' : '—')}
                      {href && (
                        <a
                          className="maps"
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          📍 Maps
                        </a>
                      )}
                    </td>
                    <td>
                      <select
                        className="estado-sel"
                        value={e.estado}
                        style={{ color: info.color, borderColor: info.color }}
                        onChange={(ev) =>
                          cambiarEstado(e.id, ev.target.value as Estado)
                        }
                      >
                        {ESTADOS.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="acciones">
                      <button onClick={() => editar(e)} title="Editar">
                        ✏️
                      </button>
                      <button onClick={() => borrar(e.id)} title="Eliminar">
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------------- Modal: alta / edición ---------------- */}
      {modalForm && (
        <div className="overlay" onClick={() => setModalForm(false)}>
          <div className="modal" onClick={(ev) => ev.stopPropagation()}>
            <div className="modal-head">
              <h2>{form.id ? 'Editar envío' : 'Nuevo envío'}</h2>
              <button className="x" onClick={() => setModalForm(false)}>
                ✕
              </button>
            </div>

            <div className="grid">
              <label>
                Número de orden
                <input
                  value={form.numero_orden}
                  onChange={(e) =>
                    setForm({ ...form, numero_orden: e.target.value })
                  }
                  placeholder="Ej. 1042"
                />
              </label>
              <label>
                Nombre del cliente *
                <input
                  value={form.nombre_cliente}
                  onChange={(e) =>
                    setForm({ ...form, nombre_cliente: e.target.value })
                  }
                />
              </label>
              <label>
                Celular
                <input
                  value={form.celular}
                  onChange={(e) => setForm({ ...form, celular: e.target.value })}
                  placeholder="09x xxx xxx"
                />
              </label>
              <label>
                Día programado / de retiro
                <input
                  type="date"
                  value={form.fecha_programada}
                  onChange={(e) =>
                    setForm({ ...form, fecha_programada: e.target.value })
                  }
                />
              </label>
              <label>
                Hora / franja (opcional)
                <input
                  value={form.hora}
                  onChange={(e) => setForm({ ...form, hora: e.target.value })}
                  placeholder="Ej. 14:00 o «por la tarde»"
                />
              </label>
              <label>
                Estado
                <select
                  value={form.estado}
                  onChange={(e) =>
                    setForm({ ...form, estado: e.target.value as Estado })
                  }
                >
                  {ESTADOS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="full">
                Dirección
                <input
                  value={form.direccion}
                  onChange={(e) =>
                    setForm({ ...form, direccion: e.target.value })
                  }
                  placeholder="Calle, número, esquina, localidad…"
                />
              </label>
              <label className="full">
                Link de Google Maps (opcional)
                <input
                  value={form.maps_link}
                  onChange={(e) =>
                    setForm({ ...form, maps_link: e.target.value })
                  }
                  placeholder="Pegá un link de Maps si lo tenés"
                />
                <small>
                  Si lo dejás vacío, se genera un link automático a partir de la
                  dirección.
                </small>
              </label>

              {/* Mercadería */}
              <div className="full">
                <div className="merc-head">
                  <span>Mercadería</span>
                  <button
                    type="button"
                    className="link"
                    onClick={() => setModalCat(true)}
                  >
                    Gestionar categorías
                  </button>
                </div>
                <div className="checks">
                  {catsActivas.map((c) => (
                    <label key={c.id} className="check">
                      <input
                        type="checkbox"
                        checked={form.mercaderia.includes(c.nombre)}
                        onChange={() => toggleMercaderiaForm(c.nombre)}
                      />
                      {c.nombre}
                    </label>
                  ))}
                </div>
                <div className="add-cat">
                  <input
                    value={nuevaCat}
                    onChange={(e) => setNuevaCat(e.target.value)}
                    placeholder="Nueva categoría…"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        agregarCategoria(nuevaCat);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => agregarCategoria(nuevaCat)}
                  >
                    + Agregar
                  </button>
                </div>
              </div>

              <label className="full">
                Notas internas
                <textarea
                  rows={2}
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  placeholder="No visible para el cliente"
                />
              </label>
            </div>

            <div className="modal-foot">
              <button className="btn ghost" onClick={() => setModalForm(false)}>
                Cancelar
              </button>
              <button
                className="btn primary"
                onClick={guardarEnvio}
                disabled={guardando}
              >
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Modal: categorías ---------------- */}
      {modalCat && (
        <div className="overlay" onClick={() => setModalCat(false)}>
          <div className="modal small" onClick={(ev) => ev.stopPropagation()}>
            <div className="modal-head">
              <h2>Categorías de mercadería</h2>
              <button className="x" onClick={() => setModalCat(false)}>
                ✕
              </button>
            </div>
            <ul className="cat-list">
              {categorias.map((c) => (
                <li key={c.id} className={c.activo ? '' : 'off'}>
                  <span>{c.nombre}</span>
                  <div>
                    <button onClick={() => toggleCategoria(c)}>
                      {c.activo ? 'Ocultar' : 'Activar'}
                    </button>
                    <button className="del" onClick={() => borrarCategoria(c)}>
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="add-cat">
              <input
                value={nuevaCat}
                onChange={(e) => setNuevaCat(e.target.value)}
                placeholder="Nueva categoría…"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    agregarCategoria(nuevaCat);
                  }
                }}
              />
              <button className="btn sm" onClick={() => agregarCategoria(nuevaCat)}>
                + Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Estilos ---------------- */}
      <style jsx>{`
        .env {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
          color: #1e293b;
        }
        .head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .head h1 {
          font-size: 26px;
          margin: 0 0 4px;
        }
        .head p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }
        .head-btns {
          display: flex;
          gap: 8px;
        }
        .btn {
          border: none;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.15s;
        }
        .btn.primary {
          background: #1d4ed8;
          color: #fff;
        }
        .btn.primary:hover {
          background: #1e40af;
        }
        .btn.ghost {
          background: #f1f5f9;
          color: #334155;
        }
        .btn.ghost:hover {
          background: #e2e8f0;
        }
        .btn.sm {
          padding: 6px 12px;
          font-size: 13px;
          background: #f1f5f9;
          color: #334155;
        }
        .btn.sm.on {
          background: #1d4ed8;
          color: #fff;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }
        .chip {
          background: #fff;
          border: 1.5px solid #cbd5e1;
          color: #475569;
          border-radius: 999px;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .chip.on {
          background: #334155;
          color: #fff;
          border-color: #334155;
        }
        .chip .n {
          opacity: 0.7;
          font-weight: 700;
          margin-left: 4px;
        }

        .filtros {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 8px;
        }
        .dia {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .dia .lbl {
          font-size: 13px;
          color: #64748b;
          font-weight: 600;
        }
        .dia input[type='date'] {
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 7px 10px;
          font-size: 13px;
        }
        .buscador {
          flex: 1;
          min-width: 220px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 14px;
        }
        .resumen-dia {
          font-size: 14px;
          color: #475569;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          padding: 8px 12px;
          border-radius: 8px;
          margin: 8px 0 16px;
        }
        .vacio {
          text-align: center;
          color: #94a3b8;
          padding: 48px 0;
        }

        .tabla-wrap {
          overflow-x: auto;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #fff;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 880px;
        }
        th {
          text-align: left;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #94a3b8;
          padding: 12px 14px;
          border-bottom: 1px solid #e2e8f0;
        }
        td {
          padding: 12px 14px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
          vertical-align: top;
        }
        tr:last-child td {
          border-bottom: none;
        }
        .orden {
          font-weight: 700;
          color: #0f172a;
        }
        .cli {
          font-weight: 600;
        }
        .tel {
          font-size: 13px;
          color: #2563eb;
          text-decoration: none;
        }
        .hora {
          font-size: 12px;
          color: #64748b;
        }
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          max-width: 220px;
        }
        .tag {
          background: #f1f5f9;
          color: #334155;
          border-radius: 6px;
          padding: 2px 8px;
          font-size: 12px;
          font-weight: 600;
        }
        .muted {
          color: #cbd5e1;
        }
        .dir {
          max-width: 220px;
          color: #475569;
        }
        .maps {
          display: inline-block;
          margin-top: 4px;
          font-size: 12px;
          color: #2563eb;
          text-decoration: none;
          font-weight: 600;
        }
        .estado-sel {
          border: 1.5px solid;
          border-radius: 8px;
          padding: 6px 8px;
          font-size: 13px;
          font-weight: 600;
          background: #fff;
          cursor: pointer;
        }
        .acciones {
          white-space: nowrap;
        }
        .acciones button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 2px 4px;
        }

        /* Modales */
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 24px;
          z-index: 100;
          overflow-y: auto;
        }
        .modal {
          background: #fff;
          border-radius: 16px;
          width: 100%;
          max-width: 640px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }
        .modal.small {
          max-width: 440px;
        }
        .modal-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 22px;
          border-bottom: 1px solid #e2e8f0;
        }
        .modal-head h2 {
          margin: 0;
          font-size: 18px;
        }
        .x {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #94a3b8;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          padding: 22px;
        }
        .grid label,
        .grid .full {
          display: flex;
          flex-direction: column;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          gap: 5px;
        }
        .grid .full {
          grid-column: 1 / -1;
        }
        .grid input,
        .grid select,
        .grid textarea {
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 9px 11px;
          font-size: 14px;
          font-weight: 400;
          color: #1e293b;
          font-family: inherit;
        }
        .grid small {
          font-weight: 400;
          color: #94a3b8;
          font-size: 12px;
        }
        .merc-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .link {
          background: none;
          border: none;
          color: #2563eb;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .checks {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 16px;
          margin: 8px 0;
        }
        .check {
          flex-direction: row !important;
          align-items: center;
          gap: 6px;
          font-weight: 500 !important;
          color: #334155 !important;
          cursor: pointer;
        }
        .check input {
          width: 16px;
          height: 16px;
        }
        .add-cat {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .add-cat input {
          flex: 1;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 8px 11px;
          font-size: 14px;
        }
        .modal-foot {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 22px;
          border-top: 1px solid #e2e8f0;
        }

        .cat-list {
          list-style: none;
          margin: 0;
          padding: 12px 22px;
        }
        .cat-list li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
        }
        .cat-list li.off span {
          color: #cbd5e1;
          text-decoration: line-through;
        }
        .cat-list li div {
          display: flex;
          gap: 6px;
        }
        .cat-list button {
          background: #f1f5f9;
          border: none;
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 12px;
          cursor: pointer;
          color: #334155;
        }
        .cat-list button.del {
          color: #dc2626;
        }
        .modal.small .add-cat {
          padding: 0 22px 20px;
        }

        @media (max-width: 640px) {
          .env {
            padding: 16px;
          }
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
