const baseUrl = import.meta.env.VITE_API_URL

async function handleResponse(response) {
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`)
  }
  return data
}

export async function getClientes() {
  const response = await fetch(`${baseUrl}/clientes`)
  return handleResponse(response)
}

export async function getCliente(id) {
  const response = await fetch(`${baseUrl}/clientes?id=${encodeURIComponent(id)}`)
  return handleResponse(response)
}

export async function createCliente(cliente) {
  const response = await fetch(`${baseUrl}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente),
  })
  return handleResponse(response)
}

export async function updateCliente(id, cliente) {
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
