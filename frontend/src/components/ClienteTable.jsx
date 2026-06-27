function ClienteTable({ clientes, onEdit, onDelete }) {
  return (
    <table className="w-full border-separate border-spacing-0 text-left min-w-[700px]">
      <thead className="sticky top-0 z-10">
        <tr>
          <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Cédula</th>
          <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Nombre</th>
          <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Teléfono</th>
          <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Dirección</th>
          <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Correo</th>
          <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {clientes.map(cliente => (
          <tr key={cliente.id_cliente} className="hover:bg-primary/[0.03]">
            <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{cliente.cedula}</td>
            <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{cliente.nombres}</td>
            <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{cliente.telefono || '-'}</td>
            <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{cliente.direccion || '-'}</td>
            <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{cliente.email || '-'}</td>
            <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">
              <button type="button" onClick={() => onEdit(cliente.id_cliente)} className="mr-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary cursor-pointer text-xs font-medium transition-all duration-200 hover:bg-primary hover:text-bg-deep">
                Editar
              </button>
              <button type="button" onClick={() => onDelete(cliente)} className="mr-1 px-3 py-1 rounded-full bg-danger/10 border border-danger/25 text-danger cursor-pointer text-xs font-medium transition-all duration-200 hover:bg-danger hover:text-white">
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
