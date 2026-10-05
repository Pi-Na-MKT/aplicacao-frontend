import React, { useState } from 'react'
import AvatarUpload from './AvatarUpload'
import Field from './Field'
import PasswordStrength from './PasswordStrength'
import { inputBase } from './inputBase'

const eyeOff = <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
const eyeOn  = <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>

const eyeButtonStyle = { position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', padding: 0 }

export default function EtapaConta({ form, erros, onChange, avatarPreview, onAvatarChange, showSenha, onToggleSenha, showConf, onToggleConf }) {
  const [focused, setFocused] = useState(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <AvatarUpload preview={avatarPreview} onFile={onAvatarChange} />

      <Field label="Nome completo" error={erros.nome}>
        <input type="text" value={form.nome} onChange={e => onChange('nome', e.target.value)}
          onFocus={() => setFocused('nome')} onBlur={() => setFocused(null)}
          placeholder="Ex.: Lucas Ferreira" autoComplete="name"
          style={inputBase(focused === 'nome', erros.nome)} />
      </Field>

      <Field label="E-mail" error={erros.email}>
        <input type="email" value={form.email} onChange={e => onChange('email', e.target.value)}
          onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
          placeholder="lucas@empresa.com" autoComplete="email"
          style={inputBase(focused === 'email', erros.email)} />
      </Field>

      <Field label="Telefone" hint="opcional">
        <input type="tel" value={form.telefone} onChange={e => onChange('telefone', e.target.value)}
          onFocus={() => setFocused('tel')} onBlur={() => setFocused(null)}
          placeholder="(11) 99999-9999"
          style={inputBase(focused === 'tel', false)} />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Senha" error={erros.senha}>
          <div style={{ position: 'relative' }}>
            <input type={showSenha ? 'text' : 'password'} value={form.senha}
              onChange={e => onChange('senha', e.target.value)}
              onFocus={() => setFocused('senha')} onBlur={() => setFocused(null)}
              placeholder="••••••" autoComplete="new-password"
              style={{ ...inputBase(focused === 'senha', erros.senha), paddingRight: 36 }} />
            <button type="button" onClick={onToggleSenha} style={eyeButtonStyle}>
              {showSenha ? eyeOff : eyeOn}
            </button>
          </div>
          <PasswordStrength senha={form.senha} />
        </Field>

        <Field label="Confirmar" error={erros.confirmarSenha}>
          <div style={{ position: 'relative' }}>
            <input type={showConf ? 'text' : 'password'} value={form.confirmarSenha}
              onChange={e => onChange('confirmarSenha', e.target.value)}
              onFocus={() => setFocused('conf')} onBlur={() => setFocused(null)}
              placeholder="••••••" autoComplete="new-password"
              style={{ ...inputBase(focused === 'conf', erros.confirmarSenha), paddingRight: 36 }} />
            <button type="button" onClick={onToggleConf} style={eyeButtonStyle}>
              {showConf ? eyeOff : eyeOn}
            </button>
          </div>
        </Field>
      </div>
    </div>
  )
}
