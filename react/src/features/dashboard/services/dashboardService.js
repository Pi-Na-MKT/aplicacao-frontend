import { listBoards, listColumns, listCards } from '../../../shared/services/boardService'

// Para cada empresa, busca o board, as colunas (ordenadas) e os cards ativos.
// Retorna [{ empresa, colunas: [{ ...coluna, cards }] }]. Empresa sem board vem com colunas vazias.
export async function loadTarefasPorEmpresa(companies) {
  const boards = await listBoards()

  return Promise.all(
    companies.map(async (company) => {
      const board = boards.find(b => b.companyId === company.id)
      if (!board) return { empresa: company, colunas: [] }

      const cols = await listColumns(board.id)
      const ordenadas = [...cols].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

      const colunas = await Promise.all(
        ordenadas.map(async (col) => {
          const cards = await listCards(col.id)
          return { ...col, cards: cards.filter(c => c.isActive !== false) }
        })
      )
      return { empresa: company, colunas }
    })
  )
}
