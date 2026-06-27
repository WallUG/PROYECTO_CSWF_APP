import { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ServerStatus from './components/ServerStatus'
import LoginForm from './components/LoginForm'
import ClienteListPage from './pages/ClienteListPage'
import ClienteFormPage from './pages/ClienteFormPage'
import VehiculoListPage from './pages/VehiculoListPage'
import VehiculoFormPage from './pages/VehiculoFormPage'
import RepuestoListPage from './pages/RepuestoListPage'
import RepuestoFormPage from './pages/RepuestoFormPage'
import OrdenListPage from './pages/OrdenListPage'
import OrdenFormPage from './pages/OrdenFormPage'
import HistorialPage from './pages/HistorialPage'
import ReportesPage from './pages/ReportesPage'
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

const navBaseClass = "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border-none bg-transparent text-gray-400 whitespace-nowrap no-underline hover:bg-primary/10 hover:text-primary"
const navActiveClass = "bg-gradient-to-r from-primary/10 to-warm/10 text-white font-semibold"

function AppContent() {
  const { user, logout } = useAuth()
  const [isLight, setIsLight] = useState(() => localStorage.getItem('theme') === 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('light', isLight)
    localStorage.setItem('theme', isLight ? 'light' : 'dark')
  }, [isLight])

  return (
    <div className="w-full max-w-[1000px] mx-auto px-5 py-6 pb-20 flex flex-col gap-[18px] min-h-screen relative">
      <header className="flex justify-between items-center gap-3.5 px-5 py-3 bg-bg-main/85 backdrop-blur-md border border-border-main rounded-xl shadow-sm">
        <div>
          <h1 className="m-0 text-xl font-bold bg-gradient-to-r from-white/90 to-primary bg-clip-text text-transparent">Gestión de Taller</h1>
          <p className="m-0 text-xs text-gray-400">Panel de administración</p>
        </div>
        {user && (
          <nav className="flex items-center gap-0.5">
            {user.role === 'Admin' && (
              <>
                <NavLink to="/clientes" className={({ isActive }) => `${navBaseClass} ${isActive ? navActiveClass : ''}`}>Clientes</NavLink>
                <NavLink to="/vehiculos" className={({ isActive }) => `${navBaseClass} ${isActive ? navActiveClass : ''}`}>Vehículos</NavLink>
                <NavLink to="/repuestos" className={({ isActive }) => `${navBaseClass} ${isActive ? navActiveClass : ''}`}>Repuestos</NavLink>
                <NavLink to="/ordenes" className={({ isActive }) => `${navBaseClass} ${isActive ? navActiveClass : ''}`}>Órdenes</NavLink>
                <NavLink to="/historial" className={({ isActive }) => `${navBaseClass} ${isActive ? navActiveClass : ''}`}>Historial</NavLink>
                <NavLink to="/reportes" className={({ isActive }) => `${navBaseClass} ${isActive ? navActiveClass : ''}`}>Reportes</NavLink>
              </>
            )}
            <button type="button" onClick={logout} className="ml-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border-none bg-transparent text-danger whitespace-nowrap hover:bg-danger/10 hover:text-danger!">
              Cerrar sesión
            </button>
          </nav>
        )}
      </header>

      <Routes>
        <Route path="/" element={user ? <Navigate to="/clientes" replace /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={user ? <Navigate to="/clientes" replace /> : <LoginForm />} />
        <Route path="/clientes" element={<ProtectedRoute adminOnly><ClienteListPage /></ProtectedRoute>} />
        <Route path="/clientes/nuevo" element={<ProtectedRoute adminOnly><ClienteFormPage /></ProtectedRoute>} />
        <Route path="/clientes/:id" element={<ProtectedRoute adminOnly><ClienteFormPage /></ProtectedRoute>} />
        <Route path="/vehiculos" element={<ProtectedRoute adminOnly><VehiculoListPage /></ProtectedRoute>} />
        <Route path="/vehiculos/nuevo" element={<ProtectedRoute adminOnly><VehiculoFormPage /></ProtectedRoute>} />
        <Route path="/vehiculos/:id" element={<ProtectedRoute adminOnly><VehiculoFormPage /></ProtectedRoute>} />
        <Route path="/repuestos" element={<ProtectedRoute adminOnly><RepuestoListPage /></ProtectedRoute>} />
        <Route path="/repuestos/nuevo" element={<ProtectedRoute adminOnly><RepuestoFormPage /></ProtectedRoute>} />
        <Route path="/repuestos/:id" element={<ProtectedRoute adminOnly><RepuestoFormPage /></ProtectedRoute>} />
        <Route path="/ordenes" element={<ProtectedRoute adminOnly><OrdenListPage /></ProtectedRoute>} />
        <Route path="/ordenes/nuevo" element={<ProtectedRoute adminOnly><OrdenFormPage /></ProtectedRoute>} />
        <Route path="/ordenes/:id" element={<ProtectedRoute adminOnly><OrdenFormPage /></ProtectedRoute>} />
        <Route path="/historial" element={<ProtectedRoute adminOnly><HistorialPage /></ProtectedRoute>} />
        <Route path="/reportes" element={<ProtectedRoute adminOnly><ReportesPage /></ProtectedRoute>} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {user && <ServerStatus />}

      <button
        type="button"
        onClick={() => setIsLight(p => !p)}
        className="fixed bottom-4 left-4 flex items-center gap-2 px-3.5 py-2 bg-bg-main/90 backdrop-blur-md border border-border-strong rounded-full text-sm text-gray-400 cursor-pointer z-50 shadow transition-all duration-200 select-none hover:text-warm hover:border-warm/25 hover:bg-warm/5"
        title={isLight ? 'Modo oscuro' : 'Modo claro'}
      >
        {isLight ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z"/></svg>
        )}
        <span className="text-xs font-medium">{isLight ? 'Oscuro' : 'Claro'}</span>
      </button>
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

export default App
