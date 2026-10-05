import React, { useState, useId } from 'react'
import AvatarNeutro from '../../../shared/components/AvatarNeutro'
import { statusDaTarefa } from '../utils/dashboardMetrics'

const LIMITE = 5

const PRIORIDADES = {
  LOW:      { label: 'Baixa',   classe: 'bg-violet-100 text-violet-700' },
  MEDIUM:   { label: 'Média',   classe: 'bg-amber-100 text-amber-700'   },
  HIGH:     { label: 'Alta',    classe: 'bg-red-100 text-red-600'       },
  CRITICAL: { label: 'Urgente', classe: 'bg-rose-100 text-rose-700'     },
}

const STATUS = {
  concluida: { label: 'Concluída',    classe: 'bg-emerald-100 text-emerald-700' },
  andamento: { label: 'Em andamento', classe: 'bg-blue-100 text-blue-700'       },
  atrasada:  { label: 'Atrasada',     classe: 'bg-orange-100 text-orange-700'   },
}

const COLUNAS = ['Tarefa', 'Usuário responsável', 'Empresa', 'Prioridade', 'Status', 'Prazo']

const formatarPrazo = (data) =>
  data ? new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '—'

function Selo({ label, classe }) {
  return <span className={`inline-block whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium ${classe}`}>{label}</span>
}

function Responsavel({ usuarios }) {
  if (usuarios.length === 0) return <span className="text-pina-text-light">—</span>
  const [primeiro, ...outros] = usuarios
  return (
    <span className="flex items-center gap-2.5">
      {primeiro.avatarUrl
        ? <img src={primeiro.avatarUrl} className="h-6 w-6 flex-shrink-0 rounded-full object-cover" alt="" />
        : <AvatarNeutro className="h-6 w-6" />}
      <span className="truncate">{primeiro.name}</span>
      {outros.length > 0 && (
        <span className="flex-shrink-0 text-pina-text-light" title={outros.map(u => u.name).join(', ')}>+{outros.length}</span>
      )}
    </span>
  )
}

// "tarefas" já chega ordenada da mais nova para a mais antiga e filtrada pela busca.
// Com busca ativa ("buscando"), a tabela mostra todos os resultados.
export default function UltimasTarefas({ tarefas, buscando }) {
  const tituloId = useId()
  const [mostrarTodas, setMostrarTodas] = useState(false)

  const visiveis = buscando || mostrarTodas ? tarefas : tarefas.slice(0, LIMITE)

  return (
    <section aria-labelledby={tituloId} className="rounded-card border border-pina-border bg-pina-surface p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id={tituloId} className="text-base font-semibold text-pina-primary">Últimas tarefas</h2>
        {!buscando && tarefas.length > LIMITE && (
          <button
            type="button"
            onClick={() => setMostrarTodas(v => !v)}
            className="rounded text-xs font-semibold text-pina-secondary transition duration-base ease-base hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40"
          >
            {mostrarTodas ? 'Ver menos' : 'Ver todas →'}
          </button>
        )}
      </div>

      {tarefas.length === 0 ? (
        <p className="py-8 text-center text-sm text-pina-text-light">Nenhuma tarefa corresponde à busca.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr className="bg-pina-background">
                {COLUNAS.map(coluna => (
                  <th key={coluna} scope="col" className="px-3 py-2.5 text-xs font-medium text-pina-text-light first:rounded-l-lg last:rounded-r-lg">
                    {coluna}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-pina-border">
              {visiveis.map(tarefa => (
                <tr key={tarefa.id}>
                  <td className="max-w-[260px] truncate px-3 py-3 font-medium text-pina-primary" title={tarefa.title}>{tarefa.title || 'Sem título'}</td>
                  <td className="max-w-[200px] px-3 py-3 text-pina-text"><Responsavel usuarios={tarefa.assignedUsers || []} /></td>
                  <td className="max-w-[180px] truncate px-3 py-3 text-pina-text">{tarefa.empresa.nome}</td>
                  <td className="px-3 py-3"><Selo {...PRIORIDADES[tarefa.priority || 'MEDIUM']} /></td>
                  <td className="px-3 py-3"><Selo {...STATUS[statusDaTarefa(tarefa)]} /></td>
                  <td className="whitespace-nowrap px-3 py-3 text-pina-text">{formatarPrazo(tarefa.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
