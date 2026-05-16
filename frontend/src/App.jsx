import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import ServerStatus from './components/ServerStatus'
import LoginForm from './components/LoginForm'
import ClienteListPage from './pages/ClienteListPage'
import ClienteFormPage from './pages/ClienteFormPage'
import VehiculoListPage from './pages/VehiculoListPage'
import VehiculoFormPage from './pages/VehiculoFormPage'
import UnauthorizedPage from './pages/UnauthorizedPage'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user.role !== 'Admin') {
    return <UnauthorizedPage />
  }

  return children
}

function AppContent() {
  const { user, logout } = useAuth()

  return (
    <div className="app-root">
      <header className="main-header">
        <div>
          <h1>Gestión de Taller</h1>
          <p>Estado del servidor y panel de clientes</p>
        </div>
        {user && (
          <nav>
            {user.role === 'Admin' && (
              <>
                <Link to="/clientes">Clientes</Link>
                <Link to="/vehiculos">Vehículos</Link>
              </>
            )}
            <button type="button" className="logout-button" onClick={logout}>
              Cerrar sesión
            </button>
          </nav>
        )}
      </header>

      {user && <ServerStatus />}

      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/clientes" replace /> : <Navigate to="/login" replace />}
        />
        <Route path="/login" element={user ? <Navigate to="/clientes" replace /> : <LoginForm />} />
        <Route
          path="/clientes"
          element={
            <ProtectedRoute adminOnly>
              <ClienteListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes/nuevo"
          element={
            <ProtectedRoute adminOnly>
              <ClienteFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes/:id"
          element={
            <ProtectedRoute adminOnly>
              <ClienteFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehiculos"
          element={
            <ProtectedRoute adminOnly>
              <VehiculoListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehiculos/nuevo"
          element={
            <ProtectedRoute adminOnly>
              <VehiculoFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehiculos/:id"
          element={
            <ProtectedRoute adminOnly>
              <VehiculoFormPage />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App;
