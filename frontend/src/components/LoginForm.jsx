import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [mode, setMode] = useState('login')
  const [identifier, setIdentifier] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    const endpoint = mode === 'register' ? 'register' : 'login'
    const payload = mode === 'register'
      ? { username: identifier, email, password }
      : { identifier, password }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.message || 'Error del servidor. Intenta de nuevo más tarde.')
        return
      }

      if (data.success && data.status === 'ok') {
        setSuccessMessage(data.message || (mode === 'register' ? 'Registro exitoso.' : 'Inicio de sesión exitoso.'))
        setIdentifier('')
        setEmail('')
        setPassword('')

        if (mode === 'login') {
          if (data.user?.role === 'Admin') {
            login(data.user, data.token)
            navigate('/clientes')
          } else {
            setErrorMessage('Acceso restringido: solo administradores pueden ver esta sección.')
          }
        }
        return
      }

      setErrorMessage(data.message || 'Ocurrió un problema. Por favor, inténtalo de nuevo.')
    } catch (fetchError) {
      console.error(fetchError)
      setErrorMessage('Error de conexión. Intenta de nuevo más tarde.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="max-w-[420px] mx-auto mt-8 p-6 bg-surface backdrop-blur-sm border border-border-main rounded-xl shadow">
      <h1 className="text-white text-xl font-bold mb-1">{mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
      <p className="text-gray-400 text-sm mb-5">
        {mode === 'register'
          ? 'Registra un nuevo usuario con correo y contraseña.'
          : 'Por favor, ingresa tus credenciales para acceder a tu cuenta.'}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="grid gap-1 text-sm text-white font-medium">
          {mode === 'register' ? 'Usuario:' : 'Usuario o correo:'}
          <input
            type="text"
            name="identifier"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            required
            className="w-full h-[42px] px-3.5 border border-border-strong rounded-lg bg-bg-main/80 text-white text-sm transition-all duration-200 outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 box-border"
          />
        </label>

        {mode === 'register' && (
          <label className="grid gap-1 text-sm text-white font-medium">
            Correo electrónico:
            <input
              type="email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full h-[42px] px-3.5 border border-border-strong rounded-lg bg-bg-main/80 text-white text-sm transition-all duration-200 outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 box-border"
            />
          </label>
        )}

        <label className="grid gap-1 text-sm text-white font-medium">
          Contraseña:
          <input
            type="password"
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full h-[42px] px-3.5 border border-border-strong rounded-lg bg-bg-main/80 text-white text-sm transition-all duration-200 outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 box-border"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-full font-bold text-sm bg-gradient-to-r from-primary to-primary-strong text-bg-deep shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting
            ? mode === 'register' ? 'Registrando...' : 'Validando...'
            : mode === 'register' ? 'Registrarse' : 'Iniciar sesión'}
        </button>
      </form>

      <div className="mt-4 text-center">
        {mode === 'register' ? (
          <button type="button" onClick={() => setMode('login')} className="bg-transparent text-gray-400 px-4 py-2 rounded-full border border-border-main text-sm hover:text-primary hover:border-primary/25 hover:bg-primary/10 transition-all">
            Ya tengo cuenta
          </button>
        ) : (
          <button type="button" onClick={() => setMode('register')} className="bg-transparent text-gray-400 px-4 py-2 rounded-full border border-border-main text-sm hover:text-primary hover:border-primary/25 hover:bg-primary/10 transition-all">
            Registrarse
          </button>
        )}
      </div>

      {errorMessage && <p className="mt-3 px-3.5 py-2.5 rounded-lg text-sm flex items-center gap-2 bg-danger/10 text-danger border border-danger/20">{errorMessage}</p>}
      {successMessage && <p className="mt-3 px-3.5 py-2.5 rounded-lg text-sm flex items-center gap-2 bg-success/10 text-success border border-success/20">{successMessage}</p>}
    </section>
  )
}

export default LoginForm
