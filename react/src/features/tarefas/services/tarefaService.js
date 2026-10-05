import api from '../../../shared/services/api'

// Operações de escrita do board. As leituras (boards, colunas e cards) estão em
// shared/services/boardService.js, porque outras features também as utilizam.

export async function createBoard(companyId, name) {
  const { data } = await api.post(`/boards/company/${companyId}`, { name, userIds: [] })
  return data
}

export async function createColumn(boardId, { name, position }) {
  const { data } = await api.post(`/columns/board/${boardId}`, { name, position })
  return data
}

// "changes" pode conter name e/ou position.
export async function updateColumn(columnId, changes) {
  await api.put(`/columns/${columnId}`, changes)
}

export async function deleteColumn(columnId) {
  await api.delete(`/columns/${columnId}`)
}

export async function createCard(columnId, payload) {
  const { data } = await api.post(`/cards/column/${columnId}`, payload)
  return data
}

// "changes" pode ser o card completo (edição) ou só alguns campos,
// como { completed } ou { columnId, position }.
export async function updateCard(cardId, changes) {
  const { data } = await api.put(`/cards/${cardId}`, changes)
  return data
}

export async function deleteCard(cardId) {
  await api.delete(`/cards/${cardId}`)
}

export async function createCardCalendarEvent(cardId) {
  const { data } = await api.post(`/cards/${cardId}/calendar-event`)
  return data
}
