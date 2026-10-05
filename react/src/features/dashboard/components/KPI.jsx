import React from 'react'

const TONS = {
  indigo: 'bg-pina-secondary/10 text-pina-secondary',
  verde:  'bg-pina-success text-white',
}

// Um indicador do topo do dashboard. "children" é a linha de apoio abaixo do número.
export default function KPI({ label, valor, icon, tom = 'indigo', children }) {
  return (
    <li className="flex gap-5 rounded-card border border-pina-border bg-pina-surface p-5 shadow-card">
      <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${TONS[tom]}`}>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-pina-primary">{label}</p>
        <p className="mt-1 text-2xl font-bold leading-tight text-pina-primary">{valor}</p>
        <p className="mt-1 text-xs text-pina-text-light">{children}</p>
      </div>
    </li>
  )
}
