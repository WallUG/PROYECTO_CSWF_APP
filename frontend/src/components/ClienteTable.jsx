function ClienteTable({ clientes, onEdit, onDelete }) {
  return (
    <table className="cliente-table">
      <thead>
        <tr>
          <th>Cédula</th>
          <th>Nombre</th>
          <th>Teléfono</th>
          <th>Dirección</th>
          <th>Correo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {clientes.map(cliente => (
          <tr key={cliente.id_cliente}>
            <td>{cliente.cedula}</td>
            <td>{cliente.nombres}</td>
            <td>{cliente.telefono || '-'}</td>
            <td>{cliente.direccion || '-'}</td>
            <td>{cliente.email || '-'}</td>
            <td>
              <button type="button" onClick={() => onEdit(cliente.id_cliente)}>
                Editar
              </button>
              <button type="button" onClick={() => onDelete(cliente)}>
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ClienteTable
