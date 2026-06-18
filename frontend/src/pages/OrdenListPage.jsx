import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrdenes, deleteOrden } from '../services/ordenService'
import OrdenTable from '../components/OrdenTable'

function OrdenListPage() {
  const [ordenes, setOrdenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrden, setSelectedOrden] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadOrdenes()
  }, [])

  async function loadOrdenes() {
    setLoading(true)
    setError('')
    try {
      const data = await getOrdenes()
      setOrdenes(data)
    } catch (fetchError) {
      setError(fetchError.message || 'Error de conexión. No se pudieron cargar las órdenes.')
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(id) {
    navigate(`/ordenes/${id}`)
  }

  function handleNew() {
    navigate('/ordenes/nuevo')
  }

  function handleDelete(orden) {
    setSelectedOrden(orden)
    setDeleteError('')
  }

  async function confirmDelete() {
    if (!selectedOrden) return
    try {
      await deleteOrden(selectedOrden.id_orden)
      setSelectedOrden(null)
      await loadOrdenes()
    } catch (deleteErr) {
      setDeleteError(deleteErr.message || 'No se pudo eliminar la orden. Intente nuevamente.')
    }
  }

  return (
    <section className="cliente-page">
      <div className="cliente-header">
        <h1>Órdenes de Servicio</h1>
        <button type="button" onClick={handleNew}>
          Nueva orden
        </button>
      </div>

      {loading ? (
        <p>Cargando órdenes...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : ordenes.length === 0 ? (
        <p>No hay órdenes de servicio registradas aún.</p>
      ) : (
        <OrdenTable ordenes={ordenes} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {deleteError && <p className="error-message">{deleteError}</p>}

      {selectedOrden && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <h3>¿Eliminar orden?</h3>
            <p>Estás a punto de eliminar la orden <strong>{selectedOrden.numero_orden}</strong>. Esta acción no se puede deshacer.</p>
            <div className="confirm-actions">
              <button type="button" className="cancel-button" onClick={() => setSelectedOrden(null)}>
                Cancelar
              </button>
              <button type="button" className="confirm-button" onClick={confirmDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default OrdenListPage
