const API_URL = import.meta.env.VITE_API_URL

function getHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function getTecnicos() {
  try {
    const res = await fetch(`${API_URL}/tecnicos`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Fallo al obtener técnicos')
    return await res.json()
  } catch (error) {
    console.error('Error en getTecnicos:', error)
    throw error
  }
}
