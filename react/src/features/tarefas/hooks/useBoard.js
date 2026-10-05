import { useState, useEffect } from 'react'
import { listBoards, listColumns, listCards } from '../../../shared/services/boardService'
import * as tarefaService from '../services/tarefaService'
import { ordenarPorPosicao, mapCard } from '../utils/board'

const COLUNAS_PADRAO = ['A Fazer', 'Em Progresso', 'Concluído']

// Guarda o board da empresa (colunas e cards) e as operações que o alteram.
// As alterações são aplicadas na tela e enviadas para a API.
export function useBoard(empresa) {
  const [board,          setBoard]          = useState(null)
  const [columns,        setColumns]        = useState([])        // [{ id, label }]
  const [cardsByColumn,  setCardsByColumn]  = useState({})        // { [columnId]: card[] }
  const [boardMemberIds, setBoardMemberIds] = useState(new Set())
  const [loading,        setLoading]        = useState(true)
  const [creatingBoard,  setCreatingBoard]  = useState(false)

  useEffect(() => {
    if (empresa?.id) loadBoard()
  }, [empresa?.id])

  const loadBoard = async () => {
    setLoading(true)
    try {
      const boards = await listBoards()
      const found = boards.find(b => b.companyId === empresa.id)
      if (!found) { setBoard(null); setColumns([]); setCardsByColumn({}); setBoardMemberIds(new Set()); return }
      setBoard(found)
      setBoardMemberIds(new Set((found.members || []).map(m => Number(m.id))))

      const sorted = ordenarPorPosicao(await listColumns(found.id))

      const map = {}
      await Promise.all(sorted.map(async (col) => {
        const cards = await listCards(col.id)
        map[col.id] = ordenarPorPosicao(cards.filter(c => c.isActive !== false)).map(mapCard)
      }))

      setColumns(sorted.map(col => ({ id: col.id, label: col.name })))
      setCardsByColumn(map)
    } catch (err) {
      console.error('Erro ao carregar board:', err)
    } finally {
      setLoading(false)
    }
  }

  const createBoard = async () => {
    setCreatingBoard(true)
    try {
      const newBoard = await tarefaService.createBoard(empresa.id, empresa.nome || empresa.name)
      await Promise.all(
        COLUNAS_PADRAO.map((name, position) => tarefaService.createColumn(newBoard.id, { name, position }))
      )
      await loadBoard()
    } catch (err) {
      console.error('Erro ao criar board:', err)
    } finally {
      setCreatingBoard(false)
    }
  }

  // Retorna true quando a coluna foi criada.
  const addColumn = async (name) => {
    if (!board) return false
    try {
      const data = await tarefaService.createColumn(board.id, { name, position: columns.length })
      setColumns(prev => [...prev, { id: data.id, label: data.name }])
      setCardsByColumn(prev => ({ ...prev, [data.id]: [] }))
      return true
    } catch (err) {
      console.error('Erro ao criar coluna:', err)
      return false
    }
  }

  const renameColumn = async (columnId, name) => {
    try {
      await tarefaService.updateColumn(columnId, { name })
      setColumns(prev => prev.map(c => c.id === columnId ? { ...c, label: name } : c))
    } catch (err) {
      console.error('Erro ao renomear coluna:', err)
    }
  }

  const deleteColumn = async (columnId) => {
    try {
      await tarefaService.deleteColumn(columnId)
      setColumns(prev => prev.filter(c => c.id !== columnId))
      setCardsByColumn(prev => { const n = { ...prev }; delete n[columnId]; return n })
    } catch (err) {
      console.error('Erro ao deletar coluna:', err)
    }
  }

  const moveColumn = (fromColId, toColId) => {
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
      await Promise.all(newOrder.map((col, i) => tarefaService.updateColumn(col.id, { position: i })))
    } catch (err) {
      console.error('Erro ao reordenar colunas:', err)
      loadBoard()
    }
  }

  // Aplica na tela o card devolvido pela API depois de criar ou editar.
  const applySavedCard = (columnId, data) => {
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
  }

  // Atualiza um card em qualquer coluna em que ele esteja.
  const updateCardInState = (cardId, update) =>
    setCardsByColumn(prev => {
      const next = {}
      Object.keys(prev).forEach(colId => {
        next[colId] = prev[colId].map(c => c.id === cardId ? update(c) : c)
      })
      return next
    })

  // Marca na tela antes da resposta da API e desfaz se a API falhar.
  const toggleComplete = async (cardId, completed) => {
    updateCardInState(cardId, c => ({ ...c, completed }))
    try {
      await tarefaService.updateCard(cardId, { completed })
    } catch (err) {
      console.error('Erro ao atualizar card:', err)
      updateCardInState(cardId, c => ({ ...c, completed: !completed }))
    }
  }

  // Retorna true quando o card foi excluído.
  const deleteCard = async (cardId, columnId) => {
    try {
      await tarefaService.deleteCard(cardId)
      setCardsByColumn(prev => ({ ...prev, [columnId]: (prev[columnId] || []).filter(c => c.id !== cardId) }))
      return true
    } catch (err) {
      console.error('Erro ao excluir card:', err)
      return false
    }
  }

  const createCalendarEvent = async (tarefa) => {
    try {
      const mapped = mapCard(await tarefaService.createCardCalendarEvent(tarefa.id))
      updateCardInState(mapped.id, () => mapped)
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao criar evento no Google Calendar.')
    }
  }

  // Move o card para a coluna de destino. Com insertBeforeId, entra antes desse card;
  // sem ele, vai para o fim da coluna.
  const moveCard = (cardId, fromColId, toColId, insertBeforeId) => {
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
      await tarefaService.updateCard(cardId, { columnId: toColId, position })
    } catch (err) {
      console.error('Erro ao mover card:', err)
      loadBoard()
    }
  }

  const totalCards   = Object.values(cardsByColumn).reduce((s, arr) => s + arr.length, 0)

  return {
    board, columns, cardsByColumn, boardMemberIds, loading, creatingBoard,
    totalCards,
    createBoard,
    addColumn, renameColumn, deleteColumn, moveColumn,
    applySavedCard, toggleComplete, deleteCard, createCalendarEvent, moveCard,
  }
}
