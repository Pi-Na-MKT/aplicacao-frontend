import React, { useState } from 'react'
import Field from './Field'
import { inputBase } from './inputBase'

const HABILIDADES = ['Design', 'Desenvolvimento', 'Gestão de Projetos', 'Análise de Dados', 'Conteúdo', 'Comunicação', 'Vendas', 'Suporte']

export default function EtapaDetalhes({ form, onChange, onToggleCanal, erroGlobal }) {
  const [focused, setFocused] = useState(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Field label="Habilidades" hint="Selecione os que domina">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {HABILIDADES.map(c => {
            const sel = form.canais.includes(c)
            return (
              <button key={c} type="button" onClick={() => onToggleCanal(c)}
                style={{
                  padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none', fontFamily: 'inherit',
                  background: sel ? 'rgba(251,191,36,0.12)' : 'rgba(30,58,138,0.08)',
                  outline: `1px solid ${sel ? 'rgba(251,191,36,0.5)' : 'rgba(30,58,138,0.3)'}`,
                  color: sel ? '#FBBF24' : '#475569',
                  transition: 'all 0.15s',
                }}>
                {c}
              </button>
            )
          })}
        </div>
      </Field>

      <Field label="Bio curta" hint="opcional">
        <textarea value={form.bio} onChange={e => onChange('bio', e.target.value)}
          onFocus={() => setFocused('bio')} onBlur={() => setFocused(null)}
          placeholder="Conte um pouco sobre sua trajetória..."
          rows={2}
          style={{ ...inputBase(focused === 'bio', false), resize: 'none', lineHeight: 1.5 }} />
      </Field>

      <Field label="LinkedIn" hint="opcional">
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#334155', pointerEvents: 'none' }}>linkedin.com/in/</span>
          <input type="text" value={form.linkedin} onChange={e => onChange('linkedin', e.target.value)}
            onFocus={() => setFocused('li')} onBlur={() => setFocused(null)}
            placeholder="seu-perfil"
            style={{ ...inputBase(focused === 'li', false), paddingLeft: 112 }} />
        </div>
      </Field>

      {erroGlobal && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171', fontSize: 13 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {erroGlobal}
        </div>
      )}
    </div>
  )
}
