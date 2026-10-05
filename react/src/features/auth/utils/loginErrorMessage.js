export function getLoginErrorMessage(err) {
  // 423: conta bloqueada temporariamente após tentativas com senha errada.
  if (err.response?.status === 423) {
    const minutos = err.response.data?.minutes_remaining
    return minutos
      ? `Conta bloqueada por excesso de tentativas. Tente novamente em ${minutos} minuto(s).`
      : 'Conta bloqueada por excesso de tentativas. Tente novamente mais tarde.'
  }
  return err.response?.data?.detail || err.response?.data?.message || 'E-mail ou senha inválidos.'
}
