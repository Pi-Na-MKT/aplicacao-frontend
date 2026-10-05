import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Usuarios from './Usuarios'
import api from '../../shared/services/api'

let auth
vi.mock('../../app/providers/AuthContext', () => ({ useAuth: () => auth }))
vi.mock('../../shared/services/api', async (importOriginal) => ({
  ...(await importOriginal()),
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const USUARIOS = [
  { id: 7, nome: 'Ana Souza',  cargo: 'Gestora' },
  { id: 8, nome: 'Bruno Lima', cargo: 'Designer' },
]

const EMPRESAS = [
  { id: 1, nome: 'Tech Solutions',  inicial: 'T', cor: 'bg-pink-500' },
  { id: 2, nome: 'Padaria Central', inicial: 'P', cor: 'bg-green-500' },
]

const BRUNO_COMPLETO = {
  id: 8, name: 'Bruno Lima', email: 'bruno@empresa.com', role: 'USER',
  jobTitle: 'Designer', phone: '', seniority: 'pleno', bio: '', responsibility: '', linkedin: '', avatarUrl: '',
}

function configurarAuth({ id = 7, role = 'ADMIN' } = {}) {
  auth = {
    user: { id, nome: 'Ana Souza', role },
    registeredUsers: USUARIOS,
    fetchUsers: vi.fn().mockResolvedValue(),
    companies: EMPRESAS,
  }
}

// Só a empresa 1 tem board, e o Bruno é membro dele.
function responderApi() {
  api.get.mockImplementation((url) => {
    if (url === '/users/8') return Promise.resolve({ data: BRUNO_COMPLETO })
    if (url === '/boards') return Promise.resolve({ data: [{ id: 10, name: 'Board Tech', companyId: 1, members: [{ id: 8 }, { id: 7 }] }] })
    return Promise.reject(new Error(`URL inesperada: ${url}`))
  })
}

const linhaDe = (nome) => within(screen.getByText(nome).closest('li'))
// Cada indicador tem o rótulo e o valor dentro do mesmo bloco.
const indicador = (rotulo) => within(screen.getByText(rotulo).parentElement)
const dialogo = (titulo) => within(screen.getByRole('heading', { name: titulo }).parentElement)

async function renderUsuarios(props) {
  render(<Usuarios onCadastrarNovo={vi.fn()} {...props} />)
  await screen.findByText('Ana Souza')
}

async function abrirEdicaoDoBruno(user) {
  await user.click(linhaDe('Bruno Lima').getByTitle('Editar'))
  await screen.findByDisplayValue('Designer')
}

describe('Usuarios', () => {
  beforeEach(() => {
    api.get.mockReset()
    api.put.mockReset()
    api.delete.mockReset()
    configurarAuth()
    responderApi()
  })

  it('busca e lista os usuários, marcando a linha de quem está logado', async () => {
    await renderUsuarios()

    expect(auth.fetchUsers).toHaveBeenCalledTimes(1)
    expect(screen.getByText('2 membros ativos')).toBeInTheDocument()
    expect(linhaDe('Ana Souza').getByText('Você')).toBeInTheDocument()
    expect(linhaDe('Bruno Lima').getByText('Designer')).toBeInTheDocument()
    expect(linhaDe('Bruno Lima').queryByText('Você')).not.toBeInTheDocument()
  })

  it('mostra os indicadores de total e de ativos', async () => {
    await renderUsuarios()

    expect(indicador('Total').getByText('2')).toBeInTheDocument()
    expect(indicador('Ativos').getByText('2')).toBeInTheDocument()
  })

  it('filtra pela busca da barra superior', async () => {
    await renderUsuarios({ search: 'gestora' })

    expect(screen.getByText('Ana Souza')).toBeInTheDocument()
    expect(screen.queryByText('Bruno Lima')).not.toBeInTheDocument()
  })

  it('combina a busca da barra superior com a busca da página', async () => {
    const user = userEvent.setup()
    await renderUsuarios({ search: 'a' })

    await user.type(screen.getByPlaceholderText('Buscar por nome ou cargo...'), 'bruno')

    expect(screen.queryByText('Ana Souza')).not.toBeInTheDocument()
    expect(screen.getByText('Bruno Lima')).toBeInTheDocument()
  })

  it('filtra por nome ou cargo', async () => {
    const user = userEvent.setup()
    await renderUsuarios()

    await user.type(screen.getByPlaceholderText('Buscar por nome ou cargo...'), 'designer')

    expect(screen.queryByText('Ana Souza')).not.toBeInTheDocument()
    expect(screen.getByText('Bruno Lima')).toBeInTheDocument()
  })

  it('avisa quando a busca não encontra ninguém', async () => {
    const user = userEvent.setup()
    await renderUsuarios()

    await user.type(screen.getByPlaceholderText('Buscar por nome ou cargo...'), 'inexistente')

    expect(screen.getByText('Nenhum usuário encontrado')).toBeInTheDocument()
  })

  it('chama onCadastrarNovo ao clicar em "Novo usuário"', async () => {
    const onCadastrarNovo = vi.fn()
    const user = userEvent.setup()
    await renderUsuarios({ onCadastrarNovo })

    await user.click(screen.getByRole('button', { name: 'Novo usuário' }))

    expect(onCadastrarNovo).toHaveBeenCalledTimes(1)
  })

  it('administrador pode editar todos e excluir os outros usuários', async () => {
    await renderUsuarios()

    expect(screen.getAllByTitle('Editar')).toHaveLength(2)
    expect(linhaDe('Ana Souza').queryByTitle('Excluir')).not.toBeInTheDocument()
    expect(linhaDe('Bruno Lima').getByTitle('Excluir')).toBeInTheDocument()
  })

  it('usuário comum só pode editar o próprio perfil', async () => {
    configurarAuth({ id: 8, role: 'USER' })
    await renderUsuarios()

    expect(screen.queryByRole('button', { name: 'Novo usuário' })).not.toBeInTheDocument()
    expect(screen.queryByTitle('Excluir')).not.toBeInTheDocument()
    expect(linhaDe('Ana Souza').queryByTitle('Editar')).not.toBeInTheDocument()
    expect(linhaDe('Bruno Lima').getByTitle('Editar')).toBeInTheDocument()
  })

  describe('exclusão', () => {
    it('exclui o usuário depois da confirmação e recarrega a lista', async () => {
      api.delete.mockResolvedValue({})
      const user = userEvent.setup()
      await renderUsuarios()

      await user.click(linhaDe('Bruno Lima').getByTitle('Excluir'))
      await user.click(dialogo('Excluir usuário?').getByRole('button', { name: 'Excluir' }))

      expect(api.delete).toHaveBeenCalledWith('/users/8')
      await vi.waitFor(() => expect(auth.fetchUsers).toHaveBeenCalledTimes(2))
      expect(screen.queryByRole('heading', { name: 'Excluir usuário?' })).not.toBeInTheDocument()
    })

    it('mostra o erro da API e mantém o diálogo aberto', async () => {
      api.delete.mockRejectedValue({ response: { status: 409, data: { detail: 'Usuário possui tarefas atribuídas.' } } })
      const user = userEvent.setup()
      await renderUsuarios()

      await user.click(linhaDe('Bruno Lima').getByTitle('Excluir'))
      await user.click(dialogo('Excluir usuário?').getByRole('button', { name: 'Excluir' }))

      expect(await screen.findByText('Usuário possui tarefas atribuídas.')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Excluir usuário?' })).toBeInTheDocument()
    })

    it('não exclui quando o usuário cancela', async () => {
      const user = userEvent.setup()
      await renderUsuarios()

      await user.click(linhaDe('Bruno Lima').getByTitle('Excluir'))
      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(api.delete).not.toHaveBeenCalled()
      expect(screen.queryByRole('heading', { name: 'Excluir usuário?' })).not.toBeInTheDocument()
    })
  })

  describe('edição', () => {
    it('carrega os dados completos do usuário no formulário', async () => {
      const user = userEvent.setup()
      await renderUsuarios()

      await abrirEdicaoDoBruno(user)

      expect(api.get).toHaveBeenCalledWith('/users/8')
      expect(api.get).toHaveBeenCalledWith('/boards')
      expect(screen.getByRole('heading', { name: 'Editar usuário' })).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Nome')).toHaveValue('Bruno Lima')
      expect(screen.getAllByText('bruno@empresa.com').length).toBeGreaterThan(0)
      expect(screen.getByRole('combobox')).toHaveValue('pleno')
    })

    it('salva as alterações e atualiza a linha na lista', async () => {
      api.put.mockResolvedValue({ data: { id: 8, name: 'Bruno Lima', jobTitle: 'Diretor de Arte' } })
      const user = userEvent.setup()
      await renderUsuarios()
      await abrirEdicaoDoBruno(user)

      const cargo = screen.getByDisplayValue('Designer')
      await user.clear(cargo)
      await user.type(cargo, 'Diretor de Arte')
      await user.click(screen.getByRole('button', { name: 'Salvar perfil' }))

      expect(api.put).toHaveBeenCalledWith('/users/8', {
        name: 'Bruno Lima',
        jobTitle: 'Diretor de Arte',
        phone: '',
        seniority: 'pleno',
        bio: '',
        responsibility: '',
        linkedin: '',
        avatarUrl: '',
      })
      await vi.waitFor(() => expect(screen.queryByRole('heading', { name: 'Editar usuário' })).not.toBeInTheDocument())
      expect(linhaDe('Bruno Lima').getByText('Diretor de Arte')).toBeInTheDocument()
    })

    it('fecha sem salvar ao cancelar', async () => {
      const user = userEvent.setup()
      await renderUsuarios()
      await abrirEdicaoDoBruno(user)

      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(api.put).not.toHaveBeenCalled()
      expect(screen.queryByRole('heading', { name: 'Editar usuário' })).not.toBeInTheDocument()
    })

    it('mostra a quais empresas o usuário tem acesso', async () => {
      const user = userEvent.setup()
      await renderUsuarios()

      await abrirEdicaoDoBruno(user)

      expect(screen.getByText('1 de 2')).toBeInTheDocument()
      expect(within(screen.getByText('Tech Solutions').closest('label')).getByText('Membro')).toBeInTheDocument()
      expect(within(screen.getByText('Padaria Central').closest('label')).getByText('sem board')).toBeInTheDocument()
    })

    it('remove o acesso à empresa atualizando os membros do board', async () => {
      api.put.mockResolvedValue({})
      const user = userEvent.setup()
      await renderUsuarios()
      await abrirEdicaoDoBruno(user)

      // A caixa de seleção é o primeiro elemento dentro da linha da empresa.
      await user.click(screen.getByText('Tech Solutions').closest('label').firstElementChild)

      expect(api.put).toHaveBeenCalledWith('/boards/10', { userIds: [7] })
      expect(await screen.findByText('0 de 2')).toBeInTheDocument()
    })

    it('não mostra o acesso a empresas para usuário comum', async () => {
      configurarAuth({ id: 8, role: 'USER' })
      const user = userEvent.setup()
      await renderUsuarios()

      await abrirEdicaoDoBruno(user)

      expect(screen.queryByText('Acesso a empresas')).not.toBeInTheDocument()
    })
  })
})
