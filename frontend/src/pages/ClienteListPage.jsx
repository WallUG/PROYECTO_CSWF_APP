import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getClientes, deleteCliente } from '../services/clienteService'
import ClienteTable from '../components/ClienteTable'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'

function ClienteListPage() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadClientes()
  }, [])

  async function loadClientes() {
    setLoading(true)
    setError('')

    try {
      const data = await getClientes()
      setClientes(data)
    } catch (fetchError) {
      setError(fetchError.message || 'No se pudieron cargar los clientes.')
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(id) {
    navigate(`/clientes/${id}`)
  }

  function handleNew() {
    navigate('/clientes/nuevo')
  }

  function handleDelete(cliente) {
    setSelectedCliente(cliente)
    setDeleteError('')
  }

  async function confirmDelete() {
    if (!selectedCliente) return

    try {
      await deleteCliente(selectedCliente.id_cliente)
      setSelectedCliente(null)
      await loadClientes()
    } catch (deleteErr) {
      setDeleteError(deleteErr.message || 'No se pudo eliminar el cliente.')
    }
  }

  return (
    <section className="cliente-page">
      <div className="cliente-header">
        <h1>Clientes</h1>
        <button type="button" onClick={handleNew}>
          Nuevo cliente
        </button>
      </div>

      {loading ? (
        <p>Cargando clientes...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : clientes.length === 0 ? (
        <p>No hay clientes registrados aún.</p>
      ) : (
        <ClienteTable clientes={clientes} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {deleteError && <p className="error-message">{deleteError}</p>}

      {selectedCliente && (
        <ConfirmDeleteModal
          cliente={selectedCliente}
          onCancel={() => setSelectedCliente(null)}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  )
}

export default ClienteListPage
