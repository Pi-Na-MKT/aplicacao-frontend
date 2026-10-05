// Estilo dos campos do cadastro, variando conforme foco e erro.
export const inputBase = (focused, error) => ({
  width: '100%', boxSizing: 'border-box',
  padding: '9px 14px',
  borderRadius: 10, fontSize: 13,
  color: '#fff', fontFamily: 'inherit',
  background: error ? 'rgba(239,68,68,0.05)' : focused ? 'rgba(30,58,138,0.2)' : 'rgba(30,58,138,0.08)',
  border: `1.5px solid ${error ? 'rgba(239,68,68,0.4)' : focused ? 'rgba(30,58,138,0.9)' : 'rgba(30,58,138,0.35)'}`,
  outline: 'none', transition: 'all 0.2s',
})
