import api from '../../../shared/services/api'

export async function listCompanies() {
  const { data } = await api.get('/companies')
  return data
}

export async function createCompany({ nome, slug, active }) {
  const { data } = await api.post('/companies', { name: nome.trim(), slug: slug.trim(), active })
  return data
}

export async function linkCompanyCalendar(companyId) {
  const { data } = await api.post(`/companies/${companyId}/calendar`)
  return data
}
