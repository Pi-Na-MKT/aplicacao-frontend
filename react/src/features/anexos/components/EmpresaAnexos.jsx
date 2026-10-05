import React from 'react'
import EmpresaPanel from './EmpresaPanel'

// Card de uma empresa: cabeçalho que abre e fecha, e o painel com os anexos.
export default function EmpresaAnexos({ empresa, lista, isOpen, onToggle, enviando, isDrag, setDragOverId, onUpload, onPickFiles, onDelete, onDownload }) {
  const count = lista.length

  return (
    <section className="rounded-card border border-pina-border bg-pina-surface shadow-card">
      <div className="relative flex items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6">

        {/* Botão invisível que cobre o cabeçalho inteiro e abre ou fecha a empresa.
            O botão de anexar fica por cima dele (z-10). */}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-label={`${isOpen ? 'Fechar' : 'Abrir'} anexos de ${empresa.nome}`}
          className="absolute inset-0 rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pina-secondary/50"
        />

        <span className={`${empresa.cor} flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white`}>
          {empresa.inicial}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[17px] font-semibold text-pina-primary">{empresa.nome}</p>
          <p className="mt-0.5 text-sm text-pina-text-light">
            {count === 0 ? 'Nenhum arquivo' : `${count} arquivo${count !== 1 ? 's' : ''}`}
          </p>
        </div>

        {count > 0 && (
          <span className="flex h-7 min-w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-pina-secondary/10 px-2.5 text-sm font-semibold text-pina-secondary">
            {count}
          </span>
        )}

        <button
          type="button"
          onClick={() => onPickFiles(empresa.id)}
          title="Anexar arquivo"
          className="relative z-10 flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-xl border border-pina-border bg-pina-surface text-pina-text-light transition duration-base ease-base hover:border-pina-secondary/40 hover:bg-pina-secondary/5 hover:text-pina-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"/>
          </svg>
        </button>

        <svg className={`h-5 w-5 flex-shrink-0 text-pina-text transition-transform duration-base ease-base ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>

      {isOpen && (
        <div className="border-t border-pina-border">
          <EmpresaPanel
            empresa={empresa}
            lista={lista}
            enviando={enviando}
            isDrag={isDrag}
            setDragOverId={setDragOverId}
            onUpload={onUpload}
            onPickFiles={onPickFiles}
            onDelete={onDelete}
            onDownload={onDownload}
          />
        </div>
      )}
    </section>
  )
}
