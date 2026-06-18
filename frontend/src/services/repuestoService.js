const API_URL = import.meta.env.VITE_API_URL

function getHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function getRepuestos() {
  try {
    const res = await fetch(`${API_URL}/repuestos`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Fallo al obtener repuestos')
    return await res.json()
  } catch (error) {
    console.error('Error en getRepuestos:', error)
    throw error
  }
}

export async function getRepuesto(id) {
  try {
    const res = await fetch(`${API_URL}/repuestos?id=${id}`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Fallo al obtener repuesto')
    return await res.json()
  } catch (error) {
    console.error('Error en getRepuesto:', error)
    throw error
  }
}

export async function getLowStockRepuestos() {
  try {
    const res = await fetch(`${API_URL}/repuestos?low_stock=1`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Fallo al obtener repuestos con stock bajo')
    return await res.json()
  } catch (error) {
    console.error('Error en getLowStockRepuestos:', error)
    throw error
  }
}

export async function createRepuesto(data) {
  try {
    const res = await fetch(`${API_URL}/repuestos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'No se pudo crear el repuesto')
    return json
  } catch (error) {
    console.error('Error en createRepuesto:', error)
    throw error
  }
}

export async function updateRepuesto(id, data) {
  try {
    const res = await fetch(`${API_URL}/repuestos?id=${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'No se pudo actualizar el repuesto')
    return json
  } catch (error) {
    console.error('Error en updateRepuesto:', error)
    throw error
  }
}

export async function deleteRepuesto(id) {
  try {
    const res = await fetch(`${API_URL}/repuestos?id=${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    if (!res.ok) throw new Error('Fallo al eliminar repuesto')
  } catch (error) {
    console.error('Error en deleteRepuesto:', error)
    throw error
  }
}
