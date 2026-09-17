import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import Spinner from '../components/Spinner'
import AvatarNeutro from '../components/AvatarNeutro'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function UserAvatar({ user, className = 'w-9 h-9' }) {
  const src = user?.avatarUrl || user?.avatar
  if (src) return <img src={src} className={`${className} rounded-full object-cover border-2 border-gray-100 flex-shrink-0`} alt=""/>
  return <AvatarNeutro className={className} />
}

const ROLE_LABELS = { ADMIN: 'Administrador', MANAGER: 'Gestor', USER: 'Usuário' }
const SENIORITY_LABELS = { junior: 'Júnior', pleno: 'Pleno', senior: 'Sênior' }

function ModalEditar({ usuarioId, usuarioInicial, isAdmin, onSalvar, onFechar }) {
  const { companies } = useAuth()
  const fileRef = useRef(null)

  const [loadingData,  setLoadingData]  = useState(true)
  const [preview,      setPreview]      = useState(usuarioInicial?.avatarUrl || '')
  const [boardsMap,    setBoardsMap]    = useState({})
  const [companyIds,   setCompanyIds]   = useState(new Set())
  const [savingCo,     setSavingCo]     = useState(null)

  const [form, setForm] = useState({
    nome: usuarioInicial?.nome || usuarioInicial?.name || '',
    email: '', role: '',
    cargo: usuarioInicial?.cargo || usuarioInicial?.jobTitle || '',
    phone: '', seniority: '', bio: '', responsibility: '', linkedin: '',
    avatarUrl: usuarioInicial?.avatarUrl || '',
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: userData }, { data: boards }] = await Promise.all([
          api.get(`/users/${usuarioId}`),
          api.get('/boards'),
        ])

        setForm({
          nome:           userData.name           || '',
          email:          userData.email          || '',
          role:           userData.role           || '',
          cargo:          userData.jobTitle       || '',
          phone:          userData.phone          || '',
          seniority:      userData.seniority      || '',
          bio:            userData.bio            || '',
          responsibility: userData.responsibility || '',
          linkedin:       userData.linkedin       || '',
          avatarUrl:      userData.avatarUrl      || '',
        })
        setPreview(userData.avatarUrl || '')

        const map = {}
        const usercos = new Set()
        boards.forEach(b => {
          if (!b.companyId) return
          const memberIds = (b.members || []).map(m => Number(m.id))
          map[b.companyId] = { id: b.id, name: b.name, memberIds }
          if (memberIds.includes(Number(usuarioId))) usercos.add(b.companyId)
        })
        setBoardsMap(map)
        setCompanyIds(usercos)
      } catch (err) {
        console.error('Erro ao carregar modal:', err)
      } finally {
        setLoadingData(false)
      }
    }
    load()
  }, [usuarioId])

  const handleToggleCompany = async (companyId, add) => {
    const board = boardsMap[companyId]
    if (!board) return
    setSavingCo(companyId)
    try {
      const newIds = add
        ? [...board.memberIds, Number(usuarioId)]
        : board.memberIds.filter(id => id !== Number(usuarioId))

      await api.put(`/boards/${board.id}`, { userIds: newIds })

      setBoardsMap(prev => ({
        ...prev,
        [companyId]: { ...board, memberIds: newIds },
      }))
      setCompanyIds(prev => {
        const next = new Set(prev)
        add ? next.add(companyId) : next.delete(companyId)
        return next
      })
    } catch (err) {
      console.error('Erro ao alterar empresa:', err)
    } finally {
      setSavingCo(null)
    }
  }

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
                    if (f) { const r = new FileReader(); r.onload = ev => { setPreview(ev.target.result); set('avatarUrl', ev.target.result) }; r.readAsDataURL(f) }
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
                            onClick={() => !disabled && handleToggleCompany(company.id, !active)}
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

export default function Usuarios({ onCadastrarNovo }) {
  const { user: loggedUser, registeredUsers, fetchUsers } = useAuth()
  const [lista,      setLista]      = useState([])
  const [busca,      setBusca]      = useState('')
  const [carregando, setCarregando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [erroDelete, setErroDelete] = useState(null)
  const [excluindo,  setExcluindo]  = useState(false)

  const isAdmin  = loggedUser?.role?.toUpperCase() === 'ADMIN'
  const isOwnRow = (u) => String(u.id) === String(loggedUser?.id)

  useEffect(() => { setCarregando(true); fetchUsers().finally(() => setCarregando(false)) }, [])
  useEffect(() => { setLista(registeredUsers.map(u => ({ ...u }))) }, [registeredUsers])

  const filtrados = lista.filter(u => {
    if (!busca) return true
    const termo = busca.toLowerCase()
    return [(u.nome || u.name), (u.cargo || u.jobTitle)].some(v => v?.toLowerCase().includes(termo))
  })

  const usuarioEditando = editandoId ? lista.find(u => u.id === editandoId) : null

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto animate-fade-up">

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="section-title mb-1">Gestão de pessoas</p>
          <h1 className="page-header">Usuários</h1>
          <p className="page-sub">{lista.length} membro{lista.length !== 1 ? 's' : ''} ativo{lista.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button onClick={onCadastrarNovo} className="btn-primary self-start sm:self-auto">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
            </svg>
            Novo usuário
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-7">
        {[
          { label: 'Total',  v: lista.length, cor: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-100'  },
          { label: 'Ativos', v: lista.length, cor: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        ].map(({ label, v, cor, bg, border }) => (
          <div key={label} className={`${bg} ${border} border rounded-2xl p-4 flex items-center justify-between`}>
            <span className="text-sm font-medium text-gray-600">{label}</span>
            <span className={`text-2xl font-bold ${cor}`}>{v}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 shadow-sm">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome ou cargo..."
            className="input-base pl-10 bg-gray-50 border-gray-200"/>
        </div>
      </div>

      {carregando ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Spinner className="mx-auto mb-3"/>
          <p className="text-gray-400 text-sm">Carregando usuários...</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <AvatarNeutro className="w-12 h-12"/>
          <p className="text-gray-400 text-sm mt-3 font-medium">Nenhum usuário encontrado</p>
          <p className="text-gray-300 text-xs mt-1">Tente ajustar a busca</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_1.4fr_100px] gap-4 px-5 py-3.5 bg-gray-50/80 border-b border-gray-100">
            {['Usuário', 'Cargo', 'Ações'].map(h => (
              <span key={h} className="section-title">{h}</span>
            ))}
          </div>

          <div className="divide-y divide-gray-50">
            {filtrados.map((u, i) => (
              <div key={u.id || i}
                className="grid md:grid-cols-[1fr_1.4fr_100px] gap-4 px-5 py-3.5 items-center hover:bg-gray-50/50 transition-colors animate-fade-up"
                style={{ animationDelay: `${i * 30}ms` }}>

                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar user={u}/>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{u.nome || u.name}</p>
                    {isOwnRow(u) && (
                      <span className="text-[10px] text-primary font-medium">Você</span>
                    )}
                  </div>
                </div>

                <div className="hidden md:block">
                  <p className="text-sm text-gray-600 truncate">{u.cargo || u.jobTitle || '—'}</p>
                </div>

                <div className="flex items-center gap-1">
                  {(isAdmin || isOwnRow(u)) && (
                    <button onClick={() => setEditandoId(u.id)}
                      className="p-2 rounded-lg text-gray-300 hover:text-primary hover:bg-primary/10 transition-all" title="Editar">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                  )}
                  {isAdmin && !isOwnRow(u) && (
                    <button onClick={() => setConfirmDel(u)}
                      className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all" title="Excluir">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editandoId && usuarioEditando && (
        <ModalEditar
          usuarioId={editandoId}
          usuarioInicial={usuarioEditando}
          isAdmin={isAdmin}
          onSalvar={async (u) => {
            try {
              const payload = {
                name:           u.nome           || '',
                jobTitle:       u.cargo          || '',
                phone:          u.phone          || '',
                seniority:      u.seniority      || '',
                bio:            u.bio            || '',
                responsibility: u.responsibility || '',
                linkedin:       u.linkedin       || '',
                avatarUrl:      u.avatarUrl      || '',
              }
              const { data } = await api.put(`/users/${u.id}`, payload)
              const atualizado = {
                ...usuarioEditando,
                ...data,
                nome:  data.name     ?? usuarioEditando.nome,
                cargo: data.jobTitle ?? usuarioEditando.cargo,
              }
              setLista(p => p.map(x => x.id === u.id ? atualizado : x))
              setEditandoId(null)
            } catch (err) {
              console.error('Erro ao editar usuário:', err)
            }
          }}
          onFechar={() => setEditandoId(null)}
        />
      )}

      {confirmDel && (
        <ConfirmDialog
          title="Excluir usuário?"
          description={
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-500">
                "<span className="font-semibold">{confirmDel.nome || confirmDel.name}</span>" será desativado permanentemente.
              </p>
              {erroDelete && <p className="text-xs text-red-500 bg-red-50 rounded-lg py-2 px-3">{erroDelete}</p>}
            </div>
          }
          loading={excluindo}
          onCancel={() => { setConfirmDel(null); setErroDelete(null) }}
          onConfirm={async () => {
            if (!confirmDel?.id) { setErroDelete('ID inválido.'); return }
            setExcluindo(true)
            setErroDelete(null)
            try {
              await api.delete(`/users/${confirmDel.id}`)
              setConfirmDel(null)
              await fetchUsers()
            } catch (err) {
              const msg = err.response?.data?.detail || err.response?.data?.message || `Erro ${err.response?.status || ''}: não foi possível excluir.`
              setErroDelete(msg)
            } finally {
              setExcluindo(false)
            }
          }}
        />
      )}
    </div>
  )
}
