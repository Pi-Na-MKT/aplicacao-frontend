import React, { useState, useId } from 'react'
import AvatarNeutro from '../../../shared/components/AvatarNeutro'

const LIMITE = 6
const CORES = ['#6366F1', '#3B82F6', '#22C55E', '#FACC15', '#F43F5E', '#A78BFA']

const plural = (n, singular, pluralTexto) => `${n} ${n === 1 ? singular : pluralTexto}`

export default function TarefasPorUsuario({ usuarios }) {
  const tituloId = useId()
  const [mostrarTodos, setMostrarTodos] = useState(false)

  const visiveis = mostrarTodos ? usuarios : usuarios.slice(0, LIMITE)
  // A barra de quem tem mais tarefas ocupa a largura toda; as outras são proporcionais a ela.
  const maior = Math.max(...usuarios.map(u => u.total), 1)

  return (
    <section aria-labelledby={tituloId} className="rounded-card border border-pina-border bg-pina-surface p-6 shadow-card">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 id={tituloId} className="text-base font-semibold text-pina-primary">Tarefas por usuário</h2>
        {usuarios.length > LIMITE && (
          <button
            type="button"
            onClick={() => setMostrarTodos(v => !v)}
            className="rounded text-xs font-semibold text-pina-secondary transition duration-base ease-base hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40"
          >
            {mostrarTodos ? 'Ver menos' : 'Ver todos →'}
          </button>
        )}
      </div>

      {usuarios.length === 0 ? (
        <p className="py-10 text-center text-sm text-pina-text-light">Nenhum membro atribuído às tarefas.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {visiveis.map((u, i) => (
            <li
              key={u.id}
              className="flex items-center gap-3"
              title={`${plural(u.concluidas, 'concluída', 'concluídas')}, ${u.andamento} em andamento, ${plural(u.atrasadas, 'atrasada', 'atrasadas')}`}
            >
              {u.avatarUrl
                ? <img src={u.avatarUrl} className="h-8 w-8 flex-shrink-0 rounded-full object-cover" alt="" />
                : <AvatarNeutro className="h-8 w-8" />}
              <span className="w-24 flex-shrink-0 truncate text-[13px] text-pina-text sm:w-36">{u.nome}</span>
              <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                <span
                  className="block h-full rounded-full transition-all duration-300"
                  style={{ width: `${(u.total / maior) * 100}%`, backgroundColor: CORES[i % CORES.length] }}
                />
              </span>
              <span className="w-7 flex-shrink-0 text-right text-[13px] font-medium text-pina-primary">{u.total}</span>
              <span className="w-10 flex-shrink-0 text-right text-[13px] text-pina-text-light">{u.pct}%</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
