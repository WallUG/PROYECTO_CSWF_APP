import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createVehiculo, updateVehiculo, getVehiculo } from '../services/vehiculoService'
import { getClientes } from '../services/clienteService'

function VehiculoFormPage() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const [form, setForm] = useState({
    placa: '',
    marca: '',
    modelo: '',
    anio: '',
    color: '',
    kilometraje: '',
    id_cliente: ''
  })
  const [clientes, setClientes] = useState([])
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
        // Carga requerida con tolerancia a fallos en caso de indisponibilidad del microservicio
        const clientesData = await getClientes().catch(() => {
          throw new Error("No se pudieron cargar los clientes. El servicio podría estar caído.");
        })
        setClientes(clientesData)
        
        if (isEditMode) {
          const vehiculoData = await getVehiculo(id)
          setForm({
            placa: vehiculoData.placa || '',
            marca: vehiculoData.marca || '',
            modelo: vehiculoData.modelo || '',
            anio: vehiculoData.anio || '',
            color: vehiculoData.color || '',
            kilometraje: vehiculoData.kilometraje || '',
            id_cliente: vehiculoData.id_cliente || ''
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

    // Preprocesado para datos opcionales
    const payload = {
        ...form,
        anio: form.anio ? parseInt(form.anio, 10) : null,
        kilometraje: form.kilometraje ? parseInt(form.kilometraje, 10) : 0,
        id_cliente: parseInt(form.id_cliente, 10)
    }

    try {
      if (isEditMode) {
        await updateVehiculo(id, payload)
        setSuccessMessage('Vehículo actualizado exitosamente.')
      } else {
        await createVehiculo(payload)
        setSuccessMessage('Vehículo credo exitosamente.')
      }
      setTimeout(() => navigate('/vehiculos'), 700)
    } catch (submitError) {
      setErrorMessage(submitError.message || 'No se pudo guardar el vehículo. Tolerancia a fallos activada.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="cliente-form-page">
      <h1>{isEditMode ? 'Editar vehículo' : 'Nuevo vehículo'}</h1>

      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="cliente-form-grid">
            <label className="form-group">
              <span>Placa</span>
              <input
                type="text"
                name="placa"
                value={form.placa}
                onChange={handleChange}
                required
                placeholder="Ej. ABC-1234"
              />
            </label>

            <label className="form-group">
              <span>Cliente Dueño</span>
              <select 
                name="id_cliente" 
                value={form.id_cliente} 
                onChange={handleChange} 
                required
                style={{
                  width: '100%', minHeight: '48px', border: '1px solid rgba(148, 163, 184, 0.24)',
                  borderRadius: '12px', padding: '12px 16px', background: 'rgba(15, 23, 42, 0.95)',
                  color: 'var(--text)', fontSize: '0.98rem'
                }}
              >
                <option value="">Seleccione un cliente</option>
                {clientes.map(c => (
                  <option key={c.id_cliente} value={c.id_cliente}>{c.nombres} ({c.cedula})</option>
                ))}
              </select>
            </label>

            <label className="form-group">
              <span>Marca</span>
              <input
                type="text"
                name="marca"
                value={form.marca}
                onChange={handleChange}
                required
                placeholder="Ej. Toyota"
              />
            </label>

            <label className="form-group">
              <span>Modelo</span>
              <input
                type="text"
                name="modelo"
                value={form.modelo}
                onChange={handleChange}
                required
                placeholder="Ej. Corolla"
              />
            </label>

            <label className="form-group">
              <span>Año</span>
              <input
                type="number"
                name="anio"
                value={form.anio}
                onChange={handleChange}
                placeholder="Ej. 2021"
              />
            </label>

            <label className="form-group">
              <span>Color</span>
              <input
                type="text"
                name="color"
                value={form.color}
                onChange={handleChange}
                placeholder="Ej. Rojo"
              />
            </label>

            <label className="form-group">
              <span>Kilometraje</span>
              <input
                type="number"
                name="kilometraje"
                value={form.kilometraje}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : isEditMode ? 'Actualizar vehículo' : 'Crear vehículo'}
            </button>
            <button type="button" className="cancel-button" onClick={() => navigate('/vehiculos')}>
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

export default VehiculoFormPage
