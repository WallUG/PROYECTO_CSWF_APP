// src/services/vehiculoService.js
const API_URL = import.meta.env.VITE_API_URL

function getHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function getVehiculos() {
  try {
    const res = await fetch(`${API_URL}/vehiculos`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Fallo al obtener vehículos')
    return await res.json()
  } catch (error) {
    console.error('Error en getVehiculos:', error)
    throw error
  }
}

export async function getVehiculo(id) {
  try {
    const res = await fetch(`${API_URL}/vehiculos?id=${id}`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Fallo al obtener vehículo')
    return await res.json()
  } catch (error) {
    console.error('Error en getVehiculo:', error)
    throw error
  }
}

export async function createVehiculo(data) {
  try {
    const res = await fetch(`${API_URL}/vehiculos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'No se pudo crear el vehículo')
    return json
  } catch (error) {
    console.error('Error en createVehiculo:', error)
    throw error
  }
}

export async function updateVehiculo(id, data) {
  try {
    const res = await fetch(`${API_URL}/vehiculos?id=${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'No se pudo actualizar el vehículo')
    return json
  } catch (error) {
    console.error('Error en updateVehiculo:', error)
    throw error
  }
}

export async function deleteVehiculo(id) {
  try {
    const res = await fetch(`${API_URL}/vehiculos?id=${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    if (!res.ok) throw new Error('Fallo al eliminar vehículo')
  } catch (error) {
    console.error('Error en deleteVehiculo:', error)
    throw error
  }
}
    throw error
  }
}

export async function deleteVehiculo(id) {
  try {
    const res = await fetch(`${API_URL}/vehiculos?id=${id}`, {
      method: 'DELETE',
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'No se pudo eliminar el vehículo')
    return json
  } catch (error) {
    console.error('Error en deleteVehiculo:', error)
    throw error
  }
}
