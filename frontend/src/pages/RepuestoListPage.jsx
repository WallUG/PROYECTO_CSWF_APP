import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRepuestos, deleteRepuesto, getLowStockRepuestos } from '../services/repuestoService'

function ConfirmDeleteRepuestoModal({ repuesto, onCancel, onConfirm }) {
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <h3>¿Eliminar repuesto?</h3>
        <p>Estás a punto de eliminar el repuesto <strong>{repuesto.nombre}</strong>. Esta acción no se puede deshacer.</p>
        <div className="confirm-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="confirm-button" onClick={onConfirm}>
            Eliminar
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
    <section className="cliente-page">
      <div className="cliente-header">
        <h1>Inventario de Repuestos</h1>
        <button type="button" onClick={handleNew}>
          Nuevo repuesto
        </button>
      </div>

      {lowStockItems.length > 0 && (
        <div className="low-stock-banner">
          <span className="low-stock-icon">&#9888;</span>
          <span>
            <strong>{lowStockItems.length}</strong> repuesto{lowStockItems.length !== 1 ? 's' : ''} con stock bajo{' '}
            (stock &le; stock mínimo)
          </span>
        </div>
      )}

      {loading ? (
        <p>Cargando repuestos...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : repuestos.length === 0 ? (
        <p>No hay repuestos registrados aún.</p>
      ) : (
        <table className="cliente-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Stock Mínimo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {repuestos.map(r => {
              const isLowStock = r.activo && r.stock <= r.stock_minimo
              const isOutOfStock = r.activo && r.stock === 0
              return (
                <tr key={r.id_repuesto} className={isLowStock ? 'low-stock-row' : ''}>
                  <td><strong>{r.codigo || '-'}</strong></td>
                  <td>{r.nombre}</td>
                  <td>{r.descripcion || '-'}</td>
                  <td>${parseFloat(r.precio).toFixed(2)}</td>
                  <td className={isOutOfStock ? 'stock-critical' : isLowStock ? 'stock-low' : ''}>
                    {r.stock}
                    {isLowStock && <span className="stock-warning-icon" title="Stock bajo"> &#9888;</span>}
                  </td>
                  <td>{r.stock_minimo}</td>
                  <td>{r.activo ? 'Activo' : 'Inactivo'}</td>
                  <td>
                    <button type="button" onClick={() => handleEdit(r.id_repuesto)}>
                      Editar
                    </button>
                    <button type="button" onClick={() => handleDelete(r)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {deleteError && <p className="error-message">{deleteError}</p>}

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
