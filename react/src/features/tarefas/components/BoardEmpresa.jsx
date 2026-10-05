import React from 'react'

// Empresa do board aberto e o total de tarefas dela. Aparece na barra superior
// em telas grandes e dentro da página nas menores (ver Tarefas.jsx).
export default function BoardEmpresa({ empresa, totalCards }) {
  return (
    <div className="flex items-center gap-4">
      <span className="flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center rounded-input bg-pina-active text-white">
        <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      </span>
      <div className="min-w-0">
        <p className="max-w-[240px] truncate text-xl font-semibold leading-tight text-pina-primary">{empresa?.nome || empresa?.name}</p>
        <p className="text-sm text-pina-text-light">{totalCards} tarefa{totalCards !== 1 ? 's' : ''} no total</p>
      </div>
    </div>
  )
}
