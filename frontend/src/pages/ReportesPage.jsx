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
    <section className="bg-surface backdrop-blur-sm border border-border-main rounded-xl p-5 px-6 shadow">
      <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">
        <h1 className="text-white font-bold text-[clamp(1.15rem,2vw,1.4rem)] m-0">Reporte General</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap mb-[18px] pb-4 border-b border-border-main">
        <label className="flex flex-col gap-1">
          <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Desde</span>
          <input type="date" name="desde" value={desde} onChange={e => setDesde(e.target.value)} className="px-3 py-2 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-3 focus:ring-primary/20 box-border" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[0.75rem] font-semibold text-gray-400 uppercase tracking-wider">Hasta</span>
          <input type="date" name="hasta" value={hasta} onChange={e => setHasta(e.target.value)} className="px-3 py-2 rounded-lg border border-border-strong bg-bg-main/80 text-white text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-3 focus:ring-primary/20 box-border" />
        </label>
        <button type="submit" className="h-10 px-6 rounded-full font-bold text-sm bg-gradient-to-r from-primary to-primary-strong text-bg-deep cursor-pointer border-none shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
          {loading ? 'Cargando...' : 'Filtrar'}
        </button>
      </form>

      {error && <p className="px-3.5 py-2.5 rounded-lg text-sm mt-3 bg-danger/10 text-danger border border-danger/20">{error}</p>}

      {loading ? (
        <p className="text-gray-400">Cargando reporte...</p>
      ) : reporte ? (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2.5 mb-[22px]">
            <div className="bg-surface-2/70 backdrop-blur-sm border border-border-main rounded-lg p-4 text-center transition-all duration-200 hover:border-border-strong hover:-translate-y-0.5 hover:shadow">
              <span className="text-[1.3rem] font-extrabold text-white leading-tight block">{reporte.total_ordenes}</span>
              <span className="text-[0.7rem] text-gray-400 uppercase tracking-wider font-semibold">Órdenes Totales</span>
            </div>
            <div className="bg-surface-2/70 backdrop-blur-sm border border-border-main rounded-lg p-4 text-center transition-all duration-200 hover:border-border-strong hover:-translate-y-0.5 hover:shadow">
              <span className="text-[1.3rem] font-extrabold text-white leading-tight block">{reporte.ordenes_completadas}</span>
              <span className="text-[0.7rem] text-gray-400 uppercase tracking-wider font-semibold">Completadas / Entregadas</span>
            </div>
            <div className="bg-surface-2/70 backdrop-blur-sm border border-border-main rounded-lg p-4 text-center transition-all duration-200 hover:border-border-strong hover:-translate-y-0.5 hover:shadow">
              <span className="text-[1.3rem] font-extrabold text-white leading-tight block">{reporte.ordenes_pendientes}</span>
              <span className="text-[0.7rem] text-gray-400 uppercase tracking-wider font-semibold">Pendientes</span>
            </div>
            <div className="bg-surface-2/70 backdrop-blur-sm border border-border-main rounded-lg p-4 text-center transition-all duration-200 hover:border-border-strong hover:-translate-y-0.5 hover:shadow">
              <span className="text-[1.3rem] font-extrabold text-white leading-tight block">{reporte.ordenes_en_proceso}</span>
              <span className="text-[0.7rem] text-gray-400 uppercase tracking-wider font-semibold">En Proceso</span>
            </div>
            <div className="bg-surface-2/70 backdrop-blur-sm border border-border-main rounded-lg p-4 text-center transition-all duration-200 hover:border-border-strong hover:-translate-y-0.5 hover:shadow">
              <span className="text-[1.3rem] font-extrabold text-white leading-tight block">{reporte.ordenes_canceladas}</span>
              <span className="text-[0.7rem] text-gray-400 uppercase tracking-wider font-semibold">Canceladas</span>
            </div>
            <div className="bg-surface-2/70 backdrop-blur-sm border border-success/20 bg-success/[0.06] rounded-lg p-4 text-center transition-all duration-200 hover:border-border-strong hover:-translate-y-0.5 hover:shadow">
              <span className="text-[1.3rem] font-extrabold text-white leading-tight block">${parseFloat(reporte.ingresos_totales || 0).toFixed(2)}</span>
              <span className="text-[0.7rem] text-gray-400 uppercase tracking-wider font-semibold">Ingresos Totales</span>
            </div>
          </div>

          <h3 className="mt-5 mb-2.5 text-sm font-semibold text-white">Ingresos por Vehículo</h3>
          <table className="w-full border-separate border-spacing-0 text-left min-w-[700px]">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Cliente</th>
                <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Vehículo</th>
                <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Placa</th>
                <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Órdenes</th>
                <th className="px-3 py-2.5 border-b-2 border-border-main text-gray-400 font-semibold text-xs uppercase tracking-wider bg-surface/95">Total</th>
              </tr>
            </thead>
            <tbody>
              {reporte.vehiculos && reporte.vehiculos.length > 0 ? (
                reporte.vehiculos.map(v => (
                  <tr key={v.id_vehiculo} className="hover:bg-primary/[0.03]">
                    <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{v.cliente_nombre || 'Sin cliente'}</td>
                    <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{v.marca} {v.modelo}</td>
                    <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150"><strong>{v.placa}</strong></td>
                    <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">{v.ordenes}</td>
                    <td className="px-3 py-2 border-b border-border-main text-sm transition-colors duration-150">${parseFloat(v.total || 0).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-2">No hay órdenes en el período seleccionado</td>
                </tr>
              )}
              {reporte.vehiculos && reporte.vehiculos.length > 0 && (
                <tr className="bg-primary/10">
                  <td colSpan={4} className="text-right font-bold px-3 py-2 border-b border-border-main text-sm">Total:</td>
                  <td className="font-bold px-3 py-2 border-b border-border-main text-sm">${parseFloat(reporte.ingresos_totales || 0).toFixed(2)}</td>
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
