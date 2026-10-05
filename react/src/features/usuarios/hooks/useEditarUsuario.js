import { useState, useEffect } from 'react'
import { listBoards } from '../../../shared/services/boardService'
import { getUser, updateBoardMembers } from '../services/usuarioService'

export function useEditarUsuario(usuarioId, usuarioInicial) {
  const [loadingData, setLoadingData] = useState(true)
  const [preview,     setPreview]     = useState(usuarioInicial?.avatarUrl || '')
  const [boardsMap,   setBoardsMap]   = useState({})        // { [companyId]: { id, name, memberIds } }
  const [companyIds,  setCompanyIds]  = useState(new Set()) // empresas às quais o usuário tem acesso
  const [savingCo,    setSavingCo]    = useState(null)

  const [form, setForm] = useState({
    nome: usuarioInicial?.nome || usuarioInicial?.name || '',
    email: '', role: '',
    cargo: usuarioInicial?.cargo || usuarioInicial?.jobTitle || '',
    phone: '', seniority: '', bio: '', responsibility: '', linkedin: '',
    avatarUrl: usuarioInicial?.avatarUrl || '',
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const setAvatar = (dataUrl) => { setPreview(dataUrl); set('avatarUrl', dataUrl) }

  useEffect(() => {
    const load = async () => {
      try {
        const [userData, boards] = await Promise.all([
          getUser(usuarioId),
          listBoards(),
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

      await updateBoardMembers(board.id, newIds)

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

  return { loadingData, preview, form, set, setAvatar, boardsMap, companyIds, savingCo, handleToggleCompany }
}
