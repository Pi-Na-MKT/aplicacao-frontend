import React from 'react'

export default function CadastroSucesso({ usuario, isInternalAccess, onCadastrarOutro, onGoToLogin }) {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#0F172A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(30,58,138,0.25) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #1E3A8A, #FBBF24, #1E3A8A, transparent)' }} />
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 360, padding: '2.5rem', background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(30,58,138,0.45)', borderRadius: 20, backdropFilter: 'blur(24px)' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1E3A8A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <svg width="24" height="24" fill="none" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Conta criada!</h2>
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: '1.5rem' }}>
          <span style={{ color: '#fff', fontWeight: 600 }}>{usuario?.nome}</span> foi cadastrado com sucesso.
        </p>
        <div style={{ background: 'rgba(30,58,138,0.12)', border: '1px solid rgba(30,58,138,0.35)', borderRadius: 12, padding: '12px 16px', marginBottom: '1.5rem', textAlign: 'left' }}>
          {[['E-mail', usuario?.email], ['Cargo', usuario?.cargo]].map(([k, v]) => v && (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(30,58,138,0.2)' }} className="last-no-border">
              <span style={{ fontSize: 12, color: '#475569' }}>{k}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={onCadastrarOutro} style={{ padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, color: '#0F172A', background: '#FBBF24', border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(251,191,36,0.2)' }}>Cadastrar outro</button>
          <button onClick={onGoToLogin} style={{ padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#64748B', background: 'rgba(30,58,138,0.08)', border: '1px solid rgba(30,58,138,0.35)', cursor: 'pointer', fontFamily: 'inherit' }}>{isInternalAccess ? 'Voltar para Usuários' : 'Ir para o login'}</button>
        </div>
      </div>
    </div>
  )
}
