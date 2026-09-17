import React, { useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function EmpresaCard({ empresa, onClick, onCalendarLinked }) {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN'

  const linked = !!empresa.googleCalendarId

  const handleCalendar = async (e) => {
    e.stopPropagation()
    if (linked || loading) return
    setLoading(true)
    try {
      const { data } = await api.post(`/companies/${empresa.id}/calendar`)
      onCalendarLinked?.(data)
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao vincular Google Calendar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={() => onClick(empresa)}
      className="bg-white rounded-2xl border border-gray-100 p-6 cursor-pointer group card-hover"
    >
      <div className="flex items-center gap-4">
        <div className={`${empresa.cor} w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm flex-shrink-0`}>
          {empresa.inicial}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base group-hover:text-primary transition-colors truncate">{empresa.nome}</h3>
          <p className="text-sm text-gray-400 mt-0.5">
            {empresa.slug || 'Clique para abrir o board'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleCalendar}
            disabled={linked || loading}
            title={linked ? 'Calendário vinculado ao Google Calendar' : 'Criar calendário no Google Calendar'}
            className={`p-2 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
              linked
                ? 'bg-emerald-50 text-emerald-500 cursor-default'
                : 'bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-500'
            }`}
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            )}
          </button>
        )}

        <svg className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
        </svg>
      </div>
    </div>
  )
}
