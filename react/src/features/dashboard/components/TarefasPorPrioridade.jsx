import React, { useId } from 'react'

const CORES = { LOW: '#A78BFA', MEDIUM: '#6366F1', HIGH: '#FACC15', CRITICAL: '#F43F5E' }

// "prioridades" vem de tarefasPorPrioridade: [{ chave, label, valor }].
export default function TarefasPorPrioridade({ prioridades }) {
  const tituloId = useId()
  const maior = Math.max(...prioridades.map(p => p.valor), 1)

  return (
    <section aria-labelledby={tituloId} className="rounded-card border border-pina-border bg-pina-surface p-6 shadow-card">
      <h2 id={tituloId} className="mb-4 text-base font-semibold text-pina-primary">Tarefas por prioridade</h2>

      {/* Cada item tem o valor, a barra e o rótulo. A linha de base das barras é
          desenhada pelo "after", logo acima dos rótulos (que têm 24px de altura). */}
      <ul className="relative flex items-end justify-around gap-4 after:absolute after:inset-x-0 after:bottom-6 after:h-px after:bg-pina-border">
        {prioridades.map(p => (
          <li key={p.chave} className="flex w-16 flex-col items-center">
            <span className="mb-1 text-[11px] font-medium text-pina-text">{p.valor}</span>
            {/* Altura proporcional à maior barra. Valor zero fica só com uma linha fina. */}
            <span className="flex h-16 w-9 items-end" aria-hidden="true">
              <span
                className="block w-full rounded-t-md transition-all duration-300"
                style={{ height: p.valor > 0 ? `${Math.max((p.valor / maior) * 100, 8)}%` : '2px', backgroundColor: CORES[p.chave] }}
              />
            </span>
            <span className="flex h-6 items-end text-[11px] text-pina-text-light">{p.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
