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
    <section className="bg-surface backdrop-blur-sm border border-border-main rounded-xl p-5 px-6 shadow">
      <h1 className="text-white font-bold text-[clamp(1.15rem,2vw,1.4rem)] m-0 mb-6">{isEditMode ? 'Editar repuesto' : 'Nuevo repuesto'}</h1>

      {loading ? (
        <p className="text-gray-400">Cargando datos...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3.5">
            <label className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Código</span>
              <input
                type="text"
                name="codigo"
                value={form.codigo}
                onChange={handleChange}
                placeholder="Ej. REP-001"
                className="w-full h-10 px-3 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/20 box-border placeholder:text-gray-500"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Nombre *</span>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                placeholder="Ej. Filtro de aceite"
                className="w-full h-10 px-3 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/20 box-border placeholder:text-gray-500"
              />
            </label>

            <label className="flex flex-col gap-1 col-span-full">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Descripción</span>
              <input
                type="text"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción opcional del repuesto"
                className="w-full h-10 px-3 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/20 box-border placeholder:text-gray-500"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Precio *</span>
              <input
                type="number"
                name="precio"
                value={form.precio}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="w-full h-10 px-3 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/20 box-border placeholder:text-gray-500"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Stock</span>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="w-full h-10 px-3 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/20 box-border placeholder:text-gray-500"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Stock mínimo</span>
              <input
                type="number"
                name="stock_minimo"
                value={form.stock_minimo}
                onChange={handleChange}
                min="0"
                placeholder="5"
                className="w-full h-10 px-3 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/20 box-border placeholder:text-gray-500"
              />
            </label>
          </div>

          <div className="flex gap-3 justify-end flex-wrap mt-1 pt-4 border-t border-border-main">
            <button type="submit" disabled={submitting} className="px-5 py-2 rounded-full font-bold text-sm bg-gradient-to-r from-primary to-primary-strong text-bg-deep cursor-pointer border-none shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg whitespace-nowrap">
              {submitting ? 'Guardando...' : isEditMode ? 'Actualizar repuesto' : 'Crear repuesto'}
            </button>
            <button type="button" className="px-5 py-2 rounded-full font-bold text-sm bg-transparent text-gray-400 border border-border-main cursor-pointer transition-all duration-200 hover:bg-surface-2 hover:text-white hover:border-border-strong whitespace-nowrap" onClick={() => navigate('/repuestos')}>
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

export default RepuestoFormPage
