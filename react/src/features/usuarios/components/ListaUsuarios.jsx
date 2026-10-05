import React from 'react'
import UserAvatar from './UserAvatar'

// Mesmas colunas no cabeçalho e nas linhas: usuário, cargo e ações.
// No celular o cargo fica oculto e sobram duas colunas: usuário e ações.
const COLUNAS = 'grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[1fr_1.08fr_120px]'

const botaoAcao =
  'flex h-10 w-10 items-center justify-center rounded-[10px] border border-pina-border bg-pina-surface text-pina-text ' +
  'transition duration-base ease-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40'

export default function ListaUsuarios({ usuarios, isAdmin, isOwnRow, onEditar, onExcluir }) {
  return (
    <div className="overflow-hidden rounded-card border border-pina-border bg-pina-surface shadow-card">
      <div className={`hidden gap-4 border-b border-pina-border bg-pina-background px-6 py-4 md:grid ${COLUNAS}`}>
        {['Usuário', 'Cargo', 'Ações'].map(h => (
          <span key={h} className="text-[13px] font-semibold uppercase tracking-wider text-pina-text-light">{h}</span>
        ))}
      </div>

      <ul className="divide-y divide-pina-border">
        {usuarios.map((u, i) => (
          <li key={u.id || i}
            className={`grid animate-fade-up items-center gap-4 px-6 py-2.5 transition duration-base ease-base hover:bg-pina-background ${COLUNAS}`}
            style={{ animationDelay: `${i * 30}ms` }}>

            <div className="flex min-w-0 items-center gap-5">
              <UserAvatar user={u} className="h-12 w-12"/>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-pina-primary">{u.nome || u.name}</p>
                {isOwnRow(u) && (
                  <span className="mt-0.5 inline-block rounded-full bg-pina-secondary/10 px-2 py-0.5 text-[11px] font-medium text-pina-secondary">Você</span>
                )}
              </div>
            </div>

            <div className="hidden md:block">
              <p className="truncate text-base text-pina-text-light">{u.cargo || u.jobTitle || '—'}</p>
            </div>

            <div className="flex items-center gap-4">
              {(isAdmin || isOwnRow(u)) && (
                <button type="button" onClick={() => onEditar(u)} title="Editar"
                  className={`${botaoAcao} hover:border-pina-secondary/40 hover:bg-pina-secondary/5 hover:text-pina-secondary`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
              )}
              {isAdmin && !isOwnRow(u) && (
                <button type="button" onClick={() => onExcluir(u)} title="Excluir"
                  className={`${botaoAcao} hover:border-pina-danger/40 hover:bg-pina-danger/5 hover:text-pina-danger`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
