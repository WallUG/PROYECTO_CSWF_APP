import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createRepuesto, updateRepuesto, getRepuesto } from '../services/repuestoService'

function RepuestoFormPage() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '0',
    stock_minimo: '5'
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setErrorMessage('')
      try {
        if (isEditMode) {
          const data = await getRepuesto(id)
          setForm({
            codigo: data.codigo || '',
            nombre: data.nombre || '',
            descripcion: data.descripcion || '',
            precio: data.precio || '',
            stock: data.stock ?? '0',
            stock_minimo: data.stock_minimo ?? '5'
          })
        }
      } catch (err) {
        setErrorMessage(err.message || 'Error al inicializar formulario.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, isEditMode])

  function handleChange(event) {
    const { name, value } = event.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setSubmitting(true)

    const payload = {
      ...form,
      precio: form.precio ? parseFloat(form.precio) : 0,
      stock: form.stock ? parseInt(form.stock, 10) : 0,
      stock_minimo: form.stock_minimo ? parseInt(form.stock_minimo, 10) : 5
    }

    try {
      if (isEditMode) {
        await updateRepuesto(id, payload)
        setSuccessMessage('Repuesto actualizado exitosamente.')
      } else {
        await createRepuesto(payload)
        setSuccessMessage('Repuesto creado exitosamente.')
      }
      setTimeout(() => navigate('/repuestos'), 700)
    } catch (submitError) {
      setErrorMessage(submitError.message || 'No se pudo guardar el repuesto.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="cliente-form-page">
      <h1>{isEditMode ? 'Editar repuesto' : 'Nuevo repuesto'}</h1>

      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="cliente-form-grid">
            <label className="form-group">
              <span>Código</span>
              <input
                type="text"
                name="codigo"
                value={form.codigo}
                onChange={handleChange}
                placeholder="Ej. REP-001"
              />
            </label>

            <label className="form-group">
              <span>Nombre *</span>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                placeholder="Ej. Filtro de aceite"
              />
            </label>

            <label className="form-group" style={{ gridColumn: '1 / -1' }}>
              <span>Descripción</span>
              <input
                type="text"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción opcional del repuesto"
              />
            </label>

            <label className="form-group">
              <span>Precio *</span>
              <input
                type="number"
                name="precio"
                value={form.precio}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
              />
            </label>

            <label className="form-group">
              <span>Stock</span>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
            </label>

            <label className="form-group">
              <span>Stock mínimo</span>
              <input
                type="number"
                name="stock_minimo"
                value={form.stock_minimo}
                onChange={handleChange}
                min="0"
                placeholder="5"
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : isEditMode ? 'Actualizar repuesto' : 'Crear repuesto'}
            </button>
            <button type="button" className="cancel-button" onClick={() => navigate('/repuestos')}>
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

export default RepuestoFormPage
