import React, { useState } from 'react'
import Modal from '../../../shared/components/Modal'
import Spinner from '../../../shared/components/Spinner'
import { useCardForm } from '../hooks/useCardForm'
import UserAvatar from './UserAvatar'

const PRIORITY_OPTIONS = [
  { value: 'HIGH',   label: 'Alta'  },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'LOW',    label: 'Baixa' },
]

export default function CardModal({ columnId, initialCard, position, registeredUsers, onClose, onSaved }) {
  const { isEdit, form, set, assignedIds, toggleUser, loading, error, setError, handleSubmit } =
    useCardForm({ columnId, initialCard, position, onSaved })
  const [userSearch, setUserSearch] = useState('')

  const filteredUsers = registeredUsers.filter(u =>
    !userSearch || (u.nome || u.name || '').toLowerCase().includes(userSearch.toLowerCase())
  )

  return (
    <Modal onClose={onClose}>
      <Modal.Header title={isEdit ? 'Editar card' : 'Novo card'} onClose={onClose} />
      <Modal.Body>
        <div>
          <label className="section-title block mb-1.5">Título <span className="text-red-400">*</span></label>
          <input
            autoFocus
            value={form.title}
            onChange={e => { set('title', e.target.value); setError('') }}
            placeholder="Ex.: Criar post para o Instagram"
            className="input-base"
          />
        </div>

        <div>
          <label className="section-title block mb-1.5">Descrição</label>
          <textarea
            value={form.desc}
            onChange={e => set('desc', e.target.value)}
            placeholder="Detalhes sobre a tarefa..."
            rows={2}
            className="input-base resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="section-title block mb-1.5">Prioridade</label>
            <select value={form.priority} onChange={e => set('priority', e.target.value)} className="input-base appearance-none">
              {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="section-title block mb-1.5">Prazo</label>
            <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} className="input-base"/>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="section-title">Responsáveis</label>
            {assignedIds.size > 0 && (
              <span className="text-[11px] text-primary font-medium">
                {assignedIds.size} selecionado{assignedIds.size !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {registeredUsers.length === 0 ? (
            <div className="flex items-center gap-2.5 px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl">
              <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <p className="text-xs text-gray-400">Adicione membros ao board para atribuir responsáveis.</p>
            </div>
          ) : (
            <>
              {registeredUsers.length > 5 && (
                <div className="relative mb-2">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  <input
                    type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)}
                    placeholder="Buscar usuário..." className="input-base pl-9 py-1.5 text-xs"
                  />
                </div>
              )}

              <div className="border border-gray-100 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-3">Nenhum usuário encontrado</p>
                ) : filteredUsers.map(u => {
                  const id       = Number(u.id)
                  const selected = assignedIds.has(id)
                  return (
                    <button key={id} type="button" onClick={() => toggleUser(id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-gray-50 ${selected ? 'bg-primary/5' : ''}`}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                        {selected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                          </svg>
                        )}
                      </div>
                      <UserAvatar user={u}/>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{u.nome || u.name}</p>
                        {(u.cargo || u.jobTitle) && (
                          <p className="text-[10px] text-gray-400 truncate">{u.cargo || u.jobTitle}</p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
            </svg>
          )}
          {loading ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar card'}
        </button>
      </Modal.Footer>
    </Modal>
  )
}
