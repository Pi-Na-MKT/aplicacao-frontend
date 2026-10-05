import React from 'react'

// Título da tela e as ações principais. Cada botão só aparece quando recebe a função dele.
export default function BoardHeader({ onDashboard, onNovaTarefa }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-3xl font-bold text-pina-primary">Boards</h1>
        <p className="mt-1 text-base text-pina-text-light">Gerencie suas tarefas e acompanhe o progresso da sua equipe.</p>
      </div>

      <div className="flex flex-shrink-0 items-center gap-3">
        {onDashboard && (
          <button
            type="button"
            onClick={onDashboard}
            className="flex h-11 items-center gap-2 rounded-button border border-pina-border bg-pina-surface px-4 text-sm font-semibold text-pina-text transition duration-base ease-base hover:border-pina-secondary/40 hover:text-pina-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Dashboard
          </button>
        )}
        {onNovaTarefa && (
          <button
            type="button"
            onClick={onNovaTarefa}
            className="flex h-11 items-center gap-2 rounded-button bg-pina-secondary px-5 text-sm font-semibold text-white shadow-card transition duration-base ease-base hover:brightness-95 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40 focus-visible:ring-offset-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Nova tarefa
          </button>
        )}
      </div>
    </div>
  )
}
