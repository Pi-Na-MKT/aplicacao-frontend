import React, { useRef } from 'react'
import { createPortal } from 'react-dom'
import Spinner from '../../../shared/components/Spinner'
import AvatarNeutro from '../../../shared/components/AvatarNeutro'
import { useAuth } from '../../../app/providers/AuthContext'
import { useEditarUsuario } from '../hooks/useEditarUsuario'
import AcessoEmpresas from './AcessoEmpresas'

const ROLE_LABELS = { ADMIN: 'Administrador', MANAGER: 'Gestor', USER: 'Usuário' }

export default function ModalEditar({ usuarioId, usuarioInicial, isAdmin, onSalvar, onFechar }) {
  const { companies } = useAuth()
  const fileRef = useRef(null)
  const { loadingData, preview, form, set, setAvatar, boardsMap, companyIds, savingCo, handleToggleCompany } = useEditarUsuario(usuarioId, usuarioInicial)

  return createPortal(
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in flex flex-col max-h-[90vh] overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-bold text-gray-900">Editar usuário</h3>
          <button onClick={onFechar} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0 px-6 py-5">
          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <Spinner/>
            </div>
          ) : (
            <div className="flex flex-col gap-4">

              <div className="flex items-center gap-4">
                <div className="relative cursor-pointer group flex-shrink-0" onClick={() => fileRef.current?.click()}>
                  {preview
                    ? <img src={preview} className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" alt=""/>
                    : <AvatarNeutro className="w-16 h-16"/>}
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{form.nome || '—'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{ROLE_LABELS[form.role] || form.role || '—'}</p>
                  <p className="text-xs text-gray-400">{form.email}</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) { const r = new FileReader(); r.onload = ev => setAvatar(ev.target.result); r.readAsDataURL(f) }
                  }}/>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="section-title mb-0.5">E-mail</p>
                  <p className="text-sm text-gray-700 truncate">{form.email || '—'}</p>
                </div>
                <div>
                  <p className="section-title mb-0.5">Perfil de acesso</p>
                  <p className="text-sm text-gray-700">{ROLE_LABELS[form.role] || form.role || '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="section-title block mb-1.5">Nome completo</label>
                  <input value={form.nome} onChange={e => set('nome', e.target.value)} className="input-base" placeholder="Nome"/>
                </div>
                <div className="col-span-2">
                  <label className="section-title block mb-1.5">Cargo / Função</label>
                  <input value={form.cargo} onChange={e => set('cargo', e.target.value)} className="input-base" placeholder="—"/>
                </div>
                <div>
                  <label className="section-title block mb-1.5">Telefone</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)} className="input-base" placeholder="—"/>
                </div>
                <div>
                  <label className="section-title block mb-1.5">Senioridade</label>
                  <select value={form.seniority} onChange={e => set('seniority', e.target.value)} className="input-base appearance-none">
                    <option value="">—</option>
                    <option value="junior">Júnior</option>
                    <option value="pleno">Pleno</option>
                    <option value="senior">Sênior</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="section-title block mb-1.5">Responsabilidades</label>
                  <input value={form.responsibility} onChange={e => set('responsibility', e.target.value)} className="input-base" placeholder="Ex.: Gerenciar tarefas, revisar entregas..."/>
                </div>
                <div className="col-span-2">
                  <label className="section-title block mb-1.5">Bio</label>
                  <textarea value={form.bio} onChange={e => set('bio', e.target.value)}
                    rows={2} className="input-base resize-none" placeholder="Breve descrição profissional..."/>
                </div>
                <div className="col-span-2">
                  <label className="section-title block mb-1.5">LinkedIn</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">linkedin.com/in/</span>
                    <input value={form.linkedin} onChange={e => set('linkedin', e.target.value)}
                      className="input-base pl-[120px]" placeholder="seu-perfil"/>
                  </div>
                </div>
              </div>

              {isAdmin && companies.length > 0 && (
                <AcessoEmpresas
                  companies={companies}
                  boardsMap={boardsMap}
                  companyIds={companyIds}
                  savingCo={savingCo}
                  onToggle={handleToggleCompany}
                />
              )}

            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onFechar} className="btn-ghost flex-1 justify-center">Cancelar</button>
          <button disabled={loadingData}
            onClick={() => onSalvar({ id: usuarioId, ...form })}
            className="btn-primary flex-1 justify-center disabled:opacity-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
            </svg>
            Salvar perfil
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
