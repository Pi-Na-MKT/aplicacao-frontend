import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AppLayout from './AppLayout'

let auth
vi.mock('../app/providers/AuthContext', () => ({ useAuth: () => auth }))

function configurarAuth({ role = 'ADMIN', registeredUsers = [{ id: 7, nome: 'Ana Pereira Souza', cargo: 'CEO' }] } = {}) {
  auth = {
    user: { id: 7, nome: 'Ana Pereira Souza', role },
    registeredUsers,
    logout: vi.fn(),
  }
}

const menu = () => within(screen.getByRole('navigation', { name: 'Menu principal' }))
const itensDoMenu = () => menu().getAllByRole('button').map(b => b.textContent)

function renderLayout(props) {
  return render(
    <AppLayout activePage="empresas" onNavigate={vi.fn()} {...props}>
      <p>conteúdo da página</p>
    </AppLayout>
  )
}

describe('AppLayout', () => {
  beforeEach(() => {
    configurarAuth()
  })

  it('exibe o conteúdo da página', () => {
    renderLayout()

    expect(screen.getByText('conteúdo da página')).toBeInTheDocument()
  })

  describe('menu lateral', () => {
    it('mostra todos os itens para administrador', () => {
      renderLayout()

      expect(itensDoMenu()).toEqual(['Início', 'Dashboards', 'Usuários', 'Anexos'])
    })

    it('esconde Dashboards e Usuários de quem não é administrador', () => {
      configurarAuth({ role: 'USER' })
      renderLayout()

      expect(itensDoMenu()).toEqual(['Início', 'Anexos'])
    })

    it('marca como ativo o item da página atual', () => {
      renderLayout({ activePage: 'anexos' })

      expect(menu().getByRole('button', { name: 'Anexos' })).toHaveAttribute('aria-current', 'page')
      expect(menu().getByRole('button', { name: 'Início' })).not.toHaveAttribute('aria-current')
    })

    it('mantém "Início" ativo dentro do board de uma empresa', () => {
      renderLayout({ activePage: 'tarefas' })

      expect(menu().getByRole('button', { name: 'Início' })).toHaveAttribute('aria-current', 'page')
    })

    it('chama onNavigate com a página do item clicado', async () => {
      const onNavigate = vi.fn()
      const user = userEvent.setup()
      renderLayout({ onNavigate })

      await user.click(menu().getByRole('button', { name: 'Dashboards' }))
      await user.click(menu().getByRole('button', { name: 'Início' }))

      expect(onNavigate).toHaveBeenNthCalledWith(1, 'dashboard')
      expect(onNavigate).toHaveBeenNthCalledWith(2, 'empresas')
    })
  })

  describe('perfil', () => {
    it('mostra o nome abreviado e o cargo do usuário', () => {
      renderLayout()

      expect(screen.getByText('Ana S.')).toBeInTheDocument()
      expect(screen.getByText('CEO')).toBeInTheDocument()
    })

    it('usa o perfil de acesso quando o cargo ainda não foi carregado', () => {
      configurarAuth({ registeredUsers: [] })
      renderLayout()

      expect(screen.getByText('ADMIN')).toBeInTheDocument()
    })

    it('sai da conta pelo menu do usuário', async () => {
      const user = userEvent.setup()
      renderLayout()

      await user.click(screen.getByRole('button', { name: 'Menu do usuário' }))
      await user.click(screen.getByRole('menuitem', { name: 'Sair da conta' }))

      expect(auth.logout).toHaveBeenCalledTimes(1)
    })

    it('fecha o menu do usuário com a tecla Esc', async () => {
      const user = userEvent.setup()
      renderLayout()

      await user.click(screen.getByRole('button', { name: 'Menu do usuário' }))
      expect(screen.getByRole('menu')).toBeInTheDocument()
      await user.keyboard('{Escape}')

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  describe('busca', () => {
    it('mostra o texto atual e o placeholder recebidos', () => {
      renderLayout({ search: 'tech', searchPlaceholder: 'Buscar empresas...' })

      const campo = screen.getByRole('searchbox', { name: 'Buscar' })
      expect(campo).toHaveValue('tech')
      expect(campo).toHaveAttribute('placeholder', 'Buscar empresas...')
    })

    it('avisa a cada alteração do texto', async () => {
      const onSearchChange = vi.fn()
      const user = userEvent.setup()
      renderLayout({ onSearchChange })

      await user.type(screen.getByRole('searchbox', { name: 'Buscar' }), 'a')

      expect(onSearchChange).toHaveBeenCalledWith('a')
    })
  })
})
