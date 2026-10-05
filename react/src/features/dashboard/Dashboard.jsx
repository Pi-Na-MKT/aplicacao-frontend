import React from 'react'
import Spinner from '../../shared/components/Spinner'
import TopbarPortal from '../../shared/components/TopbarPortal'
import KPI from './components/KPI'
import SeletorEmpresa from './components/SeletorEmpresa'
import TarefasPorUsuario from './components/TarefasPorUsuario'
import TarefasPorStatus from './components/TarefasPorStatus'
import TarefasPorPrioridade from './components/TarefasPorPrioridade'
import UltimasTarefas from './components/UltimasTarefas'
import { useDashboardData } from './hooks/useDashboardData'

const ICON_TAREFAS   = 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
const ICON_ANDAMENTO = 'M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z'
const ICON_CONCLUIDA = 'M4.5 12.75l6 6 9-13.5'
const ICON_EMPRESAS  = 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21'

// "Quinta-feira, 1 de outubro de 2026"
function dataDeHoje() {
  const texto = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

const Destaque = ({ children }) => <span className="font-semibold text-emerald-600">{children}</span>

// "search" vem da busca da barra superior (ver app/App.jsx).
export default function Dashboard({ empresaInicial = null, onBack = null, search = '' }) {
  const {
    firstName, companies, empresasAtivas, loading,
    filtro, setFiltro, empresaSelecionada,
    kpis, porUsuario, porStatus, porPrioridade, ultimasTarefas,
  } = useDashboardData(empresaInicial, search)

  const seletor = (
    <SeletorEmpresa
      companies={companies}
      filtro={filtro}
      onChange={setFiltro}
      empresaSelecionada={empresaSelecionada}
      totalTarefas={kpis.total}
    />
  )

  const pctEmpresasAtivas = companies.length > 0 ? Math.round((empresasAtivas / companies.length) * 100) : 0

  return (
    <div className="animate-fade-up px-4 pb-10 pt-6 font-poppins lg:px-7">

      {/* Em telas grandes o seletor de empresa aparece na barra superior.
          Nas menores, a barra não tem espaço e ele aparece aqui na página. */}
      <TopbarPortal>{seletor}</TopbarPortal>
      <div className="mb-5 lg:hidden">{seletor}</div>

      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold text-pina-primary">{firstName ? `Olá, ${firstName}!` : 'Olá!'}</h1>
          <p className="mt-1 text-sm text-pina-text-light">
            Aqui está um resumo da sua jornada {empresaSelecionada ? `em ${empresaSelecionada.nome}` : 'no PINA'}.
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex h-9 items-center gap-1.5 rounded-button border border-pina-border bg-pina-surface px-3 text-xs font-semibold text-pina-text transition duration-base ease-base hover:border-pina-secondary/40 hover:text-pina-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Voltar
            </button>
          )}
          <p className="flex items-center gap-2 text-[13px] text-pina-text">
            <svg className="h-4 w-4 text-pina-secondary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            {dataDeHoje()}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-24">
          <Spinner className="text-pina-secondary"/>
          <span className="text-sm text-pina-text-light">Carregando dados...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">

          <ul aria-label="Indicadores" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KPI label="Total de tarefas" valor={kpis.total} icon={ICON_TAREFAS}>
              em <Destaque>{kpis.empresasComTarefas}</Destaque> empresa{kpis.empresasComTarefas !== 1 ? 's' : ''}
            </KPI>
            <KPI label="Em andamento" valor={kpis.andamento} icon={ICON_ANDAMENTO}>
              <Destaque>{kpis.pctAndamento}%</Destaque> do total
              {kpis.atrasadas > 0 && (
                <span className="font-semibold text-amber-600"> · {kpis.atrasadas} atrasada{kpis.atrasadas !== 1 ? 's' : ''}</span>
              )}
            </KPI>
            <KPI label="Concluídas" valor={kpis.concluidas} icon={ICON_CONCLUIDA} tom="verde">
              <Destaque>{kpis.pctConcluidas}%</Destaque> do total
            </KPI>
            <KPI label="Empresas ativas" valor={empresasAtivas} icon={ICON_EMPRESAS}>
              <Destaque>{pctEmpresasAtivas}%</Destaque> das cadastradas
            </KPI>
          </ul>

          {kpis.total === 0 ? (
            <div className="rounded-card border border-pina-border bg-pina-surface p-16 text-center shadow-card">
              <p className="text-sm font-medium text-pina-text">Nenhuma tarefa criada ainda.</p>
              <p className="mt-1 text-xs text-pina-text-light">Os gráficos aparecem assim que os boards tiverem tarefas.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
                <TarefasPorUsuario usuarios={porUsuario} />
                <div className="flex flex-col gap-4">
                  <TarefasPorStatus status={porStatus} total={kpis.total} />
                  <TarefasPorPrioridade prioridades={porPrioridade} />
                </div>
              </div>

              <UltimasTarefas tarefas={ultimasTarefas} buscando={search.trim() !== ''} />
            </>
          )}
        </div>
      )}
    </div>
  )
}
