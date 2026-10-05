import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from './AuthContext'
import api from '../../shared/services/api'

vi.mock('../../shared/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: { response: { use: vi.fn(), eject: vi.fn() } },
  },
}))

// Componente mínimo que usa o contexto, só para os testes enxergarem o estado.
function Consumidor() {
  const { user, loading, login, logout, registeredUsers, companies } = useAuth()
  if (loading) return <p>carregando</p>
  return (
    <div>
      <p>{user ? `logado: ${user.nome}` : 'deslogado'}</p>
      <p>usuários: {registeredUsers.length}</p>
      <p>empresas: {companies.map(c => `${c.nome} (${c.inicial})`).join(', ')}</p>
      <button onClick={() => login('ana@empresa.com', 'senha123')}>entrar</button>
      <button onClick={logout}>sair</button>
    </div>
  )
}

const renderProvider = () => render(<AuthProvider><Consumidor /></AuthProvider>)

function responderListas({ users = [], companies = [] } = {}) {
  api.get.mockImplementation((url) => {
    if (url === '/users') return Promise.resolve({ data: users })
    if (url === '/companies') return Promise.resolve({ data: companies })
    return Promise.reject(new Error(`URL inesperada: ${url}`))
  })
}

describe('AuthProvider', () => {
  beforeEach(() => {
    api.get.mockReset()
    api.post.mockReset()
    responderListas()
  })

  it('começa deslogado quando não há sessão salva', async () => {
    renderProvider()

    expect(await screen.findByText('deslogado')).toBeInTheDocument()
    expect(api.get).not.toHaveBeenCalled()
  })

  it('faz login, salva a sessão e carrega usuários e empresas', async () => {
    api.post.mockResolvedValue({ data: { token: 'token-de-teste', userId: 7, name: 'Ana Souza', role: 'ADMIN' } })
    responderListas({
      users: [{ id: 7, name: 'Ana Souza', jobTitle: 'Analista' }],
      companies: [{ id: 1, name: 'Tech Solutions' }],
    })
    const user = userEvent.setup()
    renderProvider()

    await user.click(await screen.findByRole('button', { name: 'entrar' }))

    expect(await screen.findByText('logado: Ana Souza')).toBeInTheDocument()
    expect(api.post).toHaveBeenCalledWith('/users/login', { email: 'ana@empresa.com', password: 'senha123' })
    expect(localStorage.getItem('token')).toBe('token-de-teste')
    expect(localStorage.getItem('userId')).toBe('7')
    expect(localStorage.getItem('name')).toBe('Ana Souza')
    expect(localStorage.getItem('role')).toBe('ADMIN')
    expect(await screen.findByText('usuários: 1')).toBeInTheDocument()
    expect(await screen.findByText('empresas: Tech Solutions (T)')).toBeInTheDocument()
  })

  it('restaura a sessão salva no navegador', async () => {
    localStorage.setItem('token', 'token-de-teste')
    localStorage.setItem('name', 'Ana Souza')
    localStorage.setItem('userId', '7')
    localStorage.setItem('role', 'ADMIN')

    renderProvider()

    expect(await screen.findByText('logado: Ana Souza')).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/users')
    expect(api.get).toHaveBeenCalledWith('/companies')
  })

  it('logout limpa a sessão', async () => {
    localStorage.setItem('token', 'token-de-teste')
    localStorage.setItem('name', 'Ana Souza')
    const user = userEvent.setup()
    renderProvider()

    await user.click(await screen.findByRole('button', { name: 'sair' }))

    expect(screen.getByText('deslogado')).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('name')).toBeNull()
  })
})
