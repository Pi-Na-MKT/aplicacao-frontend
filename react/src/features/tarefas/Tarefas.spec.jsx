import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Tarefas from './Tarefas'
import api from '../../shared/services/api'

let auth
vi.mock('../../app/providers/AuthContext', () => ({ useAuth: () => auth }))
vi.mock('../../shared/services/api', async (importOriginal) => ({
  ...(await importOriginal()),
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const EMPRESA = { id: 1, nome: 'Tech Solutions', inicial: 'T', cor: 'bg-pink-500' }

const USUARIOS = [
  { id: 7, nome: 'Ana Souza', cargo: 'Gestora' },
  { id: 8, nome: 'Bruno Lima' },
]

const CARD_POST = {
  id: 100, title: 'Criar post', description: 'Post de lançamento', priority: 'HIGH', position: 0,
  completed: false, dueDate: '2026-03-10T12:00:00', assignedUsers: [{ id: 7, name: 'Ana Souza' }],
}
const CARD_SITE = { id: 101, title: 'Revisar site', priority: 'LOW', position: 0, completed: true }

// As colunas vêm fora de ordem de propósito: a tela deve ordenar por "position".
// Só a Ana (id 7) é membro do board.
function respostasPadrao() {
  return {
    '/boards': [{ id: 1, companyId: 1, members: [{ id: 7 }] }],
    '/columns/board/1': [{ id: 11, name: 'Concluído', position: 1 }, { id: 10, name: 'A Fazer', position: 0 }],
    '/cards/column/10': [CARD_POST, { id: 102, title: 'Card inativo', isActive: false }],
    '/cards/column/11': [CARD_SITE],
  }
}

let respostas

function configurarAuth(role = 'ADMIN') {
  auth = { user: { id: 7, nome: 'Ana Souza', role }, registeredUsers: USUARIOS }
}

// Localizadores. A estrutura da tela é: coluna > cabeçalho > título (h2).
const coluna = (nome) => screen.getByRole('heading', { name: nome, level: 2 }).parentElement.parentElement
const nomesDasColunas = () => screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent)
const tituloDoCard = (titulo) => screen.getByRole('heading', { name: titulo, level: 4 })
// No topo do card ficam, nesta ordem: botão de concluir, título e botão do menu.
const botoesDoCard = (titulo) => within(tituloDoCard(titulo).parentElement).getAllByRole('button')
const dialogo = (titulo) => within(screen.getByRole('heading', { name: titulo }).parentElement)

async function renderTarefas(props) {
  const resultado = render(<Tarefas empresa={EMPRESA} onDashboard={vi.fn()} {...props} />)
  await screen.findByRole('heading', { name: 'A Fazer', level: 2 })
  return resultado
}

async function abrirMenuDoCard(user, titulo) {
  await user.click(botoesDoCard(titulo)[1])
}

describe('Tarefas', () => {
  beforeEach(() => {
    api.get.mockReset()
    api.post.mockReset()
    api.put.mockReset()
    api.delete.mockReset()
    configurarAuth()
    respostas = respostasPadrao()
    api.get.mockImplementation((url) =>
      url in respostas ? Promise.resolve({ data: respostas[url] }) : Promise.reject(new Error(`URL inesperada: ${url}`))
    )
    api.put.mockResolvedValue({ data: {} })
    api.delete.mockResolvedValue({})
  })

  describe('carregamento do board', () => {
    it('mostra as colunas ordenadas com os cards ativos', async () => {
      await renderTarefas()

      expect(nomesDasColunas()).toEqual(['A Fazer', 'Concluído'])
      expect(within(coluna('A Fazer')).getByText('Criar post')).toBeInTheDocument()
      expect(within(coluna('Concluído')).getByText('Revisar site')).toBeInTheDocument()
      expect(screen.queryByText('Card inativo')).not.toBeInTheDocument()
    })

    it('mostra o título da tela, a empresa e o total de tarefas', async () => {
      await renderTarefas()

      expect(screen.getByRole('heading', { name: 'Boards', level: 1 })).toBeInTheDocument()
      expect(screen.getByText('Tech Solutions')).toBeInTheDocument()
      expect(screen.getByText('2 tarefas no total')).toBeInTheDocument()
    })

    it('mostra prioridade, prazo e responsável no card', async () => {
      await renderTarefas()

      const card = within(coluna('A Fazer'))
      expect(card.getByText('Alta')).toBeInTheDocument()
      expect(card.getByText('10/03')).toBeInTheDocument()
      expect(card.getByTitle('Ana Souza')).toBeInTheDocument()
    })

    it('mostra a quantidade de cards de cada coluna', async () => {
      respostas['/cards/column/10'] = [CARD_POST, { ...CARD_SITE, id: 105, title: 'Outro card' }]
      await renderTarefas()

      // O contador é o último elemento do cabeçalho da coluna.
      const contador = (nome) => screen.getByRole('heading', { name: nome, level: 2 }).parentElement.lastElementChild
      expect(contador('A Fazer')).toHaveTextContent(/^2$/)
      expect(contador('Concluído')).toHaveTextContent(/^1$/)
    })
  })

  describe('ações do cabeçalho', () => {
    it('abre o Dashboard da empresa para administrador', async () => {
      const onDashboard = vi.fn()
      const user = userEvent.setup()
      await renderTarefas({ onDashboard })

      await user.click(screen.getByRole('button', { name: 'Dashboard' }))

      expect(onDashboard).toHaveBeenCalledTimes(1)
    })

    it('não mostra o botão Dashboard para quem não é administrador', async () => {
      configurarAuth('MANAGER')
      await renderTarefas()

      expect(screen.queryByRole('button', { name: 'Dashboard' })).not.toBeInTheDocument()
    })

    it('"Nova tarefa" cria o card no fim da primeira coluna', async () => {
      api.post.mockResolvedValue({ data: { id: 103, title: 'Tarefa nova', priority: 'MEDIUM', position: 1 } })
      const user = userEvent.setup()
      await renderTarefas()

      await user.click(screen.getByRole('button', { name: 'Nova tarefa' }))
      await user.type(screen.getByPlaceholderText('Ex.: Criar post para o Instagram'), 'Tarefa nova')
      await user.click(screen.getByRole('button', { name: 'Criar card' }))

      expect(api.post).toHaveBeenCalledWith('/cards/column/10', expect.objectContaining({ title: 'Tarefa nova', position: 1 }))
      expect(await within(coluna('A Fazer')).findByText('Tarefa nova')).toBeInTheDocument()
    })
  })

  describe('busca da barra superior', () => {
    it('mostra só os cards que combinam pelo título', async () => {
      const { rerender } = await renderTarefas()

      rerender(<Tarefas empresa={EMPRESA} search="revisar" />)

      expect(screen.getByText('Revisar site')).toBeInTheDocument()
      expect(screen.queryByText('Criar post')).not.toBeInTheDocument()
      expect(nomesDasColunas()).toEqual(['A Fazer', 'Concluído'])
    })

    it('encontra o card pelo nome do responsável', async () => {
      const { rerender } = await renderTarefas()

      rerender(<Tarefas empresa={EMPRESA} search="ana" />)

      expect(screen.getByText('Criar post')).toBeInTheDocument()
      expect(screen.queryByText('Revisar site')).not.toBeInTheDocument()
    })

    it('um card novo entra no fim real da coluna mesmo com a busca ativa', async () => {
      const user = userEvent.setup()
      await renderTarefas({ search: 'inexistente' })

      await user.click(within(coluna('A Fazer')).getByRole('button', { name: 'Adicionar card' }))
      await user.type(screen.getByPlaceholderText('Ex.: Criar post para o Instagram'), 'Outra tarefa')
      api.post.mockResolvedValue({ data: { id: 104, title: 'Outra tarefa' } })
      await user.click(screen.getByRole('button', { name: 'Criar card' }))

      expect(api.post).toHaveBeenCalledWith('/cards/column/10', expect.objectContaining({ position: 1 }))
    })
  })

  describe('empresa sem board', () => {
    beforeEach(() => {
      respostas['/boards'] = []
    })

    it('permite que o gestor crie o board com as três colunas padrão', async () => {
      api.post.mockImplementation((url) => {
        if (url === '/boards/company/1') {
          respostas['/boards'] = respostasPadrao()['/boards']
          return Promise.resolve({ data: { id: 1 } })
        }
        return Promise.resolve({ data: {} })
      })
      const user = userEvent.setup()
      render(<Tarefas empresa={EMPRESA} />)

      await user.click(await screen.findByRole('button', { name: 'Criar board' }))

      expect(await screen.findByRole('heading', { name: 'A Fazer', level: 2 })).toBeInTheDocument()
      expect(api.post).toHaveBeenCalledWith('/boards/company/1', { name: 'Tech Solutions', userIds: [] })
      expect(api.post).toHaveBeenCalledWith('/columns/board/1', { name: 'A Fazer', position: 0 })
      expect(api.post).toHaveBeenCalledWith('/columns/board/1', { name: 'Em Progresso', position: 1 })
      expect(api.post).toHaveBeenCalledWith('/columns/board/1', { name: 'Concluído', position: 2 })
    })

    it('pede para o usuário comum aguardar um administrador', async () => {
      configurarAuth('USER')
      render(<Tarefas empresa={EMPRESA} />)

      expect(await screen.findByText('Aguarde um administrador criar o board desta empresa.')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Criar board' })).not.toBeInTheDocument()
    })
  })

  describe('colunas', () => {
    it('adiciona uma coluna no fim do board', async () => {
      api.post.mockResolvedValue({ data: { id: 12, name: 'Revisão' } })
      const user = userEvent.setup()
      await renderTarefas()

      await user.click(screen.getByRole('button', { name: 'Nova coluna' }))
      await user.type(screen.getByPlaceholderText('Nome da coluna...'), 'Revisão')
      await user.click(screen.getByRole('button', { name: 'Adicionar' }))

      expect(api.post).toHaveBeenCalledWith('/columns/board/1', { name: 'Revisão', position: 2 })
      await vi.waitFor(() => expect(nomesDasColunas()).toEqual(['A Fazer', 'Concluído', 'Revisão']))
    })

    it('renomeia a coluna ao confirmar com Enter', async () => {
      const user = userEvent.setup()
      await renderTarefas()

      await user.click(within(coluna('A Fazer')).getByTitle('Renomear coluna'))
      const campo = screen.getByDisplayValue('A Fazer')
      await user.clear(campo)
      await user.type(campo, 'Backlog{Enter}')

      expect(api.put).toHaveBeenCalledWith('/columns/10', { name: 'Backlog' })
      await vi.waitFor(() => expect(nomesDasColunas()).toEqual(['Backlog', 'Concluído']))
    })

    it('exclui a coluna depois de avisar quantos cards serão perdidos', async () => {
      const user = userEvent.setup()
      await renderTarefas()

      await user.click(within(coluna('A Fazer')).getByTitle('Excluir coluna'))
      expect(screen.getByText('1 card serão perdidos.')).toBeInTheDocument()
      await user.click(dialogo('Excluir "A Fazer"?').getByRole('button', { name: 'Excluir' }))

      expect(api.delete).toHaveBeenCalledWith('/columns/10')
      await vi.waitFor(() => expect(nomesDasColunas()).toEqual(['Concluído']))
    })

    it('reordena as colunas ao arrastar uma sobre a outra', async () => {
      await renderTarefas()

      fireEvent.dragStart(within(coluna('A Fazer')).getByTitle('Arrastar coluna'))
      fireEvent.dragOver(coluna('Concluído'))
      fireEvent.drop(coluna('Concluído'))

      expect(nomesDasColunas()).toEqual(['Concluído', 'A Fazer'])
      expect(api.put).toHaveBeenCalledWith('/columns/11', { position: 0 })
      expect(api.put).toHaveBeenCalledWith('/columns/10', { position: 1 })
    })

    it('não mostra a gestão de colunas para usuário comum', async () => {
      configurarAuth('USER')
      await renderTarefas()

      expect(screen.queryByRole('button', { name: 'Nova coluna' })).not.toBeInTheDocument()
      expect(screen.queryByTitle('Renomear coluna')).not.toBeInTheDocument()
      expect(screen.queryByTitle('Excluir coluna')).not.toBeInTheDocument()
      expect(screen.queryByTitle('Arrastar coluna')).not.toBeInTheDocument()
    })
  })

  describe('cards', () => {
    it('exige o título ao criar um card', async () => {
      const user = userEvent.setup()
      await renderTarefas()

      await user.click(within(coluna('A Fazer')).getByRole('button', { name: 'Adicionar card' }))
      await user.click(screen.getByRole('button', { name: 'Criar card' }))

      expect(screen.getByText('Título é obrigatório.')).toBeInTheDocument()
      expect(api.post).not.toHaveBeenCalled()
    })

    it('cria o card no fim da coluna', async () => {
      api.post.mockResolvedValue({ data: { id: 103, title: 'Nova tarefa', priority: 'MEDIUM', position: 1 } })
      const user = userEvent.setup()
      await renderTarefas()

      await user.click(within(coluna('A Fazer')).getByRole('button', { name: 'Adicionar card' }))
      await user.type(screen.getByPlaceholderText('Ex.: Criar post para o Instagram'), 'Nova tarefa')
      await user.click(screen.getByRole('button', { name: 'Criar card' }))

      expect(api.post).toHaveBeenCalledWith('/cards/column/10', {
        title: 'Nova tarefa',
        description: null,
        priority: 'MEDIUM',
        position: 1,
        dueDate: null,
        isActive: true,
        assignedUserIds: [],
      })
      expect(await within(coluna('A Fazer')).findByText('Nova tarefa')).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: 'Novo card' })).not.toBeInTheDocument()
    })

    it('oferece como responsáveis apenas os membros do board', async () => {
      api.post.mockResolvedValue({ data: { id: 103, title: 'Nova tarefa' } })
      const user = userEvent.setup()
      await renderTarefas()

      await user.click(within(coluna('A Fazer')).getByRole('button', { name: 'Adicionar card' }))
      expect(screen.queryByRole('button', { name: /Bruno Lima/ })).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /Ana Souza/ }))
      expect(screen.getByText('1 selecionado')).toBeInTheDocument()
      await user.type(screen.getByPlaceholderText('Ex.: Criar post para o Instagram'), 'Nova tarefa')
      await user.click(screen.getByRole('button', { name: 'Criar card' }))

      expect(api.post).toHaveBeenCalledWith('/cards/column/10', expect.objectContaining({ assignedUserIds: [7] }))
    })

    it('edita o card mantendo os dados que não foram alterados', async () => {
      api.put.mockResolvedValue({ data: { ...CARD_POST, title: 'Criar post editado' } })
      const user = userEvent.setup()
      await renderTarefas()

      await abrirMenuDoCard(user, 'Criar post')
      await user.click(screen.getByRole('menuitem', { name: 'Editar' }))
      const titulo = screen.getByDisplayValue('Criar post')
      await user.clear(titulo)
      await user.type(titulo, 'Criar post editado')
      await user.click(screen.getByRole('button', { name: 'Salvar' }))

      expect(api.put).toHaveBeenCalledWith('/cards/100', {
        title: 'Criar post editado',
        description: 'Post de lançamento',
        priority: 'HIGH',
        position: 0,
        dueDate: '2026-03-10T00:00:00',
        isActive: true,
        assignedUserIds: [7],
      })
      expect(await within(coluna('A Fazer')).findByText('Criar post editado')).toBeInTheDocument()
      expect(screen.queryByText('Criar post')).not.toBeInTheDocument()
    })

    it('exclui o card depois da confirmação', async () => {
      const user = userEvent.setup()
      await renderTarefas()

      await abrirMenuDoCard(user, 'Criar post')
      await user.click(screen.getByRole('menuitem', { name: 'Excluir' }))
      await user.click(dialogo('Excluir card?').getByRole('button', { name: 'Excluir' }))

      expect(api.delete).toHaveBeenCalledWith('/cards/100')
      await vi.waitFor(() => expect(screen.queryByText('Criar post')).not.toBeInTheDocument())
      expect(screen.queryByRole('heading', { name: 'Excluir card?' })).not.toBeInTheDocument()
    })

    it('marca o card como concluído', async () => {
      const user = userEvent.setup()
      await renderTarefas()

      await user.click(botoesDoCard('Criar post')[0])

      expect(api.put).toHaveBeenCalledWith('/cards/100', { completed: true })
    })

    it('move o card para o fim de outra coluna ao arrastar', async () => {
      await renderTarefas()
      const card = tituloDoCard('Criar post').closest('[draggable="true"]')
      // A área que recebe os cards é a mesma que contém o botão "Adicionar card".
      const destino = within(coluna('Concluído')).getByRole('button', { name: 'Adicionar card' }).parentElement

      fireEvent.dragStart(card)
      fireEvent.dragOver(destino)
      fireEvent.drop(destino)

      expect(api.put).toHaveBeenCalledWith('/cards/100', { columnId: 11, position: 1 })
      expect(within(coluna('Concluído')).getByText('Criar post')).toBeInTheDocument()
      expect(within(coluna('A Fazer')).queryByText('Criar post')).not.toBeInTheDocument()
    })

    it('insere o card antes do card sobre o qual foi solto', async () => {
      await renderTarefas()
      const card = tituloDoCard('Criar post').closest('[draggable="true"]')
      const alvo = tituloDoCard('Revisar site').closest('[draggable="true"]')
      const destino = within(coluna('Concluído')).getByRole('button', { name: 'Adicionar card' }).parentElement

      fireEvent.dragStart(card)
      fireEvent.dragOver(alvo)
      fireEvent.drop(destino)

      expect(api.put).toHaveBeenCalledWith('/cards/100', { columnId: 11, position: 0 })
      const titulos = within(coluna('Concluído')).getAllByRole('heading', { level: 4 }).map(h => h.textContent)
      expect(titulos).toEqual(['Criar post', 'Revisar site'])
    })

    it('cria o evento no Google Calendar para card com prazo', async () => {
      api.post.mockResolvedValue({ data: { ...CARD_POST, googleCalendarEventId: 'evento-1' } })
      const user = userEvent.setup()
      await renderTarefas()

      await abrirMenuDoCard(user, 'Criar post')
      await user.click(screen.getByRole('menuitem', { name: 'Add ao Google Calendar' }))

      expect(api.post).toHaveBeenCalledWith('/cards/100/calendar-event')
      await abrirMenuDoCard(user, 'Criar post')
      expect(await screen.findByRole('menuitem', { name: 'No Google Calendar' })).toBeDisabled()
    })
  })
})
