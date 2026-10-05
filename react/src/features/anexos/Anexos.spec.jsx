import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Anexos from './Anexos'
import api from '../../shared/services/api'

let auth
vi.mock('../../app/providers/AuthContext', () => ({ useAuth: () => auth }))
vi.mock('../../shared/services/api', async (importOriginal) => ({
  ...(await importOriginal()),
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const EMPRESAS = [
  { id: 1, nome: 'Tech Solutions',  inicial: 'T', cor: 'bg-pink-500' },
  { id: 2, nome: 'Padaria Central', inicial: 'P', cor: 'bg-green-500' },
]

const CONTRATO = { id: 5, fileName: 'contrato.pdf', fileSize: 2048, createdAt: '2026-01-15T12:00:00', uploadedByName: 'Ana' }

function responderAnexos(porEmpresa = { 1: [CONTRATO], 2: [] }) {
  api.get.mockImplementation((url) => {
    const empresaId = url.match(/^\/attachments\/company\/(\d+)$/)?.[1]
    if (empresaId) return Promise.resolve({ data: porEmpresa[empresaId] || [] })
    return Promise.reject(new Error(`URL inesperada: ${url}`))
  })
}

// O total fica em um <p> logo acima do rótulo.
const totalDe = (rotulo) => screen.getByText(rotulo).previousElementSibling

const botaoAbrir  = (empresa) => screen.getByRole('button', { name: `Abrir anexos de ${empresa}` })
const botaoFechar = (empresa) => screen.getByRole('button', { name: `Fechar anexos de ${empresa}` })

const confirmarDialogo = (user, titulo) =>
  user.click(within(screen.getByRole('heading', { name: titulo }).parentElement).getByRole('button', { name: 'Excluir' }))

async function pedirExclusao(user) {
  await user.click(screen.getByRole('button', { name: 'Mais ações' }))
  await user.click(screen.getByRole('menuitem', { name: 'Excluir' }))
}

describe('Anexos', () => {
  beforeEach(() => {
    api.get.mockReset()
    api.post.mockReset()
    api.delete.mockReset()
    auth = { companies: EMPRESAS }
    responderAnexos()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('carrega os anexos de cada empresa e mostra os totais', async () => {
    render(<Anexos />)

    expect(await screen.findByText('contrato.pdf')).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/attachments/company/1')
    expect(api.get).toHaveBeenCalledWith('/attachments/company/2')
    expect(screen.getByText('2,0 KB · 15/01/2026 · Ana')).toBeInTheDocument()
    expect(screen.getByText('1 arquivo')).toBeInTheDocument()
    expect(screen.getByText('Nenhum arquivo')).toBeInTheDocument()
    expect(totalDe('Arquivos')).toHaveTextContent('1')
    expect(totalDe('Empresas')).toHaveTextContent('1')
  })

  it('abre a primeira empresa por padrão e as demais ao clicar', async () => {
    const user = userEvent.setup()
    render(<Anexos />)
    await screen.findByText('contrato.pdf')

    expect(screen.queryByText('Nenhum arquivo anexado ainda')).not.toBeInTheDocument()
    await user.click(botaoAbrir('Padaria Central'))

    expect(screen.getByText('Nenhum arquivo anexado ainda')).toBeInTheDocument()
    expect(botaoFechar('Padaria Central')).toHaveAttribute('aria-expanded', 'true')
  })

  it('fecha a empresa ao clicar no cabeçalho de novo', async () => {
    const user = userEvent.setup()
    render(<Anexos />)
    await screen.findByText('contrato.pdf')

    await user.click(botaoFechar('Tech Solutions'))

    expect(screen.queryByText('contrato.pdf')).not.toBeInTheDocument()
    expect(botaoAbrir('Tech Solutions')).toHaveAttribute('aria-expanded', 'false')
  })

  describe('busca da barra superior', () => {
    it('filtra pelo nome da empresa', async () => {
      render(<Anexos search="padaria" />)

      expect(await screen.findByText('Padaria Central')).toBeInTheDocument()
      expect(screen.queryByText('Tech Solutions')).not.toBeInTheDocument()
    })

    it('filtra pelo nome de um arquivo da empresa', async () => {
      const { rerender } = render(<Anexos />)
      await screen.findByText('contrato.pdf')

      rerender(<Anexos search="contrato" />)

      expect(screen.getByText('Tech Solutions')).toBeInTheDocument()
      expect(screen.queryByText('Padaria Central')).not.toBeInTheDocument()
    })

    it('avisa quando nada corresponde à busca', async () => {
      render(<Anexos search="inexistente" />)

      expect(await screen.findByText('Nenhuma empresa ou arquivo encontrado.')).toBeInTheDocument()
    })
  })

  it('mostra o estado vazio quando não há empresas', () => {
    auth = { companies: [] }
    render(<Anexos />)

    expect(screen.getByText('Nenhuma empresa cadastrada ainda.')).toBeInTheDocument()
  })

  describe('envio', () => {
    it('envia o arquivo escolhido para a empresa e mostra na lista', async () => {
      api.post.mockResolvedValue({ data: [{ id: 6, fileName: 'foto.png', fileSize: 500, createdAt: '2026-01-16T12:00:00', uploadedByName: 'Ana' }] })
      const user = userEvent.setup()
      const { container } = render(<Anexos />)
      await screen.findByText('contrato.pdf')
      const arquivo = new File(['conteudo'], 'foto.png', { type: 'image/png' })

      await user.click(screen.getByText('clique para anexar'))
      await user.upload(container.querySelector('input[type="file"]'), arquivo)

      expect(await screen.findByText('foto.png')).toBeInTheDocument()
      const [url, formData, config] = api.post.mock.calls[0]
      expect(url).toBe('/attachments/company/1')
      expect(formData.getAll('files')).toEqual([arquivo])
      expect(config).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } })
      expect(screen.getByText('2 arquivos')).toBeInTheDocument()
    })

    it('o botão "Anexar arquivo" do cabeçalho envia para a empresa dele e abre o painel', async () => {
      api.post.mockResolvedValue({ data: [{ id: 7, fileName: 'cardapio.pdf', fileSize: 500 }] })
      const user = userEvent.setup()
      const { container } = render(<Anexos />)
      await screen.findByText('contrato.pdf')

      await user.click(screen.getAllByTitle('Anexar arquivo')[1])
      await user.upload(container.querySelector('input[type="file"]'), new File(['x'], 'cardapio.pdf', { type: 'application/pdf' }))

      expect(await screen.findByText('cardapio.pdf')).toBeInTheDocument()
      expect(api.post.mock.calls[0][0]).toBe('/attachments/company/2')
      expect(botaoFechar('Padaria Central')).toBeInTheDocument()
    })

    it('avisa quando o envio falha', async () => {
      api.post.mockRejectedValue({ response: { data: { detail: 'Arquivo muito grande.' } } })
      const user = userEvent.setup()
      const { container } = render(<Anexos />)
      await screen.findByText('contrato.pdf')

      await user.click(screen.getByText('clique para anexar'))
      await user.upload(container.querySelector('input[type="file"]'), new File(['x'], 'grande.pdf', { type: 'application/pdf' }))

      await vi.waitFor(() => expect(window.alert).toHaveBeenCalledWith('Arquivo muito grande.'))
      expect(screen.queryByText('grande.pdf')).not.toBeInTheDocument()
    })
  })

  describe('exclusão', () => {
    it('exclui o anexo depois da confirmação', async () => {
      api.delete.mockResolvedValue({})
      const user = userEvent.setup()
      render(<Anexos />)
      await screen.findByText('contrato.pdf')

      await pedirExclusao(user)
      await confirmarDialogo(user, 'Excluir anexo?')

      expect(api.delete).toHaveBeenCalledWith('/attachments/5')
      await vi.waitFor(() => expect(screen.queryByText('contrato.pdf')).not.toBeInTheDocument())
      expect(screen.queryByRole('heading', { name: 'Excluir anexo?' })).not.toBeInTheDocument()
    })

    it('não exclui quando o usuário cancela', async () => {
      const user = userEvent.setup()
      render(<Anexos />)
      await screen.findByText('contrato.pdf')

      await pedirExclusao(user)
      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(api.delete).not.toHaveBeenCalled()
      expect(screen.getByText('contrato.pdf')).toBeInTheDocument()
    })

    it('fecha o menu de ações com a tecla Esc', async () => {
      const user = userEvent.setup()
      render(<Anexos />)
      await screen.findByText('contrato.pdf')

      await user.click(screen.getByRole('button', { name: 'Mais ações' }))
      expect(screen.getByRole('menu')).toBeInTheDocument()
      await user.keyboard('{Escape}')

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  it('baixa o arquivo com o nome original', async () => {
    const blob = new Blob(['pdf'])
    const respostaPadrao = api.get.getMockImplementation()
    api.get.mockImplementation((url, config) =>
      url === '/attachments/5/download' ? Promise.resolve({ data: blob }) : respostaPadrao(url, config)
    )
    URL.createObjectURL = vi.fn(() => 'blob:teste')
    URL.revokeObjectURL = vi.fn()
    let nomeBaixado
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () { nomeBaixado = this.download })
    const user = userEvent.setup()
    render(<Anexos />)
    await screen.findByText('contrato.pdf')

    await user.click(screen.getByTitle('Baixar'))

    await vi.waitFor(() => expect(nomeBaixado).toBe('contrato.pdf'))
    expect(api.get).toHaveBeenCalledWith('/attachments/5/download', { responseType: 'blob' })
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:teste')
  })
})
