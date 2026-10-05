import React from 'react'

export default function PasswordStrength({ senha }) {
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
