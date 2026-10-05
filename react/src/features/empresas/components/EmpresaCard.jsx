import React, { useState } from 'react'
import { useAuth } from '../../../app/providers/AuthContext'
import { linkCompanyCalendar } from '../services/empresaService'

function textoBoards(boardCount) {
  if (boardCount == null) return '—'
  return `${boardCount} board${boardCount !== 1 ? 's' : ''}`
}

export default function EmpresaCard({ empresa, boardCount, onClick, onCalendarLinked }) {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN'

  const linked = !!empresa.googleCalendarId

  const handleCalendar = async () => {
    if (linked || loading) return
    setLoading(true)
    try {
      const data = await linkCompanyCalendar(empresa.id)
      onCalendarLinked?.(data)
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao vincular Google Calendar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="group relative flex h-full min-h-[134px] items-center gap-3.5 rounded-card border border-pina-border bg-pina-surface p-5 shadow-card transition duration-base ease-base hover:shadow-card-hover focus-within:shadow-card-hover">

      {/* Botão invisível que cobre o card inteiro e abre a empresa. O botão do
          calendário fica por cima dele (z-10), então os dois cliques não se misturam. */}
      <button
        type="button"
        onClick={() => onClick(empresa)}
        aria-label={`Abrir ${empresa.nome}`}
        className="absolute inset-0 rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/50"
      />

      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
        <span className={`${empresa.cor} flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold text-white`}>
          {empresa.inicial}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 break-words text-[17px] font-semibold leading-snug text-pina-primary" title={empresa.nome}>{empresa.nome}</h3>
        <p className="mt-1 text-[15px] text-pina-text-light">{textoBoards(boardCount)}</p>
      </div>

      {isAdmin && (
        <button
          type="button"
          onClick={handleCalendar}
          disabled={linked || loading}
          title={linked ? 'Calendário vinculado ao Google Calendar' : 'Criar calendário no Google Calendar'}
          className={`relative z-10 -mr-1.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition duration-base ease-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/50 ${
            linked
              ? 'cursor-default bg-pina-success/10 text-pina-success'
              : 'bg-slate-100 text-pina-text-light hover:bg-pina-secondary/10 hover:text-pina-secondary'
          }`}
        >
          {loading ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          )}
        </button>
      )}

      <svg className="h-4 w-4 flex-shrink-0 text-pina-text transition duration-base ease-base group-hover:text-pina-secondary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
      </svg>
    </div>
  )
}
