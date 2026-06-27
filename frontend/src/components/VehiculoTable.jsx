function VehiculoTable({ vehiculos, onEdit, onDelete }) {
  return (
    <table className="w-full border-separate border-spacing-0 text-left min-w-[700px]">
      <thead className="sticky top-0 z-10">
        <tr>
          <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Placa</th>
          <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Marca / Modelo</th>
          <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Año / Color</th>
          <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Kilometraje</th>
          <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Cliente</th>
          <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {vehiculos.map(v => (
          <tr key={v.id_vehiculo} className="hover:bg-primary/[0.03]">
            <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150"><strong>{v.placa}</strong></td>
            <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{v.marca} {v.modelo}</td>
            <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{v.anio || '-'} / {v.color || '-'}</td>
            <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{v.kilometraje || '0'} km</td>
            <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{v.cliente_nombre || `ID: ${v.id_cliente}`}</td>
            <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">
              <button type="button" onClick={() => onEdit(v.id_vehiculo)} className="mr-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary cursor-pointer text-xs font-medium transition-all duration-200 hover:bg-primary hover:text-bg-deep">
                Editar
              </button>
              <button type="button" onClick={() => onDelete(v)} className="mr-1 px-3 py-1 rounded-full bg-danger/10 border border-danger/25 text-danger cursor-pointer text-xs font-medium transition-all duration-200 hover:bg-danger hover:text-white">
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default VehiculoTable
