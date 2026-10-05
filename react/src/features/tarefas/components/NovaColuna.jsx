import React, { useState } from 'react'
import Spinner from '../../../shared/components/Spinner'

// onAdd recebe o nome e deve retornar true quando a coluna for criada.
export default function NovaColuna({ onAdd }) {
  const [adding, setAdding] = useState(false)
  const [name,   setName]   = useState('')
  const [saving, setSaving] = useState(false)

  const cancelar = () => { setAdding(false); setName('') }

  const handleAdd = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    const criada = await onAdd(trimmed)
    if (criada) cancelar()
    setSaving(false)
  }

  return (
    <div className="w-[300px] flex-shrink-0">
      {adding ? (
        <div className="rounded-card border border-pina-border bg-pina-surface p-4 shadow-card">
          <input
            autoFocus type="text" value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter')  handleAdd()
              if (e.key === 'Escape') cancelar()
            }}
            placeholder="Nome da coluna..."
            aria-label="Nome da coluna"
            className="mb-3 h-11 w-full rounded-input border border-pina-border bg-pina-surface px-3.5 text-sm text-pina-primary outline-none transition duration-base ease-base placeholder:text-pina-text-light focus:border-pina-secondary focus:ring-2 focus:ring-pina-secondary/20"
          />
          <div className="flex gap-2">
            <button type="button" onClick={handleAdd} disabled={saving || !name.trim()}
              className="flex h-10 flex-1 items-center justify-center rounded-button bg-pina-secondary text-sm font-semibold text-white transition duration-base ease-base hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <Spinner size="sm" className="text-white"/> : 'Adicionar'}
            </button>
            <button type="button" onClick={cancelar} aria-label="Cancelar"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-button border border-pina-border bg-pina-surface text-pina-text-light transition duration-base ease-base hover:text-pina-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)}
          className="flex w-full items-center gap-2.5 rounded-card border-2 border-dashed border-pina-border px-5 py-4 text-sm font-medium text-pina-text-light transition duration-base ease-base hover:border-pina-secondary/50 hover:text-pina-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nova coluna
        </button>
      )}
    </div>
  )
}
