import React, { useRef } from 'react'

export default function AvatarUpload({ preview, onFile }) {
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
