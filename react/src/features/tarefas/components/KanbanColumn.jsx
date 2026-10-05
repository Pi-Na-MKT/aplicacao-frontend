import React, { useState } from 'react'
import TarefaCard from './TarefaCard'

// Cores da coluna conforme a posição dela no board. Passando da última, volta para a primeira.
const TEMAS = [
  { coluna: 'border-slate-200 bg-slate-100/70',     titulo: 'text-pina-primary', badge: 'bg-slate-200 text-pina-primary'    },
  { coluna: 'border-blue-100 bg-blue-50/80',        titulo: 'text-blue-700',     badge: 'bg-blue-100 text-blue-700'         },
  { coluna: 'border-emerald-100 bg-emerald-50/80',  titulo: 'text-emerald-700',  badge: 'bg-emerald-100 text-emerald-700'   },
  { coluna: 'border-indigo-100 bg-indigo-50/80',    titulo: 'text-indigo-700',   badge: 'bg-indigo-100 text-indigo-700'     },
  { coluna: 'border-amber-100 bg-amber-50/80',      titulo: 'text-amber-700',    badge: 'bg-amber-100 text-amber-700'       },
  { coluna: 'border-pink-100 bg-pink-50/80',        titulo: 'text-pink-700',     badge: 'bg-pink-100 text-pink-700'         },
]

const botaoDeGestao =
  'flex h-7 w-7 items-center justify-center rounded-lg text-pina-text-light transition duration-base ease-base ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40'

// "dnd" é o objeto retornado por useBoardDragAndDrop.
// "cards" são os cards exibidos (já filtrados pela busca) e "totalCards" é a
// quantidade real da coluna, usada como posição de um card novo.
export default function KanbanColumn({
  col, index, cards, totalCards, canManage, dnd,
  onRename, onRequestDelete,
  onAddCard, onEditCard, onDeleteCard, onToggleComplete, onCalendarEvent,
}) {
  const [isEditing,   setIsEditing]   = useState(false)
  const [editingName, setEditingName] = useState('')
  const tema = TEMAS[index % TEMAS.length]

  const confirmRename = async () => {
    const name = editingName.trim()
    if (!name) { setIsEditing(false); return }
    await onRename(col.id, name)
    setIsEditing(false)
  }

  return (
    <div
      className={`group/coluna flex max-h-full w-[300px] flex-shrink-0 flex-col rounded-card border transition duration-base ease-base ${tema.coluna} ${
        dnd.dragColOverId === col.id && dnd.draggingColId !== col.id ? 'ring-2 ring-pina-secondary/40' : ''
      }`}
      onDragOver={(e) => dnd.handleColumnDragOver(e, col.id)}
      onDragLeave={dnd.handleColumnDragLeave}
      onDrop={(e) => dnd.handleColumnDrop(e, col.id)}
    >

      <div className="flex flex-shrink-0 items-center gap-2 px-5 pb-3 pt-4">
        {canManage && (
          <div
            draggable
            onDragStart={(e) => dnd.handleColumnDragStart(e, col.id)}
            onDragEnd={dnd.handleColumnDragEnd}
            className={`-ml-2 flex-shrink-0 cursor-grab transition duration-base ease-base active:cursor-grabbing ${
              dnd.draggingColId === col.id ? 'text-pina-secondary' : 'text-slate-300 hover:text-pina-text'
            }`}
            title="Arrastar coluna"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M7 2a2 2 0 10.001 4.001A2 2 0 007 2zm0 6a2 2 0 10.001 4.001A2 2 0 007 6zm0 6a2 2 0 10.001 4.001A2 2 0 007 12zm6-8a2 2 0 10-.001-4.001A2 2 0 0013 4zm0 2a2 2 0 10.001 4.001A2 2 0 0013 6zm0 6a2 2 0 10.001 4.001A2 2 0 0013 12z"/>
            </svg>
          </div>
        )}

        {isEditing ? (
          <input
            autoFocus type="text" value={editingName}
            onChange={e => setEditingName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter')  confirmRename()
              if (e.key === 'Escape') setIsEditing(false)
            }}
            onBlur={confirmRename}
            aria-label="Nome da coluna"
            className="min-w-0 flex-1 rounded-lg border border-pina-secondary/40 bg-pina-surface px-2 py-1 text-[15px] font-semibold text-pina-primary outline-none focus:ring-2 focus:ring-pina-secondary/20"
          />
        ) : (
          <h2 className={`min-w-0 flex-1 truncate text-[17px] font-semibold ${tema.titulo}`}>{col.label}</h2>
        )}

        {/* As ações de gestão ficam discretas e aparecem ao passar o mouse ou ao receber foco.
            Em telas de toque (sem mouse) ficam sempre visíveis. */}
        {!isEditing && canManage && (
          <div className="flex items-center gap-0.5 transition-opacity duration-base focus-within:opacity-100 lg:opacity-0 lg:group-hover/coluna:opacity-100">
            <button
              type="button"
              onClick={() => { setIsEditing(true); setEditingName(col.label) }}
              className={`${botaoDeGestao} hover:bg-pina-surface hover:text-pina-secondary`}
              title="Renomear coluna">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onRequestDelete(col.id)}
              className={`${botaoDeGestao} hover:bg-pina-danger/10 hover:text-pina-danger`}
              title="Excluir coluna">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        )}

        <span className={`flex h-7 min-w-[28px] flex-shrink-0 items-center justify-center rounded-full px-2 text-xs font-semibold ${tema.badge}`}>
          {cards.length}
        </span>
      </div>

      <div
        className={`flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-b-card px-3 pb-3 scrollbar-thin transition-colors duration-base ${
          dnd.dragOverColId === col.id ? 'bg-pina-secondary/5' : ''
        }`}
        onDragOver={(e) => dnd.handleCardListDragOver(e, col.id)}
        onDrop={(e) => dnd.handleCardListDrop(e, col.id)}
        onDragLeave={dnd.handleCardListDragLeave}
      >
        {cards.map(tarefa => (
          <div
            key={tarefa.id}
            draggable
            onDragStart={() => dnd.handleCardDragStart(tarefa.id, col.id)}
            onDragEnd={dnd.handleCardDragEnd}
            onDragOver={(e) => dnd.handleCardDragOver(e, tarefa.id, col.id)}
            className={`transition-opacity duration-base ${dnd.draggingCardId === tarefa.id ? 'opacity-40' : ''}`}
          >
            {dnd.dragOverCardId === tarefa.id && dnd.draggingCardId !== tarefa.id && (
              <div className="mx-1 mb-2 h-0.5 rounded-full bg-pina-secondary"/>
            )}
            <TarefaCard
              tarefa={tarefa}
              onEdit={(t) => onEditCard(col.id, t)}
              onDelete={(t) => onDeleteCard(col.id, t)}
              onToggleComplete={onToggleComplete}
              onCalendarEvent={onCalendarEvent}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => onAddCard(col.id, totalCards)}
          className="flex w-full flex-shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-pina-secondary transition duration-base ease-base hover:bg-pina-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Adicionar card
        </button>
      </div>
    </div>
  )
}
