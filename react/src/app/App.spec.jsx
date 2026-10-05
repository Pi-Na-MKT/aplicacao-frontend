import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

// Este teste importa a aplicação inteira. Se algum import entre as pastas
// (app, features, shared, layouts) estiver quebrado, ele falha.
describe('App', () => {
  it('exibe a tela de login quando não há usuário autenticado', async () => {
    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Acesse sua conta' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })
})
