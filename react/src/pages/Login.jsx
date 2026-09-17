import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login({ onGoToRegister }) {
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [senha, setSenha]       = useState('')
  const [erro, setErro]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [mounted, setMounted]   = useState(false)
  const [focused, setFocused]   = useState(null)

  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    if (!email || !senha) { setErro('Preencha e-mail e senha.'); return }
    setLoading(true)
    try {
      await login(email, senha)
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Credenciais inválidas.'
      setErro(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#0F172A', minHeight: '100vh' }}
      className="w-full flex items-center justify-center relative overflow-hidden">

      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(30,58,138,0.35) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 90%, rgba(30,58,138,0.2) 0%, transparent 55%), radial-gradient(ellipse 40% 40% at 70% 20%, rgba(251,191,36,0.06) 0%, transparent 50%)'
      }} />

      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06, pointerEvents: 'none' }}>
        <defs>
          <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="#FBBF24" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, #1E3A8A 30%, #FBBF24 50%, #1E3A8A 70%, transparent 100%)'
      }} />

      <div style={{ position: 'absolute', top: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>PINA</span>
      </div>

      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: 400,
        margin: '0 auto',
        padding: '2.5rem',
        background: 'rgba(15,23,42,0.7)',
        border: '1px solid rgba(30,58,138,0.45)',
        borderRadius: 20,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 0 0 1px rgba(251,191,36,0.04), 0 32px 80px rgba(0,0,0,0.5)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>

        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FBBF24', marginBottom: 10 }}>
            Gestão de Tarefas
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>
            Acesse sua conta
          </h1>
          <p style={{ marginTop: 8, fontSize: 13, color: '#64748B' }}>
            Entre com suas credenciais para continuar
          </p>
        </div>

        <div style={{ height: 1, background: 'rgba(30,58,138,0.4)', marginBottom: '1.75rem' }} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', marginBottom: 8 }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              placeholder="seu@email.com"
              autoComplete="email"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '12px 16px',
                borderRadius: 10,
                fontSize: 14,
                color: '#fff',
                background: focused === 'email' ? 'rgba(30,58,138,0.2)' : 'rgba(30,58,138,0.08)',
                border: `1.5px solid ${focused === 'email' ? 'rgba(30,58,138,0.9)' : 'rgba(30,58,138,0.35)'}`,
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B' }}>
                Senha
              </label>
              <button type="button" style={{ fontSize: 12, color: '#FBBF24', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                Esqueceu a senha?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                onFocus={() => setFocused('senha')}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '12px 44px 12px 16px',
                  borderRadius: 10,
                  fontSize: 14,
                  color: '#fff',
                  background: focused === 'senha' ? 'rgba(30,58,138,0.2)' : 'rgba(30,58,138,0.08)',
                  border: `1.5px solid ${focused === 'senha' ? 'rgba(30,58,138,0.9)' : 'rgba(30,58,138,0.35)'}`,
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0, display: 'flex',
              }}>
                {showPass
                  ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                  : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                }
              </button>
            </div>
          </div>

          {erro && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171', fontSize: 13 }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {erro}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px',
            borderRadius: 10,
            fontSize: 14, fontWeight: 700,
            color: '#0F172A',
            background: loading ? '#1E3A8A' : '#FBBF24',
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: loading ? 'none' : '0 4px 24px rgba(251,191,36,0.25)',
            transition: 'all 0.2s',
            fontFamily: 'inherit',
            marginTop: 4,
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                  <path d="M4 12a8 8 0 018-8" stroke="#fff"/>
                </svg>
                <span style={{ color: '#94A3B8' }}>Entrando...</span>
              </>
            ) : 'Entrar'}
          </button>
        </form>

        {onGoToRegister && (
          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: 13, color: '#475569' }}>
            Não tem uma conta?{' '}
            <button type="button" onClick={onGoToRegister} style={{
              color: '#FBBF24', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 13,
            }}>
              Criar conta
            </button>
          </p>
        )}
      </div>

      <p style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: '#1E3A8A', whiteSpace: 'nowrap' }}>
        © {new Date().getFullYear()} PiNa · Todos os direitos reservados
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #334155; }
      `}</style>
    </div>
  )
}
