function OrdenTable({ ordenes, onEdit, onDelete }) {
  const estadoClass = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'bg-warning/10 text-warning border border-warning/20'
      case 'En Proceso': return 'bg-primary/10 text-primary border border-primary/25'
      case 'En Espera de Repuestos': return 'bg-warm/10 text-warm border border-warm/20'
      case 'Finalizado': return 'bg-success/10 text-success border border-success/20'
      case 'Entregado': return 'bg-primary/10 text-primary border border-primary/25'
      case 'Cancelado': return 'bg-danger/10 text-danger border border-danger/20'
      default: return ''
    }
  }

  return (
    <table className="w-full border-separate border-spacing-0 text-left min-w-[700px]">
      <thead className="sticky top-0 z-10">
        <tr>
          <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">N° Orden</th>
          <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Cliente</th>
          <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Vehículo</th>
          <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Técnico</th>
          <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Estado</th>
          <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Total</th>
          <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Ingreso</th>
          <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {ordenes.map(o => (
          <tr key={o.id_orden} className="hover:bg-primary/[0.03]">
            <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150"><strong>{o.numero_orden}</strong></td>
            <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{o.cliente_nombre || `ID: ${o.id_cliente}`}</td>
            <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{o.marca} {o.modelo} ({o.placa})</td>
            <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{o.tecnico_nombre || `ID: ${o.id_tecnico}`}</td>
            <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${estadoClass(o.estado)}`}>{o.estado}</span>
            </td>
            <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">${parseFloat(o.total_estimado || 0).toFixed(2)}</td>
            <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{o.fecha_ingreso ? new Date(o.fecha_ingreso).toLocaleDateString() : '-'}</td>
            <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">
              <button type="button" onClick={() => onEdit(o.id_orden)} className="mr-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary cursor-pointer text-xs font-medium transition-all duration-200 hover:bg-primary hover:text-bg-deep">
                Editar
              </button>
              <button type="button" onClick={() => onDelete(o)} className="mr-1 px-3 py-1 rounded-full bg-danger/10 border border-danger/25 text-danger cursor-pointer text-xs font-medium transition-all duration-200 hover:bg-danger hover:text-white">
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default OrdenTable
