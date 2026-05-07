<div className="form-group">
  <label>Etiqueta Destacada (Franja negra superior)</label>
  <input 
    placeholder="Ej: PRODUCTO PREMIUM, OFERTA, STOCK DISPONIBLE" 
    value={editando.etiqueta_destacada || ''} 
    onChange={e => setEditando({...editando, etiqueta_destacada: e.target.value})} 
  />
</div>