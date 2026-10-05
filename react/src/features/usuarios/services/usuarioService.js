import api from '../../../shared/services/api'

export async function listUsers() {
  const { data } = await api.get('/users')
  return data
}

export async function getUser(userId) {
  const { data } = await api.get(`/users/${userId}`)
  return data
}

// Converte os nomes dos campos do formulário para os nomes esperados pela API.
export async function updateUser(userId, form) {
  const payload = {
    name:           form.nome           || '',
    jobTitle:       form.cargo          || '',
    phone:          form.phone          || '',
    seniority:      form.seniority      || '',
    bio:            form.bio            || '',
    responsibility: form.responsibility || '',
    linkedin:       form.linkedin       || '',
    avatarUrl:      form.avatarUrl      || '',
  }
  const { data } = await api.put(`/users/${userId}`, payload)
  return data
}

export async function deleteUser(userId) {
  await api.delete(`/users/${userId}`)
}

// O acesso de um usuário a uma empresa é definido pelos membros do board dela.
export async function updateBoardMembers(boardId, userIds) {
  await api.put(`/boards/${boardId}`, { userIds })
}
