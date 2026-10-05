import React, { useState } from 'react'
import Field from './Field'
import { inputBase } from './inputBase'

const SENIORIDADE = [
  { value: 'junior', label: 'Júnior', years: '0–2 anos' },
  { value: 'pleno',  label: 'Pleno',  years: '2–5 anos' },
  { value: 'senior', label: 'Sênior', years: '5–10 anos' },
]

export default function EtapaPerfil({ form, erros, onChange }) {
  const [focused, setFocused] = useState(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Field label="Cargo / Função" error={erros.cargo}>
        <input type="text" value={form.cargo} onChange={e => onChange('cargo', e.target.value)}
          onFocus={() => setFocused('cargo')} onBlur={() => setFocused(null)}
          placeholder="Ex.: Analista de Projetos"
          style={inputBase(focused === 'cargo', erros.cargo)} />
      </Field>

      <Field label="Senioridade">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {SENIORIDADE.map(s => (
            <button key={s.value} type="button" onClick={() => onChange('senioridade', s.value)}
              style={{
                padding: '10px 6px', borderRadius: 10, textAlign: 'center', cursor: 'pointer', border: 'none', fontFamily: 'inherit',
                background: form.senioridade === s.value ? 'rgba(30,58,138,0.35)' : 'rgba(30,58,138,0.08)',
                outline: `1.5px solid ${form.senioridade === s.value ? '#FBBF24' : 'rgba(30,58,138,0.35)'}`,
                transition: 'all 0.2s',
              }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: form.senioridade === s.value ? '#FBBF24' : '#64748B', margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 10, color: '#334155', margin: '3px 0 0' }}>{s.years}</p>
            </button>
          ))}
        </div>
      </Field>
    </div>
  )
}
