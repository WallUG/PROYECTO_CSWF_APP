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
    <section className="bg-surface backdrop-blur-sm border border-border-main rounded-xl p-5 px-6 shadow">
      <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">
        <h1 className="text-white font-bold text-[clamp(1.15rem,2vw,1.4rem)] m-0">Clientes</h1>
        <button type="button" onClick={handleNew} className="px-5 py-2 rounded-full font-bold text-sm bg-gradient-to-r from-primary to-primary-strong text-bg-deep cursor-pointer border-none shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg whitespace-nowrap">
          Nuevo cliente
        </button>
      </div>

      {loading ? (
        <p className="flex gap-2 text-gray-400">Cargando clientes...</p>
      ) : error ? (
        <p className="px-3.5 py-2.5 rounded-lg text-sm mt-3 bg-danger/10 text-danger border border-danger/20">{error}</p>
      ) : clientes.length === 0 ? (
        <p className="text-gray-400">No hay clientes registrados aún.</p>
      ) : (
        <ClienteTable clientes={clientes} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {deleteError && <p className="px-3.5 py-2.5 rounded-lg text-sm mt-3 bg-danger/10 text-danger border border-danger/20">{deleteError}</p>}

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
