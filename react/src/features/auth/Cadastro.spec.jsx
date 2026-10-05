import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Cadastro from './Cadastro'
import api from '../../shared/services/api'

// Substitui o cliente HTTP: os testes verificam o que seria enviado ao backend,
// sem depender de como a tela está organizada por dentro.
vi.mock('../../shared/services/api', () => ({
  default: { post: vi.fn() },
}))

const campo = (placeholder) => screen.getByPlaceholderText(placeholder)
const camposSenha = () => screen.getAllByPlaceholderText('••••••')
const clicar = (user, nome) => user.click(screen.getByRole('button', { name: nome }))

async function preencherEtapaConta(user, { nome = 'Ana Souza', email = 'ana@empresa.com', senha = 'senha123', confirmar = senha } = {}) {
  if (nome) await user.type(campo('Ex.: Lucas Ferreira'), nome)
  if (email) await user.type(campo('lucas@empresa.com'), email)
  if (senha) await user.type(camposSenha()[0], senha)
  if (confirmar) await user.type(camposSenha()[1], confirmar)
}

async function irParaEtapaPerfil(user) {
  await preencherEtapaConta(user)
  await clicar(user, 'Continuar')
  await screen.findByRole('heading', { name: 'Perfil' })
}

async function irParaEtapaDetalhes(user, cargo = 'Analista') {
  await irParaEtapaPerfil(user)
  await user.type(campo('Ex.: Analista de Projetos'), cargo)
  await clicar(user, 'Continuar')
  await screen.findByRole('heading', { name: 'Detalhes' })
}

describe('Cadastro', () => {
  beforeEach(() => {
    api.post.mockReset()
  })

  it('começa na etapa "Conta"', () => {
    render(<Cadastro />)

    expect(screen.getByRole('heading', { name: 'Conta' })).toBeInTheDocument()
    expect(screen.getByText('Etapa 1 de 3')).toBeInTheDocument()
  })

  describe('validação da etapa "Conta"', () => {
    it('exige nome, e-mail, senha e confirmação', async () => {
      const user = userEvent.setup()
      render(<Cadastro />)

      await clicar(user, 'Continuar')

      expect(screen.getByText('Nome é obrigatório.')).toBeInTheDocument()
      expect(screen.getByText('E-mail é obrigatório.')).toBeInTheDocument()
      expect(screen.getByText('Senha é obrigatória.')).toBeInTheDocument()
      expect(screen.getByText('Confirme a senha.')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Conta' })).toBeInTheDocument()
    })

    it('valida o formato dos dados informados', async () => {
      const user = userEvent.setup()
      render(<Cadastro />)

      await preencherEtapaConta(user, { nome: 'Ana', email: 'ana@empresa', senha: '123', confirmar: '321' })
      await clicar(user, 'Continuar')

      expect(screen.getByText('Informe nome e sobrenome.')).toBeInTheDocument()
      expect(screen.getByText('E-mail inválido.')).toBeInTheDocument()
      expect(screen.getByText('Mínimo 6 caracteres.')).toBeInTheDocument()
      expect(screen.getByText('Senhas não coincidem.')).toBeInTheDocument()
    })

    it('remove o erro do campo quando o usuário volta a digitar', async () => {
      const user = userEvent.setup()
      render(<Cadastro />)

      await clicar(user, 'Continuar')
      await user.type(campo('Ex.: Lucas Ferreira'), 'A')

      expect(screen.queryByText('Nome é obrigatório.')).not.toBeInTheDocument()
      expect(screen.getByText('E-mail é obrigatório.')).toBeInTheDocument()
    })
  })

  it('indica a força da senha digitada', async () => {
    const user = userEvent.setup()
    render(<Cadastro />)

    await user.type(camposSenha()[0], 'Senha@123')

    expect(screen.getByText('Forte')).toBeInTheDocument()
  })

  it('avança para a etapa "Perfil" quando os dados da conta são válidos', async () => {
    const user = userEvent.setup()
    render(<Cadastro />)

    await irParaEtapaPerfil(user)

    expect(screen.getByText('Etapa 2 de 3')).toBeInTheDocument()
  })

  it('exige o cargo na etapa "Perfil"', async () => {
    const user = userEvent.setup()
    render(<Cadastro />)

    await irParaEtapaPerfil(user)
    await clicar(user, 'Continuar')

    expect(screen.getByText('Cargo é obrigatório.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Perfil' })).toBeInTheDocument()
  })

  it('volta para a etapa anterior mantendo os dados preenchidos', async () => {
    const user = userEvent.setup()
    render(<Cadastro />)

    await irParaEtapaPerfil(user)
    await clicar(user, 'Voltar')

    expect(await screen.findByRole('heading', { name: 'Conta' })).toBeInTheDocument()
    expect(campo('Ex.: Lucas Ferreira')).toHaveValue('Ana Souza')
    expect(campo('lucas@empresa.com')).toHaveValue('ana@empresa.com')
  })

  describe('envio do cadastro', () => {
    it('envia os dados obrigatórios e nulo nos campos opcionais vazios', async () => {
      api.post.mockResolvedValue({ data: { id: 1, name: 'Ana Souza', email: 'ana@empresa.com', jobTitle: 'Analista' } })
      const user = userEvent.setup()
      render(<Cadastro />)

      await irParaEtapaDetalhes(user)
      await clicar(user, 'Criar conta')

      expect(api.post).toHaveBeenCalledWith('/users/register', {
        name: 'Ana Souza',
        email: 'ana@empresa.com',
        password: 'senha123',
        phone: null,
        jobTitle: 'Analista',
        seniority: null,
        responsibility: null,
        bio: null,
        linkedin: null,
      })
    })

    it('envia os campos opcionais preenchidos', async () => {
      api.post.mockResolvedValue({ data: { id: 1, name: 'Ana Souza' } })
      const user = userEvent.setup()
      render(<Cadastro />)

      await preencherEtapaConta(user)
      await user.type(campo('(11) 99999-9999'), '11988887777')
      await clicar(user, 'Continuar')
      await screen.findByRole('heading', { name: 'Perfil' })
      await user.type(campo('Ex.: Analista de Projetos'), 'Analista')
      await clicar(user, /Pleno/)
      await clicar(user, 'Continuar')
      await screen.findByRole('heading', { name: 'Detalhes' })
      await clicar(user, 'Design')
      await clicar(user, 'Vendas')
      await user.type(campo('Conte um pouco sobre sua trajetória...'), 'Cinco anos de experiência.')
      await user.type(campo('seu-perfil'), 'ana-souza')
      await clicar(user, 'Criar conta')

      expect(api.post).toHaveBeenCalledWith('/users/register', expect.objectContaining({
        phone: '11988887777',
        seniority: 'pleno',
        responsibility: 'Design, Vendas',
        bio: 'Cinco anos de experiência.',
        linkedin: 'ana-souza',
      }))
    })

    it('mostra a confirmação com os dados do usuário criado', async () => {
      api.post.mockResolvedValue({ data: { id: 1, name: 'Ana Souza', email: 'ana@empresa.com', jobTitle: 'Analista' } })
      const user = userEvent.setup()
      render(<Cadastro />)

      await irParaEtapaDetalhes(user)
      await clicar(user, 'Criar conta')

      expect(await screen.findByRole('heading', { name: 'Conta criada!' })).toBeInTheDocument()
      expect(screen.getByText('Ana Souza')).toBeInTheDocument()
      expect(screen.getByText('ana@empresa.com')).toBeInTheDocument()
      expect(screen.getByText('Analista')).toBeInTheDocument()
    })

    it('mostra a mensagem de erro retornada pela API', async () => {
      api.post.mockRejectedValue({ response: { data: { detail: 'E-mail já cadastrado.' } } })
      const user = userEvent.setup()
      render(<Cadastro />)

      await irParaEtapaDetalhes(user)
      await clicar(user, 'Criar conta')

      expect(await screen.findByText('E-mail já cadastrado.')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Detalhes' })).toBeInTheDocument()
    })

    it('mostra uma mensagem padrão quando a API não informa o motivo do erro', async () => {
      api.post.mockRejectedValue(new Error('Network Error'))
      const user = userEvent.setup()
      render(<Cadastro />)

      await irParaEtapaDetalhes(user)
      await clicar(user, 'Criar conta')

      expect(await screen.findByText('Erro ao cadastrar. Tente novamente.')).toBeInTheDocument()
    })

    it('"Cadastrar outro" volta para a primeira etapa com o formulário limpo', async () => {
      api.post.mockResolvedValue({ data: { id: 1, name: 'Ana Souza' } })
      const user = userEvent.setup()
      render(<Cadastro />)

      await irParaEtapaDetalhes(user)
      await clicar(user, 'Criar conta')
      await screen.findByRole('heading', { name: 'Conta criada!' })
      await clicar(user, 'Cadastrar outro')

      expect(screen.getByRole('heading', { name: 'Conta' })).toBeInTheDocument()
      expect(campo('Ex.: Lucas Ferreira')).toHaveValue('')
    })
  })

  describe('navegação para fora do cadastro', () => {
    it('chama onGoToLogin ao clicar em "Fazer login"', async () => {
      const onGoToLogin = vi.fn()
      const user = userEvent.setup()
      render(<Cadastro onGoToLogin={onGoToLogin} />)

      await clicar(user, 'Fazer login')

      expect(onGoToLogin).toHaveBeenCalledTimes(1)
    })

    it('chama onGoToLogin ao clicar em "Ir para o login" depois do cadastro', async () => {
      api.post.mockResolvedValue({ data: { id: 1, name: 'Ana Souza' } })
      const onGoToLogin = vi.fn()
      const user = userEvent.setup()
      render(<Cadastro onGoToLogin={onGoToLogin} />)

      await irParaEtapaDetalhes(user)
      await clicar(user, 'Criar conta')
      await screen.findByRole('heading', { name: 'Conta criada!' })
      await clicar(user, 'Ir para o login')

      expect(onGoToLogin).toHaveBeenCalledTimes(1)
    })

    it('usa o texto "Voltar para Usuários" quando aberto de dentro do sistema', () => {
      render(<Cadastro isInternalAccess />)

      expect(screen.getByRole('button', { name: 'Voltar para Usuários' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Fazer login' })).not.toBeInTheDocument()
    })
  })
})
