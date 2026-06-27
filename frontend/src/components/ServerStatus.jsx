import { useEffect, useState } from 'react'

function ServerStatus() {
  const [serverStatus, setServerStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchServerStatus() {
      try {
        setLoading(true)
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/status`,
          { signal: controller.signal }
        )
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const result = await response.json()
        setServerStatus(result.status ?? 'unknown')
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') return
        setServerStatus('error')
      } finally {
        setLoading(false)
      }
    }

    fetchServerStatus()
    return () => controller.abort()
  }, [])

  const isOnline = serverStatus === 'ok'

  return (
    <div
      className="fixed bottom-4 right-4 flex items-center gap-2 px-3.5 py-2 bg-bg-main/90 backdrop-blur-md border border-border-strong rounded-full text-sm text-gray-400 cursor-pointer z-50 shadow transition-all duration-200 select-none hover:border-primary/25"
      onClick={() => setExpanded(!expanded)}
    >
      <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${isOnline ? 'bg-success shadow-[0_0_8px_rgba(74,222,128,0.35)]' : 'bg-danger shadow-[0_0_8px_rgba(248,113,113,0.35)]'}`} />
      <span>Server</span>
      {expanded && (
        <span className="text-xs text-white font-medium pl-1.5 border-l border-border-main">
          {loading ? 'Verificando...' : isOnline ? 'Funcionando correctamente' : 'Experimentando problemas'}
        </span>
      )}
    </div>
  )
}

export default ServerStatus
