import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      setUser(res.data.user)
      return res.data.user
    } finally {
      setLoading(false)
    }
  }

  const register = async (payload) => {
    setLoading(true)
    try {
      const res = await authApi.register(payload)
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      setUser(res.data.user)
      return res.data.user
    } finally {
      setLoading(false)
    }
  }

  const refreshMe = async () => {
    if (!localStorage.getItem('token')) return
    const res = await authApi.me()
    localStorage.setItem('user', JSON.stringify(res.data))
    setUser(res.data)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  useEffect(() => {
    refreshMe().catch(() => logout())
  }, [])

  const value = useMemo(() => ({ user, loading, login, register, logout, refreshMe, isAdmin: user?.role === 'admin' }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
