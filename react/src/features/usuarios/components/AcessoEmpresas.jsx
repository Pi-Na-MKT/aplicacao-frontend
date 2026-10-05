import React from 'react'

export default function AcessoEmpresas({ companies, boardsMap, companyIds, savingCo, onToggle }) {
  return (
    <div>
      <div className="h-px bg-gray-100 mb-4"/>
      <div className="flex items-center justify-between mb-2">
        <p className="section-title">Acesso a empresas</p>
        <span className="text-[11px] text-gray-400">
          {companyIds.size} de {companies.length}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-3">
        Alterações são aplicadas imediatamente no board da empresa.
      </p>
      <div className="flex flex-col gap-1">
        {companies.map(company => {
          const board    = boardsMap[company.id]
          const active   = companyIds.has(company.id)
          const saving   = savingCo === company.id
          const disabled = !board || saving

          return (
            <label
              key={company.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors select-none ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
              } ${active && !disabled ? 'bg-primary/5' : ''}`}
            >
              <div
                onClick={() => !disabled && onToggle(company.id, !active)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  active ? 'bg-primary border-primary' : 'border-gray-300'
                }`}
              >
                {saving ? (
                  <svg className="w-2.5 h-2.5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : active ? (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                  </svg>
                ) : null}
              </div>

              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${company.cor}`}>
                {company.inicial}
              </span>

              <span className="text-sm text-gray-800 flex-1 truncate">{company.nome}</span>
              {!board ? (
                <span className="text-[10px] text-gray-400 flex-shrink-0">sem board</span>
              ) : active ? (
                <span className="text-[10px] text-emerald-600 font-medium flex-shrink-0">Membro</span>
              ) : null}
            </label>
          )
        })}
      </div>
    </div>
  )
}
