import { useEffect, useState } from 'react'
import { getReporteGeneral } from '../services/reporteService'

function ReportesPage() {
  const today = new Date().toISOString().split('T')[0]
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  const [desde, setDesde] = useState(firstDay)
  const [hasta, setHasta] = useState(today)
  const [reporte, setReporte] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarReporte()
  }, [])

  async function cargarReporte() {
    setLoading(true)
    setError('')
    try {
      const data = await getReporteGeneral(desde, hasta)
      setReporte(data)
    } catch (err) {
      setError(err.message || 'Error al cargar reporte')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    cargarReporte()
  }

  return (
    <section className="cliente-page">
      <div className="cliente-header">
        <h1>Reporte General</h1>
      </div>

      <form onSubmit={handleSubmit} className="reporte-filtros">
        <label className="form-group">
          <span>Desde</span>
          <input type="date" name="desde" value={desde} onChange={e => setDesde(e.target.value)} className="form-date" />
        </label>
        <label className="form-group">
          <span>Hasta</span>
          <input type="date" name="hasta" value={hasta} onChange={e => setHasta(e.target.value)} className="form-date" />
        </label>
        <button type="submit" className="btn-filtrar" disabled={loading}>
          {loading ? 'Cargando...' : 'Filtrar'}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p>Cargando reporte...</p>
      ) : reporte ? (
        <>
          <div className="reporte-resumen-grid">
            <div className="reporte-resumen-card">
              <span className="reporte-numero">{reporte.total_ordenes}</span>
              <span className="reporte-label">Órdenes Totales</span>
            </div>
            <div className="reporte-resumen-card">
              <span className="reporte-numero">{reporte.ordenes_completadas}</span>
              <span className="reporte-label">Completadas / Entregadas</span>
            </div>
            <div className="reporte-resumen-card">
              <span className="reporte-numero">{reporte.ordenes_pendientes}</span>
              <span className="reporte-label">Pendientes</span>
            </div>
            <div className="reporte-resumen-card">
              <span className="reporte-numero">{reporte.ordenes_en_proceso}</span>
              <span className="reporte-label">En Proceso</span>
            </div>
            <div className="reporte-resumen-card">
              <span className="reporte-numero">{reporte.ordenes_canceladas}</span>
              <span className="reporte-label">Canceladas</span>
            </div>
            <div className="reporte-resumen-card reporte-card-ingresos">
              <span className="reporte-numero">${parseFloat(reporte.ingresos_totales || 0).toFixed(2)}</span>
              <span className="reporte-label">Ingresos Totales</span>
            </div>
          </div>

          <h3 className="reporte-subtitle">Ingresos por Vehículo</h3>
          <table className="cliente-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Vehículo</th>
                <th>Placa</th>
                <th>Órdenes</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {reporte.vehiculos && reporte.vehiculos.length > 0 ? (
                reporte.vehiculos.map(v => (
                  <tr key={v.id_vehiculo}>
                    <td>{v.cliente_nombre || 'Sin cliente'}</td>
                    <td>{v.marca} {v.modelo}</td>
                    <td><strong>{v.placa}</strong></td>
                    <td>{v.ordenes}</td>
                    <td>${parseFloat(v.total || 0).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No hay órdenes en el período seleccionado
                  </td>
                </tr>
              )}
              {reporte.vehiculos && reporte.vehiculos.length > 0 && (
                <tr className="reporte-total-row">
                  <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700 }}>Total:</td>
                  <td style={{ fontWeight: 700 }}>${parseFloat(reporte.ingresos_totales || 0).toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      ) : null}
    </section>
  )
}

export default ReportesPage
