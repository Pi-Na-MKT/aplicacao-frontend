import { useState } from 'react'
import { getErrorMessage } from '../../../shared/services/api'
import { createCompany } from '../services/empresaService'
import { toSlug, sanitizeSlug } from '../utils/slug'

export function useNewCompanyForm({ onCreated }) {
  const [form, setForm]             = useState({ nome: '', slug: '', active: true })
  const [slugManual, setSlugManual] = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // O slug acompanha o nome até o usuário editar o slug manualmente.
  const handleName = (v) => { set('nome', v); if (!slugManual) set('slug', toSlug(v)) }
  const handleSlug = (v) => { setSlugManual(true); set('slug', sanitizeSlug(v)) }
  const toggleActive = () => set('active', !form.active)

  const handleSubmit = async () => {
    if (!form.nome.trim()) { setError('Nome é obrigatório.'); return }
    if (!form.slug.trim()) { setError('Slug é obrigatório.'); return }
    setError('')
    setLoading(true)
    try {
      const data = await createCompany(form)
      onCreated(data)
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao criar empresa.'))
    } finally {
      setLoading(false)
    }
  }

  return { form, slugManual, error, loading, handleName, handleSlug, toggleActive, handleSubmit }
}
