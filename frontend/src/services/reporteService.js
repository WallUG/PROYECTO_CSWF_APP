const API_URL = import.meta.env.VITE_API_URL

function getHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function getHistorialVehiculos() {
  try {
    const res = await fetch(`${API_URL}/reportes/historial`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Fallo al obtener historial')
    return await res.json()
  } catch (error) {
    console.error('Error en getHistorialVehiculos:', error)
    throw error
  }
}

export async function getHistorialByVehiculo(id) {
  try {
    const res = await fetch(`${API_URL}/reportes/historial?id_vehiculo=${id}`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Fallo al obtener historial del vehículo')
    return await res.json()
  } catch (error) {
    console.error('Error en getHistorialByVehiculo:', error)
    throw error
  }
}

export async function getReporteGeneral(desde, hasta) {
  try {
    let url = `${API_URL}/reportes/generales`
    if (desde && hasta) {
      url += `?desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`
    }
    const res = await fetch(url, { headers: getHeaders() })
    if (!res.ok) throw new Error('Fallo al obtener reporte')
    return await res.json()
  } catch (error) {
    console.error('Error en getReporteGeneral:', error)
    throw error
  }
}
