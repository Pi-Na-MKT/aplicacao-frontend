import React, { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function KPI({ label, valor, sub, cor = 'text-gray-900', icon }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="p-1.5 bg-primary/10 rounded-lg text-primary">{icon}</div>
        {sub && <span className="text-[11px] font-semibold text-amber-500">{sub}</span>}
      </div>
      <p className={`text-2xl font-bold leading-none ${cor}`}>{valor}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

export default function Dashboard({ empresaInicial = null, onBack = null }) {
  const { companies } = useAuth()

  const [allData,   setAllData]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filtro,    setFiltro]    = useState(empresaInicial?.id ?? '')

  useEffect(() => {
    setFiltro(empresaInicial?.id ?? '')
  }, [empresaInicial?.id])

  useEffect(() => {
    if (companies.length === 0) return
    loadAll()
  }, [companies.length])

  const loadAll = async () => {
    setLoading(true)
    try {
      const { data: boards } = await api.get('/boards')

      const results = await Promise.all(
        companies.map(async (company) => {
          const board = boards.find(b => b.companyId === company.id)
          if (!board) return { empresa: company, colunas: [] }

          const { data: cols } = await api.get(`/columns/board/${board.id}`)
          const ordenadas = [...cols].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

          const colunas = await Promise.all(
            ordenadas.map(async (col) => {
              const { data: cards } = await api.get(`/cards/column/${col.id}`)
              return { ...col, cards: cards.filter(c => c.isActive !== false) }
            })
          )
          return { empresa: company, colunas }
        })
      )
      setAllData(results)
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const dadosFiltrados = useMemo(() =>
    filtro ? allData.filter(d => d.empresa.id === Number(filtro)) : allData
  , [allData, filtro])

  const empresaSelecionada = useMemo(() =>
    companies.find(c => c.id === Number(filtro)) ?? null
  , [companies, filtro])

  const kpis = useMemo(() => {
    const now = new Date()
    const allCards = dadosFiltrados.flatMap(d => d.colunas.flatMap(c => c.cards))
    const total     = allCards.length
    const concluidas = allCards.filter(c => c.completed).length
    const atrasadas  = allCards.filter(c => !c.completed && c.dueDate && new Date(c.dueDate) < now).length
    const taxa = total > 0 ? Math.round((concluidas / total) * 100) : 0
    return { total, concluidas, andamento: total - concluidas, atrasadas, taxa }
  }, [dadosFiltrados])

  const chartData = useMemo(() => {
    return dadosFiltrados.map(d => {
      const cards     = d.colunas.flatMap(c => c.cards)
      const concluidas = cards.filter(c => c.completed).length
      return {
        label:      d.empresa.nome.length > 12 ? d.empresa.nome.slice(0, 10) + '…' : d.empresa.nome,
        concluidas,
        pendentes:  cards.length - concluidas,
      }
    })
  }, [dadosFiltrados])

  const chartTitle = filtro ? 'Concluídas vs Pendentes' : 'Tarefas por empresa'

  const membrosData = useMemo(() => {
    const userMap = {}
    const now = new Date()
    dadosFiltrados.forEach(({ colunas }) => {
      colunas.forEach(col => {
        col.cards.forEach(card => {
          ;(card.assignedUsers || []).forEach(u => {
            if (!userMap[u.id]) {
              userMap[u.id] = { nome: u.name, cargo: u.jobTitle || '—', concluidas: 0, andamento: 0, atrasadas: 0 }
            }
            if (card.completed) {
              userMap[u.id].concluidas++
            } else {
              userMap[u.id].andamento++
              if (card.dueDate && new Date(card.dueDate) < now) userMap[u.id].atrasadas++
            }
          })
        })
      })
    })
    return Object.values(userMap).sort((a, b) => b.concluidas - a.concluidas)
  }, [dadosFiltrados])

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#F4F5F7]">

      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-400">
              {empresaSelecionada ? empresaSelecionada.nome : `${companies.length} empresa${companies.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
            </svg>
            <select
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              className="text-xs py-1.5 pl-2 pr-7 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer text-gray-700"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 6px center',
                backgroundSize: '12px',
              }}
            >
              <option value="">Todas as empresas</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          {onBack && (
            <button onClick={onBack}
              className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Voltar
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Spinner/>
            <span className="text-sm text-gray-400">Carregando dados...</span>
          </div>
        </div>
      )}

      {!loading && (
        <div className="flex-1 overflow-hidden p-4 flex flex-col gap-4 min-h-0">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
            <KPI
              label="Total de tarefas"
              valor={kpis.total}
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}
            />
            <KPI
              label="Concluídas"
              valor={kpis.concluidas}
              cor="text-emerald-600"
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
            />
            <KPI
              label="Em andamento"
              valor={kpis.andamento}
              sub={kpis.atrasadas > 0 ? `${kpis.atrasadas} atrasada${kpis.atrasadas !== 1 ? 's' : ''}` : null}
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}
            />
            <KPI
              label="Taxa de conclusão"
              valor={`${kpis.taxa}%`}
              cor={kpis.taxa >= 75 ? 'text-emerald-600' : kpis.taxa >= 40 ? 'text-amber-500' : 'text-red-500'}
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
            />
          </div>

          <div className="flex-shrink-0 bg-white rounded-xl border border-gray-100 p-4" style={{ height: '210px' }}>
            <p className="text-xs font-semibold text-gray-700 mb-1">{chartTitle}</p>
            {chartData.length > 0 && chartData.some(d => d.concluidas + d.pendentes > 0) ? (
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={chartData} margin={{ top: 4, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '11px' }}
                    formatter={(v, name) => [v, name === 'concluidas' ? 'Concluídas' : 'Pendentes']}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={7}
                    wrapperStyle={{ fontSize: '10px', paddingTop: '2px' }}
                    formatter={v => v === 'concluidas' ? 'Concluídas' : 'Pendentes'}
                  />
                  <Bar dataKey="concluidas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pendentes"  fill="#5B4FE8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[140px]">
                <p className="text-sm text-gray-400">Nenhuma tarefa encontrada.</p>
              </div>
            )}
          </div>

          <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col min-h-0">
            <div className="px-5 py-3 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-700">Desempenho individual</p>
              {membrosData.length > 0 && (
                <span className="text-[11px] text-gray-400">{membrosData.length} membro{membrosData.length !== 1 ? 's' : ''}</span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {membrosData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <p className="text-sm text-gray-400">
                    {kpis.total === 0
                      ? 'Nenhuma tarefa criada ainda.'
                      : 'Nenhum membro atribuído às tarefas.'}
                  </p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-gray-100">
                      {['Membro', 'Cargo', 'Concluídas', 'Andamento', 'Atrasadas', 'Taxa'].map(h => (
                        <th key={h} className="text-left py-2.5 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {membrosData.map((m, i) => {
                      const total = m.concluidas + m.andamento
                      const taxa  = total > 0 ? Math.round((m.concluidas / total) * 100) : 0
                      return (
                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-4 font-semibold text-gray-900 text-xs">{m.nome}</td>
                          <td className="py-3 px-4 text-gray-500 text-xs">{m.cargo}</td>
                          <td className="py-3 px-4 text-emerald-600 font-semibold text-xs">{m.concluidas}</td>
                          <td className="py-3 px-4 text-blue-600 text-xs">{m.andamento}</td>
                          <td className="py-3 px-4 text-xs">
                            <span className={m.atrasadas > 0 ? 'text-amber-500 font-semibold' : 'text-gray-400'}>{m.atrasadas}</span>
                          </td>
                          <td className="py-3 px-4 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                <div className="h-full rounded-full transition-all"
                                  style={{ width: `${taxa}%`, background: taxa >= 75 ? '#10b981' : taxa >= 40 ? '#f59e0b' : '#ef4444' }}/>
                              </div>
                              <span className="text-gray-600">{taxa}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
