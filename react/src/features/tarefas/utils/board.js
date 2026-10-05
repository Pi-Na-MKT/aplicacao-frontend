const PRIORITY_MAP = { HIGH: 'high', MEDIUM: 'medium', LOW: 'low', CRITICAL: 'high' }

// Cards (já no formato da tela) que combinam com a busca: pelo título, pela
// descrição ou pelo nome de um responsável. Busca vazia devolve todos.
export function filtrarCards(cards, search) {
  const termo = (search || '').trim().toLowerCase()
  if (!termo) return cards
  return cards.filter(card =>
    [card.titulo, card.descricao, ...card.assignedUsers.map(u => u.name)]
      .some(texto => (texto || '').toLowerCase().includes(termo))
  )
}

export const ordenarPorPosicao = (itens) =>
  [...itens].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

// Converte o card recebido da API para o formato usado pela tela.
export const mapCard = (card) => ({
  id:                    card.id,
  titulo:                card.title       || 'Sem título',
  descricao:             card.description || '',
  prioridade:            PRIORITY_MAP[card.priority] || 'low',
  rawPriority:           card.priority    || 'MEDIUM',
  rawDueDate:            card.dueDate     || null,
  dueDate:               card.dueDate     || null,
  position:              card.position    ?? 0,
  completed:             card.completed   ?? false,
  googleCalendarEventId: card.googleCalendarEventId || null,
  horas:                 card.dueDate
    ? new Date(card.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    : '—',
  assignedUserIds: (card.assignedUsers || []).map(u => u.id),
  assignedUsers:   (card.assignedUsers || []).map(u => ({ id: u.id, avatarUrl: u.avatarUrl || null, name: u.name || '' })),
})
