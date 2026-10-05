import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from './Login'

const loginMock = vi.fn()

vi.mock('../../app/providers/AuthContext', () => ({
  useAuth: () => ({ login: loginMock }),
}))

const campoEmail = () => screen.getByLabelText('E-mail')
const campoSenha = () => screen.getByLabelText('Senha')
const botaoEntrar = () => screen.getByRole('button', { name: 'Entrar' })

async function preencherEEnviar(user, email = 'ana@empresa.com', senha = 'senha123') {
  await user.type(campoEmail(), email)
  await user.type(campoSenha(), senha)
  await user.click(botaoEntrar())
}

describe('Login', () => {
  beforeEach(() => {
    loginMock.mockReset()
  })

  it('exibe o título, os campos e o botão de entrar', () => {
    render(<Login />)

    expect(screen.getByRole('heading', { name: 'Acesse sua conta' })).toBeInTheDocument()
    expect(campoEmail()).toHaveAttribute('type', 'email')
    expect(campoSenha()).toHaveAttribute('type', 'password')
    expect(botaoEntrar()).toBeEnabled()
  })

  it('mostra e oculta a senha digitada', async () => {
    const user = userEvent.setup()
    render(<Login />)

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }))
    expect(campoSenha()).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: 'Ocultar senha' }))
    expect(campoSenha()).toHaveAttribute('type', 'password')
  })

  it('avisa quando os campos estão vazios e não chama o login', async () => {
    const user = userEvent.setup()
    render(<Login />)

    await user.click(botaoEntrar())

    expect(screen.getByRole('alert')).toHaveTextContent('Preencha e-mail e senha.')
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('envia o e-mail e a senha digitados', async () => {
    loginMock.mockResolvedValue({})
    const user = userEvent.setup()
    render(<Login />)

    await preencherEEnviar(user, 'ana@empresa.com', 'senha123')

    expect(loginMock).toHaveBeenCalledWith('ana@empresa.com', 'senha123')
  })

  it('mostra o estado de carregamento enquanto o login está em andamento', async () => {
    let concluirLogin
    loginMock.mockReturnValue(new Promise(resolve => { concluirLogin = resolve }))
    const user = userEvent.setup()
    render(<Login />)

    await preencherEEnviar(user)

    const botao = screen.getByRole('button', { name: 'Entrando...' })
    expect(botao).toBeDisabled()

    concluirLogin({})
    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeEnabled()
  })

  it('mostra a mensagem de erro retornada pela API', async () => {
    loginMock.mockRejectedValue({ response: { status: 401, data: { detail: 'Senha incorreta.' } } })
    const user = userEvent.setup()
    render(<Login />)

    await preencherEEnviar(user)

    expect(await screen.findByRole('alert')).toHaveTextContent('Senha incorreta.')
  })

  it('mostra uma mensagem padrão quando a API não informa o motivo do erro', async () => {
    loginMock.mockRejectedValue(new Error('Network Error'))
    const user = userEvent.setup()
    render(<Login />)

    await preencherEEnviar(user)

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.')
  })

  it('informa o tempo restante quando a conta está bloqueada (status 423)', async () => {
    loginMock.mockRejectedValue({ response: { status: 423, data: { minutes_remaining: 15 } } })
    const user = userEvent.setup()
    render(<Login />)

    await preencherEEnviar(user)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Conta bloqueada por excesso de tentativas. Tente novamente em 15 minuto(s).'
    )
  })

  it('chama onGoToRegister ao clicar em "Criar conta"', async () => {
    const onGoToRegister = vi.fn()
    const user = userEvent.setup()
    render(<Login onGoToRegister={onGoToRegister} />)

    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(onGoToRegister).toHaveBeenCalledTimes(1)
  })

  it('não exibe o link "Criar conta" quando onGoToRegister não é informado', () => {
    render(<Login />)

    expect(screen.queryByRole('button', { name: 'Criar conta' })).not.toBeInTheDocument()
  })
})
