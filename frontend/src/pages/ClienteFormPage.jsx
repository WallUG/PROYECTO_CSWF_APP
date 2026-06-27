import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createCliente, updateCliente, getCliente } from '../services/clienteService'

function ClienteFormPage() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const [form, setForm] = useState({
    cedula: '',
    nombres: '',
    telefono: '',
    direccion: '',
    email: '',
  })
  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (isEditMode) {
      loadCliente(id)
    }
  }, [id, isEditMode])

  async function loadCliente(clienteId) {
    setLoading(true)
    setErrorMessage('')

    try {
      const data = await getCliente(clienteId)
      setForm({
        cedula: data.cedula || '',
        nombres: data.nombres || '',
        telefono: data.telefono || '',
        direccion: data.direccion || '',
        email: data.email || '',
      })
    } catch (fetchError) {
      setErrorMessage(fetchError.message || 'No se pudo cargar el cliente.')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setSubmitting(true)

    try {
      if (isEditMode) {
        await updateCliente(id, form)
        setSuccessMessage('Cliente actualizado correctamente.')
      } else {
        await createCliente(form)
        setSuccessMessage('Cliente creado correctamente.')
        setForm({ cedula: '', nombres: '', telefono: '', direccion: '', email: '' })
      }
      setTimeout(() => navigate('/clientes'), 700)
    } catch (submitError) {
      setErrorMessage(submitError.message || 'No se pudo guardar el cliente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="bg-surface backdrop-blur-sm border border-border-main rounded-xl p-5 px-6 shadow">
      <h1 className="text-white font-bold text-[clamp(1.15rem,2vw,1.4rem)] m-0 mb-4">{isEditMode ? 'Editar cliente' : 'Nuevo cliente'}</h1>

      {loading ? (
        <p className="flex gap-2 text-gray-400">Cargando cliente...</p>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-[18px]">
          <div className="grid grid-cols-2 gap-3.5">
            <label className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Cédula</span>
              <input
                type="text"
                name="cedula"
                value={form.cedula}
                onChange={handleChange}
                required
                placeholder="Ingrese cédula"
                autoComplete="off"
                className="px-3 py-2 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-3 focus:ring-primary/20 box-border"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Nombres</span>
              <input
                type="text"
                name="nombres"
                value={form.nombres}
                onChange={handleChange}
                required
                placeholder="Nombres completos"
                autoComplete="name"
                className="px-3 py-2 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-3 focus:ring-primary/20 box-border"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Teléfono</span>
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Número de teléfono"
                autoComplete="tel"
                className="px-3 py-2 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-3 focus:ring-primary/20 box-border"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Dirección</span>
              <input
                type="text"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Dirección"
                autoComplete="street-address"
                className="px-3 py-2 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-3 focus:ring-primary/20 box-border"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Correo electrónico</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="nombre@dominio.com"
                autoComplete="email"
                className="px-3 py-2 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-3 focus:ring-primary/20 box-border"
              />
            </label>
          </div>

          <div className="flex gap-3 justify-end flex-wrap mt-1 pt-4 border-t border-border-main">
            <button type="submit" disabled={submitting} className="min-w-[130px] px-5 py-2 rounded-full font-bold text-sm bg-gradient-to-r from-primary to-primary-strong text-bg-deep cursor-pointer border-none shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
              {submitting ? 'Guardando...' : isEditMode ? 'Actualizar cliente' : 'Crear cliente'}
            </button>
            <button type="button" onClick={() => navigate('/clientes')} className="px-5 py-2 rounded-full font-bold text-sm bg-transparent text-gray-400 border border-border-main cursor-pointer transition-all duration-200 hover:bg-surface-2 hover:text-white hover:border-border-strong whitespace-nowrap">
              Volver
            </button>
          </div>
        </form>
      )}

      {errorMessage && <p className="px-3.5 py-2.5 rounded-lg text-sm mt-3 bg-danger/10 text-danger border border-danger/20">{errorMessage}</p>}
      {successMessage && <p className="px-3.5 py-2.5 rounded-lg text-sm mt-3 bg-success/10 text-success border border-success/20">{successMessage}</p>}
    </section>
  )
}

export default ClienteFormPage
