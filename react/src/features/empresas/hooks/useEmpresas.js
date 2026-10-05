import { useState, useEffect } from 'react'
import { useAuth } from '../../../app/providers/AuthContext'
import { listBoards } from '../../../shared/services/boardService'

// "search" é o texto digitado na busca da barra superior.
export function useEmpresas(search = '') {
  const { user, companies, fetchCompanies } = useAuth()
  const [loading, setLoading] = useState(false)
  // { [companyId]: quantidade de boards }. Fica null até a lista de boards chegar.
  const [boardCounts, setBoardCounts] = useState(null)

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN'
  const firstName = (user?.nome || user?.name || '').trim().split(/\s+/)[0]

  const loadBoardCounts = async () => {
    try {
      const boards = await listBoards()
      const counts = {}
      boards.forEach(b => {
        if (b.companyId != null) counts[b.companyId] = (counts[b.companyId] || 0) + 1
      })
      setBoardCounts(counts)
    } catch (err) {
      console.error('Erro ao buscar boards:', err)
    }
  }

  const reload = () => {
    setLoading(true)
    loadBoardCounts()
    fetchCompanies().finally(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  const termo = search.trim().toLowerCase()
  const filtered = companies.filter(e => e.nome.toLowerCase().includes(termo))

  // Quantidade de boards da empresa, ou null enquanto a lista não carregou.
  const boardCountOf = (companyId) => boardCounts ? (boardCounts[companyId] || 0) : null

  return { firstName, filtered, loading, isAdmin, boardCountOf, reload, refresh: fetchCompanies }
}
