import { useEffect, useState } from 'react'

function ServerStatus() {
  // Estado devuelto por el backend: 'ok' o cualquier otro valor de error
  const [serverStatus, setServerStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchServerStatus() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/status`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error(`Estado de respuesta ${response.status}`)
        }

        const result = await response.json()
        setServerStatus(result.status ?? 'unknown')
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          return
        }
        setError('No se pudo obtener el estado del servidor')
      } finally {
        setLoading(false)
      }
    }

    fetchServerStatus()

    return () => controller.abort()
  }, [])

  return (
    <section className="server-status">
      <h2>Estado del servidor</h2>
      {loading ? (
        <p>Cargando estado del servidor...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <p>
          El servidor está{' '}
          {serverStatus === 'ok'
            ? 'funcionando correctamente'
            : 'experimentando problemas'}
        </p>
      )}
    </section>
  )
}

export default ServerStatus
