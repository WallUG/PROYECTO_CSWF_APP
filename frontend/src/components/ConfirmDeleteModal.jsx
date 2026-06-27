function ConfirmDeleteModal({ cliente, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-bg-deep/65 backdrop-blur-sm grid place-items-center z-50 animate-[fadeIn_0.15s_ease]">
      <div className="bg-surface-2 backdrop-blur-md border border-border-strong rounded-xl p-6 w-[min(92vw,400px)] shadow-lg animate-[scaleIn_0.15s_ease]">
        <h2 className="mt-0 mb-2 text-lg text-white font-bold">Eliminar cliente</h2>
        <p className="text-gray-400 leading-relaxed text-sm">
          ¿Estás seguro de eliminar a <strong>{cliente.nombres}</strong> ({cliente.cedula})?
        </p>
        <div className="flex justify-end gap-2.5 mt-4">
          <button type="button" onClick={onConfirm} className="px-4 py-2 rounded-full font-bold text-sm bg-gradient-to-r from-danger to-danger-strong text-white cursor-pointer border-none shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            Sí, eliminar
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-full text-sm font-medium bg-transparent text-gray-400 border border-border-main cursor-pointer transition-all duration-200 hover:bg-surface-2 hover:text-white hover:border-border-strong">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteModal
