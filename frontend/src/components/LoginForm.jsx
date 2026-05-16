import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // mode = 'login' o 'register'
  const [mode, setMode] = useState('login')

  // Identificador del login: puede ser nombre de usuario o correo
  const [identifier, setIdentifier] = useState('')

  // Campo extra requerido solo en el formulario de registro
  const [email, setEmail] = useState('')

  // Contraseña para login o registro
  const [password, setPassword] = useState('')

  // Estado de envío para mostrar feedback mientras se procesa la petición
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    // Elegimos la ruta correcta del backend según el modo actual
    const endpoint = mode === 'register' ? 'register' : 'login'
    const payload =
      mode === 'register'
        ? { username: identifier, email, password }
        : { identifier, password }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
            // Guardar usuario y JWT generado por AuthController
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
    <section className="login-form">
      <h1>{mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
      <p>
        {mode === 'register'
          ? 'Registra un nuevo usuario con correo y contraseña.'
          : 'Por favor, ingresa tus credenciales para acceder a tu cuenta.'}
      </p>

      <form onSubmit={handleSubmit}>
        <label>
          {mode === 'register' ? 'Usuario:' : 'Usuario o correo:'}
          <input
            type="text"
            name="identifier"
            value={identifier}
            onChange={event => setIdentifier(event.target.value)}
            required
          />
        </label>

        <br />

        {mode === 'register' && (
          <>
            <label>
              Correo electrónico:
              <input
                type="email"
                name="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                required
              />
            </label>

            <br />
          </>
        )}

        <label>
          Contraseña:
          <input
            type="password"
            name="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            required
          />
        </label>

        <br />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === 'register'
              ? 'Registrando...'
              : 'Validando...'
            : mode === 'register'
            ? 'Registrarse'
            : 'Iniciar sesión'}
        </button>
      </form>

      <div className="auth-switch">
        {mode === 'register' ? (
          <button type="button" onClick={() => setMode('login')}>
            Ya tengo cuenta
          </button>
        ) : (
          <button type="button" onClick={() => setMode('register')}>
            Registrarse
          </button>
        )}
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
    </section>
  )
}

export default LoginForm
