import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('authUser')
    const storedToken = localStorage.getItem('authToken')
    if (storedUser && storedToken) {
      setUser({ ...JSON.parse(storedUser), token: storedToken })
    }
  }, [])

  function login(userData, token) {
    setUser({ ...userData, token })
    localStorage.setItem('authUser', JSON.stringify(userData))
    localStorage.setItem('authToken', token)
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('authUser')
    localStorage.removeItem('authToken')
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
