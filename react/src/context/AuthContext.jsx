import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

const CORES = [
  'bg-pink-500', 'bg-green-500', 'bg-blue-500', 'bg-orange-500',
  'bg-red-500', 'bg-purple-500', 'bg-teal-500', 'bg-indigo-500',
]

const normalizeCompany = (c, i) => ({
  ...c,
  nome:    c.name?.trim() || 'Empresa',
  inicial: c.name?.charAt(0)?.toUpperCase() || '?',
  cor:     CORES[i % CORES.length],
})

export function AuthProvider({ children }) {
  const [user, setUser]                       = useState(null)
  const [loading, setLoading]                 = useState(true)
  const [registeredUsers, setRegisteredUsers] = useState([])
  const [companies, setCompanies]             = useState([])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('name')
    localStorage.removeItem('role')
    setUser(null)
    setRegisteredUsers([])
    setCompanies([])
  }

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      res => res,
      err => {
        const isLoginEndpoint = err.config?.url?.includes('/users/login')
        if (err.response?.status === 401 && !isLoginEndpoint) logout()
        return Promise.reject(err)
      }
    )
    return () => api.interceptors.response.eject(interceptor)
  }, [])

  useEffect(() => {
    const token  = localStorage.getItem('token')
    const nome   = localStorage.getItem('name')
    const userId = localStorage.getItem('userId')
    const role   = localStorage.getItem('role')

    if (token && nome) {
      setUser({ id: userId, nome, token, role })
      fetchUsers()
      fetchCompanies()
    }
    setLoading(false)
  }, [])

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users')
      setRegisteredUsers(data.map(u => ({
        ...u,
        nome:  u.name     ?? u.nome,
        cargo: u.jobTitle ?? u.cargo,
      })))
    } catch (err) {
      console.error('Erro ao buscar usuários:', err)
    }
  }

  const fetchCompanies = async () => {
    try {
      const { data } = await api.get('/companies')
      setCompanies(data.map(normalizeCompany))
    } catch (err) {
      console.error('Erro ao buscar empresas:', err)
    }
  }

  const login = async (email, senha) => {
    const { data } = await api.post('/users/login', { email, password: senha })

    localStorage.setItem('token',  data.token)
    localStorage.setItem('userId', String(data.userId))
    localStorage.setItem('name',   data.name)
    localStorage.setItem('role',   data.role || '')

    const loggedUser = { id: data.userId, nome: data.name, token: data.token, role: data.role }
    setUser(loggedUser)

    await Promise.all([fetchUsers(), fetchCompanies()])

    return loggedUser
  }

  return (
    <AuthContext.Provider value={{
      user, login, logout, loading,
      registeredUsers, fetchUsers,
      companies, fetchCompanies,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
