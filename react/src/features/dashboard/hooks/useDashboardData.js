import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../../app/providers/AuthContext'
import { loadTarefasPorEmpresa } from '../services/dashboardService'
import {
  listarTarefas, calcularKpis, tarefasPorUsuario, tarefasPorStatus, tarefasPorPrioridade,
  ordenarPorMaisRecentes, filtrarTarefas,
} from '../utils/dashboardMetrics'

// "search" é o texto digitado na busca da barra superior. Ele filtra só a tabela de tarefas.
export function useDashboardData(empresaInicial, search = '') {
  const { user, companies } = useAuth()

  const [allData, setAllData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro,  setFiltro]  = useState(empresaInicial?.id ?? '')

  useEffect(() => {
    setFiltro(empresaInicial?.id ?? '')
  }, [empresaInicial?.id])

  useEffect(() => {
    if (companies.length === 0) { setLoading(false); return }
    loadAll()
  }, [companies.length])

  const loadAll = async () => {
    setLoading(true)
    try {
      setAllData(await loadTarefasPorEmpresa(companies))
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const empresaSelecionada = useMemo(() =>
    companies.find(c => c.id === Number(filtro)) ?? null
  , [companies, filtro])

  // Tarefas da empresa escolhida no seletor, ou de todas quando não há filtro.
  const tarefas = useMemo(() => {
    const dados = filtro ? allData.filter(d => d.empresa.id === Number(filtro)) : allData
    return listarTarefas(dados)
  }, [allData, filtro])

  const kpis          = useMemo(() => calcularKpis(tarefas),          [tarefas])
  const porUsuario    = useMemo(() => tarefasPorUsuario(tarefas),     [tarefas])
  const porStatus     = useMemo(() => tarefasPorStatus(kpis),         [kpis])
  const porPrioridade = useMemo(() => tarefasPorPrioridade(tarefas),  [tarefas])
  const ultimasTarefas = useMemo(() =>
    filtrarTarefas(ordenarPorMaisRecentes(tarefas), search)
  , [tarefas, search])

  const firstName      = (user?.nome || user?.name || '').trim().split(/\s+/)[0]
  const empresasAtivas = companies.filter(c => c.active !== false).length

  return {
    firstName, companies, empresasAtivas, loading,
    filtro, setFiltro, empresaSelecionada,
    kpis, porUsuario, porStatus, porPrioridade, ultimasTarefas,
  }
}
