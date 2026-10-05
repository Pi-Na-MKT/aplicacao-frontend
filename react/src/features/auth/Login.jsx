import React, { useState } from 'react'
import Spinner from '../../shared/components/Spinner'
import LoginBranding from './components/LoginBranding'
import PinaLogo from '../../shared/components/PinaLogo'
import { useLoginForm } from './hooks/useLoginForm'

const labelClass = 'mb-2 block text-[11px] font-semibold uppercase tracking-wider text-pina-text'

const inputClass =
  'h-12 w-full rounded-input border border-pina-border bg-pina-surface pl-12 text-sm text-pina-primary ' +
  'placeholder:text-pina-text-light/70 outline-none transition duration-base ease-base ' +
  'focus:border-pina-secondary focus:ring-2 focus:ring-pina-secondary/20'

const linkClass =
  'font-semibold text-pina-secondary rounded transition duration-base ease-base hover:underline ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40'

// Ícone posicionado dentro do campo, à esquerda.
function FieldIcon({ d }) {
  return (
    <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-pina-primary"
      fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

const ICON_MAIL = 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75-9.75-6.75'
const ICON_LOCK = 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25zM12 15v2.25'
const ICON_EYE = 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z'
const ICON_EYE_OFF = 'M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88'

export default function Login({ onGoToRegister }) {
  const { email, setEmail, senha, setSenha, erro, loading, handleSubmit } = useLoginForm()
  const [showPass, setShowPass] = useState(false)

  return (
    <div className="flex min-h-screen w-full bg-pina-background font-poppins">
      <LoginBranding />

      <main className="relative flex min-h-screen flex-1 flex-col items-center px-4 py-8">

        {/* Formas decorativas do fundo. O recorte (overflow-hidden) fica aqui, e não no
            <main>, para não criar uma área de rolagem escondida em volta do formulário. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-32 h-72 w-72 rounded-full bg-pina-secondary/5" />
          <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-pina-secondary/5" />
        </div>

        <div className="relative my-auto w-full max-w-[476px] animate-fade-up rounded-card border border-pina-border bg-pina-surface px-6 py-8 shadow-card sm:px-9 sm:py-10">
          <PinaLogo className="justify-center" />

          <h1 className="mt-6 text-center text-2xl font-bold text-pina-primary">Acesse sua conta</h1>
          <p className="mt-1.5 text-center text-sm text-pina-text-light">Entre com suas credenciais para continuar</p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <div>
              <label htmlFor="login-email" className={labelClass}>E-mail</label>
              <div className="relative">
                <FieldIcon d={ICON_MAIL} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className={`${inputClass} pr-4`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-senha" className={labelClass}>Senha</label>
              <div className="relative">
                <FieldIcon d={ICON_LOCK} />
                <input
                  id="login-senha"
                  type={showPass ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-pina-secondary transition duration-base ease-base hover:bg-pina-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={showPass ? ICON_EYE_OFF : ICON_EYE} />
                  </svg>
                </button>
              </div>
              {/* <div className="mt-2 flex justify-end">
                <button type="button" className={`text-xs ${linkClass}`}>Esqueceu a senha?</button>
              </div> */}
            </div>

            {erro && (
              <div role="alert" className="flex items-center gap-2.5 rounded-input border border-pina-danger/20 bg-pina-danger/5 px-3.5 py-2.5 text-[13px] text-pina-danger">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-button bg-pina-secondary text-sm font-semibold text-white transition duration-base ease-base hover:brightness-95 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none disabled:hover:brightness-100"
            >
              {loading && <Spinner size="sm" className="text-white" />}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {onGoToRegister && (
            <div className="mt-8 flex items-center gap-4">
              <span className="h-px flex-1 bg-pina-border" />
              <p className="text-[13px] text-pina-text-light">
                Não tem uma conta?{' '}
                <button type="button" onClick={onGoToRegister} className={linkClass}>Criar conta</button>
              </p>
              <span className="h-px flex-1 bg-pina-border" />
            </div>
          )}
        </div>

        <p className="relative mt-8 text-center text-[11px] text-pina-text-light">
          © {new Date().getFullYear()} PINA. Todos os direitos reservados.
        </p>
      </main>
    </div>
  )
}
