import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../../app/providers/AuthContext'
import { useClickOutside } from '../../../shared/hooks/useClickOutside'

const MAX_VISIBLE = 3

// Fotos dos responsáveis, sobrepostas. Acima de três, mostra "+N".
function AssignedAvatars({ users }) {
  const visible = users.slice(0, MAX_VISIBLE)
  const extra   = users.length - MAX_VISIBLE

  return (
    <div className="flex items-center">
      {visible.map((u, i) => (
        u.avatarUrl
          ? <img
              key={u.id}
              src={u.avatarUrl}
              title={u.name}
              className={`h-7 w-7 flex-shrink-0 rounded-full border-2 border-pina-surface object-cover ${i > 0 ? '-ml-2' : ''}`}
              alt=""
            />
          : <div
              key={u.id}
              title={u.name}
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 border-pina-surface bg-slate-200 ${i > 0 ? '-ml-2' : ''}`}
            >
              <svg className="h-4 w-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
      ))}
      {extra > 0 && (
        <span className="-ml-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 border-pina-surface bg-slate-200 text-[10px] font-bold text-pina-text">
          +{extra}
        </span>
      )}
    </div>
  )
}

const PRIORIDADES = {
  LOW:      { label: 'Baixa',   classe: 'bg-violet-100 text-violet-700' },
  MEDIUM:   { label: 'Média',   classe: 'bg-amber-100 text-amber-700'   },
  HIGH:     { label: 'Alta',    classe: 'bg-red-100 text-red-600'       },
  CRITICAL: { label: 'Urgente', classe: 'bg-rose-100 text-rose-700'     },
}

const itemDoMenu = 'flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition duration-base ease-base focus-visible:outline-none'

export default function TarefaCard({ tarefa, onEdit, onDelete, onToggleComplete, onCalendarEvent }) {
  const [checked,    setChecked]    = useState(tarefa.completed ?? false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [calLoading, setCalLoading] = useState(false)
  const { user } = useAuth()
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN'
  const menuRef = useRef(null)

  useEffect(() => {
    setChecked(tarefa.completed ?? false)
  }, [tarefa.completed])

  useClickOutside(menuRef, menuOpen, () => setMenuOpen(false))

  const prioridade = PRIORIDADES[tarefa.rawPriority] || PRIORIDADES.MEDIUM
  const temRodape  = tarefa.assignedUsers?.length > 0 || tarefa.dueDate

  return (
    <div className={`cursor-grab rounded-xl border bg-pina-surface p-4 shadow-card transition duration-base ease-base hover:shadow-card-hover active:cursor-grabbing ${
      checked ? 'border-pina-success/40' : 'border-pina-border'
    }`}>

      {/* Nesta ordem: botão de concluir, título e botão do menu. */}
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            const next = !checked
            setChecked(next)
            onToggleComplete?.(tarefa.id, next)
          }}
          aria-pressed={checked}
          aria-label={checked ? 'Reabrir tarefa' : 'Concluir tarefa'}
          className={`mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border-2 transition duration-base ease-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40 ${
            checked ? 'border-pina-success bg-pina-success' : 'border-slate-300 hover:border-pina-secondary'
          }`}
        >
          {checked && (
            <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          )}
        </button>

        <h4 className={`min-w-0 flex-1 break-words text-[15px] font-medium leading-snug ${
          checked ? 'text-pina-text-light line-through' : 'text-pina-primary'
        }`}>{tarefa.titulo}</h4>

        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
            aria-label="Ações do card"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="-mr-1.5 -mt-1 flex h-7 w-7 items-center justify-center rounded-lg text-pina-text-light transition duration-base ease-base hover:bg-slate-100 hover:text-pina-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" />
            </svg>
          </button>

          {menuOpen && (
            <div role="menu" className="absolute right-0 top-7 z-20 w-48 rounded-xl border border-pina-border bg-pina-surface py-1 shadow-card-hover">
              <button
                type="button"
                role="menuitem"
                onClick={e => { e.stopPropagation(); setMenuOpen(false); onEdit?.(tarefa) }}
                className={`${itemDoMenu} text-pina-text hover:bg-slate-50 focus-visible:bg-slate-50`}
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Editar
              </button>

              {tarefa.dueDate && isAdmin && (
                <button
                  type="button"
                  role="menuitem"
                  disabled={!!tarefa.googleCalendarEventId || calLoading}
                  onClick={async e => {
                    e.stopPropagation()
                    setMenuOpen(false)
                    setCalLoading(true)
                    try { await onCalendarEvent?.(tarefa) }
                    finally { setCalLoading(false) }
                  }}
                  className={`${itemDoMenu} disabled:opacity-60 ${
                    tarefa.googleCalendarEventId
                      ? 'cursor-default text-emerald-600'
                      : 'text-pina-secondary hover:bg-pina-secondary/5 focus-visible:bg-pina-secondary/5'
                  }`}
                >
                  <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  {tarefa.googleCalendarEventId ? 'No Google Calendar' : 'Add ao Google Calendar'}
                </button>
              )}

              <button
                type="button"
                role="menuitem"
                onClick={e => { e.stopPropagation(); setMenuOpen(false); onDelete?.(tarefa) }}
                className={`${itemDoMenu} text-pina-danger hover:bg-pina-danger/5 focus-visible:bg-pina-danger/5`}
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2.5 pl-7">
        <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-medium ${prioridade.classe}`}>{prioridade.label}</span>
      </div>

      {temRodape && (
        <div className="mt-3.5 flex items-center gap-3 pl-7">
          {tarefa.assignedUsers?.length > 0 && <AssignedAvatars users={tarefa.assignedUsers} />}
          {tarefa.dueDate && (
            <span className="flex items-center gap-1.5 text-[13px] text-pina-text-light">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {tarefa.horas}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
