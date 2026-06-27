import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getVehiculos, deleteVehiculo } from '../services/vehiculoService'
import VehiculoTable from '../components/VehiculoTable'

function ConfirmDeleteVehiculoModal({ vehiculo, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-bg-deep/65 backdrop-blur-sm grid place-items-center z-50">
      <div className="bg-surface-2 backdrop-blur-md border border-border-strong rounded-xl p-6 w-[min(92vw,400px)] shadow-lg">
        <h2 className="mt-0 mb-2 text-lg text-white font-bold">Eliminar vehículo</h2>
        <p className="text-gray-400 leading-relaxed text-sm">
          ¿Estás seguro de eliminar el vehículo <strong>{vehiculo.placa}</strong> ({vehiculo.marca} {vehiculo.modelo})? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2.5 mt-4">
          <button type="button" onClick={onConfirm} className="px-4 py-2 rounded-full font-bold text-sm bg-gradient-to-r from-danger to-danger-strong text-white cursor-pointer border-none shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            Eliminar
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-full text-sm font-medium bg-transparent text-gray-400 border border-border-main cursor-pointer transition-all duration-200 hover:bg-surface-2 hover:text-white hover:border-border-strong">
            Cancelar
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
    <section className="bg-surface backdrop-blur-sm border border-border-main rounded-xl p-5 px-6 shadow">
      <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">
        <h1 className="text-white font-bold text-[clamp(1.15rem,2vw,1.4rem)] m-0">Vehículos</h1>
        <button type="button" onClick={handleNew} className="px-5 py-2 rounded-full font-bold text-sm bg-gradient-to-r from-primary to-primary-strong text-bg-deep cursor-pointer border-none shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg whitespace-nowrap">
          Nuevo vehículo
        </button>
      </div>

      {loading ? (
        <p className="flex gap-2 text-gray-400">Cargando vehículos...</p>
      ) : error ? (
        <p className="px-3.5 py-2.5 rounded-lg text-sm mt-3 bg-danger/10 text-danger border border-danger/20">{error}</p>
      ) : vehiculos.length === 0 ? (
        <p className="text-gray-400">No hay vehículos registrados aún.</p>
      ) : (
        <VehiculoTable vehiculos={vehiculos} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {deleteError && <p className="px-3.5 py-2.5 rounded-lg text-sm mt-3 bg-danger/10 text-danger border border-danger/20">{deleteError}</p>}

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
