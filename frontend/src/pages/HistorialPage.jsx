import { useEffect, useState } from 'react'
import { getHistorialVehiculos, getHistorialByVehiculo } from '../services/reporteService'

function HistorialPage() {
  const [vehiculos, setVehiculos] = useState([])
  const [selectedVehiculo, setSelectedVehiculo] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadHistorial()
  }, [])

  async function loadHistorial() {
    setLoading(true)
    setError('')
    try {
      const data = await getHistorialVehiculos()
      setVehiculos(data)
    } catch (err) {
      setError(err.message || 'Error al cargar historial')
    } finally {
      setLoading(false)
    }
  }

  async function verDetalle(vehiculo) {
    setSelectedVehiculo(vehiculo)
    setDetalle(null)
    setLoadingDetalle(true)
    try {
      const data = await getHistorialByVehiculo(vehiculo.id_vehiculo)
      setDetalle(data)
    } catch (err) {
      setError(err.message || 'Error al cargar detalle')
    } finally {
      setLoadingDetalle(false)
    }
  }

  function cerrarDetalle() {
    setSelectedVehiculo(null)
    setDetalle(null)
  }

  const estadoClass = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'estado-pendiente'
      case 'En Proceso': return 'estado-proceso'
      case 'En Espera de Repuestos': return 'estado-espera'
      case 'Finalizado': return 'estado-finalizado'
      case 'Entregado': return 'estado-entregado'
      case 'Cancelado': return 'estado-cancelado'
      default: return ''
    }
  }

  return (
    <section className="cliente-page">
      <div className="cliente-header">
        <h1>Historial de Reparaciones</h1>
      </div>

      {error && <p className="error-message">{error}</p>}

      {selectedVehiculo && detalle ? (
        <div>
          <div className="detalle-vehiculo-header">
            <button type="button" className="cancel-button" onClick={cerrarDetalle}>
              &larr; Volver al listado
            </button>
          </div>

          <div className="reporte-resumen-card">
            <h2>{detalle.marca} {detalle.modelo} <span className="text-muted">({detalle.placa})</span></h2>
            <p className="text-muted">Propietario: {detalle.cliente_nombre} ({detalle.cliente_cedula})</p>
            {detalle.anio && <p className="text-muted">Año: {detalle.anio} | Color: {detalle.color || '-'}</p>}
          </div>

          {loadingDetalle ? (
            <p>Cargando órdenes...</p>
          ) : detalle.ordenes && detalle.ordenes.length > 0 ? (
            <table className="cliente-table" style={{ marginTop: '16px' }}>
              <thead>
                <tr>
                  <th>N° Orden</th>
                  <th>Fecha Ingreso</th>
                  <th>Estado</th>
                  <th>Técnico</th>
                  <th>Items</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {detalle.ordenes.map(o => (
                  <tr key={o.id_orden}>
                    <td><strong>{o.numero_orden}</strong></td>
                    <td>{new Date(o.fecha_ingreso).toLocaleDateString()}</td>
                    <td><span className={`estado-badge ${estadoClass(o.estado)}`}>{o.estado}</span></td>
                    <td>{o.tecnico_nombre || '-'}</td>
                    <td>{o.total_items}</td>
                    <td>${parseFloat(o.total_estimado || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ marginTop: '16px' }}>Este vehículo no tiene órdenes de servicio registradas.</p>
          )}
        </div>
      ) : (
        <>
          {loading ? (
            <p>Cargando historial...</p>
          ) : vehiculos.length === 0 ? (
            <p>No hay vehículos con historial registrado.</p>
          ) : (
            <table className="cliente-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Vehículo</th>
                  <th>Placa</th>
                  <th>Órdenes</th>
                  <th>Completadas</th>
                  <th>Total Gastado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {vehiculos.map(v => (
                  <tr key={v.id_vehiculo}>
                    <td>{v.cliente_nombre || 'Sin cliente'}</td>
                    <td>{v.marca} {v.modelo}</td>
                    <td><strong>{v.placa}</strong></td>
                    <td>{v.total_ordenes}</td>
                    <td>{v.ordenes_completadas}</td>
                    <td>${parseFloat(v.total_gastado || 0).toFixed(2)}</td>
                    <td>
                      <button type="button" onClick={() => verDetalle(v)}>
                        Ver órdenes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </section>
  )
}

export default HistorialPage
