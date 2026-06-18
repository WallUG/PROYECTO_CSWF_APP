const API_URL = import.meta.env.VITE_API_URL

function getHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function getOrdenes() {
  try {
    const res = await fetch(`${API_URL}/ordenes`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Fallo al obtener órdenes')
    return await res.json()
  } catch (error) {
    console.error('Error en getOrdenes:', error)
    throw error
  }
}

export async function getOrden(id) {
  try {
    const res = await fetch(`${API_URL}/ordenes?id=${id}`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Fallo al obtener orden')
    return await res.json()
  } catch (error) {
    console.error('Error en getOrden:', error)
    throw error
  }
}

export async function createOrden(data) {
  try {
    const res = await fetch(`${API_URL}/ordenes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'No se pudo crear la orden')
    return json
  } catch (error) {
    console.error('Error en createOrden:', error)
    throw error
  }
}

export async function updateOrden(id, data) {
  try {
    const res = await fetch(`${API_URL}/ordenes?id=${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'No se pudo actualizar la orden')
    return json
  } catch (error) {
    console.error('Error en updateOrden:', error)
    throw error
  }
}

export async function addDetalleOrden(id_orden, data) {
  try {
    const res = await fetch(`${API_URL}/ordenes?id=${id_orden}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'No se pudo agregar el detalle')
    return json
  } catch (error) {
    console.error('Error en addDetalleOrden:', error)
    throw error
  }
}

export async function removeDetalleOrden(detalle_id) {
  try {
    const res = await fetch(`${API_URL}/ordenes?detalle_id=${detalle_id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    if (!res.ok) throw new Error('Fallo al eliminar detalle')
  } catch (error) {
    console.error('Error en removeDetalleOrden:', error)
    throw error
  }
}

export async function deleteOrden(id) {
  try {
    const res = await fetch(`${API_URL}/ordenes?id=${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    if (!res.ok) throw new Error('Fallo al eliminar orden')
  } catch (error) {
    console.error('Error en deleteOrden:', error)
    throw error
  }
}
