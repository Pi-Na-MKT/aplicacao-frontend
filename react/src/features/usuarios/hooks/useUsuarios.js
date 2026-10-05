import { useState, useEffect } from 'react'
import { useAuth } from '../../../app/providers/AuthContext'
import { getErrorMessage } from '../../../shared/services/api'
import { updateUser, deleteUser } from '../services/usuarioService'

// "search" é o texto digitado na busca da barra superior.
export function useUsuarios(search = '') {
  const { user: loggedUser, registeredUsers, fetchUsers } = useAuth()
  const [lista,      setLista]      = useState([])
  const [busca,      setBusca]      = useState('')
  const [carregando, setCarregando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [erroDelete, setErroDelete] = useState(null)
  const [excluindo,  setExcluindo]  = useState(false)

  const isAdmin  = loggedUser?.role?.toUpperCase() === 'ADMIN'
  const isOwnRow = (u) => String(u.id) === String(loggedUser?.id)

  useEffect(() => { setCarregando(true); fetchUsers().finally(() => setCarregando(false)) }, [])
  useEffect(() => { setLista(registeredUsers.map(u => ({ ...u }))) }, [registeredUsers])

  // A lista é filtrada pela busca da página e pela busca da barra superior.
  // Quando as duas estão preenchidas, o usuário precisa atender às duas.
  const contemTermo = (u, texto) => {
    const termo = texto.trim().toLowerCase()
    if (!termo) return true
    return [(u.nome || u.name), (u.cargo || u.jobTitle)].some(v => v?.toLowerCase().includes(termo))
  }
  const filtrados = lista.filter(u => contemTermo(u, busca) && contemTermo(u, search))

  const usuarioEditando = editandoId ? lista.find(u => u.id === editandoId) : null

  const salvarUsuario = async (u) => {
    try {
      const data = await updateUser(u.id, u)
      const atualizado = {
        ...usuarioEditando,
        ...data,
        nome:  data.name     ?? usuarioEditando.nome,
        cargo: data.jobTitle ?? usuarioEditando.cargo,
      }
      setLista(p => p.map(x => x.id === u.id ? atualizado : x))
      setEditandoId(null)
    } catch (err) {
      console.error('Erro ao editar usuário:', err)
    }
  }

  const cancelarExclusao = () => { setConfirmDel(null); setErroDelete(null) }

  const confirmarExclusao = async () => {
    if (!confirmDel?.id) { setErroDelete('ID inválido.'); return }
    setExcluindo(true)
    setErroDelete(null)
    try {
      await deleteUser(confirmDel.id)
      setConfirmDel(null)
      await fetchUsers()
    } catch (err) {
      setErroDelete(getErrorMessage(err, `Erro ${err.response?.status || ''}: não foi possível excluir.`))
    } finally {
      setExcluindo(false)
    }
  }

  return {
    lista, filtrados, busca, setBusca, carregando,
    isAdmin, isOwnRow,
    editandoId, setEditandoId, usuarioEditando, salvarUsuario,
    confirmDel, setConfirmDel, erroDelete, excluindo, cancelarExclusao, confirmarExclusao,
  }
}
