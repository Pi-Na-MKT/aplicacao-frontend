import api from './api'

// Leituras de boards, colunas e cards. Ficam em shared porque são usadas por
// mais de uma feature (tarefas, dashboard e usuarios). As operações de escrita
// ficam no service da feature que as utiliza.

export async function listBoards() {
  const { data } = await api.get('/boards')
  return data
}

export async function listColumns(boardId) {
  const { data } = await api.get(`/columns/board/${boardId}`)
  return data
}

export async function listCards(columnId) {
  const { data } = await api.get(`/cards/column/${columnId}`)
  return data
}
