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
    <section className="bg-surface backdrop-blur-sm border border-border-main rounded-xl p-5 px-6 shadow">
      <h1 className="text-white font-bold text-[clamp(1.15rem,2vw,1.4rem)] m-0 mb-4">{isEditMode ? 'Editar vehículo' : 'Nuevo vehículo'}</h1>

      {loading ? (
        <p className="flex gap-2 text-gray-400">Cargando datos...</p>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-[18px]">
          <div className="grid grid-cols-2 gap-3.5">
            <label className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Placa</span>
              <input
                type="text"
                name="placa"
                value={form.placa}
                onChange={handleChange}
                required
                placeholder="Ej. ABC-1234"
                className="px-3 py-2 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-3 focus:ring-primary/20 box-border"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Cliente Dueño</span>
              <select 
                name="id_cliente" 
                value={form.id_cliente} 
                onChange={handleChange} 
                required
                className="px-3 py-2 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-3 focus:ring-primary/20 box-border"
              >
                <option value="">Seleccione un cliente</option>
                {clientes.map(c => (
                  <option key={c.id_cliente} value={c.id_cliente}>{c.nombres} ({c.cedula})</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Marca</span>
              <input
                type="text"
                name="marca"
                value={form.marca}
                onChange={handleChange}
                required
                placeholder="Ej. Toyota"
                className="px-3 py-2 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-3 focus:ring-primary/20 box-border"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Modelo</span>
              <input
                type="text"
                name="modelo"
                value={form.modelo}
                onChange={handleChange}
                required
                placeholder="Ej. Corolla"
                className="px-3 py-2 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-3 focus:ring-primary/20 box-border"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Año</span>
              <input
                type="number"
                name="anio"
                value={form.anio}
                onChange={handleChange}
                placeholder="Ej. 2021"
                className="px-3 py-2 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-3 focus:ring-primary/20 box-border"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Color</span>
              <input
                type="text"
                name="color"
                value={form.color}
                onChange={handleChange}
                placeholder="Ej. Rojo"
                className="px-3 py-2 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-3 focus:ring-primary/20 box-border"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Kilometraje</span>
              <input
                type="number"
                name="kilometraje"
                value={form.kilometraje}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="px-3 py-2 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-3 focus:ring-primary/20 box-border"
              />
            </label>
          </div>

          <div className="flex gap-3 justify-end flex-wrap mt-1 pt-4 border-t border-border-main">
            <button type="submit" disabled={submitting} className="min-w-[130px] px-5 py-2 rounded-full font-bold text-sm bg-gradient-to-r from-primary to-primary-strong text-bg-deep cursor-pointer border-none shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
              {submitting ? 'Guardando...' : isEditMode ? 'Actualizar vehículo' : 'Crear vehículo'}
            </button>
            <button type="button" onClick={() => navigate('/vehiculos')} className="px-5 py-2 rounded-full font-bold text-sm bg-transparent text-gray-400 border border-border-main cursor-pointer transition-all duration-200 hover:bg-surface-2 hover:text-white hover:border-border-strong whitespace-nowrap">
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

export default VehiculoFormPage
