import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Empresas from './Empresas'
import api from '../../shared/services/api'

let auth
vi.mock('../../app/providers/AuthContext', () => ({ useAuth: () => auth }))
vi.mock('../../shared/services/api', async (importOriginal) => ({
  ...(await importOriginal()),
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const EMPRESAS = [
  { id: 1, nome: 'Tech Solutions',  slug: 'tech-solutions',  inicial: 'T', cor: 'bg-pink-500',  googleCalendarId: null },
  { id: 2, nome: 'Padaria Central', slug: 'padaria-central', inicial: 'P', cor: 'bg-green-500', googleCalendarId: 'cal-1' },
]

// A empresa 1 tem dois boards e a empresa 2 tem um.
const BOARDS = [{ id: 10, companyId: 1 }, { id: 11, companyId: 1 }, { id: 20, companyId: 2 }]

function configurarAuth({ role = 'ADMIN', companies = EMPRESAS, nome = 'Ana Souza' } = {}) {
  auth = {
    user: { id: 7, nome, role },
    companies,
    fetchCompanies: vi.fn().mockResolvedValue(),
  }
}

function responderBoards(boards = BOARDS) {
  api.get.mockImplementation((url) =>
    url === '/boards' ? Promise.resolve({ data: boards }) : Promise.reject(new Error(`URL inesperada: ${url}`))
  )
}

const card = (nome) => within(screen.getByRole('heading', { name: nome, level: 3 }).closest('li'))

async function abrirModalNovaEmpresa(user) {
  await user.click(await screen.findByRole('button', { name: 'Nova empresa' }))
  expect(screen.getByRole('heading', { name: 'Nova empresa' })).toBeInTheDocument()
}

describe('Empresas', () => {
  beforeEach(() => {
    api.get.mockReset()
    api.post.mockReset()
    configurarAuth()
    responderBoards()
  })

  it('cumprimenta o usuário pelo primeiro nome', async () => {
    render(<Empresas onEmpresaClick={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Olá, Ana!', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Aqui está um resumo das empresas que você acompanha.')).toBeInTheDocument()
    await screen.findByText('Tech Solutions')
  })

  it('busca as empresas ao abrir e lista o resultado', async () => {
    render(<Empresas onEmpresaClick={vi.fn()} />)

    expect(await screen.findByText('Tech Solutions')).toBeInTheDocument()
    expect(screen.getByText('Padaria Central')).toBeInTheDocument()
    expect(auth.fetchCompanies).toHaveBeenCalledTimes(1)
  })

  it('mostra quantos boards cada empresa tem', async () => {
    render(<Empresas onEmpresaClick={vi.fn()} />)
    await screen.findByText('Tech Solutions')

    expect(await card('Tech Solutions').findByText('2 boards')).toBeInTheDocument()
    expect(card('Padaria Central').getByText('1 board')).toBeInTheDocument()
  })

  it('mostra zero boards para empresa sem board', async () => {
    responderBoards([])
    render(<Empresas onEmpresaClick={vi.fn()} />)
    await screen.findByText('Tech Solutions')

    expect(await card('Tech Solutions').findByText('0 boards')).toBeInTheDocument()
  })

  it('filtra as empresas pelo texto recebido da busca', async () => {
    const { rerender } = render(<Empresas onEmpresaClick={vi.fn()} search="" />)
    await screen.findByText('Tech Solutions')

    rerender(<Empresas onEmpresaClick={vi.fn()} search="padaria" />)

    expect(screen.queryByText('Tech Solutions')).not.toBeInTheDocument()
    expect(screen.getByText('Padaria Central')).toBeInTheDocument()
  })

  it('avisa quando a busca não encontra nenhuma empresa', async () => {
    render(<Empresas onEmpresaClick={vi.fn()} search="inexistente" />)

    expect(await screen.findByText('Nenhuma empresa encontrada.')).toBeInTheDocument()
  })

  it('mostra o estado vazio quando não há empresas cadastradas', async () => {
    configurarAuth({ companies: [] })
    render(<Empresas onEmpresaClick={vi.fn()} />)

    expect(await screen.findByText('Nenhuma empresa cadastrada ainda.')).toBeInTheDocument()
  })

  it('chama onEmpresaClick com a empresa clicada', async () => {
    const onEmpresaClick = vi.fn()
    const user = userEvent.setup()
    render(<Empresas onEmpresaClick={onEmpresaClick} />)

    await user.click(await screen.findByRole('button', { name: 'Abrir Tech Solutions' }))

    expect(onEmpresaClick).toHaveBeenCalledWith(EMPRESAS[0])
  })

  it('não mostra as ações de administrador para usuário comum', async () => {
    configurarAuth({ role: 'USER' })
    render(<Empresas onEmpresaClick={vi.fn()} />)
    await screen.findByText('Tech Solutions')

    expect(screen.queryByRole('button', { name: 'Nova empresa' })).not.toBeInTheDocument()
    expect(screen.queryByTitle('Criar calendário no Google Calendar')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Calendário vinculado ao Google Calendar')).not.toBeInTheDocument()
  })

  describe('nova empresa', () => {
    it('exige o nome', async () => {
      const user = userEvent.setup()
      render(<Empresas onEmpresaClick={vi.fn()} />)
      await abrirModalNovaEmpresa(user)

      await user.click(screen.getByRole('button', { name: 'Criar empresa' }))

      expect(screen.getByText('Nome é obrigatório.')).toBeInTheDocument()
      expect(api.post).not.toHaveBeenCalled()
    })

    it('gera o slug a partir do nome e cria a empresa', async () => {
      api.post.mockResolvedValue({ data: { id: 3, name: 'Café São João' } })
      const user = userEvent.setup()
      render(<Empresas onEmpresaClick={vi.fn()} />)
      await abrirModalNovaEmpresa(user)

      await user.type(screen.getByPlaceholderText('Ex.: Tech Solutions'), 'Café São João')
      expect(screen.getByPlaceholderText('tech-solutions')).toHaveValue('cafe-sao-joao')
      await user.click(screen.getByRole('button', { name: 'Criar empresa' }))

      expect(api.post).toHaveBeenCalledWith('/companies', { name: 'Café São João', slug: 'cafe-sao-joao', active: true })
      expect(screen.queryByRole('heading', { name: 'Nova empresa' })).not.toBeInTheDocument()
      expect(auth.fetchCompanies).toHaveBeenCalledTimes(2)
    })

    it('mantém o slug digitado manualmente quando o nome muda', async () => {
      const user = userEvent.setup()
      render(<Empresas onEmpresaClick={vi.fn()} />)
      await abrirModalNovaEmpresa(user)

      await user.type(screen.getByPlaceholderText('tech-solutions'), 'Meu Slug!')
      await user.type(screen.getByPlaceholderText('Ex.: Tech Solutions'), 'Outra Empresa')

      expect(screen.getByPlaceholderText('tech-solutions')).toHaveValue('meuslug')
    })

    it('mostra a mensagem de erro retornada pela API', async () => {
      api.post.mockRejectedValue({ response: { data: { message: 'Slug já existe.' } } })
      const user = userEvent.setup()
      render(<Empresas onEmpresaClick={vi.fn()} />)
      await abrirModalNovaEmpresa(user)

      await user.type(screen.getByPlaceholderText('Ex.: Tech Solutions'), 'Tech Solutions')
      await user.click(screen.getByRole('button', { name: 'Criar empresa' }))

      expect(await screen.findByText('Slug já existe.')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Nova empresa' })).toBeInTheDocument()
    })
  })

  describe('Google Calendar', () => {
    it('vincula o calendário da empresa e atualiza a lista, sem abrir a empresa', async () => {
      api.post.mockResolvedValue({ data: { id: 1, googleCalendarId: 'cal-2' } })
      const onEmpresaClick = vi.fn()
      const user = userEvent.setup()
      render(<Empresas onEmpresaClick={onEmpresaClick} />)
      await screen.findByText('Tech Solutions')

      await user.click(card('Tech Solutions').getByTitle('Criar calendário no Google Calendar'))

      expect(api.post).toHaveBeenCalledWith('/companies/1/calendar')
      await vi.waitFor(() => expect(auth.fetchCompanies).toHaveBeenCalledTimes(2))
      expect(onEmpresaClick).not.toHaveBeenCalled()
    })

    it('desabilita o botão quando o calendário já está vinculado', async () => {
      render(<Empresas onEmpresaClick={vi.fn()} />)
      await screen.findByText('Tech Solutions')

      expect(card('Padaria Central').getByTitle('Calendário vinculado ao Google Calendar')).toBeDisabled()
    })

    it('avisa quando a API não consegue vincular o calendário', async () => {
      api.post.mockRejectedValue({ response: { data: { message: 'Conta Google não conectada.' } } })
      vi.spyOn(window, 'alert').mockImplementation(() => {})
      const user = userEvent.setup()
      render(<Empresas onEmpresaClick={vi.fn()} />)
      await screen.findByText('Tech Solutions')

      await user.click(card('Tech Solutions').getByTitle('Criar calendário no Google Calendar'))

      await vi.waitFor(() => expect(window.alert).toHaveBeenCalledWith('Conta Google não conectada.'))
      expect(auth.fetchCompanies).toHaveBeenCalledTimes(1)
      vi.restoreAllMocks()
    })
  })
})
