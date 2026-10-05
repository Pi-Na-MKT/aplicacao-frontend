import { useState, useRef } from 'react'

// Controla o arrastar e soltar de cards e de colunas.
// Os refs guardam o que está sendo arrastado (não precisam redesenhar a tela);
// os estados controlam apenas os destaques visuais durante o arraste.
export function useBoardDragAndDrop({ onMoveCard, onMoveColumn }) {
  const dragCardRef = useRef(null)   // { cardId, fromColId }
  const dragColRef  = useRef(null)   // id da coluna
  const [draggingCardId, setDraggingCardId] = useState(null)
  const [draggingColId,  setDraggingColId]  = useState(null)
  const [dragOverColId,  setDragOverColId]  = useState(null)
  const [dragOverCardId, setDragOverCardId] = useState(null)
  const [dragColOverId,  setDragColOverId]  = useState(null)

  // ---- Cards ----

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

  // Passando por cima de outro card: marca o card para inserir antes dele.
  const handleCardDragOver = (e, cardId, colId) => {
    if (!dragCardRef.current) return
    e.preventDefault()
    e.stopPropagation()
    setDragOverCardId(cardId)
    setDragOverColId(colId)
  }

  // Passando pela área de cards da coluna, fora de qualquer card: vai para o fim.
  const handleCardListDragOver = (e, colId) => {
    if (!dragCardRef.current) return
    e.preventDefault()
    e.stopPropagation()
    setDragOverColId(colId)
    setDragOverCardId(null)
  }

  const handleCardListDragLeave = (e) => {
    if (!dragCardRef.current) return
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColId(null)
      setDragOverCardId(null)
    }
  }

  const handleCardListDrop = (e, toColId) => {
    const drag = dragCardRef.current
    if (!drag) return
    e.preventDefault()
    e.stopPropagation()
    const insertBeforeId = dragOverColId === toColId ? dragOverCardId : null
    dragCardRef.current = null
    setDraggingCardId(null)
    setDragOverColId(null)
    setDragOverCardId(null)
    onMoveCard(drag.cardId, drag.fromColId, toColId, insertBeforeId)
  }

  // ---- Colunas ----

  const handleColumnDragStart = (e, colId) => {
    e.stopPropagation()
    dragColRef.current  = colId
    dragCardRef.current = null
    setDraggingColId(colId)
  }

  const handleColumnDragEnd = () => {
    dragColRef.current = null
    setDraggingColId(null)
    setDragColOverId(null)
  }

  const handleColumnDragOver = (e, colId) => {
    if (!dragColRef.current) return
    e.preventDefault()
    setDragColOverId(colId)
  }

  const handleColumnDragLeave = (e) => {
    if (dragColRef.current && !e.currentTarget.contains(e.relatedTarget))
      setDragColOverId(null)
  }

  const handleColumnDrop = (e, toColId) => {
    const fromColId = dragColRef.current
    if (!fromColId) return
    e.preventDefault()
    dragColRef.current = null
    setDraggingColId(null)
    setDragColOverId(null)
    if (fromColId === toColId) return
    onMoveColumn(fromColId, toColId)
  }

  return {
    draggingCardId, draggingColId, dragOverColId, dragOverCardId, dragColOverId,
    handleCardDragStart, handleCardDragEnd, handleCardDragOver,
    handleCardListDragOver, handleCardListDragLeave, handleCardListDrop,
    handleColumnDragStart, handleColumnDragEnd, handleColumnDragOver, handleColumnDragLeave, handleColumnDrop,
  }
}
