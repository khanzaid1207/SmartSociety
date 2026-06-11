/**
 * AuthContext.jsx
 * ---------------
 * Manages "who is logged in" across the entire app.
 * Any page or component can call useAuth() to get the current user,
 * call login() after sign-in, or logout() to clear the session.
 */

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage when the app first loads
  useEffect(() => {
    const savedToken = localStorage.getItem('ss_token')
    const savedUser  = localStorage.getItem('ss_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  function login(userData, jwtToken) {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('ss_token', jwtToken)
    localStorage.setItem('ss_user', JSON.stringify(userData))
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('ss_token')
    localStorage.removeItem('ss_user')
  }

  function updateUser(updatedData) {
    const merged = { ...user, ...updatedData }
    setUser(merged)
    localStorage.setItem('ss_user', JSON.stringify(merged))
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// Call this inside any component: const { user, login, logout } = useAuth()
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside <AuthProvider>')
  return ctx
}
