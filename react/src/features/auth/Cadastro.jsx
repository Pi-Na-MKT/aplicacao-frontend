import React, { useState, useEffect } from 'react'
import { useCadastroForm } from './hooks/useCadastroForm'
import CadastroSucesso from './components/CadastroSucesso'
import EtapaConta from './components/EtapaConta'
import EtapaPerfil from './components/EtapaPerfil'
import EtapaDetalhes from './components/EtapaDetalhes'

const STEPS = ['Conta', 'Perfil', 'Detalhes']

export default function Cadastro({ onGoToLogin, isInternalAccess = false }) {
  const {
    step, dir, anim, loading, sucesso, erroGlobal, erros, usuarioCriado,
    avatarPreview, setAvatarPreview,
    form, set, toggleCanal,
    goNext, goBack, handleSubmit, resetForm,
  } = useCadastroForm()

  const [mounted, setMounted]     = useState(false)
  const [showSenha, setShowSenha] = useState(false)
  const [showConf, setShowConf]   = useState(false)

  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])

  if (sucesso) return (
    <CadastroSucesso
      usuario={usuarioCriado}
      isInternalAccess={isInternalAccess}
      onCadastrarOutro={resetForm}
      onGoToLogin={onGoToLogin}
    />
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
            <EtapaConta
              form={form}
              erros={erros}
              onChange={set}
              avatarPreview={avatarPreview}
              onAvatarChange={setAvatarPreview}
              showSenha={showSenha}
              onToggleSenha={() => setShowSenha(v => !v)}
              showConf={showConf}
              onToggleConf={() => setShowConf(v => !v)}
            />
          )}
          {step === 1 && <EtapaPerfil form={form} erros={erros} onChange={set} />}
          {step === 2 && <EtapaDetalhes form={form} onChange={set} onToggleCanal={toggleCanal} erroGlobal={erroGlobal} />}
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
