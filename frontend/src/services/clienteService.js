const baseUrl = import.meta.env.VITE_API_URL

function getHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function handleResponse(response) {
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`)
  }
  return data
}

export async function getClientes() {
  const response = await fetch(`${baseUrl}/clientes`, { headers: getHeaders() })
  return handleResponse(response)
}

export async function getCliente(id) {
  const response = await fetch(`${baseUrl}/clientes?id=${encodeURIComponent(id)}`, { headers: getHeaders() })
  return handleResponse(response)
}

export async function createCliente(cliente) {
  const response = await fetch(`${baseUrl}/clientes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(cliente),
  })
  return handleResponse(response)
}

export async function updateCliente(id, cliente) {
  const response = await fetch(`${baseUrl}/clientes?id=${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(cliente),
  })
  return handleResponse(response)
}

export async function deleteCliente(id) {
  const response = await fetch(`${baseUrl}/clientes?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getHeaders()
  })
  return handleResponse(response)
}
  const response = await fetch(`${baseUrl}/clientes?id=${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente),
  })
  return handleResponse(response)
}

export async function deleteCliente(id) {
  const response = await fetch(`${baseUrl}/clientes?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  return handleResponse(response)
}
