import React from 'react'
import Spinner from '../../../shared/components/Spinner'
import AnexoItem from './AnexoItem'

// Conteúdo de uma empresa aberta: área para enviar arquivos e a lista dos anexos.
export default function EmpresaPanel({ empresa, lista, enviando, isDrag, setDragOverId, onUpload, onPickFiles, onDelete, onDownload }) {
  return (
    <div className="flex flex-col gap-5 px-4 pb-6 pt-4 sm:px-6">
      <button
        type="button"
        onClick={() => onPickFiles(empresa.id)}
        onDragOver={e => { e.preventDefault(); setDragOverId(empresa.id) }}
        onDragLeave={() => setDragOverId(null)}
        onDrop={e => { e.preventDefault(); setDragOverId(null); onUpload(empresa.id, e.dataTransfer.files) }}
        className={`flex w-full items-center gap-5 rounded-xl border-2 border-dashed px-5 py-4 text-left transition duration-base ease-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40 ${
          isDrag ? 'border-pina-secondary bg-pina-secondary/5' : 'border-pina-border hover:border-pina-secondary/50 hover:bg-pina-secondary/[0.03]'
        }`}
      >
        {enviando ? (
          <>
            <Spinner size="sm" className="text-pina-secondary"/>
            <span className="text-sm font-medium text-pina-secondary">Enviando arquivos...</span>
          </>
        ) : (
          <>
            <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border transition duration-base ease-base ${
              isDrag ? 'border-pina-secondary bg-pina-secondary text-white' : 'border-pina-border bg-pina-surface text-pina-secondary'
            }`}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] text-pina-text-light">
                Arraste ou <span className="font-medium text-pina-secondary">clique para anexar</span>
              </span>
              <span className="mt-0.5 block text-[13px] text-pina-text-light">PDF, imagens, DOC, XLSX</span>
            </span>
          </>
        )}
      </button>

      {lista.length === 0 ? (
        <p className="py-4 text-center text-sm text-pina-text-light">Nenhum arquivo anexado ainda</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {lista.map(a => (
            <AnexoItem
              key={a.id}
              anexo={a}
              onDownload={onDownload}
              onDelete={(anexoId) => onDelete(empresa.id, anexoId)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
