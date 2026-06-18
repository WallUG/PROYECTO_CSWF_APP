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

  const totalCalculado = detalles.reduce((sum, d) => sum + (d.subtotal || d.cantidad * d.precio_unitario), 0)

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
    <section className="cliente-form-page">
      <h1>{isEditMode ? 'Editar orden de servicio' : 'Nueva orden de servicio'}</h1>

      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="cliente-form-grid">
            <label className="form-group">
              <span>Cliente</span>
              <select
                name="id_cliente"
                value={selectedCliente}
                onChange={handleClienteChange}
                className="form-select"
              >
                <option value="">Seleccione un cliente</option>
                {clientes.map(c => (
                  <option key={c.id_cliente} value={c.id_cliente}>{c.nombres} ({c.cedula})</option>
                ))}
              </select>
            </label>

            <label className="form-group">
              <span>Vehículo *</span>
              <select
                name="id_vehiculo"
                value={form.id_vehiculo}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">Seleccione un vehículo</option>
                {vehiculosFiltrados.map(v => (
                  <option key={v.id_vehiculo} value={v.id_vehiculo}>
                    {v.marca} {v.modelo} ({v.placa})
                  </option>
                ))}
              </select>
            </label>

            <label className="form-group">
              <span>Técnico *</span>
              <select
                name="id_tecnico"
                value={form.id_tecnico}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">Seleccione un técnico</option>
                {tecnicos.map(t => (
                  <option key={t.id_usuario} value={t.id_usuario}>{t.nombre}</option>
                ))}
              </select>
            </label>

            {isEditMode && (
              <label className="form-group">
                <span>Estado</span>
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
                  className="form-select"
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

            <label className="form-group" style={{ gridColumn: '1 / -1' }}>
              <span>Motivo de Ingreso *</span>
              <textarea
                name="motivo_ingreso"
                value={form.motivo_ingreso}
                onChange={handleChange}
                required
                className="form-textarea"
                placeholder="Describa el motivo de ingreso del vehículo"
                rows={2}
              />
            </label>

            <label className="form-group" style={{ gridColumn: '1 / -1' }}>
              <span>Diagnóstico Técnico</span>
              <textarea
                name="diagnostico_tecnico"
                value={form.diagnostico_tecnico}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Diagnóstico del técnico (opcional)"
                rows={2}
              />
            </label>
          </div>

          <div className="detalles-section">
            <h3>Detalles de la Orden</h3>

            <table className="cliente-table" style={{ minWidth: '600px', marginBottom: '16px' }}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Subtotal</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map(d => (
                  <tr key={d.id_detalle}>
                    <td>{d.item_nombre || `Item #${d.id_item}`}</td>
                    <td>{d.item_tipo || 'Repuesto'}</td>
                    <td>{d.cantidad}</td>
                    <td>${parseFloat(d.precio_unitario).toFixed(2)}</td>
                    <td>${(d.subtotal || d.cantidad * d.precio_unitario).toFixed(2)}</td>
                    <td>
                      <button type="button" className="btn-small-danger" onClick={() => eliminarDetalle(d)}>
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
                {detalles.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No hay items agregados aún
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700 }}>Total:</td>
                  <td colSpan={2} style={{ fontWeight: 700 }}>${totalCalculado.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="nuevo-item-row">
              <select
                value={nuevoItem.id_item}
                onChange={(e) => handleSelectItem(e.target.value)}
                className="form-select"
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
                className="item-cantidad-input"
                placeholder="Cant."
              />
              <input
                type="number"
                name="precio_unitario"
                value={nuevoItem.precio_unitario}
                onChange={handleNuevoItemChange}
                min="0.01"
                step="0.01"
                className="item-precio-input"
                placeholder="Precio"
              />
              <button type="button" className="btn-agregar-item" onClick={agregarItem}>
                Agregar
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : isEditMode ? 'Actualizar orden' : 'Crear orden'}
            </button>
            <button type="button" className="cancel-button" onClick={() => navigate('/ordenes')}>
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

export default OrdenFormPage
