import React, { useId } from 'react'
import { PieChart, Pie, Cell } from 'recharts'

const CORES = { concluida: '#22C55E', andamento: '#6366F1', atrasada: '#F59E0B' }
const TAMANHO = 132

// "status" vem de tarefasPorStatus: [{ chave, label, valor, pct }].
export default function TarefasPorStatus({ status, total }) {
  const tituloId = useId()

  return (
    <section aria-labelledby={tituloId} className="rounded-card border border-pina-border bg-pina-surface p-6 shadow-card">
      <h2 id={tituloId} className="mb-4 text-base font-semibold text-pina-primary">Tarefas por status</h2>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
        <div className="relative flex-shrink-0" style={{ width: TAMANHO, height: TAMANHO }} aria-hidden="true">
          <PieChart width={TAMANHO} height={TAMANHO}>
            <Pie
              data={status.filter(s => s.valor > 0)}
              dataKey="valor"
              innerRadius={44}
              outerRadius={64}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={false}
            >
              {status.filter(s => s.valor > 0).map(s => <Cell key={s.chave} fill={CORES[s.chave]} />)}
            </Pie>
          </PieChart>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold leading-none text-pina-primary">{total}</span>
            <span className="mt-1 text-[11px] text-pina-text-light">Total</span>
          </div>
        </div>

        <ul className="flex w-full flex-col gap-4">
          {status.map(s => (
            <li key={s.chave} className="flex items-center gap-3 text-[13px]">
              <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: CORES[s.chave] }} />
              <span className="flex-1 text-pina-text">{s.label}</span>
              <span className="w-7 text-right font-medium text-pina-primary">{s.valor}</span>
              <span className="w-10 text-right text-pina-text-light">{s.pct}%</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
