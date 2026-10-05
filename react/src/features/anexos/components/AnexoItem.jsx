import React, { useState, useRef } from 'react'
import { useClickOutside } from '../../../shared/hooks/useClickOutside'
import { tipoArquivo, formatBytes, formatDate } from '../utils/arquivo'

// Desenho do ícone conforme o tipo do arquivo.
const ICONES = {
  pdf:   'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  doc:   'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  xls:   'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  other: 'M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13',
}

const botaoAcao =
  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] border border-pina-border bg-pina-surface text-pina-secondary ' +
  'transition duration-base ease-base hover:border-pina-secondary/40 hover:bg-pina-secondary/5 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40'

export default function AnexoItem({ anexo, onDownload, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  useClickOutside(menuRef, menuOpen, () => setMenuOpen(false))

  return (
    <li className="flex items-center gap-4 rounded-xl border border-pina-border bg-pina-background px-4 py-3">
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-pina-border bg-pina-surface text-pina-secondary">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d={ICONES[tipoArquivo(anexo.fileName)]} />
        </svg>
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-pina-primary" title={anexo.fileName}>{anexo.fileName}</p>
        <p className="mt-0.5 truncate text-[13px] text-pina-text-light">
          {formatBytes(anexo.fileSize)} · {formatDate(anexo.createdAt)} · {anexo.uploadedByName || '—'}
        </p>
      </div>

      <button type="button" onClick={() => onDownload(anexo.id, anexo.fileName)} title="Baixar" className={botaoAcao}>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
      </button>

      <div className="relative flex-shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Mais ações"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className={botaoAcao}
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" />
          </svg>
        </button>

        {menuOpen && (
          <div role="menu" className="absolute right-0 top-full z-20 mt-2 w-40 rounded-xl border border-pina-border bg-pina-surface py-1 shadow-card-hover">
            <button
              type="button"
              role="menuitem"
              onClick={() => { setMenuOpen(false); onDelete(anexo.id) }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-pina-danger transition duration-base ease-base hover:bg-pina-danger/5 focus-visible:bg-pina-danger/5 focus-visible:outline-none"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Excluir
            </button>
          </div>
        )}
      </div>
    </li>
  )
}
