'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type ItemPresupuesto = {
  producto: { nombre: string; imagen_url: string }
  cantidad: number
  precioFinal: number
  varianteElegida?: { label: string }
}

type Presupuesto = {
  id: string
  codigo: number
  items: ItemPresupuesto[]
  total: number
  estado: string
  created_at: string
}

export default function AdminPresupuestosPage() {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [filtroCodigo, setFiltroCodigo] = useState('')
  const [loading, setLoading] = useState(true)
  const [seleccionado, setSeleccionado] = useState<Presupuesto | null>(null)

  useEffect(() => {
    cargarPresupuestos()
  }, [])

  async function cargarPresupuestos() {
    setLoading(true)
    const { data, error } = await supabase
      .from('tienda_presupuestos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setPresupuestos(data)
    setLoading(false)
  }

  const actualizarEstado = async (id: string, nuevoEstado: string) => {
    await supabase.from('tienda_presupuestos').update({ estado: nuevoEstado }).eq('id', id)
    cargarPresupuestos()
    if (seleccionado?.id === id) setSeleccionado({ ...seleccionado, estado: nuevoEstado })
  }

  const presupuestosFiltrados = presupuestos.filter(p => 
    p.codigo.toString().includes(filtroCodigo)
  )

  const fmt = (n: number) => new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="admin-presupuestos">
      <header className="admin-header">
        <div>
          <h1>Historial de Presupuestos</h1>
          <p>Gestiona las solicitudes que llegan desde la tienda</p>
        </div>
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Buscar por código (ej: 1024)..." 
            value={filtroCodigo}
            onChange={(e) => setFiltroCodigo(e.target.value)}
          />
        </div>
      </header>

      <div className="admin-content">
        <aside className="list-aside">
          {loading ? <p>Cargando...</p> : (
            <div className="presupuestos-list">
              {presupuestosFiltrados.map(p => (
                <div 
                  key={p.id} 
                  className={`presupuesto-card ${seleccionado?.id === p.id ? 'active' : ''}`}
                  onClick={() => setSeleccionado(p)}
                >
                  <div className="card-info">
                    <span className="p-code">#{p.codigo}</span>
                    <span className="p-date">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="card-total">
                    <strong>{fmt(p.total)}</strong>
                    <span className={`status-badge ${p.estado}`}>{p.estado}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        <main className="detail-main">
          {seleccionado ? (
            <div className="detail-view animate-in">
              <div className="detail-header">
                <h2>Presupuesto #{seleccionado.codigo}</h2>
                <div className="actions">
                  <select 
                    value={seleccionado.estado} 
                    onChange={(e) => actualizarEstado(seleccionado.id, e.target.value)}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="contactado">Contactado</option>
                    <option value="vendido">Vendido</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="items-table">
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Unit.</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seleccionado.items.map((item, i) => (
                      <tr key={i}>
                        <td>
                          <div className="prod-cell">
                            <img src={item.producto.imagen_url} alt="" />
                            <div>
                              <strong>{item.producto.nombre}</strong>
                              {item.varianteElegida && <small>{item.varianteElegida.label}</small>}
                            </div>
                          </div>
                        </td>
                        <td>{item.cantidad}</td>
                        <td>{fmt(item.precioFinal)}</td>
                        <td>{fmt(item.precioFinal * item.cantidad)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="detail-footer">
                <div className="total-box">
                  <span>TOTAL ESTIMADO</span>
                  <strong>{fmt(seleccionado.total)}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>Selecciona un presupuesto para ver el detalle</p>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        .admin-presupuestos { padding: 2rem; max-width: 1400px; margin: 0 auto; font-family: sans-serif; background: #f8f9fa; min-height: 100vh; }
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .admin-header h1 { font-size: 1.8rem; color: #1a1a1a; margin: 0; }
        .admin-header p { color: #666; margin: 5px 0 0; }
        
        .search-bar input { padding: 0.8rem 1.5rem; border: 1px solid #ddd; border-radius: 50px; width: 300px; outline: none; }
        .search-bar input:focus { border-color: #D62828; }

        .admin-content { display: grid; grid-template-columns: 350px 1fr; gap: 2rem; }
        
        /* Lista Izquierda */
        .presupuestos-list { display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; max-height: 80vh; }
        .presupuesto-card { background: white; padding: 1.2rem; border-radius: 16px; cursor: pointer; border: 2px solid transparent; transition: 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
        .presupuesto-card:hover { border-color: #eee; transform: translateY(-2px); }
        .presupuesto-card.active { border-color: #D62828; background: #fff5f5; }
        
        .card-info { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
        .p-code { font-weight: 800; color: #D62828; font-size: 1.1rem; }
        .p-date { font-size: 0.8rem; color: #999; }
        
        .card-total { display: flex; justify-content: space-between; align-items: center; }
        .status-badge { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; padding: 4px 8px; border-radius: 6px; }
        .status-badge.pendiente { background: #fff3cd; color: #856404; }
        .status-badge.contactado { background: #cfe2ff; color: #084298; }
        .status-badge.vendido { background: #d1e7dd; color: #0f5132; }

        /* Detalle Derecha */
        .detail-main { background: white; border-radius: 24px; padding: 3rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); min-height: 60vh; }
        .detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #eee; }
        .detail-header select { padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid #ddd; font-weight: 600; }

        .items-table { width: 100%; margin-bottom: 2rem; }
        .items-table table { width: 100%; border-collapse: collapse; }
        .items-table th { text-align: left; padding: 12px; color: #999; font-size: 0.8rem; text-transform: uppercase; border-bottom: 2px solid #f8f9fa; }
        .items-table td { padding: 15px 12px; border-bottom: 1px solid #f8f9fa; }
        
        .prod-cell { display: flex; gap: 15px; align-items: center; }
        .prod-cell img { width: 50px; height: 50px; object-fit: cover; border-radius: 8px; }
        .prod-cell small { display: block; color: #D62828; font-weight: 600; }

        .detail-footer { display: flex; justify-content: flex-end; padding-top: 2rem; border-top: 2px solid #f8f9fa; }
        .total-box { text-align: right; }
        .total-box span { display: block; font-size: 0.8rem; color: #999; font-weight: 800; }
        .total-box strong { font-size: 2.5rem; color: #D62828; }

        .empty-state { display: flex; align-items: center; justify-content: center; height: 100%; color: #999; }
        .animate-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}