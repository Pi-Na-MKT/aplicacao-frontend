import React from 'react'
import Spinner from '../../../shared/components/Spinner'

export default function BoardVazio({ canManage, creating, onCreate }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="max-w-xs text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-card bg-pina-secondary/10 text-pina-secondary">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
        <p className="mb-1 text-base font-semibold text-pina-primary">Nenhum board encontrado</p>
        {canManage ? (
          <>
            <p className="mb-5 text-sm text-pina-text-light">Crie o board desta empresa para começar a organizar as tarefas.</p>
            <button
              type="button"
              onClick={onCreate}
              disabled={creating}
              className="mx-auto flex h-11 items-center gap-2 rounded-button bg-pina-secondary px-5 text-sm font-semibold text-white shadow-card transition duration-base ease-base hover:brightness-95 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? <Spinner size="sm" className="text-white"/> : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
              )}
              {creating ? 'Criando...' : 'Criar board'}
            </button>
          </>
        ) : (
          <p className="text-sm text-pina-text-light">Aguarde um administrador criar o board desta empresa.</p>
        )}
      </div>
    </div>
  )
}
