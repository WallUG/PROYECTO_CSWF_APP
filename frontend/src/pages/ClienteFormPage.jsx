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
    <section className="cliente-form-page">
      <h1>{isEditMode ? 'Editar cliente' : 'Nuevo cliente'}</h1>

      {loading ? (
        <p>Cargando cliente...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="cliente-form-grid">
            <label className="form-group">
              <span>Cédula</span>
              <input
                type="text"
                name="cedula"
                value={form.cedula}
                onChange={handleChange}
                required
                placeholder="Ingrese cédula"
                autoComplete="off"
              />
            </label>

            <label className="form-group">
              <span>Nombres</span>
              <input
                type="text"
                name="nombres"
                value={form.nombres}
                onChange={handleChange}
                required
                placeholder="Nombres completos"
                autoComplete="name"
              />
            </label>

            <label className="form-group">
              <span>Teléfono</span>
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Número de teléfono"
                autoComplete="tel"
              />
            </label>

            <label className="form-group">
              <span>Dirección</span>
              <input
                type="text"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Dirección"
                autoComplete="street-address"
              />
            </label>

            <label className="form-group">
              <span>Correo electrónico</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="nombre@dominio.com"
                autoComplete="email"
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : isEditMode ? 'Actualizar cliente' : 'Crear cliente'}
            </button>
            <button type="button" className="cancel-button" onClick={() => navigate('/clientes')}>
              Volver
            </button>
          </div>
        </form>
      )}

      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
    </section>
  )
}

export default ClienteFormPage
