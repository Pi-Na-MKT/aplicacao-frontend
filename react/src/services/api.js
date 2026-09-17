import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8080/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api

export function getErrorMessage(err, fallback = 'Ocorreu um erro inesperado') {
  return err.response?.data?.detail || err.response?.data?.message || fallback
}
