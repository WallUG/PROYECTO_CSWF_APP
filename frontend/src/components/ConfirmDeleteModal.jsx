function ConfirmDeleteModal({ cliente, onCancel, onConfirm }) {
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <h2>Eliminar cliente</h2>
        <p>
          ¿Estás seguro de eliminar a <strong>{cliente.nombres}</strong> ({cliente.cedula})?
        </p>
        <div className="confirm-actions">
          <button type="button" className="confirm-button" onClick={onConfirm}>
            Sí, eliminar
          </button>
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteModal
