import api from '../../../shared/services/api'

export async function listAttachments(empresaId) {
  const { data } = await api.get(`/attachments/company/${empresaId}`)
  return data
}

export async function uploadAttachments(empresaId, files) {
  const formData = new FormData()
  Array.from(files).forEach(f => formData.append('files', f))

  const { data } = await api.post(`/attachments/company/${empresaId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteAttachment(anexoId) {
  await api.delete(`/attachments/${anexoId}`)
}

// Retorna o conteúdo do arquivo como Blob.
export async function downloadAttachment(anexoId) {
  const { data } = await api.get(`/attachments/${anexoId}/download`, { responseType: 'blob' })
  return data
}
