// Funções puras que transformam os dados carregados ([{ empresa, colunas }])
// nos números exibidos no dashboard. Nenhuma delas acessa a API ou o estado.

const PRIORIDADES = [
  { chave: 'LOW',      label: 'Baixa'   },
  { chave: 'MEDIUM',   label: 'Média'   },
  { chave: 'HIGH',     label: 'Alta'    },
  { chave: 'CRITICAL', label: 'Urgente' },
]

const porcentagem = (parte, total) => total > 0 ? Math.round((parte / total) * 100) : 0

// Junta as tarefas de todas as empresas em uma lista só. Cada tarefa leva a empresa dela.
export function listarTarefas(dados) {
  return dados.flatMap(d =>
    d.colunas.flatMap(col => col.cards.map(card => ({ ...card, empresa: d.empresa })))
  )
}

// A tarefa não tem campo de status. Ele é deduzido de "completed" e do prazo.
export function statusDaTarefa(tarefa, now = new Date()) {
  if (tarefa.completed) return 'concluida'
  if (tarefa.dueDate && new Date(tarefa.dueDate) < now) return 'atrasada'
  return 'andamento'
}

export function calcularKpis(tarefas, now = new Date()) {
  const total      = tarefas.length
  const concluidas = tarefas.filter(t => statusDaTarefa(t, now) === 'concluida').length
  const atrasadas  = tarefas.filter(t => statusDaTarefa(t, now) === 'atrasada').length
  const andamento  = total - concluidas   // inclui as atrasadas
  return {
    total, concluidas, andamento, atrasadas,
    noPrazo:            andamento - atrasadas,
    pctConcluidas:      porcentagem(concluidas, total),
    pctAndamento:       porcentagem(andamento, total),
    empresasComTarefas: new Set(tarefas.map(t => t.empresa.id)).size,
  }
}

// Uma linha por responsável, de quem tem mais tarefas para quem tem menos.
// "pct" é a parte do total de tarefas que está com a pessoa. Como uma tarefa pode
// ter mais de um responsável, a soma das porcentagens pode passar de 100%.
export function tarefasPorUsuario(tarefas, now = new Date()) {
  const porId = {}
  tarefas.forEach(tarefa => {
    const status = statusDaTarefa(tarefa, now)
    const responsaveis = tarefa.assignedUsers || []
    responsaveis.forEach(u => {
      if (!porId[u.id]) {
        porId[u.id] = { id: u.id, nome: u.name, avatarUrl: u.avatarUrl || '', total: 0, concluidas: 0, andamento: 0, atrasadas: 0 }
      }
      const linha = porId[u.id]
      linha.total++
      if (status === 'concluida') linha.concluidas++
      else linha.andamento++
      if (status === 'atrasada') linha.atrasadas++
    })
  })
  return Object.values(porId)
    .map(linha => ({ ...linha, pct: porcentagem(linha.total, tarefas.length) }))
    .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome))
}

export function tarefasPorStatus(kpis) {
  return [
    { chave: 'concluida', label: 'Concluídas', valor: kpis.concluidas },
    { chave: 'andamento', label: 'No prazo',   valor: kpis.noPrazo    },
    { chave: 'atrasada',  label: 'Atrasadas',  valor: kpis.atrasadas  },
  ].map(item => ({ ...item, pct: porcentagem(item.valor, kpis.total) }))
}

// Tarefa sem prioridade conta como "Média", o mesmo padrão usado no Kanban.
export function tarefasPorPrioridade(tarefas) {
  return PRIORIDADES.map(({ chave, label }) => ({
    chave, label,
    valor: tarefas.filter(t => (t.priority || 'MEDIUM') === chave).length,
  }))
}

// Da mais nova para a mais antiga, pela data de criação. Sem data, usa o id.
export function ordenarPorMaisRecentes(tarefas) {
  return [...tarefas].sort((a, b) =>
    new Date(b.createdAt || 0) - new Date(a.createdAt || 0) || b.id - a.id
  )
}

// Busca pelo título, pelo nome de um responsável ou pelo nome da empresa.
export function filtrarTarefas(tarefas, search) {
  const termo = (search || '').trim().toLowerCase()
  if (!termo) return tarefas
  return tarefas.filter(t =>
    [t.title, t.empresa.nome, ...(t.assignedUsers || []).map(u => u.name)]
      .some(texto => (texto || '').toLowerCase().includes(termo))
  )
}
