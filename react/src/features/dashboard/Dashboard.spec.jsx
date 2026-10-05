import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dashboard from './Dashboard'
import api from '../../shared/services/api'

let auth
vi.mock('../../app/providers/AuthContext', () => ({ useAuth: () => auth }))
vi.mock('../../shared/services/api', async (importOriginal) => ({
  ...(await importOriginal()),
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const EMPRESAS = [
  { id: 1, nome: 'Tech Solutions',  inicial: 'T', cor: 'bg-pink-500',  active: true },
  { id: 2, nome: 'Padaria Central', inicial: 'P', cor: 'bg-green-500', active: true },
  { id: 3, nome: 'Loja Fechada',    inicial: 'L', cor: 'bg-blue-500',  active: false },
]

const ANA   = { id: 7, name: 'Ana Souza' }
const BRUNO = { id: 8, name: 'Bruno Lima' }

// Empresa 1: uma tarefa atrasada, uma concluída e uma inativa (que não deve contar).
// Empresa 2: uma tarefa em andamento, dentro do prazo.
// Empresa 3: sem board.
const RESPOSTAS = {
  '/boards': [{ id: 10, companyId: 1 }, { id: 20, companyId: 2 }],
  '/columns/board/10': [{ id: 101, name: 'Concluído', position: 1 }, { id: 100, name: 'A Fazer', position: 0 }],
  '/columns/board/20': [{ id: 200, name: 'A Fazer', position: 0 }],
  '/cards/column/100': [
    { id: 1, title: 'Revisar proposta', priority: 'HIGH', completed: false, createdAt: '2026-01-01T12:00:00', dueDate: '2020-01-10T12:00:00', assignedUsers: [ANA] },
    { id: 2, title: 'Tarefa inativa', completed: false, isActive: false, assignedUsers: [ANA] },
  ],
  '/cards/column/101': [
    { id: 3, title: 'Criar landing page', priority: 'LOW', completed: true, createdAt: '2026-01-03T12:00:00', assignedUsers: [ANA] },
  ],
  '/cards/column/200': [
    { id: 4, title: 'Ajustar cardápio', priority: 'CRITICAL', completed: false, createdAt: '2026-01-02T12:00:00', dueDate: '2099-06-25T12:00:00', assignedUsers: [BRUNO] },
  ],
}

function responderApi(respostas = RESPOSTAS) {
  api.get.mockImplementation((url) =>
    url in respostas ? Promise.resolve({ data: respostas[url] }) : Promise.reject(new Error(`URL inesperada: ${url}`))
  )
}

// Localizadores por bloco da tela.
const indicador = (rotulo) => within(within(screen.getByRole('list', { name: 'Indicadores' })).getByText(rotulo).closest('li'))
// O valor do indicador fica no parágrafo logo abaixo do rótulo.
const valorDe = (rotulo) => within(screen.getByRole('list', { name: 'Indicadores' })).getByText(rotulo).nextElementSibling
const bloco = (titulo) => within(screen.getByRole('region', { name: titulo }))
const textosDe = (itens) => itens.map(item => item.textContent)
const linhasDaTabela = () => bloco('Últimas tarefas').getAllByRole('row').slice(1)
const titulosDaTabela = () => linhasDaTabela().map(linha => within(linha).getAllByRole('cell')[0].textContent)

async function renderDashboard(props) {
  const resultado = render(<Dashboard {...props} />)
  await screen.findByRole('list', { name: 'Indicadores' })
  return resultado
}

describe('Dashboard', () => {
  beforeEach(() => {
    api.get.mockReset()
    auth = { user: { id: 7, nome: 'Ana Souza', role: 'ADMIN' }, companies: EMPRESAS }
    responderApi()
  })

  it('cumprimenta o usuário pelo primeiro nome', async () => {
    await renderDashboard()

    expect(screen.getByRole('heading', { name: 'Olá, Ana!', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Aqui está um resumo da sua jornada no PINA.')).toBeInTheDocument()
  })

  describe('indicadores', () => {
    it('somam as tarefas ativas de todas as empresas', async () => {
      await renderDashboard()

      expect(valorDe('Total de tarefas')).toHaveTextContent(/^3$/)
      expect(indicador('Total de tarefas').getByText(/empresas$/)).toHaveTextContent('em 2 empresas')
      expect(valorDe('Em andamento')).toHaveTextContent(/^2$/)
      expect(indicador('Em andamento').getByText(/do total/)).toHaveTextContent('67% do total · 1 atrasada')
      expect(valorDe('Concluídas')).toHaveTextContent(/^1$/)
      expect(indicador('Concluídas').getByText(/do total/)).toHaveTextContent('33% do total')
    })

    it('contam só as empresas ativas', async () => {
      await renderDashboard()

      expect(valorDe('Empresas ativas')).toHaveTextContent(/^2$/)
      expect(indicador('Empresas ativas').getByText(/cadastradas/)).toHaveTextContent('67% das cadastradas')
    })
  })

  it('mostra as tarefas por usuário, de quem tem mais para quem tem menos', async () => {
    await renderDashboard()

    const linhas = bloco('Tarefas por usuário').getAllByRole('listitem')
    expect(textosDe(linhas)).toEqual(['Ana Souza267%', 'Bruno Lima133%'])
    expect(linhas[0]).toHaveAttribute('title', '1 concluída, 1 em andamento, 1 atrasada')
  })

  it('mostra as tarefas por status', async () => {
    await renderDashboard()

    const linhas = bloco('Tarefas por status').getAllByRole('listitem')
    expect(textosDe(linhas)).toEqual(['Concluídas133%', 'No prazo133%', 'Atrasadas133%'])
  })

  it('mostra as tarefas por prioridade', async () => {
    await renderDashboard()

    const linhas = bloco('Tarefas por prioridade').getAllByRole('listitem')
    expect(textosDe(linhas)).toEqual(['1Baixa', '0Média', '1Alta', '1Urgente'])
  })

  describe('últimas tarefas', () => {
    it('lista da mais nova para a mais antiga com responsável, empresa, prioridade, status e prazo', async () => {
      await renderDashboard()

      expect(titulosDaTabela()).toEqual(['Criar landing page', 'Ajustar cardápio', 'Revisar proposta'])
      const celulas = (linha) => textosDe(within(linha).getAllByRole('cell'))
      expect(celulas(linhasDaTabela()[0])).toEqual(['Criar landing page', 'Ana Souza', 'Tech Solutions', 'Baixa', 'Concluída', '—'])
      expect(celulas(linhasDaTabela()[1])).toEqual(['Ajustar cardápio', 'Bruno Lima', 'Padaria Central', 'Urgente', 'Em andamento', '25/06'])
      expect(celulas(linhasDaTabela()[2])).toEqual(['Revisar proposta', 'Ana Souza', 'Tech Solutions', 'Alta', 'Atrasada', '10/01'])
    })

    it('é filtrada pela busca da barra superior', async () => {
      const { rerender } = await renderDashboard()

      rerender(<Dashboard search="bruno" />)
      expect(titulosDaTabela()).toEqual(['Ajustar cardápio'])

      rerender(<Dashboard search="tech" />)
      expect(titulosDaTabela()).toEqual(['Criar landing page', 'Revisar proposta'])
    })

    it('avisa quando a busca não encontra tarefas, sem afetar os indicadores', async () => {
      await renderDashboard({ search: 'inexistente' })

      expect(screen.getByText('Nenhuma tarefa corresponde à busca.')).toBeInTheDocument()
      expect(valorDe('Total de tarefas')).toHaveTextContent(/^3$/)
    })

    it('mostra cinco tarefas e o restante ao clicar em "Ver todas"', async () => {
      const muitas = Array.from({ length: 7 }, (_, i) => ({
        id: i + 1, title: `Tarefa ${i + 1}`, completed: false, createdAt: `2026-01-0${i + 1}T12:00:00`,
      }))
      responderApi({ ...RESPOSTAS, '/cards/column/100': muitas, '/cards/column/101': [], '/cards/column/200': [] })
      const user = userEvent.setup()
      await renderDashboard()

      expect(titulosDaTabela()).toEqual(['Tarefa 7', 'Tarefa 6', 'Tarefa 5', 'Tarefa 4', 'Tarefa 3'])
      await user.click(screen.getByRole('button', { name: 'Ver todas →' }))

      expect(titulosDaTabela()).toHaveLength(7)
    })
  })

  describe('seletor de empresa', () => {
    it('filtra todos os blocos pela empresa escolhida', async () => {
      const user = userEvent.setup()
      await renderDashboard()

      await user.selectOptions(screen.getByRole('combobox', { name: 'Empresa' }), 'Padaria Central')

      expect(screen.getByText('Aqui está um resumo da sua jornada em Padaria Central.')).toBeInTheDocument()
      expect(valorDe('Total de tarefas')).toHaveTextContent(/^1$/)
      expect(indicador('Concluídas').getByText(/do total/)).toHaveTextContent('0% do total')
      expect(textosDe(bloco('Tarefas por usuário').getAllByRole('listitem'))).toEqual(['Bruno Lima1100%'])
      expect(titulosDaTabela()).toEqual(['Ajustar cardápio'])
    })

    it('mostra a empresa atual e o total de tarefas dela', async () => {
      await renderDashboard({ empresaInicial: EMPRESAS[0] })

      expect(screen.getByRole('combobox', { name: 'Empresa' })).toHaveValue('1')
      expect(screen.getByText('2 tarefas no total')).toBeInTheDocument()
      expect(valorDe('Total de tarefas')).toHaveTextContent(/^2$/)
      expect(indicador('Concluídas').getByText(/do total/)).toHaveTextContent('50% do total')
    })
  })

  describe('botão "Voltar"', () => {
    it('aparece quando recebe onBack e chama a função ao clicar', async () => {
      const onBack = vi.fn()
      const user = userEvent.setup()
      await renderDashboard({ onBack })

      await user.click(screen.getByRole('button', { name: 'Voltar' }))

      expect(onBack).toHaveBeenCalledTimes(1)
    })

    it('não aparece sem onBack', async () => {
      await renderDashboard()

      expect(screen.queryByRole('button', { name: 'Voltar' })).not.toBeInTheDocument()
    })
  })

  describe('estados vazios', () => {
    it('mostra um aviso único quando não há tarefas', async () => {
      responderApi({ '/boards': [] })
      await renderDashboard()

      expect(valorDe('Total de tarefas')).toHaveTextContent(/^0$/)
      expect(screen.getByText('Nenhuma tarefa criada ainda.')).toBeInTheDocument()
      expect(screen.queryByRole('region', { name: 'Tarefas por status' })).not.toBeInTheDocument()
    })

    it('avisa quando há tarefas mas nenhuma tem responsável', async () => {
      responderApi({
        '/boards': [{ id: 10, companyId: 1 }],
        '/columns/board/10': [{ id: 100, name: 'A Fazer', position: 0 }],
        '/cards/column/100': [{ id: 1, title: 'Sem responsável', completed: false }],
      })
      await renderDashboard()

      expect(screen.getByText('Nenhum membro atribuído às tarefas.')).toBeInTheDocument()
      expect(textosDe(within(linhasDaTabela()[0]).getAllByRole('cell'))).toEqual(['Sem responsável', '—', 'Tech Solutions', 'Média', 'Em andamento', '—'])
    })

    it('não fica carregando para sempre quando não há empresas', async () => {
      auth = { user: { id: 7, nome: 'Ana Souza', role: 'ADMIN' }, companies: [] }
      await renderDashboard()

      expect(screen.getByText('Nenhuma tarefa criada ainda.')).toBeInTheDocument()
      expect(api.get).not.toHaveBeenCalled()
    })
  })
})
