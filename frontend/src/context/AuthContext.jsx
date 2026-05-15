import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('authUser')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  function login(userData) {
    setUser(userData)
    localStorage.setItem('authUser', JSON.stringify(userData))
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('authUser')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
