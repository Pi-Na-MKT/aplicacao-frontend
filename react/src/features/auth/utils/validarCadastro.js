// Retorna um objeto { campo: mensagem } com os erros da etapa informada.
// Objeto vazio significa que a etapa está válida.
export function validarEtapaCadastro(step, form) {
  const e = {}
  if (step === 0) {
    if (!form.nome.trim()) e.nome = 'Nome é obrigatório.'
    else if (form.nome.trim().split(' ').length < 2) e.nome = 'Informe nome e sobrenome.'
    if (!form.email.trim()) e.email = 'E-mail é obrigatório.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido.'
    if (!form.senha) e.senha = 'Senha é obrigatória.'
    else if (form.senha.length < 6) e.senha = 'Mínimo 6 caracteres.'
    if (!form.confirmarSenha) e.confirmarSenha = 'Confirme a senha.'
    else if (form.senha !== form.confirmarSenha) e.confirmarSenha = 'Senhas não coincidem.'
  }
  if (step === 1 && !form.cargo.trim()) e.cargo = 'Cargo é obrigatório.'
  return e
}
