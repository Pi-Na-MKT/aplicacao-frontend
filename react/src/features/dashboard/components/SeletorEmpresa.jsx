import React from 'react'

// Seletor da empresa cujos dados o dashboard mostra.
// O <select> de verdade fica invisível por cima do desenho: assim o visual é o do
// protótipo, e o teclado e os leitores de tela continuam funcionando normalmente.
export default function SeletorEmpresa({ companies, filtro, onChange, empresaSelecionada, totalTarefas }) {
  return (
    <div className="relative flex h-[52px] w-full items-center gap-4 rounded-input border border-pina-border bg-pina-surface pr-4 shadow-sm transition duration-base ease-base focus-within:border-pina-secondary focus-within:ring-2 focus-within:ring-pina-secondary/20 lg:w-[328px]">
      <span className="-my-px -ml-px flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-input bg-pina-active text-white">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold leading-tight text-pina-primary">
          {empresaSelecionada ? empresaSelecionada.nome : 'Todas as empresas'}
        </span>
        <span className="block truncate text-xs text-pina-text-light">
          {totalTarefas} tarefa{totalTarefas !== 1 ? 's' : ''} no total
        </span>
      </span>

      <svg className="h-4 w-4 flex-shrink-0 text-pina-text" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>

      <select
        aria-label="Empresa"
        value={filtro}
        onChange={e => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        <option value="">Todas as empresas</option>
        {companies.map(c => (
          <option key={c.id} value={c.id}>{c.nome}</option>
        ))}
      </select>
    </div>
  )
}
