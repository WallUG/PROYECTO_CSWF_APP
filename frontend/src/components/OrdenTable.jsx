function OrdenTable({ ordenes, onEdit, onDelete }) {
  const estadoClass = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'estado-pendiente'
      case 'En Proceso': return 'estado-proceso'
      case 'En Espera de Repuestos': return 'estado-espera'
      case 'Finalizado': return 'estado-finalizado'
      case 'Entregado': return 'estado-entregado'
      case 'Cancelado': return 'estado-cancelado'
      default: return ''
    }
  }

  return (
    <table className="cliente-table">
      <thead>
        <tr>
          <th>N° Orden</th>
          <th>Cliente</th>
          <th>Vehículo</th>
          <th>Técnico</th>
          <th>Estado</th>
          <th>Total</th>
          <th>Ingreso</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {ordenes.map(o => (
          <tr key={o.id_orden}>
            <td><strong>{o.numero_orden}</strong></td>
            <td>{o.cliente_nombre || `ID: ${o.id_cliente}`}</td>
            <td>{o.marca} {o.modelo} ({o.placa})</td>
            <td>{o.tecnico_nombre || `ID: ${o.id_tecnico}`}</td>
            <td><span className={`estado-badge ${estadoClass(o.estado)}`}>{o.estado}</span></td>
            <td>${parseFloat(o.total_estimado || 0).toFixed(2)}</td>
            <td>{o.fecha_ingreso ? new Date(o.fecha_ingreso).toLocaleDateString() : '-'}</td>
            <td>
              <button type="button" onClick={() => onEdit(o.id_orden)}>
                Editar
              </button>
              <button type="button" onClick={() => onDelete(o)}>
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
