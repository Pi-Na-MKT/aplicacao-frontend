import React, { useState } from 'react'
import ConfirmDialog from '../../shared/components/ConfirmDialog'
import Spinner from '../../shared/components/Spinner'
import TopbarPortal from '../../shared/components/TopbarPortal'
import { useAuth } from '../../app/providers/AuthContext'
import BoardEmpresa from './components/BoardEmpresa'
import BoardHeader from './components/BoardHeader'
import BoardVazio from './components/BoardVazio'
import CardModal from './components/CardModal'
import KanbanColumn from './components/KanbanColumn'
import NovaColuna from './components/NovaColuna'
import { useBoard } from './hooks/useBoard'
import { useBoardDragAndDrop } from './hooks/useBoardDragAndDrop'
import { filtrarCards } from './utils/board'

// "search" vem da busca da barra superior (ver app/App.jsx).
export default function Tarefas({ empresa, onDashboard, search = '' }) {
  const { user, registeredUsers } = useAuth()
  const role      = user?.role?.toUpperCase()
  const canManage = ['ADMIN', 'MANAGER'].includes(role)
  const isAdmin   = role === 'ADMIN'

  const {
    board, columns, cardsByColumn, boardMemberIds, loading, creatingBoard,
    totalCards,
    createBoard,
    addColumn, renameColumn, deleteColumn, moveColumn,
    applySavedCard, toggleComplete, deleteCard, createCalendarEvent, moveCard,
  } = useBoard(empresa)

  const dnd = useBoardDragAndDrop({ onMoveCard: moveCard, onMoveColumn: moveColumn })

  const [cardModal,          setCardModal]          = useState(null)   // { columnId, card, position }
  const [deleteCardTarget,   setDeleteCardTarget]   = useState(null)   // { card, columnId }
  const [deletingCard,       setDeletingCard]       = useState(false)
  const [deleteColumnTarget, setDeleteColumnTarget] = useState(null)   // id da coluna

  const abrirNovoCard = (columnId) =>
    setCardModal({ columnId, card: null, position: (cardsByColumn[columnId] || []).length })

  const handleCardSaved = (data) => {
    if (!cardModal) return
    applySavedCard(cardModal.columnId, data)
    setCardModal(null)
  }

  const handleDeleteCard = async () => {
    if (!deleteCardTarget) return
    const { card, columnId } = deleteCardTarget
    setDeletingCard(true)
    const excluido = await deleteCard(card.id, columnId)
    if (excluido) setDeleteCardTarget(null)
    setDeletingCard(false)
  }

  const handleDeleteColumn = async () => {
    await deleteColumn(deleteColumnTarget)
    setDeleteColumnTarget(null)
  }

  const empresaAtual = <BoardEmpresa empresa={empresa} totalCards={totalCards} />
  const temColunas   = !loading && board && columns.length > 0

  return (
    <div className="flex h-full animate-fade-up flex-col font-poppins">

      {/* Em telas grandes a empresa aparece na barra superior; nas menores, aqui na página. */}
      <TopbarPortal>{empresaAtual}</TopbarPortal>

      <div className="flex-shrink-0 px-4 pb-6 pt-7 lg:px-10">
        <div className="mb-5 lg:hidden">{empresaAtual}</div>
        {/* O Dashboard só existe para administrador. "Nova tarefa" cria o card na primeira coluna. */}
        <BoardHeader
          onDashboard={isAdmin ? onDashboard : undefined}
          onNovaTarefa={temColunas ? () => abrirNovoCard(columns[0].id) : undefined}
        />
      </div>

      {loading && (
        <div className="flex flex-1 items-center justify-center">
          <Spinner className="text-pina-secondary"/>
        </div>
      )}

      {!loading && !board && (
        <BoardVazio canManage={canManage} creating={creatingBoard} onCreate={createBoard} />
      )}

      {!loading && board && (
        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full min-w-max items-start gap-5 px-4 pb-6 lg:px-10">

            {columns.map((col, index) => (
              <KanbanColumn
                key={col.id}
                col={col}
                index={index}
                cards={filtrarCards(cardsByColumn[col.id] || [], search)}
                totalCards={(cardsByColumn[col.id] || []).length}
                canManage={canManage}
                dnd={dnd}
                onRename={renameColumn}
                onRequestDelete={setDeleteColumnTarget}
                onAddCard={(columnId, position) => setCardModal({ columnId, card: null, position })}
                onEditCard={(columnId, card) => setCardModal({ columnId, card, position: card.position })}
                onDeleteCard={(columnId, card) => setDeleteCardTarget({ card, columnId })}
                onToggleComplete={toggleComplete}
                onCalendarEvent={createCalendarEvent}
              />
            ))}

            {canManage && <NovaColuna onAdd={addColumn} />}
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
            onConfirm={handleDeleteColumn}
            onCancel={() => setDeleteColumnTarget(null)}
          />
        )
      })()}
    </div>
  )
}
