export function tipoArquivo(nome) {
  const ext = (nome || '').split('.').pop().toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return 'image'
  if (['doc','docx'].includes(ext)) return 'doc'
  if (['xls','xlsx','csv'].includes(ext)) return 'xls'
  return 'other'
}

// Uma casa decimal no padrão brasileiro: 2.4 -> "2,4"
const umaCasa = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return umaCasa(bytes / 1024) + ' KB'
  return umaCasa(bytes / 1048576) + ' MB'
}

export function formatDate(d) {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date)) return '—'
  return date.toLocaleDateString('pt-BR')
}

// Empresas que combinam com a busca: pelo nome da empresa ou pelo nome de
// algum arquivo dela. Busca vazia devolve todas.
// "anexos" tem o formato { [empresaId]: anexo[] }.
export function filtrarEmpresasPorBusca(empresas, anexos, search) {
  const termo = (search || '').trim().toLowerCase()
  if (!termo) return empresas
  return empresas.filter(emp =>
    emp.nome.toLowerCase().includes(termo) ||
    (anexos[emp.id] || []).some(a => (a.fileName || '').toLowerCase().includes(termo))
  )
}

// Dispara o download de um Blob no navegador usando um link temporário.
export function baixarBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}
