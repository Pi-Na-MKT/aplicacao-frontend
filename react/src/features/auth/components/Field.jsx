import React from 'react'

export default function Field({ label, hint, error, children }) {
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
