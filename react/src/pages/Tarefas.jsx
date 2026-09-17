import React, { useState, useEffect, useRef } from 'react'
import TarefaCard from '../components/TarefaCard'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const COL_CORES = ['bg-gray-400', 'bg-blue-500', 'bg-emerald-500', 'bg-violet-400', 'bg-amber-400', 'bg-pink-400']
const PRIORITY_MAP = { HIGH: 'high', MEDIUM: 'medium', LOW: 'low', CRITICAL: 'high' }
const PRIORITY_OPTIONS = [
  { value: 'HIGH',   label: 'Alta'  },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'LOW',    label: 'Baixa' },
]

const mapCard = (card) => ({
  id:                    card.id,
  titulo:                card.title       || 'Sem título',
  descricao:             card.description || '',
  prioridade:            PRIORITY_MAP[card.priority] || 'low',
  rawPriority:           card.priority    || 'MEDIUM',
  rawDueDate:            card.dueDate     || null,
  dueDate:               card.dueDate     || null,
  position:              card.position    ?? 0,
  completed:             card.completed   ?? false,
  googleCalendarEventId: card.googleCalendarEventId || null,
  horas:                 card.dueDate
    ? new Date(card.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    : '—',
  assignedUserIds: (card.assignedUsers || []).map(u => u.id),
  assignedUsers:   (card.assignedUsers || []).map(u => ({ id: u.id, avatarUrl: u.avatarUrl || null, name: u.name || '' })),
})

function UserAvatar({ user, size = 'w-6 h-6' }) {
  const src = user?.avatarUrl || user?.avatar
  if (src) return <img src={src} className={`${size} rounded-full object-cover flex-shrink-0`} alt=""/>
  return (
    <div className={`${size} rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0`}>
      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
      </svg>
    </div>
  )
}

function CardModal({ columnId, initialCard, position, registeredUsers, onClose, onSaved }) {
  const isEdit = !!initialCard
  const [form, setForm] = useState({
    title:    initialCard?.titulo      || '',
    desc:     initialCard?.descricao   || '',
    priority: initialCard?.rawPriority || 'MEDIUM',
    dueDate:  initialCard?.rawDueDate
      ? new Date(initialCard.rawDueDate).toISOString().slice(0, 10)
      : '',
  })
  const [assignedIds, setAssignedIds] = useState(
    () => new Set((initialCard?.assignedUserIds || []).map(Number))
  )
  const [userSearch, setUserSearch] = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const toggleUser = (id) =>
    setAssignedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const filteredUsers = registeredUsers.filter(u =>
    !userSearch || (u.nome || u.name || '').toLowerCase().includes(userSearch.toLowerCase())
  )

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Título é obrigatório.'); return }
    setLoading(true)
    setError('')
    try {
      const payload = {
        title:           form.title.trim(),
        description:     form.desc.trim() || null,
        priority:        form.priority,
        position,
        dueDate:         form.dueDate ? form.dueDate + 'T00:00:00' : null,
        isActive:        true,
        assignedUserIds: [...assignedIds],
      }
      const { data } = isEdit
        ? await api.put(`/cards/${initialCard.id}`, payload)
        : await api.post(`/cards/column/${columnId}`, payload)
      onSaved(data)
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Erro ao salvar card.')
    } finally {
      setLoading(false)
    }
  }

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

export default function Tarefas({ empresa, onBack, onDashboard }) {
  const { user, registeredUsers } = useAuth()
  const canManage = ['ADMIN', 'MANAGER'].includes(user?.role?.toUpperCase())

  const [board,              setBoard]              = useState(null)
  const [columns,            setColumns]            = useState([])
  const [cardsByColumn,      setCardsByColumn]      = useState({})
  const [boardMemberIds,     setBoardMemberIds]     = useState(new Set())
  const [loading,            setLoading]            = useState(true)
  const [creatingBoard,      setCreatingBoard]      = useState(false)
  const [addingColumn,       setAddingColumn]       = useState(false)
  const [newColumnName,      setNewColumnName]      = useState('')
  const [savingColumn,       setSavingColumn]       = useState(false)
  const [editingColumnId,    setEditingColumnId]    = useState(null)
  const [editingName,        setEditingName]        = useState('')
  const [cardModal,          setCardModal]          = useState(null)
  const [deleteCardTarget,   setDeleteCardTarget]   = useState(null)
  const [deletingCard,       setDeletingCard]       = useState(false)
  const [deleteColumnTarget, setDeleteColumnTarget] = useState(null)

  const dragCardRef      = useRef(null)
  const dragColRef       = useRef(null)
  const [draggingCardId, setDraggingCardId] = useState(null)
  const [draggingColId,  setDraggingColId]  = useState(null)
  const [dragOverColId,  setDragOverColId]  = useState(null)
  const [dragOverCardId, setDragOverCardId] = useState(null)
  const [dragColOverId,  setDragColOverId]  = useState(null)

  useEffect(() => {
    if (empresa?.id) loadBoard()
  }, [empresa?.id])

  const loadBoard = async () => {
    setLoading(true)
    try {
      const { data: boards } = await api.get('/boards')
      const found = boards.find(b => b.companyId === empresa.id)
      if (!found) { setBoard(null); setColumns([]); setCardsByColumn({}); setBoardMemberIds(new Set()); return }
      setBoard(found)
      setBoardMemberIds(new Set((found.members || []).map(m => Number(m.id))))

      const { data: cols } = await api.get(`/columns/board/${found.id}`)
      const sorted = [...cols].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

      const map = {}
      await Promise.all(sorted.map(async (col) => {
        const { data: cards } = await api.get(`/cards/column/${col.id}`)
        map[col.id] = cards
          .filter(c => c.isActive !== false)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
          .map(mapCard)
      }))

      setColumns(sorted.map((col, i) => ({ id: col.id, label: col.name, cor: COL_CORES[i % COL_CORES.length] })))
      setCardsByColumn(map)
    } catch (err) {
      console.error('Erro ao carregar board:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBoard = async () => {
    setCreatingBoard(true)
    try {
      const { data: newBoard } = await api.post(`/boards/company/${empresa.id}`, {
        name: empresa.nome || empresa.name, userIds: [],
      })
      await Promise.all([
        api.post(`/columns/board/${newBoard.id}`, { name: 'A Fazer',      position: 0 }),
        api.post(`/columns/board/${newBoard.id}`, { name: 'Em Progresso', position: 1 }),
        api.post(`/columns/board/${newBoard.id}`, { name: 'Concluído',    position: 2 }),
      ])
      await loadBoard()
    } catch (err) {
      console.error('Erro ao criar board:', err)
    } finally {
      setCreatingBoard(false)
    }
  }

  const handleAddColumn = async () => {
    const name = newColumnName.trim()
    if (!name || !board) return
    setSavingColumn(true)
    try {
      const { data } = await api.post(`/columns/board/${board.id}`, { name, position: columns.length })
      const cor = COL_CORES[columns.length % COL_CORES.length]
      setColumns(prev => [...prev, { id: data.id, label: data.name, cor }])
      setCardsByColumn(prev => ({ ...prev, [data.id]: [] }))
      setNewColumnName('')
      setAddingColumn(false)
    } catch (err) {
      console.error('Erro ao criar coluna:', err)
    } finally {
      setSavingColumn(false)
    }
  }

  const confirmRename = async () => {
    const name = editingName.trim()
    if (!name) { setEditingColumnId(null); return }
    try {
      await api.put(`/columns/${editingColumnId}`, { name })
      setColumns(prev => prev.map(c => c.id === editingColumnId ? { ...c, label: name } : c))
    } catch (err) {
      console.error('Erro ao renomear coluna:', err)
    }
    setEditingColumnId(null)
  }

  const deleteColumn = async () => {
    const id = deleteColumnTarget
    try {
      await api.delete(`/columns/${id}`)
      setColumns(prev => prev.filter(c => c.id !== id))
      setCardsByColumn(prev => { const n = { ...prev }; delete n[id]; return n })
    } catch (err) {
      console.error('Erro ao deletar coluna:', err)
    }
    setDeleteColumnTarget(null)
  }

  const handleCardSaved = (data) => {
    if (!cardModal) return
    const { columnId } = cardModal
    const mapped = mapCard(data)
    setCardsByColumn(prev => {
      const list = prev[columnId] || []
      const idx  = list.findIndex(c => c.id === mapped.id)
      if (idx >= 0) {
        const updated = [...list]
        updated[idx]  = mapped
        return { ...prev, [columnId]: updated }
      }
      return { ...prev, [columnId]: [...list, mapped] }
    })
    setCardModal(null)
  }

  const handleToggleComplete = async (cardId, completed) => {
    const update = (val) =>
      setCardsByColumn(prev => {
        const next = {}
        Object.keys(prev).forEach(colId => {
          next[colId] = prev[colId].map(c => c.id === cardId ? { ...c, completed: val } : c)
        })
        return next
      })

    update(completed)
    try {
      await api.put(`/cards/${cardId}`, { completed })
    } catch (err) {
      console.error('Erro ao atualizar card:', err)
      update(!completed)
    }
  }

  const handleDeleteCard = async () => {
    if (!deleteCardTarget) return
    const { card, columnId } = deleteCardTarget
    setDeletingCard(true)
    try {
      await api.delete(`/cards/${card.id}`)
      setCardsByColumn(prev => ({ ...prev, [columnId]: (prev[columnId] || []).filter(c => c.id !== card.id) }))
      setDeleteCardTarget(null)
    } catch (err) {
      console.error('Erro ao excluir card:', err)
    } finally {
      setDeletingCard(false)
    }
  }

  const handleCalendarEvent = async (tarefa) => {
    try {
      const { data } = await api.post(`/cards/${tarefa.id}/calendar-event`)
      const mapped = mapCard(data)
      setCardsByColumn(prev => {
        const next = {}
        Object.keys(prev).forEach(colId => {
          next[colId] = prev[colId].map(c => c.id === mapped.id ? mapped : c)
        })
        return next
      })
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao criar evento no Google Calendar.')
    }
  }

  const handleCardDragStart = (cardId, fromColId) => {
    dragCardRef.current = { cardId, fromColId }
    dragColRef.current  = null
    setDraggingCardId(cardId)
  }

  const handleCardDragEnd = () => {
    dragCardRef.current = null
    setDraggingCardId(null)
    setDragOverColId(null)
    setDragOverCardId(null)
  }

  const handleCardDrop = (toColId) => {
    const drag = dragCardRef.current
    if (!drag) return
    const insertBeforeId = dragOverColId === toColId ? dragOverCardId : null
    dragCardRef.current = null
    setDraggingCardId(null)
    setDragOverColId(null)
    setDragOverCardId(null)
    const { cardId, fromColId } = drag
    setCardsByColumn(prev => {
      const card = (prev[fromColId] || []).find(c => c.id === cardId)
      if (!card) return prev
      const fromList   = (prev[fromColId] || []).filter(c => c.id !== cardId)
      const baseToList = toColId === fromColId ? fromList : [...(prev[toColId] || [])]
      let insertIdx    = insertBeforeId ? baseToList.findIndex(c => c.id === insertBeforeId) : -1
      if (insertIdx === -1) insertIdx = baseToList.length
      const newToList  = [...baseToList]
      newToList.splice(insertIdx, 0, card)
      moveCardOnServer(cardId, toColId, insertIdx)
      if (toColId === fromColId) {
        return { ...prev, [toColId]: newToList.map((c, i) => ({ ...c, position: i })) }
      }
      return {
        ...prev,
        [fromColId]: fromList.map((c, i) => ({ ...c, position: i })),
        [toColId]:   newToList.map((c, i) => ({ ...c, position: i })),
      }
    })
  }

  const moveCardOnServer = async (cardId, toColId, position) => {
    try {
      await api.put(`/cards/${cardId}`, { columnId: toColId, position })
    } catch (err) {
      console.error('Erro ao mover card:', err)
      loadBoard()
    }
  }

  const handleColDragStart = (colId) => {
    dragColRef.current  = colId
    dragCardRef.current = null
    setDraggingColId(colId)
  }

  const handleColDragEnd = () => {
    dragColRef.current = null
    setDraggingColId(null)
    setDragColOverId(null)
  }

  const handleColDrop = (toColId) => {
    const fromColId = dragColRef.current
    dragColRef.current = null
    setDraggingColId(null)
    setDragColOverId(null)
    if (!fromColId || fromColId === toColId) return
    setColumns(prev => {
      const fromIdx = prev.findIndex(c => c.id === fromColId)
      const toIdx   = prev.findIndex(c => c.id === toColId)
      if (fromIdx === -1 || toIdx === -1) return prev
      const next    = [...prev]
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      reorderColumnsOnServer(next)
      return next
    })
  }

  const reorderColumnsOnServer = async (newOrder) => {
    try {
      await Promise.all(newOrder.map((col, i) => api.put(`/columns/${col.id}`, { position: i })))
    } catch (err) {
      console.error('Erro ao reordenar colunas:', err)
      loadBoard()
    }
  }

  const totalCards   = Object.values(cardsByColumn).reduce((s, arr) => s + arr.length, 0)
  const doneColumnId = columns.find(c => c.label.toLowerCase().includes('conclu') || c.label.toLowerCase().includes('finaliz'))?.id
  const doneCount    = doneColumnId ? (cardsByColumn[doneColumnId] || []).length : 0
  const donePercent  = totalCards > 0 ? Math.round((doneCount / totalCards) * 100) : 0

  return (
    <div className="h-full flex flex-col animate-fade-up">

      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-6 py-4">
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <button onClick={onBack} className="hover:text-primary transition-colors font-medium">Empresas</button>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
          <span className="text-gray-600 font-semibold">{empresa?.nome || empresa?.name}</span>
        </nav>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {empresa && (
              <div className={`w-9 h-9 rounded-xl ${empresa.cor} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                {empresa.inicial}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-gray-900">{empresa?.nome || empresa?.name}</h1>
              <p className="text-xs text-gray-400">
                {totalCards} tarefa{totalCards !== 1 ? 's' : ''} ·{' '}
                <span className="text-emerald-600 font-semibold">{doneCount} concluída{doneCount !== 1 ? 's' : ''}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* {totalCards > 0 && (
              <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${donePercent}%` }}/>
                </div>
                <span className="text-xs font-semibold text-gray-600">{donePercent}%</span>
              </div>
            )} */}
            <button onClick={onDashboard} className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
              Dashboard
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <Spinner/>
        </div>
      )}

      {!loading && !board && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-xs">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <p className="text-gray-700 font-semibold text-sm mb-1">Nenhum board encontrado</p>
            {canManage ? (
              <>
                <p className="text-gray-400 text-xs mb-5">Crie o board desta empresa para começar a organizar as tarefas.</p>
                <button onClick={handleCreateBoard} disabled={creatingBoard} className="btn-primary disabled:opacity-50">
                  {creatingBoard ? <Spinner size="sm" className="text-white"/> : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
                    </svg>
                  )}
                  {creatingBoard ? 'Criando...' : 'Criar board'}
                </button>
              </>
            ) : (
              <p className="text-gray-400 text-xs">Aguarde um administrador criar o board desta empresa.</p>
            )}
          </div>
        </div>
      )}

      {!loading && board && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-5 p-6 h-full" style={{ alignItems: 'flex-start', minWidth: 'max-content' }}>

            {columns.map((col) => {
              const cards     = cardsByColumn[col.id] || []
              const isEditing = editingColumnId === col.id

              return (
                <div
                  key={col.id}
                  className={`flex flex-col bg-gray-100/70 rounded-2xl flex-shrink-0 w-80 transition-all ${
                    dragColOverId === col.id && draggingColId !== col.id ? 'ring-2 ring-primary/40' : ''
                  }`}
                  style={{ maxHeight: 'calc(100vh - 160px)' }}
                  onDragOver={(e) => {
                    if (!dragColRef.current) return
                    e.preventDefault()
                    setDragColOverId(col.id)
                  }}
                  onDragLeave={(e) => {
                    if (dragColRef.current && !e.currentTarget.contains(e.relatedTarget))
                      setDragColOverId(null)
                  }}
                  onDrop={(e) => {
                    if (!dragColRef.current) return
                    e.preventDefault()
                    handleColDrop(col.id)
                  }}
                >

                  <div className="flex items-center gap-2 px-4 pt-4 pb-3 flex-shrink-0">
                    {canManage && (
                      <div
                        draggable
                        onDragStart={(e) => { e.stopPropagation(); handleColDragStart(col.id) }}
                        onDragEnd={handleColDragEnd}
                        className={`cursor-grab active:cursor-grabbing flex-shrink-0 transition-colors ${
                          draggingColId === col.id ? 'text-primary' : 'text-gray-300 hover:text-gray-500'
                        }`}
                        title="Arrastar coluna"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 2a2 2 0 10.001 4.001A2 2 0 007 2zm0 6a2 2 0 10.001 4.001A2 2 0 007 6zm0 6a2 2 0 10.001 4.001A2 2 0 007 12zm6-8a2 2 0 10-.001-4.001A2 2 0 0013 4zm0 2a2 2 0 10.001 4.001A2 2 0 0013 6zm0 6a2 2 0 10.001 4.001A2 2 0 0013 12z"/>
                        </svg>
                      </div>
                    )}

                    <div className={`w-2 h-2 rounded-full ${col.cor} flex-shrink-0`}/>

                    {isEditing ? (
                      <input
                        autoFocus type="text" value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter')  confirmRename()
                          if (e.key === 'Escape') setEditingColumnId(null)
                        }}
                        onBlur={confirmRename}
                        className="flex-1 px-2 py-1 rounded-lg text-sm bg-white border border-primary/40 focus:outline-none font-semibold"
                      />
                    ) : (
                      <h2 className="text-sm font-bold text-gray-700 flex-1 truncate">{col.label}</h2>
                    )}

                    <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {cards.length}
                    </span>

                    {!isEditing && canManage && (
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => { setEditingColumnId(col.id); setEditingName(col.label) }}
                          className="w-6 h-6 rounded-lg text-gray-400 hover:text-primary hover:bg-white transition-all flex items-center justify-center"
                          title="Renomear coluna">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteColumnTarget(col.id)}
                          className="w-6 h-6 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                          title="Excluir coluna">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={`mx-4 h-0.5 ${col.cor} opacity-30 rounded-full mb-3 flex-shrink-0`}/>

                  <div
                    className={`flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2.5 scrollbar-thin rounded-b-2xl transition-colors ${
                      dragOverColId === col.id ? 'bg-primary/5' : ''
                    }`}
                    onDragOver={(e) => {
                      if (!dragCardRef.current) return
                      e.preventDefault()
                      e.stopPropagation()
                      setDragOverColId(col.id)
                      setDragOverCardId(null)
                    }}
                    onDrop={(e) => {
                      if (!dragCardRef.current) return
                      e.preventDefault()
                      e.stopPropagation()
                      handleCardDrop(col.id)
                    }}
                    onDragLeave={(e) => {
                      if (!dragCardRef.current) return
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        setDragOverColId(null)
                        setDragOverCardId(null)
                      }
                    }}
                  >
                    {cards.map(tarefa => (
                      <div
                        key={tarefa.id}
                        draggable
                        onDragStart={() => handleCardDragStart(tarefa.id, col.id)}
                        onDragEnd={handleCardDragEnd}
                        onDragOver={(e) => {
                          if (!dragCardRef.current) return
                          e.preventDefault()
                          e.stopPropagation()
                          setDragOverCardId(tarefa.id)
                          setDragOverColId(col.id)
                        }}
                        className={`transition-opacity ${draggingCardId === tarefa.id ? 'opacity-40' : ''}`}
                      >
                        {dragOverCardId === tarefa.id && draggingCardId !== tarefa.id && (
                          <div className="h-0.5 bg-primary rounded-full mb-1.5 mx-1"/>
                        )}
                        <TarefaCard
                          tarefa={tarefa}
                          onEdit={(t) => setCardModal({ columnId: col.id, card: t, position: t.position })}
                          onDelete={(t) => setDeleteCardTarget({ card: t, columnId: col.id })}
                          onToggleComplete={handleToggleComplete}
                          onCalendarEvent={handleCalendarEvent}
                        />
                      </div>
                    ))}

                    <button
                      onClick={() => setCardModal({ columnId: col.id, card: null, position: cards.length })}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 text-xs font-medium text-gray-400 hover:border-primary/30 hover:text-primary/60 hover:bg-white/70 transition-all mt-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                      </svg>
                      Adicionar card
                    </button>
                  </div>
                </div>
              )
            })}

            {canManage && (
              <div className="flex-shrink-0 w-80">
                {addingColumn ? (
                  <div className="bg-gray-100/70 rounded-2xl p-4">
                    <input
                      autoFocus type="text" value={newColumnName}
                      onChange={e => setNewColumnName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter')  handleAddColumn()
                        if (e.key === 'Escape') { setAddingColumn(false); setNewColumnName('') }
                      }}
                      placeholder="Nome da coluna..."
                      className="input-base mb-3 bg-white"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleAddColumn} disabled={savingColumn || !newColumnName.trim()}
                        className="btn-primary flex-1 justify-center py-2 disabled:opacity-50">
                        {savingColumn ? <Spinner size="sm" className="text-white"/> : 'Adicionar'}
                      </button>
                      <button onClick={() => { setAddingColumn(false); setNewColumnName('') }}
                        className="w-9 h-9 rounded-xl bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-500 transition-colors flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddingColumn(true)}
                    className="w-full flex items-center gap-2.5 px-4 py-3.5 rounded-2xl text-sm font-medium text-gray-500 hover:bg-gray-200/70 hover:text-gray-800 border-2 border-dashed border-gray-200 transition-all">
                    <div className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                      </svg>
                    </div>
                    Nova coluna
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {cardModal && (
        <CardModal
          columnId={cardModal.columnId}
          initialCard={cardModal.card}
          position={cardModal.position}
          registeredUsers={registeredUsers.filter(u => boardMemberIds.has(Number(u.id)))}
          onClose={() => setCardModal(null)}
          onSaved={handleCardSaved}
        />
      )}

      {deleteCardTarget && (
        <ConfirmDialog
          title="Excluir card?"
          description={<p className="text-sm text-gray-500">"{deleteCardTarget.card.titulo}" será removido permanentemente.</p>}
          onConfirm={handleDeleteCard}
          onCancel={() => setDeleteCardTarget(null)}
          loading={deletingCard}
        />
      )}

      {deleteColumnTarget && (() => {
        const col = columns.find(c => c.id === deleteColumnTarget)
        const qty = (cardsByColumn[deleteColumnTarget] || []).length
        return (
          <ConfirmDialog
            title={`Excluir "${col?.label}"?`}
            description={
              <div className="flex flex-col gap-1">
                {qty > 0 && <p className="text-sm text-red-500 font-medium">{qty} card{qty !== 1 ? 's' : ''} serão perdidos.</p>}
                <p className="text-sm text-gray-400">Esta ação não pode ser desfeita.</p>
              </div>
            }
            onConfirm={deleteColumn}
            onCancel={() => setDeleteColumnTarget(null)}
          />
        )
      })()}
    </div>
  )
}
