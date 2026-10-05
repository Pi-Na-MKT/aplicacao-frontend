import { useState } from 'react'
import { getErrorMessage } from '../../../shared/services/api'
import { createCard, updateCard } from '../services/tarefaService'

// Formulário de criação e edição de card. Com initialCard, edita; sem ele, cria na coluna informada.
export function useCardForm({ columnId, initialCard, position, onSaved }) {
  const isEdit = !!initialCard
  const [form, setForm] = useState({
    title:    initialCard?.titulo      || '',
    desc:     initialCard?.descricao   || '',
    priority: initialCard?.rawPriority || 'MEDIUM',
    dueDate:  initialCard?.rawDueDate
      ? new Date(initialCard.rawDueDate).toISOString().slice(0, 10)
      : '',
  })
  const [assignedIds, setAssignedIds] = useState(
    () => new Set((initialCard?.assignedUserIds || []).map(Number))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const toggleUser = (id) =>
    setAssignedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Título é obrigatório.'); return }
    setLoading(true)
    setError('')
    try {
      const payload = {
        title:           form.title.trim(),
        description:     form.desc.trim() || null,
        priority:        form.priority,
        position,
        dueDate:         form.dueDate ? form.dueDate + 'T00:00:00' : null,
        isActive:        true,
        assignedUserIds: [...assignedIds],
      }
      const data = isEdit
        ? await updateCard(initialCard.id, payload)
        : await createCard(columnId, payload)
      onSaved(data)
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao salvar card.'))
    } finally {
      setLoading(false)
    }
  }

  return { isEdit, form, set, assignedIds, toggleUser, loading, error, setError, handleSubmit }
}
