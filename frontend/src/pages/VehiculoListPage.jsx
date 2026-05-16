import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getVehiculos, deleteVehiculo } from '../services/vehiculoService'
import VehiculoTable from '../components/VehiculoTable'

function ConfirmDeleteVehiculoModal({ vehiculo, onCancel, onConfirm }) {
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <h3>¿Eliminar vehículo?</h3>
        <p>Estás a punto de eliminar el vehículo {vehiculo.placa} ({vehiculo.marca} {vehiculo.modelo}). Esta acción no se puede deshacer.</p>
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

function VehiculoListPage() {
  const [vehiculos, setVehiculos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedVehiculo, setSelectedVehiculo] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadVehiculos()
  }, [])

  async function loadVehiculos() {
    setLoading(true)
    setError('')
    try {
      const data = await getVehiculos()
      setVehiculos(data)
    } catch (fetchError) {
      setError(fetchError.message || 'Error de conexión. Se activó tolerancia a fallos y no se pudieron cargar los vehículos.')
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(id) {
    navigate(`/vehiculos/${id}`)
  }

  function handleNew() {
    navigate('/vehiculos/nuevo')
  }

  function handleDelete(vehiculo) {
    setSelectedVehiculo(vehiculo)
    setDeleteError('')
  }

  async function confirmDelete() {
    if (!selectedVehiculo) return
    try {
      await deleteVehiculo(selectedVehiculo.id_vehiculo)
      setSelectedVehiculo(null)
      await loadVehiculos()
    } catch (deleteErr) {
      setDeleteError(deleteErr.message || 'No se pudo eliminar el vehículo. Intente nuevamente.')
    }
  }

  return (
    <section className="cliente-page">
      <div className="cliente-header">
        <h1>Vehículos</h1>
        <button type="button" onClick={handleNew}>
          Nuevo vehículo
        </button>
      </div>

      {loading ? (
        <p>Cargando vehículos...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : vehiculos.length === 0 ? (
        <p>No hay vehículos registrados aún.</p>
      ) : (
        <VehiculoTable vehiculos={vehiculos} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {deleteError && <p className="error-message">{deleteError}</p>}

      {selectedVehiculo && (
        <ConfirmDeleteVehiculoModal
          vehiculo={selectedVehiculo}
          onCancel={() => setSelectedVehiculo(null)}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  )
}

export default VehiculoListPage
