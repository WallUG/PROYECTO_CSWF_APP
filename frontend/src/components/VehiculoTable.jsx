function VehiculoTable({ vehiculos, onEdit, onDelete }) {
  return (
    <table className="cliente-table">
      <thead>
        <tr>
          <th>Placa</th>
          <th>Marca / Modelo</th>
          <th>Año / Color</th>
          <th>Kilometraje</th>
          <th>Cliente</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {vehiculos.map(v => (
          <tr key={v.id_vehiculo}>
            <td><strong>{v.placa}</strong></td>
            <td>{v.marca} {v.modelo}</td>
            <td>{v.anio || '-'} / {v.color || '-'}</td>
            <td>{v.kilometraje || '0'} km</td>
            <td>{v.cliente_nombre || `ID: ${v.id_cliente}`}</td>
            <td>
              <button type="button" onClick={() => onEdit(v.id_vehiculo)}>
                Editar
              </button>
              <button type="button" onClick={() => onDelete(v)}>
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
