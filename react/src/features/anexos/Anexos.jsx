import React, { useState, useRef } from 'react'
import ConfirmDialog from '../../shared/components/ConfirmDialog'
import EmpresaAnexos from './components/EmpresaAnexos'
import { useAnexos } from './hooks/useAnexos'

const ICON_ARQUIVO = 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z'
const ICON_EMPRESA = 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21'

// Aparência de cada resumo do topo da tela.
const RESUMOS = {
  arquivos: { label: 'Arquivos', icon: ICON_ARQUIVO, card: 'border-pina-secondary/15 bg-pina-secondary/5', cor: 'text-pina-secondary' },
  empresas: { label: 'Empresas', icon: ICON_EMPRESA, card: 'border-pina-success/20 bg-pina-success/5',     cor: 'text-emerald-600' },
}

function Resumo({ tipo, valor }) {
  const { label, icon, card, cor } = RESUMOS[tipo]
  return (
    <div className={`flex items-center gap-3 rounded-card border px-5 py-3.5 ${card}`}>
      <svg className={`h-8 w-8 flex-shrink-0 ${cor}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      <div>
        <p className={`text-2xl font-bold leading-none ${cor}`}>{valor}</p>
        <p className={`mt-1.5 text-xs font-medium uppercase tracking-wide ${cor}`}>{label}</p>
      </div>
    </div>
  )
}

// "search" vem da busca da barra superior (ver app/App.jsx).
export default function Anexos({ search = '' }) {
  const {
    empresas, empresasVisiveis, anexos, abertos, uploading, uploadingId,
    toggleEmpresa, abrirEmpresa, handleUpload, handleDelete, handleDownload,
    totalAnexos, empresasComAnexos,
  } = useAnexos(search)

  const [dragOverId, setDragOverId] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  // Um único <input type="file"> atende todas as empresas. A empresa de destino
  // é guardada em dataset.empresa antes de abrir o seletor de arquivos.
  const fileInputRef = useRef(null)

  const escolherArquivos = (empresaId) => {
    fileInputRef.current.dataset.empresa = empresaId
    fileInputRef.current.click()
    abrirEmpresa(empresaId)
  }

  const confirmarExclusao = async () => {
    await handleDelete(confirmDel.empresaId, confirmDel.anexoId)
    setConfirmDel(null)
  }

  return (
    <div className="animate-fade-up px-4 pb-10 pt-8 font-poppins lg:px-11">

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-pina-text-light">Documentos</p>
          <h1 className="text-3xl font-bold text-pina-primary lg:text-4xl">Anexos</h1>
          <p className="mt-1 text-base text-pina-text-light lg:text-lg">Arquivos e documentos organizados por empresa</p>
        </div>
        <div className="flex gap-3">
          <Resumo tipo="arquivos" valor={totalAnexos} />
          <Resumo tipo="empresas" valor={empresasComAnexos} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {empresasVisiveis.map(emp => (
          <EmpresaAnexos
            key={emp.id}
            empresa={emp}
            lista={anexos[emp.id] || []}
            isOpen={!!abertos[emp.id]}
            onToggle={() => toggleEmpresa(emp.id)}
            enviando={uploading && uploadingId === emp.id}
            isDrag={dragOverId === emp.id}
            setDragOverId={setDragOverId}
            onUpload={handleUpload}
            onPickFiles={escolherArquivos}
            onDelete={(empresaId, anexoId) => setConfirmDel({ empresaId, anexoId })}
            onDownload={handleDownload}
          />
        ))}
      </div>

      {empresasVisiveis.length === 0 && (
        <div className="rounded-card border border-pina-border bg-pina-surface p-16 text-center shadow-card">
          <p className="text-sm text-pina-text-light">
            {empresas.length === 0 ? 'Nenhuma empresa cadastrada ainda.' : 'Nenhuma empresa ou arquivo encontrado.'}
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={e => {
          const empId = Number(fileInputRef.current.dataset.empresa)
          handleUpload(empId, e.target.files)
          e.target.value = ''
        }}
      />

      {confirmDel && (
        <ConfirmDialog
          title="Excluir anexo?"
          description={<p className="text-sm text-gray-500">Esta ação não pode ser desfeita.</p>}
          onConfirm={confirmarExclusao}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  )
}
