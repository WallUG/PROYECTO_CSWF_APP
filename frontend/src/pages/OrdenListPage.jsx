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
    <section className="bg-surface backdrop-blur-sm border border-border-main rounded-xl p-5 px-6 shadow">
      <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">
        <h1 className="text-white font-bold text-[clamp(1.15rem,2vw,1.4rem)] m-0">Órdenes de Servicio</h1>
        <button type="button" onClick={handleNew} className="px-5 py-2 rounded-full font-bold text-sm bg-gradient-to-r from-primary to-primary-strong text-bg-deep cursor-pointer border-none shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg whitespace-nowrap">
          Nueva orden
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Cargando órdenes...</p>
      ) : error ? (
        <p className="px-3.5 py-2.5 rounded-lg text-sm mt-3 bg-danger/10 text-danger border border-danger/20">{error}</p>
      ) : ordenes.length === 0 ? (
        <p className="text-gray-400">No hay órdenes de servicio registradas aún.</p>
      ) : (
        <OrdenTable ordenes={ordenes} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {deleteError && <p className="px-3.5 py-2.5 rounded-lg text-sm mt-3 bg-danger/10 text-danger border border-danger/20">{deleteError}</p>}

      {selectedOrden && (
        <div className="fixed inset-0 bg-bg-deep/65 backdrop-blur-sm grid place-items-center z-50 animate-[fadeIn_0.15s_ease]">
          <div className="bg-surface-2 backdrop-blur-md border border-border-strong rounded-xl p-6 w-[min(92vw,400px)] shadow-lg animate-[scaleIn_0.15s_ease]">
            <h2 className="mt-0 mb-2 text-lg text-white font-bold">Eliminar orden</h2>
            <p className="text-gray-400 leading-relaxed text-sm">
              ¿Estás seguro de eliminar la orden <strong>{selectedOrden.numero_orden}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2.5 mt-4">
              <button type="button" onClick={confirmDelete} className="px-4 py-2 rounded-full font-bold text-sm bg-gradient-to-r from-danger to-danger-strong text-white cursor-pointer border-none shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                Sí, eliminar
              </button>
              <button type="button" onClick={() => setSelectedOrden(null)} className="px-4 py-2 rounded-full text-sm font-medium bg-transparent text-gray-400 border border-border-main cursor-pointer transition-all duration-200 hover:bg-surface-2 hover:text-white hover:border-border-strong">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default OrdenListPage
