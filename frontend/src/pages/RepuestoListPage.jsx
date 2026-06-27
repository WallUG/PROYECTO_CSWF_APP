import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRepuestos, deleteRepuesto, getLowStockRepuestos } from '../services/repuestoService'

function ConfirmDeleteRepuestoModal({ repuesto, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-bg-deep/65 backdrop-blur-sm grid place-items-center z-50 animate-[fadeIn_0.15s_ease]">
      <div className="bg-surface-2 backdrop-blur-md border border-border-strong rounded-xl p-6 w-[min(92vw,400px)] shadow-lg animate-[scaleIn_0.15s_ease]">
        <h2 className="mt-0 mb-2 text-lg text-white font-bold">Eliminar repuesto</h2>
        <p className="text-gray-400 leading-relaxed text-sm">
          ¿Estás seguro de eliminar <strong>{repuesto.nombre}</strong>? Esta acción no se puede deshacer.
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

function RepuestoListPage() {
  const [repuestos, setRepuestos] = useState([])
  const [lowStockItems, setLowStockItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRepuesto, setSelectedRepuesto] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadRepuestos()
  }, [])

  async function loadRepuestos() {
    setLoading(true)
    setError('')
    try {
      const data = await getRepuestos()
      setRepuestos(data)
      try {
        const lowStock = await getLowStockRepuestos()
        setLowStockItems(lowStock)
      } catch {
        setLowStockItems([])
      }
    } catch (fetchError) {
      setError(fetchError.message || 'Error de conexión. No se pudieron cargar los repuestos.')
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(id) {
    navigate(`/repuestos/${id}`)
  }

  function handleNew() {
    navigate('/repuestos/nuevo')
  }

  function handleDelete(repuesto) {
    setSelectedRepuesto(repuesto)
    setDeleteError('')
  }

  async function confirmDelete() {
    if (!selectedRepuesto) return
    try {
      await deleteRepuesto(selectedRepuesto.id_repuesto)
      setSelectedRepuesto(null)
      await loadRepuestos()
    } catch (deleteErr) {
      setDeleteError(deleteErr.message || 'No se pudo eliminar el repuesto. Intente nuevamente.')
    }
  }

  return (
    <section className="bg-surface backdrop-blur-sm border border-border-main rounded-xl p-5 px-6 shadow">
      <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">
        <h1 className="text-white font-bold text-[clamp(1.15rem,2vw,1.4rem)] m-0">Inventario de Repuestos</h1>
        <button type="button" onClick={handleNew} className="px-5 py-2 rounded-full font-bold text-sm bg-gradient-to-r from-primary to-primary-strong text-bg-deep cursor-pointer border-none shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg whitespace-nowrap">
          Nuevo repuesto
        </button>
      </div>

      {lowStockItems.length > 0 && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-warning/10 text-warning border border-warning/20 mb-4 text-sm">
          <span className="text-warning">&#9888;</span>
          <span>
            <strong>{lowStockItems.length}</strong> repuesto{lowStockItems.length !== 1 ? 's' : ''} con stock bajo{' '}
            (stock &le; stock mínimo)
          </span>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Cargando repuestos...</p>
      ) : error ? (
        <p className="px-3.5 py-2.5 rounded-lg text-sm mt-3 bg-danger/10 text-danger border border-danger/20">{error}</p>
      ) : repuestos.length === 0 ? (
        <p className="text-gray-400">No hay repuestos registrados aún.</p>
      ) : (
        <table className="w-full border-separate border-spacing-0 text-left min-w-[700px]">
          <thead>
            <tr>
              <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95 sticky top-0 z-10">Código</th>
              <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95 sticky top-0 z-10">Nombre</th>
              <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95 sticky top-0 z-10">Descripción</th>
              <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95 sticky top-0 z-10">Precio</th>
              <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95 sticky top-0 z-10">Stock</th>
              <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95 sticky top-0 z-10">Stock Mínimo</th>
              <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95 sticky top-0 z-10">Estado</th>
              <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95 sticky top-0 z-10">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {repuestos.map(r => {
              const isLowStock = r.activo && r.stock <= r.stock_minimo
              const isOutOfStock = r.activo && r.stock === 0
              return (
                <tr key={r.id_repuesto} className={isLowStock ? 'bg-warning/5' : ''}>
                  <td className="px-3 py-2 border-b border-border-main text-sm"><strong>{r.codigo || '-'}</strong></td>
                  <td className="px-3 py-2 border-b border-border-main text-sm">{r.nombre}</td>
                  <td className="px-3 py-2 border-b border-border-main text-sm">{r.descripcion || '-'}</td>
                  <td className="px-3 py-2 border-b border-border-main text-sm">${parseFloat(r.precio).toFixed(2)}</td>
                  <td className={`px-3 py-2 border-b border-border-main text-sm ${isOutOfStock ? 'text-danger font-bold' : isLowStock ? 'text-warning font-bold' : ''}`}>
                    {r.stock}
                    {isLowStock && <span className="ml-1 text-warning" title="Stock bajo">&#9888;</span>}
                  </td>
                  <td className="px-3 py-2 border-b border-border-main text-sm">{r.stock_minimo}</td>
                  <td className="px-3 py-2 border-b border-border-main text-sm">{r.activo ? 'Activo' : 'Inactivo'}</td>
                  <td className="px-3 py-2 border-b border-border-main text-sm">
                    <button type="button" onClick={() => handleEdit(r.id_repuesto)} className="mr-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary cursor-pointer text-xs font-medium transition-all duration-200 hover:bg-primary hover:text-bg-deep">
                      Editar
                    </button>
                    <button type="button" onClick={() => handleDelete(r)} className="mr-1 px-3 py-1 rounded-full bg-danger/10 border border-danger/25 text-danger cursor-pointer text-xs font-medium transition-all duration-200 hover:bg-danger hover:text-white">
                      Eliminar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {deleteError && <p className="px-3.5 py-2.5 rounded-lg text-sm mt-3 bg-danger/10 text-danger border border-danger/20">{deleteError}</p>}

      {selectedRepuesto && (
        <ConfirmDeleteRepuestoModal
          repuesto={selectedRepuesto}
          onCancel={() => setSelectedRepuesto(null)}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  )
}

export default RepuestoListPage
