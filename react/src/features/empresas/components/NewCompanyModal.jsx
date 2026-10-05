import React from 'react'
import Modal from '../../../shared/components/Modal'
import Spinner from '../../../shared/components/Spinner'
import { useNewCompanyForm } from '../hooks/useNewCompanyForm'

export default function NewCompanyModal({ onClose, onCreated }) {
  const { form, slugManual, error, loading, handleName, handleSlug, toggleActive, handleSubmit } = useNewCompanyForm({ onCreated })

  return (
    <Modal onClose={onClose}>
      <Modal.Header title="Nova empresa" onClose={onClose}/>
      <Modal.Body>
        <div>
          <label className="section-title block mb-1.5">Nome da empresa <span className="text-red-400">*</span></label>
          <input autoFocus value={form.nome} onChange={e => handleName(e.target.value)} placeholder="Ex.: Tech Solutions" className="input-base"/>
        </div>

        <div>
          <label className="section-title block mb-1.5">
            Slug (URL)
            {!slugManual && form.nome && (
              <span className="ml-2 text-[10px] font-normal text-primary normal-case">gerado automaticamente</span>
            )}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none select-none">/</span>
            <input value={form.slug} onChange={e => handleSlug(e.target.value)} placeholder="tech-solutions" className="input-base pl-5 font-mono text-sm"/>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Apenas letras minúsculas, números e hifens.</p>
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm font-semibold text-gray-800">Empresa ativa</p>
            <p className="text-xs text-gray-400">Empresa visível para os membros</p>
          </div>
          <button type="button" onClick={toggleActive}
            className={`relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${form.active ? 'bg-primary' : 'bg-gray-200'}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form.active ? 'translate-x-5' : 'translate-x-1'}`}/>
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {error}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancelar</button>
        <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 justify-center disabled:opacity-50">
          {loading ? <Spinner size="sm" className="text-white"/> : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
            </svg>
          )}
          {loading ? 'Criando...' : 'Criar empresa'}
        </button>
      </Modal.Footer>
    </Modal>
  )
}
