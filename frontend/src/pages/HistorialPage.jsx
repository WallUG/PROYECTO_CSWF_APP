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
      case 'Pendiente': return 'bg-warning/10 text-warning border border-warning/20'
      case 'En Proceso': return 'bg-primary/10 text-primary border border-primary/25'
      case 'En Espera de Repuestos': return 'bg-warm/10 text-warm border border-warm/20'
      case 'Finalizado': return 'bg-success/10 text-success border border-success/20'
      case 'Entregado': return 'bg-primary/10 text-primary border border-primary/25'
      case 'Cancelado': return 'bg-danger/10 text-danger border border-danger/20'
      default: return ''
    }
  }

  return (
    <section className="bg-surface backdrop-blur-sm border border-border-main rounded-xl p-5 px-6 shadow">
      <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">
        <h1 className="text-white font-bold text-[clamp(1.15rem,2vw,1.4rem)] m-0">Historial de Reparaciones</h1>
      </div>

      {error && <p className="px-3.5 py-2.5 rounded-lg text-sm mt-3 bg-danger/10 text-danger border border-danger/20">{error}</p>}

      {selectedVehiculo && detalle ? (
        <div>
          <div className="mb-3">
            <button type="button" className="px-5 py-2 rounded-full font-bold text-sm bg-transparent text-gray-400 border border-border-main cursor-pointer transition-all duration-200 hover:bg-surface-2 hover:text-white hover:border-border-strong whitespace-nowrap" onClick={cerrarDetalle}>
              &larr; Volver al listado
            </button>
          </div>

          <div className="bg-surface-2/70 backdrop-blur-sm border border-border-main rounded-lg p-4 transition-all duration-200">
            <h2 className="text-[1.1rem] font-bold text-white">{detalle.marca} {detalle.modelo} <span className="text-gray-400 text-sm font-normal">({detalle.placa})</span></h2>
            <p className="text-gray-400 text-sm">Propietario: {detalle.cliente_nombre} ({detalle.cliente_cedula})</p>
            {detalle.anio && <p className="text-gray-400 text-sm">Año: {detalle.anio} | Color: {detalle.color || '-'}</p>}
          </div>

          {loadingDetalle ? (
            <p className="text-gray-400 mt-4">Cargando órdenes...</p>
          ) : detalle.ordenes && detalle.ordenes.length > 0 ? (
            <table className="w-full border-separate border-spacing-0 text-left min-w-[700px] mt-4">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">N° Orden</th>
                  <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Fecha Ingreso</th>
                  <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Estado</th>
                  <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Técnico</th>
                  <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Items</th>
                  <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Total</th>
                </tr>
              </thead>
              <tbody>
                {detalle.ordenes.map(o => (
                  <tr key={o.id_orden} className="hover:bg-primary/[0.03]">
                    <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150"><strong>{o.numero_orden}</strong></td>
                    <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{new Date(o.fecha_ingreso).toLocaleDateString()}</td>
                    <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150"><span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${estadoClass(o.estado)}`}>{o.estado}</span></td>
                    <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{o.tecnico_nombre || '-'}</td>
                    <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{o.total_items}</td>
                    <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">${parseFloat(o.total_estimado || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mt-4 text-gray-400">Este vehículo no tiene órdenes de servicio registradas.</p>
          )}
        </div>
      ) : (
        <>
          {loading ? (
            <p className="flex gap-2 text-gray-400">Cargando historial...</p>
          ) : vehiculos.length === 0 ? (
            <p className="text-gray-400">No hay vehículos con historial registrado.</p>
          ) : (
            <table className="w-full border-separate border-spacing-0 text-left min-w-[700px]">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Cliente</th>
                  <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Vehículo</th>
                  <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Placa</th>
                  <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Órdenes</th>
                  <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Completadas</th>
                  <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Total Gastado</th>
                  <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Acción</th>
                </tr>
              </thead>
              <tbody>
                {vehiculos.map(v => (
                  <tr key={v.id_vehiculo} className="hover:bg-primary/[0.03]">
                    <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{v.cliente_nombre || 'Sin cliente'}</td>
                    <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{v.marca} {v.modelo}</td>
                    <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150"><strong>{v.placa}</strong></td>
                    <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{v.total_ordenes}</td>
                    <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{v.ordenes_completadas}</td>
                    <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">${parseFloat(v.total_gastado || 0).toFixed(2)}</td>
                    <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">
                      <button type="button" onClick={() => verDetalle(v)} className="mr-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary cursor-pointer text-xs font-medium transition-all duration-200 hover:bg-primary hover:text-bg-deep">
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
