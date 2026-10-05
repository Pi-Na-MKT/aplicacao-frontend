import { useState } from 'react'
import { registerUser } from '../services/authService'
import { validarEtapaCadastro } from '../utils/validarCadastro'

const FORM_INICIAL = { nome: '', email: '', telefone: '', senha: '', confirmarSenha: '', cargo: '', senioridade: '', canais: [], bio: '', linkedin: '' }

// Tempo da animação de troca de etapa. A etapa só muda depois que a animação de saída termina.
const DURACAO_TRANSICAO_MS = 200

export function useCadastroForm() {
  const [step, setStep]             = useState(0)
  const [dir, setDir]               = useState(1)
  const [anim, setAnim]             = useState(false)
  const [loading, setLoading]       = useState(false)
  const [sucesso, setSucesso]       = useState(false)
  const [erroGlobal, setErroGlobal] = useState('')
  const [erros, setErros]           = useState({})
  const [usuarioCriado, setUsuarioCriado] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [form, setForm]             = useState(FORM_INICIAL)

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErros(p => ({ ...p, [k]: '' })); setErroGlobal('') }
  const toggleCanal = c => setForm(p => ({ ...p, canais: p.canais.includes(c) ? p.canais.filter(x => x !== c) : [...p.canais, c] }))

  const goNext = () => {
    const e = validarEtapaCadastro(step, form)
    if (Object.keys(e).length) { setErros(e); return }
    setDir(1); setAnim(true)
    setTimeout(() => { setStep(s => s + 1); setAnim(false) }, DURACAO_TRANSICAO_MS)
  }
  const goBack = () => {
    setDir(-1); setAnim(true)
    setTimeout(() => { setStep(s => s - 1); setAnim(false) }, DURACAO_TRANSICAO_MS)
  }

  const handleSubmit = async () => {
    setErroGlobal(''); setLoading(true)
    try {
      const data = await registerUser(form)
      setUsuarioCriado({ ...data, nome: data.name ?? form.nome, cargo: data.jobTitle ?? form.cargo, avatar: avatarPreview })
      setSucesso(true)
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Erro ao cadastrar. Tente novamente.'
      setErroGlobal(typeof msg === 'string' ? msg : 'Erro ao cadastrar.')
    } finally { setLoading(false) }
  }

  const resetForm = () => { setSucesso(false); setStep(0); setAvatarPreview(null); setForm(FORM_INICIAL) }

  return {
    step, dir, anim, loading, sucesso, erroGlobal, erros, usuarioCriado,
    avatarPreview, setAvatarPreview,
    form, set, toggleCanal,
    goNext, goBack, handleSubmit, resetForm,
  }
}
