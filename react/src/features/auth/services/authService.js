import api from '../../../shared/services/api'

export async function login(email, senha) {
  const { data } = await api.post('/users/login', { email, password: senha })
  return data
}

// Converte os nomes dos campos do formulário para os nomes esperados pela API.
// Campos opcionais vazios são enviados como null.
export async function registerUser(form) {
  const payload = {
    name:           form.nome,
    email:          form.email,
    password:       form.senha,
    phone:          form.telefone || null,
    jobTitle:       form.cargo || null,
    seniority:      form.senioridade || null,
    responsibility: form.canais.length ? form.canais.join(', ') : null,
    bio:            form.bio || null,
    linkedin:       form.linkedin || null,
  }
  const { data } = await api.post('/users/register', payload)
  return data
}
