import React, { useState, useEffect, useRef } from 'react'
import api from '../services/api'

const HABILIDADES = ['Design', 'Desenvolvimento', 'Gestão de Projetos', 'Análise de Dados', 'Conteúdo', 'Comunicação', 'Vendas', 'Suporte']
const SENIORIDADE = [
  { value: 'junior', label: 'Júnior', years: '0–2 anos' },
  { value: 'pleno',  label: 'Pleno',  years: '2–5 anos' },
  { value: 'senior', label: 'Sênior', years: '5–10 anos' },
]
const STEPS = ['Conta', 'Perfil', 'Detalhes']

function PasswordStrength({ senha }) {
  const checks = [senha.length >= 8, /[A-Z]/.test(senha), /[0-9]/.test(senha), /[^A-Za-z0-9]/.test(senha)]
  const score  = checks.filter(Boolean).length
  const colors = ['transparent', '#ef4444', '#f59e0b', '#10b981', '#FBBF24']
  const labels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte']
  if (!senha) return null
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? colors[score] : 'rgba(30,58,138,0.3)', transition: 'background 0.3s' }} />
        ))}
      </div>
      <p style={{ fontSize: 11, color: colors[score] }}>{labels[score]}</p>
    </div>
  )
}

function AvatarUpload({ preview, onFile }) {
  const ref = useRef(null)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 0 }}>
      <div onClick={() => ref.current?.click()} style={{
        width: 44, height: 44, borderRadius: '50%', cursor: 'pointer',
        border: '1.5px dashed rgba(251,191,36,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(30,58,138,0.12)', overflow: 'hidden', position: 'relative',
      }}>
        {preview
          ? <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <svg width="22" height="22" fill="none" stroke="#FBBF24" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        }
      </div>
      <p style={{ fontSize: 10, color: '#334155', margin: 0 }}>Clique para adicionar foto</p>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => onFile(ev.target.result); r.readAsDataURL(f) }}} />
    </div>
  )
}

function Field({ label, hint, error, children }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B' }}>{label}</label>
        {hint && <span style={{ fontSize: 11, color: '#334155' }}>{hint}</span>}
      </div>
      {children}
      {error && (
        <p style={{ marginTop: 4, fontSize: 11, color: '#f87171', display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {error}
        </p>
      )}
    </div>
  )
}

const inputBase = (focused, error) => ({
  width: '100%', boxSizing: 'border-box',
  padding: '9px 14px',
  borderRadius: 10, fontSize: 13,
  color: '#fff', fontFamily: 'inherit',
  background: error ? 'rgba(239,68,68,0.05)' : focused ? 'rgba(30,58,138,0.2)' : 'rgba(30,58,138,0.08)',
  border: `1.5px solid ${error ? 'rgba(239,68,68,0.4)' : focused ? 'rgba(30,58,138,0.9)' : 'rgba(30,58,138,0.35)'}`,
  outline: 'none', transition: 'all 0.2s',
})

export default function Cadastro({ onGoToLogin, isInternalAccess = false }) {
  const [step, setStep]             = useState(0)
  const [dir, setDir]               = useState(1)
  const [anim, setAnim]             = useState(false)
  const [mounted, setMounted]       = useState(false)
  const [loading, setLoading]       = useState(false)
  const [sucesso, setSucesso]       = useState(false)
  const [erroGlobal, setErroGlobal] = useState('')
  const [focused, setFocused]       = useState(null)
  const [erros, setErros]           = useState({})
  const [showSenha, setShowSenha]   = useState(false)
  const [showConf, setShowConf]     = useState(false)
  const [usuarioCriado, setUsuarioCriado] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', senha: '', confirmarSenha: '', cargo: '', senioridade: '', canais: [], bio: '', linkedin: '' })

  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErros(p => ({ ...p, [k]: '' })); setErroGlobal('') }
  const toggleCanal = c => setForm(p => ({ ...p, canais: p.canais.includes(c) ? p.canais.filter(x => x !== c) : [...p.canais, c] }))

  const validar = s => {
    const e = {}
    if (s === 0) {
      if (!form.nome.trim()) e.nome = 'Nome é obrigatório.'
      else if (form.nome.trim().split(' ').length < 2) e.nome = 'Informe nome e sobrenome.'
      if (!form.email.trim()) e.email = 'E-mail é obrigatório.'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido.'
      if (!form.senha) e.senha = 'Senha é obrigatória.'
      else if (form.senha.length < 6) e.senha = 'Mínimo 6 caracteres.'
      if (!form.confirmarSenha) e.confirmarSenha = 'Confirme a senha.'
      else if (form.senha !== form.confirmarSenha) e.confirmarSenha = 'Senhas não coincidem.'
    }
    if (s === 1 && !form.cargo.trim()) e.cargo = 'Cargo é obrigatório.'
    return e
  }

  const goNext = () => {
    const e = validar(step)
    if (Object.keys(e).length) { setErros(e); return }
    setDir(1); setAnim(true)
    setTimeout(() => { setStep(s => s + 1); setAnim(false) }, 200)
  }
  const goBack = () => {
    setDir(-1); setAnim(true)
    setTimeout(() => { setStep(s => s - 1); setAnim(false) }, 200)
  }

  const handleSubmit = async () => {
    setErroGlobal(''); setLoading(true)
    try {
      const payload = { name: form.nome, email: form.email, password: form.senha, phone: form.telefone || null, jobTitle: form.cargo || null, seniority: form.senioridade || null, responsibility: form.canais.length ? form.canais.join(', ') : null, bio: form.bio || null, linkedin: form.linkedin || null }
      const { data } = await api.post('/users/register', payload)
      setUsuarioCriado({ ...data, nome: data.name ?? form.nome, cargo: data.jobTitle ?? form.cargo, avatar: avatarPreview })
      setSucesso(true)
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Erro ao cadastrar. Tente novamente.'
      setErroGlobal(typeof msg === 'string' ? msg : 'Erro ao cadastrar.')
    } finally { setLoading(false) }
  }

  const resetForm = () => { setSucesso(false); setStep(0); setAvatarPreview(null); setForm({ nome: '', email: '', telefone: '', senha: '', confirmarSenha: '', cargo: '', senioridade: '', canais: [], bio: '', linkedin: '' }) }

  const eyeOff = <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
  const eyeOn  = <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>

  if (sucesso) return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#0F172A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(30,58,138,0.25) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #1E3A8A, #FBBF24, #1E3A8A, transparent)' }} />
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 360, padding: '2.5rem', background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(30,58,138,0.45)', borderRadius: 20, backdropFilter: 'blur(24px)' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1E3A8A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <svg width="24" height="24" fill="none" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Conta criada!</h2>
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: '1.5rem' }}>
          <span style={{ color: '#fff', fontWeight: 600 }}>{usuarioCriado?.nome}</span> foi cadastrado com sucesso.
        </p>
        <div style={{ background: 'rgba(30,58,138,0.12)', border: '1px solid rgba(30,58,138,0.35)', borderRadius: 12, padding: '12px 16px', marginBottom: '1.5rem', textAlign: 'left' }}>
          {[['E-mail', usuarioCriado?.email], ['Cargo', usuarioCriado?.cargo]].map(([k, v]) => v && (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(30,58,138,0.2)' }} className="last-no-border">
              <span style={{ fontSize: 12, color: '#475569' }}>{k}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={resetForm} style={{ padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, color: '#0F172A', background: '#FBBF24', border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(251,191,36,0.2)' }}>Cadastrar outro</button>
          <button onClick={onGoToLogin} style={{ padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#64748B', background: 'rgba(30,58,138,0.08)', border: '1px solid rgba(30,58,138,0.35)', cursor: 'pointer', fontFamily: 'inherit' }}>{isInternalAccess ? 'Voltar para Usuários' : 'Ir para o login'}</button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#0F172A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', paddingTop: '4rem', paddingBottom: '2.5rem' }}>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(30,58,138,0.32) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 90%, rgba(30,58,138,0.18) 0%, transparent 55%), radial-gradient(ellipse 35% 35% at 65% 20%, rgba(251,191,36,0.05) 0%, transparent 50%)' }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.055, pointerEvents: 'none' }}>
        <defs><pattern id="dots2" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.5" fill="#FBBF24"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#dots2)"/>
      </svg>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #1E3A8A, #FBBF24, #1E3A8A, transparent)' }} />

      <div style={{ position: 'absolute', top: '1.75rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: '#FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>PINA</span>
      </div>

      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: 480,
        margin: '0 auto',
        padding: '1.4rem',
        background: 'rgba(15,23,42,0.72)',
        border: '1px solid rgba(30,58,138,0.45)',
        borderRadius: 20,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 0 0 1px rgba(251,191,36,0.03), 0 32px 80px rgba(0,0,0,0.5)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>

        <div style={{ marginBottom: '0.75rem', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FBBF24', marginBottom: 2 }}>Criar conta</p>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>{STEPS[step]}</h1>
          <p style={{ marginTop: 4, fontSize: 12, color: '#475569' }}>Etapa {step + 1} de {STEPS.length}</p>
        </div>

        <div style={{ height: 3, background: 'rgba(30,58,138,0.3)', borderRadius: 2, marginBottom: '1rem', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 2, background: '#FBBF24', width: `${((step + 1) / STEPS.length) * 100}%`, transition: 'width 0.4s ease' }} />
        </div>

        <div style={{ transition: 'opacity 0.2s, transform 0.2s', opacity: anim ? 0 : 1, transform: anim ? `translateX(${dir * 24}px)` : 'translateX(0)' }}>

          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <AvatarUpload preview={avatarPreview} onFile={setAvatarPreview} />

              <Field label="Nome completo" error={erros.nome}>
                <input type="text" value={form.nome} onChange={e => set('nome', e.target.value)}
                  onFocus={() => setFocused('nome')} onBlur={() => setFocused(null)}
                  placeholder="Ex.: Lucas Ferreira" autoComplete="name"
                  style={inputBase(focused === 'nome', erros.nome)} />
              </Field>

              <Field label="E-mail" error={erros.email}>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  placeholder="lucas@empresa.com" autoComplete="email"
                  style={inputBase(focused === 'email', erros.email)} />
              </Field>

              <Field label="Telefone" hint="opcional">
                <input type="tel" value={form.telefone} onChange={e => set('telefone', e.target.value)}
                  onFocus={() => setFocused('tel')} onBlur={() => setFocused(null)}
                  placeholder="(11) 99999-9999"
                  style={inputBase(focused === 'tel', false)} />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Senha" error={erros.senha}>
                  <div style={{ position: 'relative' }}>
                    <input type={showSenha ? 'text' : 'password'} value={form.senha}
                      onChange={e => set('senha', e.target.value)}
                      onFocus={() => setFocused('senha')} onBlur={() => setFocused(null)}
                      placeholder="••••••" autoComplete="new-password"
                      style={{ ...inputBase(focused === 'senha', erros.senha), paddingRight: 36 }} />
                    <button type="button" onClick={() => setShowSenha(v => !v)}
                      style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', padding: 0 }}>
                      {showSenha ? eyeOff : eyeOn}
                    </button>
                  </div>
                  <PasswordStrength senha={form.senha} />
                </Field>

                <Field label="Confirmar" error={erros.confirmarSenha}>
                  <div style={{ position: 'relative' }}>
                    <input type={showConf ? 'text' : 'password'} value={form.confirmarSenha}
                      onChange={e => set('confirmarSenha', e.target.value)}
                      onFocus={() => setFocused('conf')} onBlur={() => setFocused(null)}
                      placeholder="••••••" autoComplete="new-password"
                      style={{ ...inputBase(focused === 'conf', erros.confirmarSenha), paddingRight: 36 }} />
                    <button type="button" onClick={() => setShowConf(v => !v)}
                      style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', padding: 0 }}>
                      {showConf ? eyeOff : eyeOn}
                    </button>
                  </div>
                </Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="Cargo / Função" error={erros.cargo}>
                <input type="text" value={form.cargo} onChange={e => set('cargo', e.target.value)}
                  onFocus={() => setFocused('cargo')} onBlur={() => setFocused(null)}
                  placeholder="Ex.: Analista de Projetos"
                  style={inputBase(focused === 'cargo', erros.cargo)} />
              </Field>

              <Field label="Senioridade">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {SENIORIDADE.map(s => (
                    <button key={s.value} type="button" onClick={() => set('senioridade', s.value)}
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
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="Habilidades" hint="Selecione os que domina">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {HABILIDADES.map(c => {
                    const sel = form.canais.includes(c)
                    return (
                      <button key={c} type="button" onClick={() => toggleCanal(c)}
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
                <textarea value={form.bio} onChange={e => set('bio', e.target.value)}
                  onFocus={() => setFocused('bio')} onBlur={() => setFocused(null)}
                  placeholder="Conte um pouco sobre sua trajetória..."
                  rows={2}
                  style={{ ...inputBase(focused === 'bio', false), resize: 'none', lineHeight: 1.5 }} />
              </Field>

              <Field label="LinkedIn" hint="opcional">
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#334155', pointerEvents: 'none' }}>linkedin.com/in/</span>
                  <input type="text" value={form.linkedin} onChange={e => set('linkedin', e.target.value)}
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
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: '0.75rem' }}>
          {step > 0 && (
            <button type="button" onClick={goBack} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              background: 'rgba(30,58,138,0.08)', border: '1px solid rgba(30,58,138,0.35)', color: '#64748B',
            }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
              Voltar
            </button>
          )}
          {step < 2 ? (
            <button type="button" onClick={goNext} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              background: '#FBBF24', border: 'none', color: '#0F172A',
              boxShadow: '0 4px 20px rgba(251,191,36,0.2)',
            }}>
              Continuar
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              background: loading ? '#1E3A8A' : '#FBBF24', border: 'none', color: loading ? '#94A3B8' : '#0F172A',
              opacity: loading ? 0.7 : 1, boxShadow: loading ? 'none' : '0 4px 20px rgba(251,191,36,0.2)',
            }}>
              {loading
                ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="3" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M4 12a8 8 0 018-8"/></svg>Cadastrando...</>
                : <>Criar conta<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></>
              }
            </button>
          )}
        </div>

        {step === 0 && (
          <p style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: 13, color: '#475569' }}>
            Já tem uma conta?{' '}
            <button type="button" onClick={onGoToLogin} style={{ color: '#FBBF24', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 13 }}>
              {isInternalAccess ? 'Voltar para Usuários' : 'Fazer login'}
            </button>
          </p>
        )}
      </div>

      <p style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: '#1E3A8A', whiteSpace: 'nowrap' }}>
        © {new Date().getFullYear()} PiNa · Todos os direitos reservados
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: #1E3A5F; }
      `}</style>
    </div>
  )
}