import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getOrden, createOrden, updateOrden, addDetalleOrden, removeDetalleOrden } from '../services/ordenService'
import { getClientes } from '../services/clienteService'
import { getVehiculos } from '../services/vehiculoService'
import { getRepuestos } from '../services/repuestoService'
import { getTecnicos } from '../services/tecnicoService'

function OrdenFormPage() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    id_vehiculo: '',
    id_tecnico: '',
    motivo_ingreso: '',
    diagnostico_tecnico: '',
    estado: 'Pendiente'
  })
  const [clientes, setClientes] = useState([])
  const [vehiculos, setVehiculos] = useState([])
  const [vehiculosFiltrados, setVehiculosFiltrados] = useState([])
  const [tecnicos, setTecnicos] = useState([])
  const [catalogoItems, setCatalogoItems] = useState([])
  const [detalles, setDetalles] = useState([])
  const [selectedCliente, setSelectedCliente] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [nuevoItem, setNuevoItem] = useState({ id_item: '', cantidad: 1, precio_unitario: '' })

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setErrorMessage('')
      try {
        const [clientesData, vehiculosData, repuestosData, tecnicosData] = await Promise.all([
          getClientes().catch(() => { throw new Error('No se pudieron cargar los clientes') }),
          getVehiculos().catch(() => { throw new Error('No se pudieron cargar los vehículos') }),
          getRepuestos().catch(() => { throw new Error('No se pudieron cargar los repuestos') }),
          getTecnicos().catch(() => { throw new Error('No se pudieron cargar los técnicos') })
        ])

        setClientes(clientesData)
        setVehiculos(vehiculosData)
        setCatalogoItems(repuestosData)
        setTecnicos(tecnicosData)

        if (isEditMode) {
          const ordenData = await getOrden(id)
          setForm({
            id_vehiculo: ordenData.id_vehiculo || '',
            id_tecnico: ordenData.id_tecnico || '',
            motivo_ingreso: ordenData.motivo_ingreso || '',
            diagnostico_tecnico: ordenData.diagnostico_tecnico || '',
            estado: ordenData.estado || 'Pendiente'
          })
          setDetalles(ordenData.detalles || [])

          const vehiculo = vehiculosData.find(v => v.id_vehiculo === ordenData.id_vehiculo)
          if (vehiculo) {
            setSelectedCliente(vehiculo.id_cliente)
          }
        }
      } catch (err) {
        setErrorMessage(err.message || 'Error al inicializar formulario.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, isEditMode])

  useEffect(() => {
    if (selectedCliente) {
      setVehiculosFiltrados(vehiculos.filter(v => v.id_cliente === parseInt(selectedCliente)))
    } else {
      setVehiculosFiltrados(vehiculos)
    }
  }, [selectedCliente, vehiculos])

  function handleChange(event) {
    const { name, value } = event.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleClienteChange(event) {
    const clienteId = event.target.value
    setSelectedCliente(clienteId)
    setForm(prev => ({ ...prev, id_vehiculo: '' }))
  }

  function handleNuevoItemChange(event) {
    const { name, value } = event.target
    setNuevoItem(prev => ({ ...prev, [name]: value }))
  }

  function handleSelectItem(itemId) {
    const item = catalogoItems.find(i => i.id_repuesto === parseInt(itemId) || i.id_item === parseInt(itemId))
    setNuevoItem(prev => ({
      ...prev,
      id_item: itemId,
      precio_unitario: item ? item.precio : prev.precio_unitario
    }))
  }

  function agregarItem() {
    if (!nuevoItem.id_item || !nuevoItem.cantidad || !nuevoItem.precio_unitario) {
      setErrorMessage('Seleccione un item, indique cantidad y precio unitario')
      return
    }
    const item = catalogoItems.find(i => i.id_repuesto === parseInt(nuevoItem.id_item) || i.id_item === parseInt(nuevoItem.id_item))
    const tempId = Date.now()
    const nuevoDetalle = {
      id_detalle: tempId,
      id_item: parseInt(nuevoItem.id_item),
      item_nombre: item ? item.nombre : `Item #${nuevoItem.id_item}`,
      item_tipo: item ? (item.tipo || 'Repuesto') : 'Repuesto',
      cantidad: parseInt(nuevoItem.cantidad),
      precio_unitario: parseFloat(nuevoItem.precio_unitario),
      subtotal: parseInt(nuevoItem.cantidad) * parseFloat(nuevoItem.precio_unitario),
      _temp: true
    }
    setDetalles(prev => [...prev, nuevoDetalle])
    setNuevoItem({ id_item: '', cantidad: 1, precio_unitario: '' })
    setErrorMessage('')
  }

  async function eliminarDetalle(detalle) {
    if (!detalle._temp && detalle.id_detalle > 0) {
      try {
        await removeDetalleOrden(detalle.id_detalle)
      } catch (err) {
        setErrorMessage(err.message || 'No se pudo eliminar el detalle')
        return
      }
    }
    setDetalles(prev => prev.filter(d => d.id_detalle !== detalle.id_detalle))
  }

  const totalCalculado = detalles.reduce((sum, d) => sum + (parseFloat(d.subtotal) || d.cantidad * d.precio_unitario), 0)

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setSubmitting(true)

    if (!form.id_vehiculo || !form.id_tecnico || !form.motivo_ingreso) {
      setErrorMessage('Vehículo, técnico y motivo de ingreso son obligatorios')
      setSubmitting(false)
      return
    }

    try {
      if (isEditMode) {
        await updateOrden(id, {
          id_vehiculo: parseInt(form.id_vehiculo),
          id_tecnico: parseInt(form.id_tecnico),
          motivo_ingreso: form.motivo_ingreso,
          diagnostico_tecnico: form.diagnostico_tecnico || null
        })

        const itemsToAdd = detalles.filter(d => d._temp)
        for (const item of itemsToAdd) {
          await addDetalleOrden(id, {
            id_item: item.id_item,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario
          })
        }

        setSuccessMessage('Orden actualizada exitosamente.')
      } else {
        const itemsPayload = detalles.map(d => ({
          id_item: d.id_item,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario
        }))

        await createOrden({
          id_vehiculo: parseInt(form.id_vehiculo),
          id_tecnico: parseInt(form.id_tecnico),
          motivo_ingreso: form.motivo_ingreso,
          items: itemsPayload
        })

        setSuccessMessage('Orden creada exitosamente.')
      }
      setTimeout(() => navigate('/ordenes'), 700)
    } catch (submitError) {
      setErrorMessage(submitError.message || 'No se pudo guardar la orden.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="bg-surface backdrop-blur-sm border border-border-main rounded-xl p-5 px-6 shadow">
      <h1 className="text-white font-bold text-[clamp(1.15rem,2vw,1.4rem)] m-0 mb-6">{isEditMode ? 'Editar orden de servicio' : 'Nueva orden de servicio'}</h1>

      {loading ? (
        <p className="text-gray-400">Cargando datos...</p>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-[18px]">
          <div className="grid grid-cols-2 gap-3.5">
            <label className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Cliente</span>
              <select
                name="id_cliente"
                value={selectedCliente}
                onChange={handleClienteChange}
                className="w-full h-10 px-3 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/20 box-border appearance-none"
              >
                <option value="">Seleccione un cliente</option>
                {clientes.map(c => (
                  <option key={c.id_cliente} value={c.id_cliente}>{c.nombres} ({c.cedula})</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Vehículo *</span>
              <select
                name="id_vehiculo"
                value={form.id_vehiculo}
                onChange={handleChange}
                required
                className="w-full h-10 px-3 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/20 box-border appearance-none"
              >
                <option value="">Seleccione un vehículo</option>
                {vehiculosFiltrados.map(v => (
                  <option key={v.id_vehiculo} value={v.id_vehiculo}>
                    {v.marca} {v.modelo} ({v.placa})
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Técnico *</span>
              <select
                name="id_tecnico"
                value={form.id_tecnico}
                onChange={handleChange}
                required
                className="w-full h-10 px-3 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/20 box-border appearance-none"
              >
                <option value="">Seleccione un técnico</option>
                {tecnicos.map(t => (
                  <option key={t.id_usuario} value={t.id_usuario}>{t.nombre}</option>
                ))}
              </select>
            </label>

            {isEditMode && (
              <label className="flex flex-col gap-1">
                <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Estado</span>
                <select
                  name="estado"
                  value={form.estado}
                  onChange={(e) => {
                    const newEstado = e.target.value
                    setForm(prev => ({ ...prev, estado: newEstado }))
                    if (newEstado !== 'Pendiente' && newEstado !== 'Cancelado') {
                      updateOrden(id, { estado: newEstado, diagnostico_tecnico: form.diagnostico_tecnico || null })
                        .then(() => setSuccessMessage('Estado actualizado correctamente'))
                        .catch(err => setErrorMessage(err.message))
                    }
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/20 box-border appearance-none"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="En Espera de Repuestos">En Espera de Repuestos</option>
                  <option value="Finalizado">Finalizado</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </label>
            )}

            <label className="flex flex-col gap-1 col-span-full">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Motivo de Ingreso *</span>
              <textarea
                name="motivo_ingreso"
                value={form.motivo_ingreso}
                onChange={handleChange}
                required
                placeholder="Describa el motivo de ingreso del vehículo"
                rows={2}
                className="w-full px-3 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/20 box-border min-h-[60px] resize-y font-sans leading-relaxed placeholder:text-gray-500"
              />
            </label>

            <label className="flex flex-col gap-1 col-span-full">
              <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Diagnóstico Técnico</span>
              <textarea
                name="diagnostico_tecnico"
                value={form.diagnostico_tecnico}
                onChange={handleChange}
                placeholder="Diagnóstico del técnico (opcional)"
                rows={2}
                className="w-full px-3 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/20 box-border min-h-[60px] resize-y font-sans leading-relaxed placeholder:text-gray-500"
              />
            </label>
          </div>

          <div className="mt-4">
            <h3 className="text-white font-bold text-[clamp(1rem,1.5vw,1.15rem)] m-0 mb-3">Detalles de la Orden</h3>

            <table className="w-full border-separate border-spacing-0 text-left min-w-[600px]">
              <thead>
                <tr>
                  <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Item</th>
                  <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Tipo</th>
                  <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Cantidad</th>
                  <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Precio Unit.</th>
                  <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Subtotal</th>
                  <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Acción</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map(d => (
                  <tr key={d.id_detalle}>
                    <td className="px-3 py-2 border-b border-border-main text-sm">{d.item_nombre || `Item #${d.id_item}`}</td>
                    <td className="px-3 py-2 border-b border-border-main text-sm">{d.item_tipo || 'Repuesto'}</td>
                    <td className="px-3 py-2 border-b border-border-main text-sm">{d.cantidad}</td>
                    <td className="px-3 py-2 border-b border-border-main text-sm">${parseFloat(d.precio_unitario).toFixed(2)}</td>
                    <td className="px-3 py-2 border-b border-border-main text-sm">${(parseFloat(d.subtotal) || d.cantidad * d.precio_unitario).toFixed(2)}</td>
                    <td className="px-3 py-2 border-b border-border-main text-sm">
                      <button type="button" className="px-3 py-1 rounded-full text-xs bg-danger/10 text-danger border border-danger/20 cursor-pointer transition-all hover:bg-danger hover:text-white" onClick={() => eliminarDetalle(d)}>
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
                {detalles.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-2 border-b border-border-main text-sm text-center text-gray-400">
                      No hay items agregados aún
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="px-3 py-2 border-b border-border-main text-sm text-right font-bold">Total:</td>
                  <td colSpan={2} className="px-3 py-2 border-b border-border-main text-sm font-bold">${totalCalculado.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="flex gap-2 items-end mt-3">
              <select
                value={nuevoItem.id_item}
                onChange={(e) => handleSelectItem(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/20 box-border appearance-none"
              >
                <option value="">Seleccionar item</option>
                {catalogoItems.map(item => (
                  <option key={item.id_repuesto || item.id_item} value={item.id_repuesto || item.id_item}>
                    {item.nombre} ({item.codigo || 'sin código'}) - ${parseFloat(item.precio).toFixed(2)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="cantidad"
                value={nuevoItem.cantidad}
                onChange={handleNuevoItemChange}
                min="1"
                className="w-20 h-10 px-2 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/20 box-border placeholder:text-gray-500"
                placeholder="Cant."
              />
              <input
                type="number"
                name="precio_unitario"
                value={nuevoItem.precio_unitario}
                onChange={handleNuevoItemChange}
                min="0.01"
                step="0.01"
                className="w-28 h-10 px-2 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/20 box-border placeholder:text-gray-500"
                placeholder="Precio"
              />
              <button type="button" className="px-4 py-2 rounded-full font-bold text-sm bg-gradient-to-r from-warm to-warm-strong text-bg-deep cursor-pointer border-none shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg whitespace-nowrap" onClick={agregarItem}>
                Agregar
              </button>
            </div>
          </div>

          <div className="flex gap-3 justify-end flex-wrap mt-1 pt-4 border-t border-border-main">
            <button type="submit" disabled={submitting} className="px-5 py-2 rounded-full font-bold text-sm bg-gradient-to-r from-primary to-primary-strong text-bg-deep cursor-pointer border-none shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg whitespace-nowrap">
              {submitting ? 'Guardando...' : isEditMode ? 'Actualizar orden' : 'Crear orden'}
            </button>
            <button type="button" className="px-5 py-2 rounded-full font-bold text-sm bg-transparent text-gray-400 border border-border-main cursor-pointer transition-all duration-200 hover:bg-surface-2 hover:text-white hover:border-border-strong" onClick={() => navigate('/ordenes')}>
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

export default OrdenFormPage
