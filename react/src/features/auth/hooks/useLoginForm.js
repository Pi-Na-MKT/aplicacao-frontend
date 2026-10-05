import { useState } from 'react'
import { useAuth } from '../../../app/providers/AuthContext'
import { getLoginErrorMessage } from '../utils/loginErrorMessage'

export function useLoginForm() {
  const { login } = useAuth()
  const [email, setEmail]     = useState('')
  const [senha, setSenha]     = useState('')
  const [erro, setErro]       = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    if (!email || !senha) { setErro('Preencha e-mail e senha.'); return }
    setLoading(true)
    try {
      await login(email, senha)
    } catch (err) {
      setErro(getLoginErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return { email, setEmail, senha, setSenha, erro, loading, handleSubmit }
}
