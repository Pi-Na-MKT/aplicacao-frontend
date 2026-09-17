import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

const MAX_VISIBLE = 3

function AssignedAvatars({ users }) {
  const visible = users.slice(0, MAX_VISIBLE)
  const extra   = users.length - MAX_VISIBLE

  return (
    <div className="flex items-center" style={{ direction: 'rtl' }}>
      {extra > 0 && (
        <span
          className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-500 flex-shrink-0"
          style={{ marginLeft: '-6px' }}
        >
          +{extra}
        </span>
      )}
      {[...visible].reverse().map((u, i) => (
        u.avatarUrl
          ? <img
              key={u.id}
              src={u.avatarUrl}
              title={u.name}
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm object-cover flex-shrink-0"
              style={{ marginLeft: i < visible.length - 1 || extra > 0 ? '-6px' : 0 }}
              alt=""
            />
          : <div
              key={u.id}
              title={u.name}
              className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center flex-shrink-0"
              style={{ marginLeft: i < visible.length - 1 || extra > 0 ? '-6px' : 0 }}
            >
              <svg className="w-3.5 h-3.5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
      ))}
    </div>
  )
}

const PRIORIDADE = {
  high:   { label: 'Alta',   dot: 'bg-red-400',    pill: 'bg-red-50   text-red-600   ring-1 ring-red-100'    },
  medium: { label: 'Média',  dot: 'bg-amber-400',  pill: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100'  },
  low:    { label: 'Baixa',  dot: 'bg-emerald-400',pill: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' },
}

export default function TarefaCard({ tarefa, onEdit, onDelete, onToggleComplete, onCalendarEvent }) {
  const [checked,    setChecked]    = useState(tarefa.completed ?? false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [calLoading, setCalLoading] = useState(false)
  const { user } = useAuth()
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN'

  useEffect(() => {
    setChecked(tarefa.completed ?? false)
  }, [tarefa.completed])
  const menuRef = useRef(null)
  const pri = PRIORIDADE[tarefa.prioridade] || PRIORIDADE.low

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <div className={`bg-white rounded-2xl p-4 border transition-all group cursor-pointer card-hover ${
      checked ? 'border-emerald-100 bg-emerald-50/30' : 'border-gray-100 hover:border-primary/20'
    }`}>
      <div className="flex items-start gap-2.5 mb-2">
        <button
          onClick={e => {
            e.stopPropagation()
            const next = !checked
            setChecked(next)
            onToggleComplete?.(tarefa.id, next)
          }}
          className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-primary'
          }`}
        >
          {checked && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
            </svg>
          )}
        </button>

        <h4 className={`font-semibold text-sm leading-snug flex-1 transition-colors ${
          checked ? 'text-gray-400 line-through' : 'text-gray-900'
        }`}>{tarefa.titulo}</h4>

        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-gray-500 p-0.5 rounded"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-6 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1 w-44">
              <button
                onClick={e => { e.stopPropagation(); setMenuOpen(false); onEdit?.(tarefa) }}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Editar
              </button>

              {tarefa.dueDate && isAdmin && (
                <button
                  disabled={!!tarefa.googleCalendarEventId || calLoading}
                  onClick={async e => {
                    e.stopPropagation()
                    setMenuOpen(false)
                    setCalLoading(true)
                    try { await onCalendarEvent?.(tarefa) }
                    finally { setCalLoading(false) }
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 disabled:opacity-50 ${
                    tarefa.googleCalendarEventId
                      ? 'text-emerald-600 cursor-default'
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                  {tarefa.googleCalendarEventId ? 'No Google Calendar' : 'Add ao Google Calendar'}
                </button>
              )}

              <button
                onClick={e => { e.stopPropagation(); setMenuOpen(false); onDelete?.(tarefa) }}
                className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      {!checked && (
        <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2" style={{ marginLeft: '26px' }}>
          {tarefa.descricao}
        </p>
      )}

      <div className="flex items-center justify-between" style={{ marginLeft: '26px' }}>
        <div className="flex items-center gap-1.5">
          <span className={`badge text-[10px] ${pri.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1 ${pri.dot}`}/>
            {pri.label}
          </span>
          <span className="badge text-[10px] bg-gray-50 text-gray-500 ring-1 ring-gray-100">
            <svg className="w-2.5 h-2.5 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {tarefa.horas}
          </span>
        </div>

        {tarefa.assignedUsers?.length > 0 && (
          <AssignedAvatars users={tarefa.assignedUsers} />
        )}
      </div>
    </div>
  )
}
